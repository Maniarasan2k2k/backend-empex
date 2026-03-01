import axios from "axios";

// 🌍 Use environment variables for API URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// 🔐 Token Interceptor: Attach Auth Token if exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 🚀 Response Interceptor: Standardize API responses and handle errors
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        // Global error handling: Auto logout on 401 Unauth
        if (error.response?.status === 401) {
            console.warn("🔐 Session expired. Logging out...");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // window.location.href = "/login"; // Optional: Redirect if needed
        }

        // Standardize error object
        const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred.";
        return Promise.reject(errorMessage);
    }
);

export default api;
