import axios from "axios";

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

        console.log('🔑 API Request:', config.method?.toUpperCase(), config.url);
        console.log('🔑 Token present:', !!token, token ? `(${token.substring(0, 20)}...)` : '(none)');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }


);

api.interceptors.response.use(
    (response) => {
        console.log('✅ API Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
        return response;
    },
    (error) => {
        console.error('❌ API Error:', error.config?.method?.toUpperCase(), error.config?.url);
        console.error('❌ Status:', error.response?.status);
        console.error('❌ Error data:', error.response?.data);
        
        if(error.response?.status === 401) {
            console.warn('🚫 401 Unauthorized - Clearing tokens and redirecting to login');
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");

            window.location.href = "/login";
        }
    

        return Promise.reject(error);
    }
);

export default api;
        