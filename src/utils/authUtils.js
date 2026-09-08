/**
 * Check if a JWT token is expired or invalid.
 * @param {string} token
 * @returns {boolean} true if token is expired, missing, or malformed, false if still valid
 */
export const isTokenExpired = (token) => {
    if (!token || typeof token !== 'string') return true;
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return true;
        const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
        const payload = JSON.parse(payloadJson);
        if (!payload.exp) return false;
        // 5 second buffer for network latency
        return payload.exp * 1000 <= Date.now() + 5000;
    } catch {
        return true;
    }
};
