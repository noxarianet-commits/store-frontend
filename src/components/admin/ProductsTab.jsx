import { Search, Plus, Edit, Trash2, Globe } from 'lucide-react';
import IconRenderer from '../ui/IconRenderer';
import { useState } from 'react';

const ProductsTab = ({ products, openProductModal, deleteProduct }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const renderProductCard = (p) => (
        <div key={p.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between hover:border-purple-300 shadow-xs hover:shadow-md transition-all group mb-3">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                    <IconRenderer name={p.icon} size={24} />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900">{p.name}</h3>
                        {!p.is_active && <span className="text-[9px] bg-rose-50 border border-rose-200 text-rose-700 px-1.5 py-0.5 rounded uppercase font-bold">Nonaktif</span>}
                    </div>
                    <p className="text-xs text-slate-500">{p.category} • <span className="font-semibold text-purple-700">Rp {(p.price || (p.variants && p.variants[0]?.price) || 0).toLocaleString('id-ID')}</span></p>
                </div>
            </div>
            <div className="flex items-center gap-2 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all">
                <button
                    onClick={() => openProductModal(p)}
                    className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all"
                    title="Edit Layanan"
                >
                    <Edit size={16} />
                </button>
                <button
                    onClick={() => deleteProduct(p.id)}
                    className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all"
                    title="Hapus Layanan"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-5">
            <div className="relative mb-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Cari nama produk atau kategori..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200/80 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 shadow-xs transition-all"
                />
            </div>
            <div>
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Globe size={18} className="text-purple-600" /> Layanan Jasa
                        </h3>
                        <button
                            onClick={() => openProductModal(null, 'Layanan Jasa')}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-xs transition-all"
                        >
                            <Plus size={14} /> Tambah Layanan
                        </button>
                    </div>
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                            Tidak ada produk yang cocok dengan pencarian Anda.
                        </div>
                    ) : (
                        filteredProducts.map(renderProductCard)
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductsTab;
