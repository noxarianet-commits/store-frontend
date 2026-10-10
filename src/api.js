import axios from 'axios';
import { getOrderAccessToken } from './utils/orderToken';
import { getTicketAccessToken } from './utils/ticketToken';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
});

// Order ID bisa ditebak, jadi backend mewajibkan X-Order-Token untuk
// /payments/status/:orderId dan /payments/cancel. Token diambil otomatis dari
// sessionStorage supaya purchaser tidak perlu mengirimnya manual.
function attachOrderAccessToken(config) {
    const url = config.url || '';
    let orderId = null;

    const statusMatch = url.match(/\/payments\/status\/([^/?]+)/);
    if (statusMatch) {
        orderId = decodeURIComponent(statusMatch[1]);
    } else if (url.includes('/payments/cancel')) {
        // order_id ada di body request
        try {
            orderId = typeof config.data === 'string' ? JSON.parse(config.data).order_id : config.data?.order_id;
        } catch { /* body bukan JSON */ }
    }

    const token = getOrderAccessToken(orderId);
    if (token) {
        config.headers['X-Order-Token'] = token;
    }
    return config;
}

// Ticket number bisa ditebak, jadi backend mewajibkan X-Ticket-Token untuk
// /tickets/:ticketNumber (kecuali admin — admin pakai JWT). Token disimpan
// localStorage oleh utils/ticketToken.js, terutama untuk tamu tanpa akun.
function attachTicketAccessToken(config) {
    const url = config.url || '';
    if (url.includes('/admin')) return config;

    const match = url.match(/\/tickets\/([^/?]+)/);
    if (match) {
        const ticketNumber = decodeURIComponent(match[1]);
        const token = getTicketAccessToken(ticketNumber);
        if (token) {
            config.headers['X-Ticket-Token'] = token;
        }
    }
    return config;
}

// Add a request interceptor to include the admin or user token
api.interceptors.request.use(config => {
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('userToken');
    
    // Determine context: admin dashboard pages use adminToken, all other pages use userToken
    const isAdminPage = window.location.pathname.includes('admin');
    const isAdminApiCall = config.url && (config.url.includes('/admin') || config.url.includes('/orders'));
    
    if ((isAdminPage || isAdminApiCall) && adminToken) {
        config.headers['Authorization'] = `Bearer ${adminToken}`;
    } else if (userToken) {
        config.headers['Authorization'] = `Bearer ${userToken}`;
    } else if (adminToken) {
        // Fallback: attach admin token if no user token (backward compat)
        config.headers['Authorization'] = `Bearer ${adminToken}`;
    }

    return attachTicketAccessToken(attachOrderAccessToken(config));
});

api.interceptors.response.use(
    response => response,
    error => {
        const url = error.config?.url || '';
        const status = error.response?.status;
        const isLoginAttempt = url.includes('/admin/login');
        // Tanpa garis miring di akhir supaya tetap cocok untuk '/auth' polos —
        // endpoint OTP baru semuanya harus punya error yang tampil di form,
        // bukan dialihkan ke halaman /error.
        // '/tickets' pelanggan (bukan /admin/tickets) juga di-bail-out: 401 di
        // sana wajar untuk tamu dan tidak boleh dianggap sesi admin berakhir.
        const isUserAuthRoute = url.includes('/auth') || url.includes('/balance')
            || (url.includes('/tickets') && !url.includes('/admin'));
        const isAdminSessionError = !isLoginAttempt && !isUserAuthRoute && (
            status === 401 ||
            (status === 403 && (url.includes('/admin') || Boolean(localStorage.getItem('adminToken'))))
        );

        if (isAdminSessionError) {
            const message = error.response?.data?.error || 'Sesi login telah berakhir. Silakan login kembali.';
            localStorage.removeItem('adminToken');
            window.dispatchEvent(new CustomEvent('admin:session_expired', { detail: { message } }));

            if (!window.location.pathname.includes('admin')) {
                window.location.href = '/admin-dashboard';
            }
            return Promise.reject(error);
        }

        if (
            window.location.pathname.includes('admin') ||
            window.location.pathname.includes('error') ||
            window.location.pathname.includes('/auth') ||
            window.location.pathname.includes('/dashboard') ||
            window.location.pathname.includes('/ticket') ||
            url.includes('/auth') ||
            url.includes('/balance') ||
            url.includes('/validate') ||
            url.includes('/tickets') ||
            url.includes('/payments/status')
        ) {
            return Promise.reject(error);
        }

        if (!error.response) {
            // Network error atau server mati total
            window.location.href = '/error?type=network';
        } else {
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

// Auth
//
// Registrasi dan lupa password keduanya 2 langkah: endpoint pertama mengirim OTP
// dan TIDAK mengembalikan token, endpoint kedua menukar OTP itu dengan token.
// Jangan pernah menganggap authRegister() mengembalikan sesi yang sudah login.
api.authRegister = (data) => api.post('/auth/register', data);
api.authVerifyRegistration = (data) => api.post('/auth/register/verify', data);
api.authResendRegistration = (email) => api.post('/auth/register/resend', { email });
api.authLogin = (data) => api.post('/auth/login', data);
api.authForgotPassword = (email) => api.post('/auth/forgot-password', { email });
api.authVerifyResetPassword = (data) => api.post('/auth/forgot-password/verify', data);
api.authResendResetPassword = (email) => api.post('/auth/forgot-password/resend', { email });
api.authProfile = () => api.get('/auth/profile');
api.authUpdateProfile = (data) => api.put('/auth/profile', data);
api.authChangePassword = (data) => api.put('/auth/password', data);
api.getUserOrders = (params) => api.get('/auth/orders', { params });

// Balance
api.getBalance = () => api.get('/balance');
api.createTopup = (data) => api.post('/balance/topup', data);
api.getTopupStatus = (id) => api.get(`/balance/topup/${id}/status`);
api.getPendingTopup = () => api.get('/balance/topup/pending');
api.cancelPendingTopup = (id) => api.post('/balance/topup/cancel', { id });
api.getBalanceHistory = (params) => api.get('/balance/history', { params });

// Tiket Bantuan CS — pelanggan / tamu
api.createTicket = (data) => api.post('/tickets', data);
api.getMyTickets = (params) => api.get('/tickets', { params });
api.getTicket = (ticketNumber) => api.get(`/tickets/${encodeURIComponent(ticketNumber)}`);
api.addTicketMessage = (ticketNumber, body) => api.post(`/tickets/${encodeURIComponent(ticketNumber)}/messages`, { body });
api.reopenTicket = (ticketNumber) => api.patch(`/tickets/${encodeURIComponent(ticketNumber)}/reopen`);

// Tiket Bantuan CS — admin
api.getAdminTickets = (params) => api.get('/admin/tickets', { params });
api.getAdminTicketStats = () => api.get('/admin/tickets/stats');
api.getAdminTicket = (ticketNumber) => api.get(`/admin/tickets/${encodeURIComponent(ticketNumber)}`);
api.replyAdminTicket = (ticketNumber, body) => api.post(`/admin/tickets/${encodeURIComponent(ticketNumber)}/messages`, { body });
api.updateAdminTicket = (ticketNumber, data) => api.patch(`/admin/tickets/${encodeURIComponent(ticketNumber)}`, data);

export default api;
