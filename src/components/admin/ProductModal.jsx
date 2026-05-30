import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';
import { iconOptions } from '../ui/iconMap';

const ProductModal = ({ isModalOpen, setIsModalOpen, editingProduct, productForm, setProductForm, saveProduct }) => {
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await saveProduct();
        } finally {
            setSaving(false);
        }
    };

    const addVariant = () => {
        setProductForm({ ...productForm, variants: [...productForm.variants, { name: '', price: 0 }] });
    };

    const removeVariant = (idx) => {
        const variants = productForm.variants.filter((_, i) => i !== idx);
        setProductForm({ ...productForm, variants });
    };

    const updateVariant = (idx, field, value) => {
        const variants = [...productForm.variants];
        variants[idx] = { ...variants[idx], [field]: value };
        setProductForm({ ...productForm, variants });
    };

    const addFeature = () => {
        setProductForm({ ...productForm, features: [...(productForm.features || []), ''] });
    };

    const removeFeature = (idx) => {
        const features = (productForm.features || []).filter((_, i) => i !== idx);
        setProductForm({ ...productForm, features });
    };

    const updateFeature = (idx, value) => {
        const features = [...(productForm.features || [])];
        features[idx] = value;
        setProductForm({ ...productForm, features });
    };

    if (!isModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80"
                onClick={() => setIsModalOpen(false)}
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-4xl bg-[#0E0E0E] border border-white/10 rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
                    <h2 className="text-xl font-bold text-white">{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-white"><X size={20} /></button>
                </div>

                <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4">Informasi Dasar</h4>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1.5">Nama Produk</label>
                            <input
                                value={productForm.name}
                                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
                                placeholder="contoh: Netflix Premium"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1.5">Kategori</label>
                            <input
                                value={productForm.category}
                                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
                                placeholder="contoh: Streaming"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1.5">Ikon</label>
                            <select
                                value={productForm.icon}
                                onChange={(e) => setProductForm({ ...productForm, icon: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
                            >
                                {iconOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-xs text-gray-500">Aktif</label>
                            <button
                                onClick={() => setProductForm({ ...productForm, is_active: !productForm.is_active })}
                                className={`relative w-12 h-6 rounded-full transition-all ${productForm.is_active ? 'bg-green-600' : 'bg-gray-700'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full transition-all transform ${productForm.is_active ? 'translate-x-7' : 'translate-x-1'} mt-1`} />
                            </button>
                        </div>

                        {/* Features */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs text-gray-500">Fitur / Kelebihan</label>
                                <button onClick={addFeature} className="text-[10px] text-purple-400 hover:text-purple-300">+ Tambah</button>
                            </div>
                            {(productForm.features || []).map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-2 mb-2">
                                    <input
                                        value={feature}
                                        onChange={(e) => updateFeature(idx, e.target.value)}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white"
                                        placeholder="Fitur..."
                                    />
                                    <button onClick={() => removeFeature(idx)} className="text-red-400 hover:text-red-300 p-1"><X size={14} /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest">Varian Harga</h4>
                            <button onClick={addVariant} className="text-xs bg-purple-600/20 text-purple-400 px-3 py-1.5 rounded-lg hover:bg-purple-600 hover:text-white transition-all">+ Tambah Varian</button>
                        </div>
                        {productForm.variants.map((variant, idx) => (
                            <div key={idx} className="bg-white/3 rounded-xl p-4 border border-white/5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Varian {idx + 1}</span>
                                    {productForm.variants.length > 1 && (
                                        <button onClick={() => removeVariant(idx)} className="text-red-400 hover:text-red-300 p-1"><X size={14} /></button>
                                    )}
                                </div>
                                <input
                                    value={variant.name}
                                    onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white"
                                    placeholder="Nama varian (contoh: 1 Bulan)"
                                />
                                <input
                                    type="number"
                                    value={variant.price}
                                    onChange={(e) => updateVariant(idx, 'price', parseInt(e.target.value) || 0)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white"
                                    placeholder="Harga (Rp)"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 border-t border-white/5 bg-white/2 flex justify-end gap-3">
                    <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition-all">
                        Batal
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {editingProduct ? 'Perbarui' : 'Simpan'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ProductModal;
