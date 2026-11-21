import { useState, useEffect, useCallback } from 'react';
import { Calendar, User, Mail, Edit, Trash2, CreditCard, Search, Package, ChevronLeft, ChevronRight, Loader2, Filter } from 'lucide-react';
import api from '../../api';
import { notifySuccess } from '../../utils/notify';

const STATUS_CONFIG = {
    PENDING: { label: 'Menunggu', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
    PROCESSING: { label: 'Diproses', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
    COMPLETED: { label: 'Selesai', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    FAILED: { label: 'Gagal', color: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
    CANCELLED: { label: 'Dibatalkan', color: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
    REFUND_PENDING: { label: 'Refund Diproses', color: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
    REFUNDED: { label: 'Dana Dikembalikan', color: 'bg-teal-50 text-teal-700 border-teal-200', dot: 'bg-teal-500' },
};

const VENDOR_CONFIG = {
    sekalipay: { label: 'Sekalipay', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    okeconnect: { label: 'OkeConnect', color: 'bg-sky-50 text-sky-700 border-sky-200' },
};

const CHANNEL_CONFIG = {
    web: { label: 'Web', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    android: { label: 'Android App', color: 'bg-teal-50 text-teal-700 border-teal-200' },
};

const ORDER_TYPE_CONFIG = {
    prepaid: { label: 'Prepaid', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    postpaid: { label: 'Tagihan', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
};

const PAGE_SIZE = 20;

const OrdersTab = ({ openOrderModal, deleteOrder, refreshTrigger }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchId, setSearchId] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [channelFilter, setChannelFilter] = useState('ALL');
    const [orderTypeFilter, setOrderTypeFilter] = useState('ALL');

    const fetchOrders = useCallback(async (
        targetPage = 1,
        search = activeSearch,
        status = statusFilter,
        channel = channelFilter,
        orderType = orderTypeFilter
    ) => {
        setLoading(true);
        try {
            const params = {
                page: targetPage,
                limit: PAGE_SIZE
            };
            if (search.trim()) params.search = search.trim();
            if (status !== 'ALL') params.status = status;
            if (channel !== 'ALL') params.channel = channel;
            if (orderType !== 'ALL') params.order_type = orderType;

            const res = await api.get('/orders', { params });
            
            if (Array.isArray(res.data)) {
                // Backwards compatibility fallback if API returns flat array
                setOrders(res.data);
                setTotal(res.data.length);
                setTotalPages(Math.ceil(res.data.length / PAGE_SIZE) || 1);
                setPage(1);
            } else {
                setOrders(res.data.orders || []);
                setTotal(res.data.total || 0);
                setTotalPages(res.data.totalPages || 1);
                setPage(res.data.page || targetPage);
            }
        } catch (e) {
            console.error('Gagal fetch paginated orders:', e);
        } finally {
            setLoading(false);
        }
    }, [activeSearch, statusFilter, channelFilter, orderTypeFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrders(1, activeSearch, statusFilter, channelFilter, orderTypeFilter);
        }, 0);
        return () => clearTimeout(timer);
    }, [refreshTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        const trimmed = searchId.trim();
        setActiveSearch(trimmed);
        setPage(1);
        fetchOrders(1, trimmed, statusFilter, channelFilter, orderTypeFilter);
    };

    const handleStatusChange = (newStatus) => {
        setStatusFilter(newStatus);
        setPage(1);
        fetchOrders(1, activeSearch, newStatus, channelFilter, orderTypeFilter);
    };

    const handleChannelChange = (newChannel) => {
        setChannelFilter(newChannel);
        setPage(1);
        fetchOrders(1, activeSearch, statusFilter, newChannel, orderTypeFilter);
    };

    const handleOrderTypeChange = (newType) => {
        setOrderTypeFilter(newType);
        setPage(1);
        fetchOrders(1, activeSearch, statusFilter, channelFilter, newType);
    };

    const handleClearSearch = () => {
        setSearchId('');
        setActiveSearch('');
        setStatusFilter('ALL');
        setChannelFilter('ALL');
        setOrderTypeFilter('ALL');
        setPage(1);
        fetchOrders(1, '', 'ALL', 'ALL', 'ALL');
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        setPage(newPage);
        fetchOrders(newPage, activeSearch, statusFilter, channelFilter, orderTypeFilter);
    };

    const handleDelete = async (id) => {
        await deleteOrder(id);
    };

    const hasActiveFilters = Boolean(activeSearch) ||
        statusFilter !== 'ALL' ||
        channelFilter !== 'ALL' ||
        orderTypeFilter !== 'ALL';

    return (
        <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Cari ID Order atau No. WhatsApp..."
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-500 transition-colors"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-purple-500 cursor-pointer appearance-none pr-8 h-full"
                            >
                                <option value="ALL">Semua Status</option>
                                <option value="PENDING">Menunggu</option>
                                <option value="PROCESSING">Diproses</option>
                                <option value="COMPLETED">Selesai</option>
                                <option value="FAILED">Gagal</option>
                                <option value="CANCELLED">Dibatalkan</option>
                                <option value="REFUND_PENDING">Refund Diproses</option>
                                <option value="REFUNDED">Dana Dikembalikan</option>
                            </select>
                            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                        </div>
                        <div className="relative">
                            <select
                                value={channelFilter}
                                onChange={(e) => handleChannelChange(e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-purple-500 cursor-pointer appearance-none pr-8 h-full"
                            >
                                <option value="ALL">Semua Channel</option>
                                <option value="web">Web</option>
                                <option value="android">Android App</option>
                            </select>
                            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                        </div>
                        <div className="relative">
                            <select
                                value={orderTypeFilter}
                                onChange={(e) => handleOrderTypeChange(e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-purple-500 cursor-pointer appearance-none pr-8 h-full"
                            >
                                <option value="ALL">Semua Tipe</option>
                                <option value="prepaid">Prepaid</option>
                                <option value="postpaid">Tagihan</option>
                            </select>
                            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                        </div>
                        <button
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
                        >
                            <Search size={14} /> Cari
                        </button>
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-slate-200"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </form>
                {hasActiveFilters && (
                    <p className="text-purple-600 text-xs mt-2.5 font-medium">
                        Filter: {activeSearch && `Pencarian "${activeSearch}" `}
                        {statusFilter !== 'ALL' && `[Status: ${STATUS_CONFIG[statusFilter]?.label || statusFilter}] `}
                        {channelFilter !== 'ALL' && `[Channel: ${CHANNEL_CONFIG[channelFilter]?.label || channelFilter}] `}
                        {orderTypeFilter !== 'ALL' && `[Tipe: ${ORDER_TYPE_CONFIG[orderTypeFilter]?.label || orderTypeFilter}] `}
                        • Ditemukan {total} order.
                    </p>
                )}
            </div>

            {/* Content List */}
            {loading ? (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center gap-3 shadow-xs">
                    <Loader2 size={28} className="animate-spin text-purple-600" />
                    <span className="text-xs font-semibold">Memuat pesanan...</span>
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center text-slate-500 shadow-xs">
                    {hasActiveFilters
                        ? 'Tidak ada pesanan yang sesuai dengan filter pencarian.'
                        : 'Belum ada pesanan masuk.'}
                </div>
            ) : (
                orders.map(order => {
                    const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                    const vendor = order.vendor || 'sekalipay';
                    const vendorCfg = VENDOR_CONFIG[vendor] || VENDOR_CONFIG.sekalipay;
                    const channelCfg = CHANNEL_CONFIG[order.channel || 'web'] || CHANNEL_CONFIG.web;
                    const typeCfg = ORDER_TYPE_CONFIG[order.order_type || 'prepaid'] || ORDER_TYPE_CONFIG.prepaid;
                    return (
                        <div key={order.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 hover:border-purple-200 shadow-xs hover:shadow-md transition-all group">
                            <div className="flex flex-col lg:flex-row justify-between gap-4 lg:gap-6">
                                <div className="flex-1 space-y-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-lg">{order.id}</span>
                                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.color}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                                            {statusCfg.label}
                                        </span>
                                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${vendorCfg.color}`}>
                                            <Package size={10} />
                                            {vendorCfg.label}
                                        </span>
                                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${channelCfg.color}`}>
                                            {channelCfg.label}
                                        </span>
                                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeCfg.color}`}>
                                            {typeCfg.label}
                                        </span>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1 ml-auto sm:ml-0 font-medium">
                                            <Calendar size={12} /> {new Date(order.timestamp).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-base sm:text-lg font-bold text-slate-900">{order.product}</h3>
                                        <p className="text-sm font-semibold text-slate-600">{order.variant} • <span className="text-purple-700 font-bold">Rp {order.price?.toLocaleString('id-ID')}</span></p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                        <div className="flex items-center gap-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-lg flex items-center justify-center text-slate-600 border border-slate-200 shadow-xs"><User size={14} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WhatsApp</p>
                                                <p className="text-xs sm:text-sm font-medium">{order.wa_number}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-lg flex items-center justify-center text-slate-600 border border-slate-200 shadow-xs"><Mail size={14} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                                                <p className="text-xs sm:text-sm font-medium">{order.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {order.payment_method && (
                                        <div className="flex items-center gap-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-xl p-2.5 max-w-xs">
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-lg flex items-center justify-center text-slate-600 border border-slate-200 shadow-xs"><CreditCard size={14} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pembayaran</p>
                                                <p className="text-xs sm:text-sm font-semibold">{order.payment_method}</p>
                                            </div>
                                        </div>
                                    )}
                                    {order.account_details && (
                                        <div className="mt-3 p-4 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-2">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] text-purple-700 font-bold uppercase tracking-wider">
                                                    {order.order_type === 'postpaid' ? 'Detail Tagihan' : 'Detail Akun / Lisensi'}
                                                </p>
                                                {order.account_details.type && (
                                                    <span className="text-[9px] bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 rounded font-mono uppercase font-bold">
                                                        {order.account_details.type}
                                                    </span>
                                                )}
                                            </div>
                                            {order.order_type === 'postpaid' && (
                                                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                                                    <div className="bg-white border border-purple-100 px-2.5 py-2 rounded-xl">
                                                        <p className="text-[9px] text-slate-400 uppercase font-bold">Nomor Pelanggan</p>
                                                        <p className="font-mono text-slate-800 font-bold select-all">{order.account_details.customer_number || order.account_details.target || '-'}</p>
                                                    </div>
                                                    <div className="bg-white border border-purple-100 px-2.5 py-2 rounded-xl">
                                                        <p className="text-[9px] text-slate-400 uppercase font-bold">Periode</p>
                                                        <p className="text-slate-800 font-medium">{order.account_details.bill_period || '-'}</p>
                                                    </div>
                                                    <div className="bg-white border border-purple-100 px-2.5 py-2 rounded-xl">
                                                        <p className="text-[9px] text-slate-400 uppercase font-bold">Nominal Tagihan</p>
                                                        <p className="text-slate-800 font-bold">Rp {(order.account_details.bill_amount || 0).toLocaleString('id-ID')}</p>
                                                    </div>
                                                    <div className="bg-white border border-purple-100 px-2.5 py-2 rounded-xl">
                                                        <p className="text-[9px] text-slate-400 uppercase font-bold">Biaya Layanan</p>
                                                        <p className="text-slate-800 font-bold">Rp {(order.account_details.admin_fee || 0).toLocaleString('id-ID')}</p>
                                                    </div>
                                                    <div className="bg-cyan-50 border border-cyan-200 px-2.5 py-2 rounded-xl col-span-2">
                                                        <p className="text-[9px] text-cyan-700 uppercase font-bold">Total Dibayar</p>
                                                        <p className="text-cyan-900 font-black">Rp {(order.account_details.total_amount || order.price || 0).toLocaleString('id-ID')}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {(() => {
                                                const targetNum = order.account_details.target || order.account_details.sekalipay_note || order.account_details.raw_items?.[0]?.target;
                                                if (targetNum) {
                                                    return (
                                                        <div className="flex flex-col gap-1 bg-white border border-purple-100 px-3 py-2 rounded-xl text-xs mb-2">
                                                            <span className="text-[10px] text-slate-400 uppercase font-bold">Nomor Tujuan</span>
                                                            <span className="font-mono text-purple-700 font-bold select-all">{targetNum}</span>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
                                            {(() => {
                                                const details = order.account_details;
                                                if (typeof details === 'object' && details !== null) {
                                                    if (Array.isArray(details.licenses) && details.licenses.length > 0) {
                                                        return (
                                                            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                                                {details.licenses.map((lic, index) => {
                                                                    let licenseText = '';
                                                                    let licenseNote = '';
                                                                    if (lic && typeof lic === 'object') {
                                                                        licenseText = lic.product_license || lic.license || lic.key || lic.code || JSON.stringify(lic);
                                                                        licenseNote = lic.note || lic.desc || '';
                                                                    } else {
                                                                        licenseText = String(lic);
                                                                    }
                                                                    return (
                                                                        <div key={index} className="flex flex-col gap-1 bg-white border border-purple-100 px-3 py-2.5 rounded-xl text-xs shadow-xs">
                                                                            <div className="flex items-center justify-between gap-3 font-mono text-slate-800">
                                                                                <span className="truncate select-all font-semibold">{licenseText}</span>
                                                                                <button 
                                                                                    onClick={() => {
                                                                                        navigator.clipboard.writeText(licenseText);
                                                                                        notifySuccess('Lisensi berhasil disalin!');
                                                                                    }}
                                                                                    className="text-purple-600 hover:text-purple-800 text-[10px] uppercase font-bold shrink-0 bg-purple-50 px-2 py-0.5 rounded border border-purple-200"
                                                                                >
                                                                                    Copy
                                                                                </button>
                                                                            </div>
                                                                            {licenseNote && (
                                                                                <p className="text-[10px] text-slate-500 italic mt-0.5">{licenseNote}</p>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        );
                                                    }
                                                    return (
                                                        <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap bg-white p-3 rounded-xl border border-purple-100 max-h-40 overflow-auto">
                                                            {JSON.stringify(details, null, 2)}
                                                        </pre>
                                                    );
                                                }
                                                return (
                                                    <p className="text-xs text-slate-700 whitespace-pre-wrap font-medium">{String(details)}</p>
                                                );
                                            })()}
                                        </div>
                                    )}
                                    {order.testimonial && order.testimonial !== '-' && (
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 italic text-sm text-slate-600">
                                            "{order.testimonial}"
                                        </div>
                                    )}
                                </div>
                                <div className="w-full lg:w-48 flex flex-col gap-2 shrink-0">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openOrderModal(order)}
                                            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl transition-all text-xs font-bold flex items-center justify-center gap-2"
                                        >
                                            <Edit size={14} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(order.id)}
                                            className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition-all text-xs font-bold flex items-center justify-center gap-2"
                                        >
                                            <Trash2 size={14} /> Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}

            {/* Pagination Controls */}
            {!loading && totalPages > 0 && (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-slate-500 font-medium">
                            Menampilkan {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} dari {total} order
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1 || loading}
                                className="flex items-center gap-1 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 rounded-xl transition-all text-xs font-bold"
                            >
                                <ChevronLeft size={14} /> Prev
                            </button>
                            <span className="text-sm text-slate-700 font-semibold px-2">
                                Halaman {page} dari {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages || totalPages === 0 || loading}
                                className="flex items-center gap-1 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 rounded-xl transition-all text-xs font-bold"
                            >
                                Next <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersTab;
