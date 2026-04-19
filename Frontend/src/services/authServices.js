import axios from "axios";

export const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

export const loginUser = async (userData) => {
  const response = await API.post("/users/login", userData);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await API.post("/users/register", userData);
  return response.data;
};

export const logoutUser = async () => {
  const response = await API.post("/users/logout");
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

export const getCurrentUser = async () => {
  const response = await API.get("/users/me");
  return response.data;
};

export const refreshTokens = async () => {
  const response = await API.post("/users/refresh-tokens");
  return response.data;
};

export const checkAuth = async () => {
  try {
    return await getCurrentUser();
  } catch (error) {
    if (error.response?.status !== 401) {
      throw error;
    }

    await refreshTokens();
    return await getCurrentUser();
  }
};
