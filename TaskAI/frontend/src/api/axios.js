import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8081',
    headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token from localStorage to every request
api.interceptors.request.use(
    (config) => {
        const storedUser = localStorage.getItem('user');
        const tokenFromUser = storedUser ? JSON.parse(storedUser)?.token : null;
        const tokenFromKey = localStorage.getItem('token');
        const token = tokenFromUser || tokenFromKey;
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// On 401 redirect to login (Unauthorized)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
