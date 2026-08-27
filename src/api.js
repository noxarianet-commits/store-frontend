import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
});

// Add a request interceptor to include the admin token
api.interceptors.request.use(config => {
    const token = localStorage.getItem('adminToken');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        const url = error.config?.url || '';
        if (
            window.location.pathname.includes('admin') ||
            window.location.pathname.includes('error') ||
            url.includes('/validate') ||
            url.includes('/payments/status')
        ) {
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

// Unified Product API methods
api.getProducts = (params) => api.get('/products', { params });
api.getProduct = (id) => api.get(`/products/${id}`);
api.validateAccount = (data) => api.post('/products/validate', data);

// Unified Admin Product API methods
api.getAdminProducts = (params) => api.get('/admin/products/products', { params });
api.getAdminSyncStatus = (vendor) => api.get('/admin/products/sync-status', { params: { vendor } });
api.getAdminBalance = (vendor) => api.get('/admin/products/balance', { params: { vendor } });
api.triggerSync = (vendor, type = 'full') => api.post('/admin/products/sync', { vendor, type });
api.updateAdminMarkup = (productId, data) => api.patch(`/admin/products/products/${productId}/markup`, data);
api.toggleAdminProduct = (productId) => api.patch(`/admin/products/products/${productId}/toggle`);
api.toggleAdminFeatured = (productId) => api.patch(`/admin/products/products/${productId}/featured`);
api.toggleVariantHidden = (variantId) => api.patch(`/admin/products/variants/${variantId}/toggle-hidden`);
api.applyGlobalMarkup = (vendor, markup) => api.post('/admin/products/global-markup', { vendor, markup });

export default api;
