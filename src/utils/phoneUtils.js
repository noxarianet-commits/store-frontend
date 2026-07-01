/**
 * phoneUtils.js — Indonesian phone number normalization for e-wallet products.
 *
 * Sekalipay API requires phone numbers in "08xxxxxxxxxx" format.
 * Users may input: +62 812-3456-7890, 0812 3456 7890, 62812345, etc.
 */

/**
 * Normalize an Indonesian phone number to 08xxx format.
 *
 * Steps:
 *  1. Strip all non-digit characters (spaces, dashes, parens, +)
 *  2. Convert leading "62" → "0"  (handles both +62 and 62)
 *  3. If it starts with "8" (no leading 0 or 62), prepend "0"
 *  4. Return unchanged if it doesn't look like a phone number
 *
 * @param {string} input — Raw user input
 * @returns {string} Normalized phone number, or original input if not a phone pattern
 */
export function normalizePhoneNumber(input) {
    if (!input || typeof input !== 'string') return input;

    // Strip everything except digits
    const digits = input.replace(/\D/g, '');

    // Too short to be a phone number — return original
    if (digits.length < 8) return input;

    // "628xxxxxxxx" → "08xxxxxxxx"
    if (digits.startsWith('62') && digits.length >= 10) {
        return '0' + digits.slice(2);
    }

    // "8xxxxxxxx" (no leading 0) → "08xxxxxxxx"
    if (digits.startsWith('8') && digits.length >= 9) {
        return '0' + digits;
    }

    // Already starts with "0" — return digits only (cleaned)
    if (digits.startsWith('0')) {
        return digits;
    }

    // Not a recognizable phone pattern — return original to avoid mangling game IDs, etc.
    return input;
}
