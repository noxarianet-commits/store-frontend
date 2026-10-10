// Konfigurasi label & warna tiket — dipakai StatusBadge (tema terang) dan
// form tiket. Versi gelap untuk dashboard admin didefinisikan lokal di
// components/admin/TicketsTab.jsx.
//
// Dipisah dari StatusBadge.jsx agar file komponen hanya mengekspor komponen
// (aturan react-refresh/only-export-components).

export const STATUS_CONFIG = {
    open: { label: 'Terbuka', className: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
    pending: { label: 'Menunggu CS', className: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
    closed: { label: 'Selesai', className: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
};

export const PRIORITY_CONFIG = {
    low: { label: 'Rendah', className: 'bg-slate-100 text-slate-500 border-slate-200' },
    normal: { label: 'Normal', className: 'bg-slate-100 text-slate-600 border-slate-200' },
    high: { label: 'Tinggi', className: 'bg-orange-50 text-orange-700 border-orange-200' },
    urgent: { label: 'Mendesak', className: 'bg-red-50 text-red-700 border-red-200' },
};

export const CATEGORY_LABELS = {
    umum: 'Umum',
    pesanan: 'Pesanan',
    pembayaran: 'Pembayaran',
    produk: 'Produk',
    akun: 'Akun',
    lainnya: 'Lainnya',
};
