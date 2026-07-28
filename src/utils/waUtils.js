/**
 * WhatsApp Helper Utilities
 */

export const DEFAULT_WA_NUMBER = '6285199605580';

/**
 * Returns clean numeric WA CS number from settings or default.
 * @param {object|string} settings - Settings object or waNumber string
 * @returns {string} e.g. "6285199605580"
 */
export function getWaNumber(settings) {
    if (!settings) return DEFAULT_WA_NUMBER;
    if (typeof settings === 'string') return settings.replace(/\D/g, '') || DEFAULT_WA_NUMBER;
    const num = settings.whatsapp_cs;
    if (!num) return DEFAULT_WA_NUMBER;
    return String(num).replace(/\D/g, '') || DEFAULT_WA_NUMBER;
}

/**
 * Format numeric WA number to display format e.g. "+62 851-9960-5580"
 * @param {string} number 
 * @returns {string}
 */
export function formatWaDisplay(number) {
    const clean = (number || DEFAULT_WA_NUMBER).replace(/\D/g, '');
    if (clean.startsWith('62') && clean.length >= 10) {
        const rest = clean.slice(2);
        // split rest into chunks like 851-9960-5580
        if (rest.length <= 7) {
            return `+62 ${rest.slice(0, 3)}-${rest.slice(3)}`;
        }
        return `+62 ${rest.slice(0, 3)}-${rest.slice(3, 7)}-${rest.slice(7)}`;
    }
    return `+${clean}`;
}

/**
 * Returns full wa.me link with optional pre-filled message.
 * @param {object|string} settings 
 * @param {string} [message] 
 * @returns {string}
 */
export function getWaUrl(settings, message = '') {
    const num = getWaNumber(settings);
    if (!message) return `https://wa.me/${num}`;
    return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}
