/**
 * Helper untuk membaca flag "Wajib Validasi Akun" dari settings publik.
 *
 * Backend (utils/settingFlags.js) memakai aturan yang sama:
 *   - `mandatory_validation`        = saklar master untuk semua channel
 *   - `mandatory_validation_web`    = override channel web (opsional)
 *   - `mandatory_validation_app`    = override channel app (opsional)
 *
 * Effective untuk sebuah channel:
 *   master harus ON, dan override channel (bila ada) tidak boleh OFF.
 *
 * Fail-safe: nilai hilang / tidak valid berarti validasi tetap wajib.
 */

export const MASTER_VALIDATION_KEY = 'mandatory_validation';

export const CHANNEL_VALIDATION_KEYS = Object.freeze({
    web: 'mandatory_validation_web',
    app: 'mandatory_validation_app',
});

/**
 * Parse nilai setting menjadi boolean. null = bukan boolean / belum diatur.
 * @param {unknown} raw
 * @returns {boolean|null}
 */
export function parseBoolSetting(raw) {
    if (typeof raw === 'boolean') return raw;
    if (typeof raw === 'string') {
        const str = raw.trim().toLowerCase();
        if (str === 'true') return true;
        if (str === 'false') return false;
        try {
            const parsed = JSON.parse(raw);
            if (parsed !== raw) return parseBoolSetting(parsed);
        } catch {
            // bukan JSON dan bukan boolean -> dianggap belum diatur
        }
        return null;
    }
    if (raw && typeof raw === 'object') {
        const value = raw.value ?? raw.enabled ?? raw.active;
        if (value === raw) return null;
        return parseBoolSetting(value);
    }
    return null;
}

/**
 * @param {Record<string, unknown>|null|undefined} settings
 * @param {'web'|'app'} [channel]
 * @returns {boolean} true ketika validasi akun wajib dilakukan.
 */
export function isMandatoryValidationForChannel(settings, channel = 'web') {
    const master = parseBoolSetting(settings?.[MASTER_VALIDATION_KEY]);
    if (master === false) return false;

    const key = CHANNEL_VALIDATION_KEYS[channel] || CHANNEL_VALIDATION_KEYS.web;
    const override = parseBoolSetting(settings?.[key]);
    return override !== false;
}
