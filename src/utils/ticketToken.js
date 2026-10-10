// Penyimpanan token akses tiket bantuan CS.
//
// Ticket number bisa ditebak (format TK-YYYYMMDD-XXXX), jadi backend mewajibkan
// bukti kepemilikan lewat header X-Ticket-Token (atau ?token= untuk SSE).
// Token 32 byte hex ini diberikan saat tiket dibuat dan hanya berlaku untuk
// satu tiket.
//
// localStorage (bukan sessionStorage seperti orderToken.js) dipilih karena
// tamu perlu membuka kembali tiketnya di kunjungan berikutnya — kalau hanya
// sessionStorage, tiket tamu jadi tidak bisa diakses lagi begitu tab ditutup.
// Isi yang disimpan hanya token milik tiket itu sendiri, bukan data sensitif lain.

const STORE_KEY = 'noxaria_ticket_access_tokens';

function readStore() {
    try {
        return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
    } catch {
        return {};
    }
}

function writeStore(store) {
    try {
        localStorage.setItem(STORE_KEY, JSON.stringify(store));
    } catch {
        // Storage penuh / diblokir — akses tiket tamu akan hilang, bukan celah keamanan.
    }
}

/**
 * Simpan token akses sebuah tiket (dipanggil setelah tiket dibuat).
 * @param {string} ticketNumber
 * @param {string} token
 * @param {{ subject?: string, createdAt?: string }} meta — untuk daftar tiket tamu
 */
export function saveTicketAccess(ticketNumber, token, meta = {}) {
    if (!ticketNumber || !token) return;
    const store = readStore();
    store[ticketNumber] = {
        token,
        subject: meta.subject || store[ticketNumber]?.subject || '',
        createdAt: meta.createdAt || store[ticketNumber]?.createdAt || new Date().toISOString(),
    };
    writeStore(store);
}

/** Ambil token akses sebuah tiket, atau null. */
export function getTicketAccessToken(ticketNumber) {
    if (!ticketNumber) return null;
    return readStore()[ticketNumber]?.token || null;
}

/** Daftar tiket tamu yang tersimpan di browser ini (terbaru dulu). */
export function listGuestTickets() {
    const store = readStore();
    return Object.entries(store)
        .map(([ticketNumber, value]) => ({
            ticket_number: ticketNumber,
            subject: value?.subject || '',
            created_at: value?.createdAt || null,
        }))
        .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}

/** Hapus token tiket dari browser (mis. setelah ditutup permanen). */
export function removeTicketAccess(ticketNumber) {
    const store = readStore();
    delete store[ticketNumber];
    writeStore(store);
}
