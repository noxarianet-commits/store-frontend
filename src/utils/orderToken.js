// Penyimpanan token akses order.
//
// Order ID bisa ditebak (lihat backend paymentController.js generateOrderId),
// jadi backend mewajibkan bukti kepemilikan lewat header X-Order-Token.
// Token ini diberikan ke pembeli saat order dibuat dan disimpan di sessionStorage
// supaya tetap ada setelah redirect dari payment gateway.
//
// sessionStorage (bukan localStorage) dipilih supaya token hilang saat tab ditutup
// dan tidak ter-share ke seluruh browser.

const STORE_KEY = 'noxaria_order_access_tokens';

function readStore() {
    try {
        return JSON.parse(sessionStorage.getItem(STORE_KEY)) || {};
    } catch {
        return {};
    }
}

function writeStore(store) {
    try {
        sessionStorage.setItem(STORE_KEY, JSON.stringify(store));
    } catch {
        // Storage penuh / diblokir — polling status akan gagal, bukan jadi bypass.
    }
}

/** Simpan token akses untuk sebuah order (dipanggil setelah order dibuat). */
export function saveOrderAccessToken(orderId, token) {
    if (!orderId || !token) return;
    const store = readStore();
    store[orderId] = token;
    writeStore(store);
}

/** Ambil token akses sebuah order, atau null. */
export function getOrderAccessToken(orderId) {
    if (!orderId) return null;
    return readStore()[orderId] || null;
}
