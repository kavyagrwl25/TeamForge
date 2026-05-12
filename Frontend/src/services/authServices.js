import axios from "axios";
import {
  isRateLimitError,
  UNAUTHORIZED_MESSAGE,
  normalizeApiError,
  shouldNotifyGlobalApiError,
} from "../utils/apiErrorHelpers";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1";
const AUTH_SESSION_HINT_KEY = "teamforge_has_session";
let refreshRequest = null;
let authFailureHandler = null;
let globalApiErrorHandler = null;
let lastGlobalApiError = null;
const AUTH_ROUTE_MATCHERS = [
  "/users/login",
  "/users/register",
  "/users/refresh-token",
  "/users/refresh-tokens",
];

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

export const setGlobalApiErrorHandler = (handler) => {
  globalApiErrorHandler = handler;

  return () => {
    if (globalApiErrorHandler === handler) {
      globalApiErrorHandler = null;
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

  return request?.skipAuthRefresh || AUTH_ROUTE_MATCHERS.some((route) => url.includes(route));
};

const isAuthRouteRequest = (request) => {
  const url = request?.url || "";

  return AUTH_ROUTE_MATCHERS.some((route) => url.includes(route));
};

const notifyGlobalApiError = (error) => {
  if (
    !globalApiErrorHandler ||
    !shouldNotifyGlobalApiError(error, {
      suppressNotification: isAuthRouteRequest(error?.config),
    })
  ) {
    return;
  }

  const status = error.response?.status;
  const message = error.userMessage || error.response?.data?.message;

  if (!message) {
    return;
  }

  const now = Date.now();

  if (
    lastGlobalApiError &&
    lastGlobalApiError.status === status &&
    lastGlobalApiError.message === message &&
    now - lastGlobalApiError.timestamp < 1500
  ) {
    return;
  }

  lastGlobalApiError = {
    status,
    message,
    timestamp: now,
  };

  globalApiErrorHandler({
    id: now,
    status,
    message,
  });
};

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isAuthRouteError = isAuthRouteRequest(error?.config);
    const normalizedError = normalizeApiError(error, {
      unauthorizedMessage:
        !isAuthRouteError && !error?.config?.skipAuthRefresh
          ? UNAUTHORIZED_MESSAGE
          : undefined,
    });
    const originalRequest = normalizedError.config;

    if (isRateLimitError(normalizedError)) {
      notifyGlobalApiError(normalizedError);
      return Promise.reject(normalizedError);
    }

    if (
      normalizedError.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      shouldSkipAuthRefresh(originalRequest)
    ) {
      notifyGlobalApiError(normalizedError);
      return Promise.reject(normalizedError);
    }

    // Interceptor flow: a protected request received 401, so the access token
    // cookie may be expired. Mark this request as retried to prevent loops.
    originalRequest._retry = true;
    originalRequest.withCredentials = true;
    originalRequest.baseURL = originalRequest.baseURL || API_BASE_URL;

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
      const normalizedRefreshError = normalizeApiError(refreshError, {
        unauthorizedMessage: UNAUTHORIZED_MESSAGE,
      });

      if (isRateLimitError(normalizedRefreshError)) {
        notifyGlobalApiError(normalizedRefreshError);
        return Promise.reject(normalizedRefreshError);
      }

      // Refresh failure means both cookies are no longer usable. Clear frontend
      // auth state through App.jsx, then send the user back to login.
      clearAuthSessionHint();

      if (authFailureHandler) {
        authFailureHandler();
      } else if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }

      return Promise.reject(normalizedRefreshError);
    }
  }
);

export const loginUser = async (userData) => {
  const response = await API.post("/users/login", userData);
  markAuthSessionKnown();
  return response;
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
  const response = await refreshAPI.post(
    "/users/refresh-tokens",
    {},
    { withCredentials: true }
  );
  return response.data;
};

export const checkAuth = async () => {
  return await getCurrentUser();
};

export const checkPublicAuth = async () => {
  return await getCurrentUser({ skipAuthRefresh: true });
};
