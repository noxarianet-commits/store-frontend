import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api'
});

// Add a request interceptor to include the admin token
api.interceptors.request.use(config => {
    const token = localStorage.getItem('adminToken');
    if (token) {
        // Gunakan standar Authorization: Bearer header
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default api;
