import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Loader2, Plus } from 'lucide-react';
import { iconOptions } from '../ui/iconMap';

const ProductModal = ({ isAdding, editingProduct, onClose, onSave }) => {
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: '', category: '', icon: '', is_active: true,
        features: [], variants: [{ name: '', price: 0 }]
    });

    useEffect(() => {
        if (editingProduct) {
            setForm({
                name: editingProduct.name || '',
                category: editingProduct.category || '',
                icon: editingProduct.icon || '',
                is_active: editingProduct.is_active !== false,
                features: editingProduct.features || [],
                variants: editingProduct.variants?.length
                    ? editingProduct.variants.map(v => ({ name: v.name || '', price: v.price || 0 }))
                    : [{ name: '', price: 0 }]
            });
        } else if (isAdding) {
            // Reset form for new product
            setForm({
                name: '', category: '', icon: '', is_active: true,
                features: [], variants: [{ name: '', price: 0 }]
            });
        }
    }, [editingProduct, isAdding]);

    const handleSave = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        try {
            await onSave(form);
        } finally {
            setSaving(false);
        }
    };

    const addVariant = () => {
        setForm({ ...form, variants: [...form.variants, { name: '', price: 0 }] });
    };

    const removeVariant = (idx) => {
        const variants = form.variants.filter((_, i) => i !== idx);
        setForm({ ...form, variants });
    };

    const updateVariant = (idx, field, value) => {
        const variants = [...form.variants];
        variants[idx] = { ...variants[idx], [field]: value };
        setForm({ ...form, variants });
    };

    const addFeature = () => {
        setForm({ ...form, features: [...(form.features || []), ''] });
    };

    const removeFeature = (idx) => {
        const features = (form.features || []).filter((_, i) => i !== idx);
        setForm({ ...form, features });
    };

    const updateFeature = (idx, value) => {
        const features = [...(form.features || [])];
        features[idx] = value;
        setForm({ ...form, features });
    };

    if (!isAdding && !editingProduct) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60"
                onClick={onClose}
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
            >
                <div className="p-5 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">{isAdding ? 'Tambah Produk Baru' : 'Edit Produk'}</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 sm:p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-4">Informasi Dasar</h4>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Nama Produk</label>
                            <input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500 transition-colors"
                                placeholder="contoh: Jasa Pembuatan Website"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Kategori</label>
                            <input
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500 transition-colors"
                                placeholder="contoh: Layanan Jasa"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Ikon</label>
                            <select
                                value={form.icon}
                                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 cursor-pointer focus:outline-none focus:bg-white focus:border-purple-500 transition-colors"
                            >
                                {iconOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-3 pt-1">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Status Aktif</label>
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, is_active: !form.is_active })}
                                className={`relative w-12 h-6 rounded-full transition-all ${form.is_active ? 'bg-emerald-600' : 'bg-slate-300'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full transition-all transform ${form.is_active ? 'translate-x-7' : 'translate-x-1'} mt-1 shadow-xs`} />
                            </button>
                        </div>

                        {/* Features */}
                        <div className="pt-2">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Fitur / Kelebihan</label>
                                <button type="button" onClick={addFeature} className="text-xs font-bold text-purple-600 hover:text-purple-800">+ Tambah Fitur</button>
                            </div>
                            {(form.features || []).map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-2 mb-2">
                                    <input
                                        value={feature}
                                        onChange={(e) => updateFeature(idx, e.target.value)}
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500 transition-colors"
                                        placeholder="Fitur..."
                                    />
                                    <button type="button" onClick={() => removeFeature(idx)} className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50"><X size={14} /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider">Varian Harga</h4>
                            <button
                                type="button"
                                onClick={addVariant}
                                className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-xl font-bold hover:bg-purple-100 transition-all flex items-center gap-1"
                            >
                                <Plus size={13} /> Tambah Varian
                            </button>
                        </div>
                        {form.variants.map((variant, idx) => (
                            <div key={idx} className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Varian {idx + 1}</span>
                                    {form.variants.length > 1 && (
                                        <button type="button" onClick={() => removeVariant(idx)} className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50"><X size={14} /></button>
                                    )}
                                </div>
                                <input
                                    value={variant.name}
                                    onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-purple-500"
                                    placeholder="Nama varian (contoh: 1 Bulan / Paket Basic)"
                                />
                                <input
                                    type="number"
                                    value={variant.price}
                                    onChange={(e) => updateVariant(idx, 'price', parseInt(e.target.value) || 0)}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-500"
                                    placeholder="Harga (Rp)"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2.5">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 shadow-xs transition-all"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                        {isAdding ? 'Simpan' : 'Perbarui'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ProductModal;
