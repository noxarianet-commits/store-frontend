/**
 * Konstanta & helper untuk input OTP.
 *
 * Dipisah dari components/auth/OtpInput.jsx supaya file komponen itu hanya
 * mengekspor komponen — aturan `react-refresh/only-export-components` menolak
 * file yang mencampur komponen dengan helper biasa.
 */

export const OTP_LENGTH = 6;

/**
 * Buang semua non-digit dan potong ke panjang maksimum.
 *
 * Dipakai untuk setiap input dari user supaya caller cukup memanggil
 * `sanitizeOtp(raw)` tanpa perlu tahu aturan input-nya.
 *
 * @param {string} raw
 * @returns {string} Hanya digit, maksimal OTP_LENGTH karakter
 */
export function sanitizeOtp(raw) {
    return String(raw || '').replace(/\D/g, '').slice(0, OTP_LENGTH);
}