import { Search, Loader2, Package, CheckCircle2, DollarSign, Zap,
    ChevronDown, Eye, EyeOff } from 'lucide-react';

const OkeconnectTab = ({
    okeconnectProducts, okeconnectBalance, okeconnectSync, okeconnectLoading,
    okeconnectSearch, setOkeconnectSearch,
    handleSync, handleGlobalMarkup, handleMarkupUpdate, handleToggleProduct,
    syncInProgress, globalMarkupValue, setGlobalMarkupValue,
    expandedProduct, setExpandedProduct,
    handleToggleVariantHidden
}) => {
    const filtered = (okeconnectProducts || []).filter(p =>
        p.name?.toLowerCase().includes((okeconnectSearch || '').toLowerCase()) ||
        p.category?.toLowerCase().includes((okeconnectSearch || '').toLowerCase()) ||
        p.brand?.toLowerCase().includes((okeconnectSearch || '').toLowerCase())
    );

    // Group by category (Game / E-Wallet)
    const grouped = {};
    filtered.forEach(p => {
        const cat = p.category || 'Lainnya';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(p);
    });

    return (
        <div className="space-y-6">
            {/* Sync Status & Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Saldo OkeConnect</p>
                        <DollarSign size={18} className="text-green-500" />
                    </div>
                    <h4 className="text-xl font-bold text-white">
                        {okeconnectBalance ? `Rp ${(okeconnectBalance.balance || okeconnectBalance.data?.balance || 0).toLocaleString('id-ID')}` : '—'}
                    </h4>
                </div>
                <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Total Produk</p>
                        <Package size={18} className="text-purple-500" />
                    </div>
                    <h4 className="text-xl font-bold text-white">{(okeconnectProducts || []).length}</h4>
                </div>
                <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Sync Terakhir</p>
                        <CheckCircle2 size={18} className="text-cyan-500" />
                    </div>
                    <h4 className="text-sm font-bold text-white">
                        {okeconnectSync?.synced_at ? new Date(okeconnectSync.synced_at).toLocaleString('id-ID') : 'Belum pernah sync'}
                    </h4>
                    {okeconnectSync?.type && (
                        <p className="text-[10px] text-gray-500 mt-1">Tipe: {okeconnectSync.type} • {okeconnectSync.productCount || 0} produk</p>
                    )}
                </div>
            </div>

            {/* Sync Actions */}
            <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Zap size={20} className="text-yellow-400" /> Sinkronisasi Produk OkeConnect</h3>
                        <p className="text-xs text-gray-500 mt-1">Menarik katalog produk E-Wallet & Topup Game langsung dari OkeConnect H2H API.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleSync('full')}
                            disabled={syncInProgress}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-purple-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {syncInProgress ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                            Full Sync OkeConnect
                        </button>
                    </div>
                </div>
            </div>

            {/* Global Markup */}
            <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><DollarSign size={16} className="text-green-400" /> Markup Global OkeConnect</h3>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-1">
                        <span className="text-xs text-gray-500">Rp</span>
                        <input
                            type="number"
                            value={globalMarkupValue}
                            onChange={(e) => setGlobalMarkupValue(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500/50 max-w-[200px]"
                            placeholder="1000"
                        />
                    </div>
                    <button
                        onClick={handleGlobalMarkup}
                        className="bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                    >
                        Terapkan ke Semua
                    </button>
                </div>
                <p className="text-[10px] text-gray-600 mt-2">Terapkan markup nominal tetap ke semua varian produk OkeConnect. Harga jual = Harga dasar + Markup.</p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Cari produk OkeConnect..."
                    value={okeconnectSearch}
                    onChange={(e) => setOkeconnectSearch(e.target.value)}
                    className="w-full bg-[#0E0E0E] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
                />
            </div>

            {/* Product List */}
            {okeconnectLoading ? (
                <div className="py-20 flex justify-center"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : Object.keys(grouped).length === 0 ? (
                <div className="text-center py-10 text-gray-500 bg-[#0E0E0E] rounded-2xl border border-white/5">
                    {(okeconnectProducts || []).length === 0
                        ? 'Belum ada produk. Klik "Full Sync OkeConnect" untuk menarik daftar produk.'
                        : 'Tidak ada produk yang cocok dengan pencarian.'}
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(grouped).map(([catName, catProducts]) => (
                        <div key={catName}>
                            <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Package size={16} /> {catName}
                                <span className="text-[10px] text-gray-600 font-normal lowercase">({catProducts.length} produk)</span>
                            </h3>
                            <div className="space-y-2">
                                {catProducts.map(product => {
                                    const totalVariants = (product.variants || []).length;
                                    const visibleVariants = (product.variants || []).filter(v => !v.is_hidden).length;
                                    const inStock = (product.variants || []).filter(v => v.stock > 0).length;
                                    const isExpanded = expandedProduct === product.id;

                                    return (
                                        <div key={product.id} className={`bg-[#0E0E0E] border rounded-2xl transition-all ${
                                            product.is_active ? 'border-white/5 hover:border-white/10' : 'border-red-500/20 opacity-60'
                                        }`}>
                                            {/* Product Header */}
                                            <div
                                                className="p-4 flex items-center justify-between cursor-pointer"
                                                onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-500">
                                                        <Package size={18} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-white text-sm truncate">{product.name}</h4>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] text-gray-500">{totalVariants} varian</span>
                                                            <span className="text-[10px] text-green-500">{inStock} stok</span>
                                                            <span className="text-[10px] text-cyan-400">{visibleVariants} aktif tampil</span>
                                                            {!product.is_active && <span className="text-[9px] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded uppercase font-bold">Produk Nonaktif</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleToggleProduct(product.id); }}
                                                        className={`p-2 rounded-lg transition-all text-xs ${
                                                            product.is_active ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                                        }`}
                                                        title={product.is_active ? 'Sembunyikan Produk' : 'Tampilkan Produk'}
                                                    >
                                                        {product.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                                                    </button>
                                                    <ChevronDown size={16} className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                </div>
                                            </div>

                                            {/* Expanded Variants */}
                                            {isExpanded && (
                                                <div className="border-t border-white/5 p-4">
                                                    <div className="grid grid-cols-12 gap-2 mb-2 px-2">
                                                        <span className="col-span-3 text-[9px] text-gray-600 uppercase tracking-widest font-bold">Varian (Kode)</span>
                                                        <span className="col-span-2 text-[9px] text-gray-600 uppercase tracking-widest font-bold text-right">Harga Dasar</span>
                                                        <span className="col-span-2 text-[9px] text-gray-600 uppercase tracking-widest font-bold text-right">Markup</span>
                                                        <span className="col-span-2 text-[9px] text-gray-600 uppercase tracking-widest font-bold text-right">Harga Jual</span>
                                                        <span className="col-span-1 text-[9px] text-gray-600 uppercase tracking-widest font-bold text-right">Stok</span>
                                                        <span className="col-span-2 text-[9px] text-gray-600 uppercase tracking-widest font-bold text-center">Tampilkan</span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        {(product.variants || []).map(variant => (
                                                            <div key={variant.id || variant.db_id} className={`grid grid-cols-12 gap-2 items-center rounded-xl px-2 py-2 transition-all ${
                                                                variant.is_hidden ? 'bg-red-500/5 opacity-60' : 'bg-white/[0.02] hover:bg-white/5'
                                                            }`}>
                                                                <div className="col-span-3">
                                                                    <div className="flex items-center gap-1.5">
                                                                        {variant.is_hidden && <span className="text-[8px] bg-red-500/15 text-red-400 px-1 py-0.5 rounded font-bold uppercase">Hidden</span>}
                                                                        <p className={`text-xs font-medium truncate ${variant.is_hidden ? 'text-gray-500 line-through' : 'text-white'}`}>{variant.name}</p>
                                                                    </div>
                                                                    <p className="text-[9px] text-gray-500 font-mono">{variant.id || variant.sku || '—'}</p>
                                                                </div>
                                                                <p className="col-span-2 text-xs text-gray-400 text-right">Rp {variant.base_price?.toLocaleString('id-ID')}</p>
                                                                <div className="col-span-2">
                                                                    <input
                                                                        type="number"
                                                                        defaultValue={variant.markup || 0}
                                                                        onBlur={(e) => {
                                                                            const newMarkup = parseInt(e.target.value) || 0;
                                                                            if (newMarkup !== (variant.markup || 0)) {
                                                                                handleMarkupUpdate(product.id, variant.id || variant.db_id, newMarkup);
                                                                            }
                                                                        }}
                                                                        onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-right text-white focus:outline-none focus:border-purple-500/50"
                                                                    />
                                                                </div>
                                                                <p className="col-span-2 text-xs text-green-400 font-bold text-right">Rp {variant.sell_price?.toLocaleString('id-ID')}</p>
                                                                <div className="col-span-1 text-right">
                                                                    <span className={`text-xs font-bold ${variant.stock > 0 ? 'text-white' : 'text-red-400'}`}>
                                                                        {variant.stock > 0 ? variant.stock : 'Habis'}
                                                                    </span>
                                                                </div>
                                                                <div className="col-span-2 flex justify-center">
                                                                    <button
                                                                        onClick={() => handleToggleVariantHidden(product.id, variant.id || variant.db_id)}
                                                                        className={`p-1.5 rounded-lg transition-all text-xs ${variant.is_hidden ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}
                                                                        title={variant.is_hidden ? 'Tampilkan varian di store' : 'Sembunyikan varian'}
                                                                    >
                                                                        {variant.is_hidden ? <EyeOff size={13} /> : <Eye size={13} />}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                                                        <span className="text-[10px] text-gray-500">Markup semua varian:</span>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[10px] text-gray-600">Rp</span>
                                                            <input
                                                                type="number"
                                                                placeholder="1000"
                                                                className="w-24 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white text-right focus:outline-none focus:border-purple-500/50"
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        handleMarkupUpdate(product.id, null, parseInt(e.target.value) || 0);
                                                                        e.target.value = '';
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-[9px] text-gray-600">(tekan Enter)</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OkeconnectTab;
