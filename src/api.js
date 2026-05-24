import axios from 'axios';

const api = axios.create({
    baseURL: '/api'
});

// Add a request interceptor to include the admin token
api.interceptors.request.use(config => {
    const token = localStorage.getItem('adminToken');
    if (token) {
        config.headers['x-admin-token'] = token;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default api;
