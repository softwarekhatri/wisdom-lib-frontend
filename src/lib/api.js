import axios from "axios";

const api = axios.create({
  baseURL: "https://wisdom-library-backend.vercel.app/api",
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("wl_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path.startsWith("/admin") || path.startsWith("/student")) {
        localStorage.removeItem("wl_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  },
);

export default api;
