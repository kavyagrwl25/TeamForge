import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const AUTH_SESSION_HINT_KEY = "teamforge_has_session";
let refreshRequest = null;
let authFailureHandler = null;

export const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const refreshAPI = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const setAuthFailureHandler = (handler) => {
  authFailureHandler = handler;

  return () => {
    if (authFailureHandler === handler) {
      authFailureHandler = null;
    }
  };
};

export const hasAuthSessionHint = () => {
  return window.localStorage.getItem(AUTH_SESSION_HINT_KEY) === "true";
};

export const markAuthSessionKnown = () => {
  window.localStorage.setItem(AUTH_SESSION_HINT_KEY, "true");
};

export const clearAuthSessionHint = () => {
  window.localStorage.removeItem(AUTH_SESSION_HINT_KEY);
};

const shouldSkipAuthRefresh = (request) => {
  const url = request?.url || "";

  return (
    request?.skipAuthRefresh ||
    url.includes("/users/login") ||
    url.includes("/users/register") ||
    url.includes("/users/refresh-tokens")
  );
};

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      shouldSkipAuthRefresh(originalRequest)
    ) {
      return Promise.reject(error);
    }

    // Interceptor flow: a protected request received 401, so the access token
    // cookie may be expired. Mark this request as retried to prevent loops.
    originalRequest._retry = true;

    try {
      // Refresh retry: keep one shared refresh call so multiple expired
      // requests do not spam POST /api/v1/users/refresh-tokens.
      if (!refreshRequest) {
        refreshRequest = refreshTokens().finally(() => {
          refreshRequest = null;
        });
      }

      await refreshRequest;

      // After refresh succeeds, retry the original failed request once.
      return API(originalRequest);
    } catch (refreshError) {
      // Refresh failure means both cookies are no longer usable. Clear frontend
      // auth state through App.jsx, then send the user back to login.
      clearAuthSessionHint();

      if (authFailureHandler) {
        authFailureHandler();
      } else if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }

      return Promise.reject(refreshError);
    }
  }
);

export const loginUser = async (userData) => {
  const response = await API.post("/users/login", userData);
  markAuthSessionKnown();
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await API.post("/users/register", userData);
  return response.data;
};

export const logoutUser = async () => {
  const response = await API.post("/users/logout");
  clearAuthSessionHint();
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await API.patch("/users/change-password", passwordData);
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await API.patch("/users/me", profileData);
  return response.data;
};

export const deleteAccount = async (deleteData) => {
  const response = await API.delete("/users/me", {
    data: deleteData,
  });
  return response.data;
};

export const getCurrentUser = async (config = {}) => {
  // API call for session checks: GET /api/v1/users/me.
  // Public pages can pass { skipAuthRefresh: true } so a normal logged-out
  // 401 does not trigger the refresh-token interceptor.
  const response = await API.get("/users/me", config);
  return response.data;
};

export const refreshTokens = async () => {
  const response = await refreshAPI.post("/users/refresh-tokens");
  return response.data;
};

export const checkAuth = async () => {
  return await getCurrentUser();
};

export const checkPublicAuth = async () => {
  return await getCurrentUser({ skipAuthRefresh: true });
};
