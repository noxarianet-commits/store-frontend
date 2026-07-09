import { Search, Loader2, Package, CheckCircle2, DollarSign, Zap, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const FincloudTab = ({
    fincloudProducts, fincloudBalance, fincloudSync, fincloudLoading,
    fincloudSearch, setFincloudSearch,
    handleSync, handleGlobalMarkup, handleMarkupUpdate, handleToggleProduct,
    syncInProgress, globalMarkupValue, setGlobalMarkupValue,
    expandedProduct, setExpandedProduct, handleToggleBrandHidden
}) => {
    const [localMarkup, setLocalMarkup] = useState({});

    const filtered = fincloudProducts.filter(p =>
        p.name?.toLowerCase().includes(fincloudSearch.toLowerCase()) ||
        p.brand?.toLowerCase().includes(fincloudSearch.toLowerCase())
    );

    // Group by brand
    const grouped = {};
    filtered.forEach(p => {
        const brand = p.brand || 'Lainnya';
        if (!grouped[brand]) grouped[brand] = [];
        grouped[brand].push(p);
    });

    return (
        <div className="space-y-6">
            {/* Sync Status & Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Saldo Fincloud</p>
                        <DollarSign size={18} className="text-green-500" />
                    </div>
                    <h4 className="text-xl font-bold text-white">
                        {fincloudBalance ? `Rp ${fincloudBalance.balance?.toLocaleString('id-ID')}` : '—'}
                    </h4>
                </div>
                <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Total Produk</p>
                        <Package size={18} className="text-purple-500" />
                    </div>
                    <h4 className="text-xl font-bold text-white">{fincloudProducts.length}</h4>
                </div>
                <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Sync Terakhir</p>
                        <CheckCircle2 size={18} className="text-cyan-500" />
                    </div>
                    <h4 className="text-sm font-bold text-white">
                        {fincloudSync?.lastSync ? new Date(fincloudSync.lastSync).toLocaleString('id-ID') : 'Belum pernah sync'}
                    </h4>
                </div>
            </div>

            {/* Sync Actions */}
            <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Zap size={20} className="text-yellow-400" /> Sinkronisasi Produk</h3>
                        <p className="text-xs text-gray-500 mt-1">Manual sync menarik semua daftar PPOB dan Game terbaru dari Fincloud.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleSync()}
                            disabled={syncInProgress}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-purple-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {syncInProgress ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                            Sync Sekarang
                        </button>
                    </div>
                </div>
            </div>

            {/* Global Markup */}
            <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><DollarSign size={16} className="text-green-400" /> Markup Global Fincloud</h3>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-1">
                        <span className="text-xs text-gray-500">Rp</span>
                        <input
                            type="number"
                            value={globalMarkupValue}
                            onChange={(e) => setGlobalMarkupValue(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500/50 max-w-[200px]"
                            placeholder="0"
                        />
                    </div>
                    <button
                        onClick={handleGlobalMarkup}
                        disabled={!globalMarkupValue}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-xs font-bold transition-all disabled:opacity-50 whitespace-nowrap"
                    >
                        Terapkan ke Semua Produk
                    </button>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">Menambahkan nominal markup (keuntungan) ini ke atas Harga Dasar untuk semua produk Fincloud.</p>
            </div>

            {/* Product List */}
            <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-3 justify-between items-center bg-white/[0.02]">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Package size={18} className="text-purple-400" />
                        Manajemen Harga Fincloud
                    </h3>
                    <div className="relative w-full sm:w-auto">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari produk / sku..."
                            value={fincloudSearch}
                            onChange={(e) => setFincloudSearch(e.target.value)}
                            className="w-full sm:w-64 bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                        />
                    </div>
                </div>

                <div className="p-4">
                    {fincloudLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <Loader2 size={32} className="animate-spin mb-3 text-purple-500" />
                            <p className="text-sm font-medium">Memuat data produk...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-12">
                            <Package size={48} className="mx-auto text-gray-600 mb-4" />
                            <p className="text-gray-400 font-medium">Tidak ada produk ditemukan</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {Object.entries(grouped).map(([brand, products]) => {
                                const allHidden = products.every(p => p.is_hidden);
                                return (
                                <div key={brand} className={`border rounded-xl overflow-hidden transition-all ${allHidden ? 'border-red-500/20 opacity-75 bg-red-500/5' : 'border-white/5 bg-white/[0.01]'}`}>
                                    <div className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => setExpandedProduct(expandedProduct === brand ? null : brand)}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${allHidden ? 'bg-red-500/10 text-red-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                                <Package size={16} />
                                            </div>
                                            <div className="text-left">
                                                <div className="flex items-center gap-2">
                                                    <h4 className={`text-sm font-bold ${allHidden ? 'text-gray-400 line-through' : 'text-white'}`}>{brand}</h4>
                                                    {allHidden && <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded uppercase">Hidden</span>}
                                                </div>
                                                <p className="text-xs text-gray-500">{products.length} Varian</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleToggleBrandHidden(brand, !allHidden); }}
                                                className={`p-2 rounded-lg transition-colors flex items-center border ${allHidden ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'}`}
                                                title={allHidden ? "Tampilkan Brand" : "Sembunyikan Brand"}
                                            >
                                                {allHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                                            </button>
                                            <ChevronDown size={18} className={`text-gray-400 transition-transform ${expandedProduct === brand ? 'rotate-180' : ''}`} />
                                        </div>
                                    </div>
                                    
                                    {expandedProduct === brand && (
                                        <div className="border-t border-white/5 p-4 bg-black/20">
                                            <div className="grid gap-3">
                                                {products.map(variant => (
                                                    <div key={variant.sku} className={`bg-[#1A1A1A] rounded-xl p-3 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border ${variant.is_hidden ? 'border-red-500/30' : 'border-white/5'} hover:border-purple-500/30 transition-colors`}>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-xs font-mono text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded">{variant.sku}</span>
                                                                {variant.is_hidden && <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded uppercase">Sembunyikan</span>}
                                                            </div>
                                                            <p className="text-sm font-bold text-white">{variant.name}</p>
                                                            <p className="text-xs text-gray-400">Brand: {variant.brand} | Tipe: {variant.product_type}</p>
                                                            <p className="text-xs text-gray-500 line-through mt-1">H. Dasar: Rp {variant.base_price?.toLocaleString('id-ID')}</p>
                                                        </div>
                                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] text-gray-500 mb-1">Markup (Rp)</span>
                                                                <input
                                                                    type="number"
                                                                    value={localMarkup[variant.sku] !== undefined ? localMarkup[variant.sku] : variant.markup}
                                                                    onChange={(e) => setLocalMarkup({...localMarkup, [variant.sku]: e.target.value})}
                                                                    className="w-24 bg-[#0A0A0A] border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-purple-500"
                                                                />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] text-gray-500 mb-1">Harga Jual</span>
                                                                <div className="h-9 flex items-center px-3 bg-[#0A0A0A] border border-white/5 rounded-lg text-sm font-bold text-green-400 min-w-[100px]">
                                                                    Rp {(variant.base_price + (parseInt(localMarkup[variant.sku]) || variant.markup || 0)).toLocaleString('id-ID')}
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2 self-end">
                                                                <button
                                                                    onClick={() => handleMarkupUpdate(variant.sku, localMarkup[variant.sku] !== undefined ? localMarkup[variant.sku] : variant.markup)}
                                                                    className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors h-9 flex items-center"
                                                                    title="Simpan Markup"
                                                                >
                                                                    <CheckCircle2 size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleToggleProduct(variant.sku)}
                                                                    className={`p-2 rounded-lg transition-colors h-9 flex items-center border ${variant.is_hidden ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'}`}
                                                                    title={variant.is_hidden ? "Tampilkan Produk" : "Sembunyikan Produk"}
                                                                >
                                                                    {variant.is_hidden ? <Eye size={16} /> : <EyeOff size={16} />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FincloudTab;
