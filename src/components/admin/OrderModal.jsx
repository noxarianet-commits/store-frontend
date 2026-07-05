import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save } from 'lucide-react';

const OrderModal = ({ editingOrder, onClose, onSave }) => {
    const [form, setForm] = useState({
        id: '', product: '', variant: '', price: 0,
        wa_number: '', email: '', testimonial: '',
        status: 'PENDING', payment_method: '',
        account_details: null
    });
    const [accountDetailsStr, setAccountDetailsStr] = useState('');

    useEffect(() => {
        if (editingOrder) {
            setForm({
                id: editingOrder.id || '',
                product: editingOrder.product || '',
                variant: editingOrder.variant || '',
                price: editingOrder.price || 0,
                wa_number: editingOrder.wa_number || '',
                email: editingOrder.email || '',
                testimonial: editingOrder.testimonial || '',
                status: editingOrder.status || 'PENDING',
                payment_method: editingOrder.payment_method || '',
                account_details: editingOrder.account_details || null
            });
            setAccountDetailsStr(
                editingOrder.account_details
                    ? (typeof editingOrder.account_details === 'object'
                        ? JSON.stringify(editingOrder.account_details, null, 2)
                        : String(editingOrder.account_details))
                    : ''
            );
        }
    }, [editingOrder]);

    if (!editingOrder) return null;

    const handleSave = () => {
        let parsedDetails = null;
        if (accountDetailsStr.trim()) {
            try {
                parsedDetails = JSON.parse(accountDetailsStr);
            } catch (err) {
                // If not valid JSON, save as raw string
                parsedDetails = accountDetailsStr;
            }
        }
        onSave({ ...form, account_details: parsedDetails });
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80"
                onClick={onClose}
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-lg bg-[#0E0E0E] border border-white/10 rounded-3xl overflow-hidden"
            >
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Edit Pesanan</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white"><X size={20} /></button>
                </div>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1.5">ID Pesanan</label>
                        <input value={form.id} disabled className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white opacity-50 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1.5">Nama Produk</label>
                        <input value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1.5">Varian</label>
                        <input value={form.variant} onChange={(e) => setForm({ ...form, variant: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1.5">Harga (Rp)</label>
                        <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1.5">No. WhatsApp</label>
                        <input value={form.wa_number} onChange={(e) => setForm({ ...form, wa_number: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1.5">Email</label>
                        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1.5">Status</label>
                        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl p-3 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-purple-500/50">
                            <option value="PENDING" className="bg-[#1a1a2e] text-white">Menunggu</option>
                            <option value="PROCESSING" className="bg-[#1a1a2e] text-white">Diproses</option>
                            <option value="COMPLETED" className="bg-[#1a1a2e] text-white">Selesai</option>
                            <option value="FAILED" className="bg-[#1a1a2e] text-white">Gagal</option>
                            <option value="CANCELLED" className="bg-[#1a1a2e] text-white">Dibatalkan</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1.5">Metode Pembayaran</label>
                        <input value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white" placeholder="Contoh: QRIS" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1.5">Detail Akun / Lisensi (Format JSON atau Teks)</label>
                        <textarea
                            value={accountDetailsStr}
                            onChange={(e) => setAccountDetailsStr(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white h-28 font-mono resize-y focus:outline-none focus:border-purple-500/50"
                            placeholder='Contoh JSON:&#10;{&#10;  "type": "auto",&#10;  "licenses": ["KEY-XYZ123"]&#10;}&#10;&#10;Atau ketik teks biasa langsung.'
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1.5">Testimonial</label>
                        <textarea value={form.testimonial} onChange={(e) => setForm({ ...form, testimonial: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white h-24 resize-none" />
                    </div>
                </div>

                <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-3 rounded-xl text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition-all">Batal</button>
                    <button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                        <Save size={18} /> Simpan
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default OrderModal;
