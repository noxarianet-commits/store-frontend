import { useState, useMemo } from 'react';
import { Search, Star, Loader2, Package, Filter } from 'lucide-react';

const formatRp = (n) => `Rp ${(n || 0).toLocaleString('id-ID')}`;

const FeaturedTab = ({
    products,
    featuredCount,
    loading,
    onToggleFeatured,
}) => {
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all'); // all | featured | not_featured

    // Get unique categories
    const categories = useMemo(() => {
        const cats = new Set();
        products.forEach(p => { if (p.category) cats.add(p.category); });
        return Array.from(cats).sort();
    }, [products]);

    // Filter products
    const filtered = useMemo(() => {
        return products.filter(p => {
            const matchSearch = !search ||
                p.name?.toLowerCase().includes(search.toLowerCase()) ||
                p.category?.toLowerCase().includes(search.toLowerCase());
            const matchCategory = filterCategory === 'all' || p.category === filterCategory;
            const matchStatus = filterStatus === 'all' ||
                (filterStatus === 'featured' && p.is_featured) ||
                (filterStatus === 'not_featured' && !p.is_featured);
            return matchSearch && matchCategory && matchStatus;
        });
    }, [products, search, filterCategory, filterStatus]);

    // Group by category
    const grouped = useMemo(() => {
        const groups = {};
        filtered.forEach(p => {
            const cat = p.category || 'Lainnya';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(p);
        });
        return groups;
    }, [filtered]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Total Produk</p>
                        <Package size={18} className="text-purple-500" />
                    </div>
                    <h4 className="text-xl font-bold text-white">{products.length}</h4>
                </div>
                <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Produk Unggulan</p>
                        <Star size={18} className="text-yellow-500" />
                    </div>
                    <h4 className="text-xl font-bold text-white">{featuredCount}</h4>
                    <p className="text-[10px] text-gray-500 mt-1">Maks. 12 produk unggulan</p>
                </div>
                <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Kategori</p>
                        <Filter size={18} className="text-cyan-500" />
                    </div>
                    <h4 className="text-xl font-bold text-white">{categories.length}</h4>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Cari produk..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                        />
                    </div>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                    >
                        <option value="all">Semua Kategori</option>
                        {categories.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                    >
                        <option value="all">Semua Status</option>
                        <option value="featured">⭐ Unggulan</option>
                        <option value="not_featured">Belum Unggulan</option>
                    </select>
                </div>
            </div>

            {/* Product List */}
            {Object.keys(grouped).length === 0 ? (
                <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-10 text-center">
                    <Package size={40} className="text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Tidak ada produk ditemukan</p>
                </div>
            ) : (
                Object.entries(grouped).map(([category, prods]) => (
                    <div key={category} className="bg-[#0E0E0E] border border-white/5 rounded-2xl overflow-hidden">
                        <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white">{category}</h3>
                            <span className="text-[10px] text-gray-500 font-medium">
                                {prods.filter(p => p.is_featured).length}/{prods.length} unggulan
                            </span>
                        </div>
                        <div className="divide-y divide-white/5">
                            {prods.map(product => {
                                const minPrice = Math.min(...(product.variants || []).map(v => v.sell_price || v.price || 0));
                                return (
                                    <div
                                        key={product.id}
                                        className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${product.is_featured ? 'bg-yellow-500/5' : 'hover:bg-white/[0.02]'}`}
                                    >
                                        {/* Icon */}
                                        {product.icon && (
                                            <img
                                                src={product.icon}
                                                alt=""
                                                className="w-9 h-9 rounded-lg object-cover shrink-0"
                                            />
                                        )}
                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-white truncate">{product.name}</p>
                                            <p className="text-[10px] text-gray-500">
                                                {(product.variants || []).length} varian • Mulai {formatRp(minPrice)}
                                            </p>
                                        </div>
                                        {/* Featured Toggle */}
                                        <button
                                            onClick={() => onToggleFeatured(product.id)}
                                            className={`group flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                                                product.is_featured
                                                    ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/25'
                                                    : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:text-white hover:border-white/20'
                                            }`}
                                            title={product.is_featured ? 'Hapus dari unggulan' : 'Tandai sebagai unggulan'}
                                        >
                                            <Star
                                                size={14}
                                                className={`transition-all ${product.is_featured ? 'fill-yellow-400 text-yellow-400' : 'group-hover:text-yellow-400'}`}
                                            />
                                            {product.is_featured ? 'Unggulan' : 'Tandai'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default FeaturedTab;
