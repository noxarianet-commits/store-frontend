import { useState } from 'react';
import { Star, Search, Package, Loader2, Filter, Wallet } from 'lucide-react';
import { formatRp } from '../../utils/currencyUtils';

const FeaturedTab = ({ products = [], featuredCount = 0, loading = false, onToggleFeatured }) => {
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    // Get unique categories
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

    // Filter products
    const filtered = products.filter(p => {
        const matchSearch = !search ||
            (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (p.category || '').toLowerCase().includes(search.toLowerCase());
        const matchCategory = filterCategory === 'all' || p.category === filterCategory;
        const matchStatus = filterStatus === 'all' ||
            (filterStatus === 'featured' && p.is_featured) ||
            (filterStatus === 'not_featured' && !p.is_featured);
        return matchSearch && matchCategory && matchStatus;
    });

    // Group by category
    const grouped = filtered.reduce((acc, p) => {
        const cat = p.category || 'Lainnya';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(p);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">Total Produk</p>
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Package size={16} />
                        </div>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 font-mono">{products.length}</h4>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">Best Seller Aktif</p>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                            <Star size={16} className="fill-amber-500" />
                        </div>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 font-mono">{featuredCount}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Tampil di strip Best Seller halaman depan</p>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">Kategori Terdaftar</p>
                        <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                            <Filter size={16} />
                        </div>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 font-mono">{categories.length}</h4>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari produk..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white transition-colors"
                        />
                    </div>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-purple-500 transition-colors"
                    >
                        <option value="all">Semua Kategori</option>
                        {categories.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-purple-500 transition-colors"
                    >
                        <option value="all">Semua Status</option>
                        <option value="featured">Best Seller</option>
                        <option value="not_featured">Bukan Best Seller</option>
                    </select>
                </div>
            </div>

            {/* Product List */}
            {Object.keys(grouped).length === 0 ? (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center shadow-xs">
                    <Package size={40} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-xs sm:text-sm">Tidak ada produk ditemukan</p>
                </div>
            ) : (
                Object.entries(grouped).map(([category, prods]) => (
                    <div key={category} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                        <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200/80 flex items-center justify-between">
                            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">{category}</h3>
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                                {prods.filter(p => p.is_featured).length}/{prods.length} best seller
                            </span>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {prods.map(product => {
                                const prices = (product.variants || []).map(v => v.sell_price || v.price || 0);
                                const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                                const isEwallet = product.category === 'E-Wallet' || /dana|gopay|ovo|shopee|linkaja/i.test(product.name || '');
                                const isServer2 = (product.name || '').toLowerCase().includes('okeconnect');

                                return (
                                    <div
                                        key={product.id}
                                        className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${
                                            product.is_featured ? 'bg-purple-50/30' : 'hover:bg-slate-50/70'
                                        }`}
                                    >
                                        {/* Icon */}
                                        {product.icon ? (
                                            <img
                                                src={product.icon}
                                                alt=""
                                                className="w-9 h-9 rounded-xl object-cover shrink-0 shadow-2xs"
                                            />
                                        ) : (
                                            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-600">
                                                {isEwallet ? (
                                                    <Wallet size={18} className="text-emerald-600" />
                                                ) : (
                                                    <Package size={18} className="text-purple-600" />
                                                )}
                                            </div>
                                        )}
                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{product.name}</p>
                                                <span className={`text-[8.5px] px-1.5 py-0.5 rounded uppercase font-extrabold shrink-0 ${
                                                    isServer2 
                                                        ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' 
                                                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                                                }`}>
                                                    {isServer2 ? 'Server 2' : 'Server 1'}
                                                </span>
                                            </div>
                                            <p className="text-[10.5px] text-slate-500 mt-0.5">
                                                {(product.variants || []).length} varian &bull; Mulai <span className="font-mono font-semibold text-slate-700">{formatRp(minPrice)}</span>
                                            </p>
                                        </div>
                                        {/* Featured Toggle */}
                                        <button
                                            type="button"
                                            onClick={() => onToggleFeatured(product.id)}
                                            className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                                                product.is_featured
                                                    ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-2xs hover:bg-amber-100'
                                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                            }`}
                                            title={product.is_featured ? 'Hapus dari Best Seller' : 'Tandai sebagai Best Seller'}
                                        >
                                            <Star
                                                size={13}
                                                className={`transition-all ${product.is_featured ? 'fill-amber-500 text-amber-500' : 'text-slate-400 group-hover:text-amber-500'}`}
                                            />
                                            <span>{product.is_featured ? 'Best Seller' : 'Tandai'}</span>
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
