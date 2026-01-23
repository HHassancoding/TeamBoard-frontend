import axios from "axios";
import { queryClient } from "../main";

console.log("API BASE URL =", import.meta.env.VITE_API_BASE_URL);

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add request logging for debugging
        const requestId = Math.random().toString(36).substr(2, 9);
        const timestamp = new Date().toISOString();
        console.log(`[${requestId}] ${config.method?.toUpperCase()} ${config.url}`, {
            hasToken: !!token,
            timestamp,
        });
        
        // Attach requestId to config for response logging
        (config as any)._requestId = requestId;
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const requestId = (error.config as any)?._requestId || 'UNKNOWN';
        const timestamp = new Date().toISOString();
        
        console.error(`[${requestId}] API Request Failed:`, {
            url: error.config?.url,
            method: error.config?.method?.toUpperCase(),
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
            timestamp,
        });
        
        if(error.response?.status === 401) {
            console.warn(`[${requestId}] 401 Unauthorized - Clearing tokens and cache, redirecting to login`);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            queryClient.clear();
            console.log("✅ cache cleared on 401");
            window.location.href = "/login";
        }
        
        if(error.response?.status === 403) {
            console.warn(`[${requestId}] 403 Forbidden - User may not have permission for this resource`);
        }
        
        if(error.response?.status === 404) {
            console.warn(`[${requestId}] 404 Not Found - Resource does not exist`);
        }
        
        return Promise.reject(error);
    }
);

export default api;
        