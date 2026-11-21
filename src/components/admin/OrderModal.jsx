import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save } from 'lucide-react';

function buildInitialForm(order) {
    return {
        id: order?.id || '',
        product: order?.product || '',
        variant: order?.variant || '',
        price: order?.price || 0,
        wa_number: order?.wa_number || '',
        email: order?.email || '',
        testimonial: order?.testimonial || '',
        status: order?.status || 'PENDING',
        payment_method: order?.payment_method || '',
        account_details: order?.account_details || null,
    };
}

function buildInitialAccountDetails(order) {
    if (!order?.account_details) return '';
    return typeof order.account_details === 'object'
        ? JSON.stringify(order.account_details, null, 2)
        : String(order.account_details);
}

const OrderModal = ({ editingOrder, onClose, onSave }) => {
    const [form, setForm] = useState(() => buildInitialForm(editingOrder));
    const [accountDetailsStr, setAccountDetailsStr] = useState(() => buildInitialAccountDetails(editingOrder));
    const [manualLicense, setManualLicense] = useState('');

    if (!editingOrder) return null;

    const handleSave = () => {
        let parsedDetails = null;
        if (accountDetailsStr.trim()) {
            try {
                parsedDetails = JSON.parse(accountDetailsStr);
            } catch {
                // If not valid JSON, save as raw string
                parsedDetails = accountDetailsStr;
            }
        }

        // Quick add manual license for failed orders (or any order)
        const updatedForm = { ...form };
        if (manualLicense.trim()) {
            if (!parsedDetails || typeof parsedDetails !== 'object') {
                parsedDetails = { type: 'auto', licenses: [manualLicense.trim()] };
            } else {
                const licenses = Array.isArray(parsedDetails.licenses) ? parsedDetails.licenses : [];
                parsedDetails = {
                    ...parsedDetails,
                    licenses: [...licenses, manualLicense.trim()],
                };
            }
            // Auto set status to COMPLETED when admin adds license manually if it was FAILED or PENDING
            if (updatedForm.status === 'FAILED' || updatedForm.status === 'PENDING') {
                updatedForm.status = 'COMPLETED';
            }
        }

        onSave({ ...updatedForm, account_details: parsedDetails });
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
                <div className="p-5 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Edit Pesanan</h2>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{form.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">ID Pesanan</label>
                        <input value={form.id} disabled className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-sm text-slate-500 font-mono cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Nama Produk</label>
                        <input value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Varian</label>
                        <input value={form.variant} onChange={(e) => setForm({ ...form, variant: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Harga (Rp)</label>
                        <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 font-mono font-bold focus:outline-none focus:bg-white focus:border-purple-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">No. WhatsApp</label>
                        <input value={form.wa_number} onChange={(e) => setForm({ ...form, wa_number: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Email</label>
                        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Status</label>
                        <select
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 font-semibold cursor-pointer focus:outline-none focus:bg-white focus:border-purple-500"
                        >
                            <option value="PENDING">Menunggu</option>
                            <option value="PROCESSING">Diproses</option>
                            <option value="COMPLETED">Selesai</option>
                            <option value="FAILED">Gagal</option>
                            <option value="CANCELLED">Dibatalkan</option>
                            <option value="REFUND_PENDING">Refund Diproses</option>
                            <option value="REFUNDED">Dana Dikembalikan</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Metode Pembayaran</label>
                        <input value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500" placeholder="Contoh: QRIS" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Detail Akun / Lisensi (Format JSON atau Teks)</label>
                        <textarea
                            value={accountDetailsStr}
                            onChange={(e) => setAccountDetailsStr(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 h-28 font-mono resize-y focus:outline-none focus:bg-white focus:border-purple-500"
                            placeholder='Contoh JSON:&#10;{&#10;  "type": "auto",&#10;  "licenses": ["KEY-XYZ123"]&#10;}&#10;&#10;Atau ketik teks biasa langsung.'
                        />
                    </div>
                    {(form.status === 'FAILED' || form.status === 'PENDING') && (
                        <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl">
                            <label className="block text-xs text-purple-800 font-bold mb-1.5">Isi Lisensi / Kredensial Manual</label>
                            <input
                                value={manualLicense}
                                onChange={(e) => setManualLicense(e.target.value)}
                                className="w-full bg-white border border-purple-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-purple-500"
                                placeholder="Ketik SN / Email & Password untuk dikirim ke pembeli..."
                            />
                            <p className="text-[11px] text-purple-600 mt-2">
                                Mengisi kolom ini akan otomatis menambahkannya ke data lisensi dan merubah status menjadi <span className="font-bold text-emerald-700">Selesai</span>.
                            </p>
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Testimonial</label>
                        <textarea value={form.testimonial} onChange={(e) => setForm({ ...form, testimonial: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 h-24 resize-none focus:outline-none focus:bg-white focus:border-purple-500" />
                    </div>
                </div>

                <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2.5">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 shadow-xs transition-all">Batal</button>
                    <button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2">
                        <Save size={15} /> Simpan Perubahan
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default OrderModal;
