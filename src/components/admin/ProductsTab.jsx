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
        <div key={p.id} className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-white/10 transition-all group mb-3">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-gray-400">
                    <IconRenderer name={p.icon} size={24} />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white">{p.name}</h3>
                        {!p.is_active && <span className="text-[9px] bg-red-500/15 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded uppercase font-bold">Nonaktif</span>}
                    </div>
                    <p className="text-xs text-gray-500">{p.category} • Rp {(p.price || (p.variants && p.variants[0]?.price) || 0).toLocaleString('id-ID')}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button
                    onClick={() => openProductModal(p)}
                    className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"
                >
                    <Edit size={16} />
                </button>
                <button
                    onClick={() => deleteProduct(p.id)}
                    className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="relative mb-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Cari nama produk atau kategori..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#0E0E0E] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
                />
            </div>
            <div>
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Globe size={20} className="text-purple-400" /> Layanan Jasa</h3>
                        <button
                            onClick={() => openProductModal(null, 'Layanan Jasa')}
                            className="bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs font-bold transition-all"
                        >
                            <Plus size={14} /> Tambah
                        </button>
                    </div>
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 bg-[#0E0E0E] rounded-2xl border border-white/5">
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
