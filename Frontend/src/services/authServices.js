import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

export const loginUser = async (userData) => {
  const response = await API.post("/users/login", userData);
  return response.data;
};