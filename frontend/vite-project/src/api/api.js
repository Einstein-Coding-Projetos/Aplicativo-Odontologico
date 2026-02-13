import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

api.interceptors.request.use((config) => {
  const publicRoutes = [
    "accounts/register/",
    "accounts/login/",
  ];

  if (!publicRoutes.some(route => config.url.includes(route))) {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default api; // 👈 FALTAVA ISSO

