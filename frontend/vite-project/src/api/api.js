import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access"); // 👈 JWT access
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // 👈 JWT usa Bearer
  }
  return config;
});

export default api;
