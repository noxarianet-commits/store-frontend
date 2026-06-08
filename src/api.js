import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
});

// Add a request interceptor to include the admin token
api.interceptors.request.use(config => {
    const token = localStorage.getItem('adminToken');
    if (token) {
        // Gunakan standar Authorization: Bearer header
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
    return Promise.reject(error);
});

// Add a response interceptor to handle global errors (500, 429, Network Error)
api.interceptors.response.use(
    response => response,
    error => {
        // Jangan redirect jika error terjadi di halaman admin atau jika kita sedang berada di halaman error itu sendiri
        if (window.location.pathname.includes('admin') || window.location.pathname.includes('error')) {
            return Promise.reject(error);
        }

        if (!error.response) {
            // Network error atau server mati total
            window.location.href = '/error?type=network';
        } else {
            const status = error.response.status;
            if (status === 429) {
                // Rate limit
                window.location.href = '/error?type=ratelimit';
            } else if (status >= 500) {
                // Server error (500, 502, 503, 504)
                window.location.href = '/error?type=server';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
