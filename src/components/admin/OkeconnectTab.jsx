import { useState } from 'react';
import { Search, Loader2, Package, CheckCircle2, DollarSign, Zap,
    ChevronDown, Eye, EyeOff, StickyNote, Smartphone, Globe } from 'lucide-react';
import { notifyWarning } from '../../utils/notify';

const OkeconnectTab = ({
    okeconnectProducts, okeconnectPostpaidProducts = [],
    okeconnectBalance, okeconnectSync, okeconnectPostpaidSync, okeconnectLoading,
    okeconnectSearch, setOkeconnectSearch,
    handleSync, handleGlobalMarkup, handleMarkupUpdate, handleToggleProduct,
    handleSetChannels,
    syncInProgress, globalMarkupValue, setGlobalMarkupValue,
    expandedProduct, setExpandedProduct,
    handleToggleVariantHidden, onEditVariantNote
}) => {
    const [productView, setProductView] = useState('prepaid');
    const isPostpaidView = productView === 'postpaid';
    const activeProducts = isPostpaidView ? okeconnectPostpaidProducts : (okeconnectProducts || []);
    const activeSync = isPostpaidView ? okeconnectPostpaidSync : okeconnectSync;

    const filtered = (activeProducts || []).filter(p =>
        p.name?.toLowerCase().includes((okeconnectSearch || '').toLowerCase()) ||
        p.category?.toLowerCase().includes((okeconnectSearch || '').toLowerCase()) ||
        p.brand?.toLowerCase().includes((okeconnectSearch || '').toLowerCase())
    );

    const productChannels = (product) => (
        Array.isArray(product.available_channels) && product.available_channels.length > 0
            ? product.available_channels
            : ['web', 'app']
    );

    const toggleChannel = (product, channel) => {
        const current = productChannels(product);
        const next = current.includes(channel)
            ? current.filter(c => c !== channel)
            : [...current, channel];

        if (next.length === 0) {
            notifyWarning('Minimal satu channel harus aktif.');
            return;
        }

        handleSetChannels?.(product.id, next);
    };

    // Group by category (Game / E-Wallet)
    const grouped = {};
    filtered.forEach(p => {
        const cat = p.category || 'Lainnya';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(p);
    });

    return (
        <div className="space-y-5">
            {/* Product type switcher */}
            <div className="flex gap-1.5 p-1 bg-slate-100 border border-slate-200/80 rounded-2xl w-full sm:w-fit">
                <button
                    onClick={() => { setProductView('prepaid'); setExpandedProduct(null); }}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        !isPostpaidView
                            ? 'bg-white text-purple-700 shadow-xs border border-slate-200/60'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <Globe size={14} className={!isPostpaidView ? 'text-purple-600' : 'text-slate-400'} /> Prepaid
                </button>
                <button
                    onClick={() => { setProductView('postpaid'); setExpandedProduct(null); }}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        isPostpaidView
                            ? 'bg-white text-sky-700 shadow-xs border border-slate-200/60'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <Smartphone size={14} className={isPostpaidView ? 'text-sky-600' : 'text-slate-400'} /> Tagihan (App)
                </button>
            </div>

            {/* Sync Status & Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Saldo OkeConnect</p>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                            <DollarSign size={16} />
                        </div>
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 font-mono">
                        {okeconnectBalance ? `Rp ${(okeconnectBalance.balance || okeconnectBalance.data?.balance || 0).toLocaleString('id-ID')}` : '—'}
                    </h4>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                            {isPostpaidView ? 'Produk Tagihan' : 'Produk Prepaid'}
                        </p>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${isPostpaidView ? 'bg-sky-50 text-sky-600 border-sky-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>
                            <Package size={16} />
                        </div>
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 font-mono">{(activeProducts || []).length}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">
                        {(okeconnectProducts || []).length} prepaid • {(okeconnectPostpaidProducts || []).length} tagihan
                    </p>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Sync Terakhir</p>
                        <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                            <CheckCircle2 size={16} />
                        </div>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                        {activeSync?.synced_at ? new Date(activeSync.synced_at).toLocaleString('id-ID') : 'Belum pernah sync'}
                    </h4>
                    {activeSync?.type && (
                        <p className="text-[10px] text-slate-500 mt-1 font-medium">Tipe: {activeSync.type} • {activeSync.productCount || 0} produk</p>
                    )}
                </div>
            </div>

            {/* Sync Actions */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Zap size={18} className="text-amber-500" />
                            Sinkronisasi {isPostpaidView ? 'Tagihan' : 'Produk'} OkeConnect
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {isPostpaidView
                                ? 'Menarik katalog tagihan PLN, PDAM, BPJS, telepon, TV, gas, PBB, dan biller pascabayar lainnya.'
                                : 'Menarik katalog produk E-Wallet & Topup Game langsung dari OkeConnect H2H API.'}
                        </p>
                    </div>
                    <div className="flex gap-2.5">
                        <button
                            onClick={() => handleSync('full', productView)}
                            disabled={syncInProgress}
                            className={`text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-50 flex items-center gap-2 ${
                                isPostpaidView
                                    ? 'bg-sky-600 hover:bg-sky-700'
                                    : 'bg-purple-600 hover:bg-purple-700'
                            }`}
                        >
                            {syncInProgress ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                            Full Sync {isPostpaidView ? 'Tagihan' : 'OkeConnect'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Global Markup */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <DollarSign size={16} className="text-emerald-600" /> Markup Global OkeConnect
                </h3>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex items-center gap-2 flex-1 sm:max-w-[240px]">
                        <span className="text-xs font-bold text-slate-400">Rp</span>
                        <input
                            type="number"
                            value={globalMarkupValue}
                            onChange={(e) => setGlobalMarkupValue(e.target.value)}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500"
                            placeholder="1000"
                        />
                    </div>
                    <button
                        onClick={handleGlobalMarkup}
                        className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                        Terapkan ke Semua
                    </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                    Terapkan markup nominal tetap ke semua varian OkeConnect.
                    {isPostpaidView
                        ? ' Untuk tagihan, markup adalah biaya layanan yang ditambahkan ke nominal tagihan.'
                        : ' Harga jual = Harga dasar + Markup.'}
                </p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder={isPostpaidView ? 'Cari biller tagihan (PLN, PDAM, BPJS...)' : 'Cari produk OkeConnect...'}
                    value={okeconnectSearch}
                    onChange={(e) => setOkeconnectSearch(e.target.value)}
                    className="w-full bg-white border border-slate-200/80 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 shadow-xs transition-all"
                />
            </div>

            {/* Product List */}
            {okeconnectLoading ? (
                <div className="py-20 flex justify-center"><div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>
            ) : Object.keys(grouped).length === 0 ? (
                <div className="text-center py-10 text-slate-500 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                    {(activeProducts || []).length === 0
                        ? `Belum ada ${isPostpaidView ? 'produk tagihan' : 'produk'}. Klik "Full Sync ${isPostpaidView ? 'Tagihan' : 'OkeConnect'}" untuk menarik daftar produk.`
                        : 'Tidak ada produk yang cocok dengan pencarian.'}
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(grouped).map(([catName, catProducts]) => (
                        <div key={catName}>
                            <h3 className="text-xs font-bold text-sky-700 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                                <Package size={15} /> {catName}
                                <span className="text-[11px] text-slate-400 font-medium lowercase">({catProducts.length} produk)</span>
                            </h3>
                            <div className="space-y-2">
                                {catProducts.map(product => {
                                    const totalVariants = (product.variants || []).length;
                                    const visibleVariants = (product.variants || []).filter(v => !v.is_hidden).length;
                                    const inStock = (product.variants || []).filter(v => v.stock > 0).length;
                                    const isExpanded = expandedProduct === product.id;

                                    return (
                                        <div key={product.id} className={`bg-white border rounded-2xl transition-all shadow-xs ${
                                            product.is_active ? 'border-slate-200/80 hover:border-sky-300' : 'border-rose-200 bg-rose-50/20 opacity-70'
                                        }`}>
                                            {/* Product Header */}
                                            <div
                                                className="p-4 flex items-center justify-between cursor-pointer"
                                                onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 border border-slate-200">
                                                        <Package size={18} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-slate-900 text-sm truncate">{product.name}</h4>
                                                            {product.product_type === 'postpaid' && (
                                                                <span className="text-[9px] bg-sky-50 text-sky-700 border border-sky-200 px-1.5 py-0.5 rounded uppercase font-bold shrink-0">
                                                                    Tagihan
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[11px] text-slate-500 font-medium">{totalVariants} varian</span>
                                                            <span className="text-[11px] text-emerald-600 font-semibold">{inStock} stok</span>
                                                            <span className="text-[11px] text-sky-600 font-medium">{visibleVariants} aktif tampil</span>
                                                            {!product.is_active && <span className="text-[9px] bg-rose-50 border border-rose-200 text-rose-700 px-1.5 py-0.5 rounded uppercase font-bold">Produk Nonaktif</span>}
                                                            {product.product_type === 'postpaid' && (
                                                                <span className="text-[10px] text-slate-400 font-medium">Hanya tampil di aplikasi Android</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {product.product_type === 'postpaid' ? (
                                                        <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-200 px-2 py-1 rounded-lg font-bold uppercase">
                                                            App Only
                                                        </span>
                                                    ) : (
                                                        <div
                                                            className="flex items-center gap-1 bg-slate-100 border border-slate-200 p-1 rounded-xl"
                                                            onClick={(e) => e.stopPropagation()}
                                                            title="Channel tempat produk ini tampil"
                                                        >
                                                            <button
                                                                onClick={() => toggleChannel(product, 'web')}
                                                                className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase transition-all flex items-center gap-1 ${
                                                                    productChannels(product).includes('web')
                                                                        ? 'bg-purple-600 text-white shadow-xs'
                                                                        : 'text-slate-500 hover:text-slate-800'
                                                                }`}
                                                            >
                                                                <Globe size={10} /> Web
                                                            </button>
                                                            <button
                                                                onClick={() => toggleChannel(product, 'app')}
                                                                className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase transition-all flex items-center gap-1 ${
                                                                    productChannels(product).includes('app')
                                                                        ? 'bg-sky-600 text-white shadow-xs'
                                                                        : 'text-slate-500 hover:text-slate-800'
                                                                }`}
                                                            >
                                                                <Smartphone size={10} /> App
                                                            </button>
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleToggleProduct(product.id); }}
                                                        className={`p-2 rounded-xl transition-all text-xs border ${
                                                            product.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                                        }`}
                                                        title={product.is_active ? 'Sembunyikan Produk' : 'Tampilkan Produk'}
                                                    >
                                                        {product.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                                                    </button>
                                                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                </div>
                                            </div>

                                            {/* Expanded Variants */}
                                            {isExpanded && (
                                                <div className="border-t border-slate-100 p-4 bg-slate-50/40 rounded-b-2xl">
                                                    <div className="overflow-x-auto no-scrollbar pb-1">
                                                        <div className="min-w-[620px]">
                                                            <div className="grid grid-cols-12 gap-2 mb-2 px-2">
                                                                <span className="col-span-3 text-[10px] text-slate-400 uppercase tracking-wider font-bold">Varian (Kode)</span>
                                                                <span className="col-span-2 text-[10px] text-slate-400 uppercase tracking-wider font-bold text-right">
                                                                    {isPostpaidView ? 'Biaya Vendor' : 'Harga Dasar'}
                                                                </span>
                                                                <span className="col-span-2 text-[10px] text-slate-400 uppercase tracking-wider font-bold text-right">
                                                                    {isPostpaidView ? 'Biaya Layanan' : 'Markup'}
                                                                </span>
                                                                <span className="col-span-2 text-[10px] text-slate-400 uppercase tracking-wider font-bold text-right">
                                                                    {isPostpaidView ? 'Biaya Customer' : 'Harga Jual'}
                                                                </span>
                                                                <span className="col-span-1 text-[10px] text-slate-400 uppercase tracking-wider font-bold text-right">Stok</span>
                                                                <span className="col-span-2 text-[10px] text-slate-400 uppercase tracking-wider font-bold text-center">Tampilkan</span>
                                                            </div>
                                                            {isPostpaidView && (
                                                                <p className="text-[10px] text-slate-500 mb-2 px-2 font-medium">
                                                                    Harga jual = nominal tagihan + biaya layanan. Nominal tagihan ditentukan dari hasil cek tagihan.
                                                                </p>
                                                            )}
                                                            <div className="space-y-1">
                                                                {(product.variants || []).map(variant => (
                                                                    <div key={variant.id || variant.db_id} className={`grid grid-cols-12 gap-2 items-center rounded-xl px-2.5 py-2 transition-all border ${
                                                                        variant.is_hidden ? 'bg-rose-50/30 border-rose-100 opacity-60' : 'bg-white border-slate-200/60 hover:border-sky-300'
                                                                    }`}>
                                                                        <div className="col-span-3">
                                                                            <div className="flex items-center gap-1.5">
                                                                                {variant.is_hidden && <span className="text-[8px] bg-rose-50 text-rose-700 px-1 py-0.5 rounded font-bold uppercase border border-rose-200">Hidden</span>}
                                                                                <p className={`text-xs font-semibold truncate ${variant.is_hidden ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{variant.name}</p>
                                                                            </div>
                                                                            <p className="text-[10px] text-slate-400 font-mono">{variant.id || variant.sku || '—'}</p>
                                                                            {variant.note && (
                                                                                <p className="mt-0.5 max-w-[190px] truncate text-[9px] text-amber-700 font-medium" title={variant.note}>
                                                                                    {variant.note.split('\n')[0]}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        <p className="col-span-2 text-xs text-slate-600 font-mono text-right">Rp {variant.base_price?.toLocaleString('id-ID')}</p>
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
                                                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-right text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-sky-500"
                                                                            />
                                                                        </div>
                                                                        <p className="col-span-2 text-xs text-emerald-700 font-bold font-mono text-right">Rp {variant.sell_price?.toLocaleString('id-ID')}</p>
                                                                        <div className="col-span-1 text-right">
                                                                            <span className={`text-xs font-bold ${variant.stock > 0 ? 'text-slate-800' : 'text-rose-600'}`}>
                                                                                {variant.stock > 0 ? variant.stock : 'Habis'}
                                                                            </span>
                                                                        </div>
                                                                        <div className="col-span-2 flex justify-center gap-1">
                                                                            <button
                                                                                onClick={() => onEditVariantNote?.(product, variant)}
                                                                                className={`p-1.5 rounded-lg transition-all text-xs border ${variant.note ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                                                                                title={variant.note ? 'Edit catatan varian' : 'Tambah catatan varian'}
                                                                            >
                                                                                <StickyNote size={13} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleToggleVariantHidden(product.id, variant.id || variant.db_id)}
                                                                                className={`p-1.5 rounded-lg transition-all text-xs border ${variant.is_hidden ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'}`}
                                                                                title={variant.is_hidden ? 'Tampilkan varian di store' : 'Sembunyikan varian'}
                                                                            >
                                                                                {variant.is_hidden ? <EyeOff size={13} /> : <Eye size={13} />}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center gap-2">
                                                        <span className="text-[11px] text-slate-500 font-medium">Markup semua varian:</span>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[11px] text-slate-400">Rp</span>
                                                            <input
                                                                type="number"
                                                                placeholder="1000"
                                                                className="w-24 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-900 text-right focus:outline-none focus:border-sky-500"
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        handleMarkupUpdate(product.id, null, parseInt(e.target.value) || 0);
                                                                        e.target.value = '';
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] text-slate-400">(tekan Enter)</span>
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
