import { useState, useEffect, useCallback } from 'react';
import { Calendar, User, Mail, Edit, Trash2, CreditCard, Search, Package, ChevronLeft, ChevronRight, Loader2, Filter } from 'lucide-react';
import api from '../../api';
import { notifySuccess } from '../../utils/notify';

const STATUS_CONFIG = {
    PENDING: { label: 'Menunggu', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-400' },
    PROCESSING: { label: 'Diproses', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30', dot: 'bg-blue-400' },
    COMPLETED: { label: 'Selesai', color: 'bg-green-500/15 text-green-400 border-green-500/30', dot: 'bg-green-400' },
    FAILED: { label: 'Gagal', color: 'bg-red-500/15 text-red-400 border-red-500/30', dot: 'bg-red-400' },
    CANCELLED: { label: 'Dibatalkan', color: 'bg-gray-500/15 text-gray-400 border-gray-500/30', dot: 'bg-gray-400' },
};

const VENDOR_CONFIG = {
    sekalipay: { label: 'Sekalipay', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    okeconnect: { label: 'OkeConnect', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
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

    const fetchOrders = useCallback(async (targetPage = 1, search = activeSearch, status = statusFilter) => {
        setLoading(true);
        try {
            const params = {
                page: targetPage,
                limit: PAGE_SIZE
            };
            if (search.trim()) params.search = search.trim();
            if (status !== 'ALL') params.status = status;

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
    }, [activeSearch, statusFilter]);

    useEffect(() => {
        fetchOrders(1, activeSearch, statusFilter);
    }, [refreshTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        const trimmed = searchId.trim();
        setActiveSearch(trimmed);
        setPage(1);
        fetchOrders(1, trimmed, statusFilter);
    };

    const handleStatusChange = (newStatus) => {
        setStatusFilter(newStatus);
        setPage(1);
        fetchOrders(1, activeSearch, newStatus);
    };

    const handleClearSearch = () => {
        setSearchId('');
        setActiveSearch('');
        setStatusFilter('ALL');
        setPage(1);
        fetchOrders(1, '', 'ALL');
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        setPage(newPage);
        fetchOrders(newPage, activeSearch, statusFilter);
    };

    const handleDelete = async (id) => {
        await deleteOrder(id);
        fetchOrders(page, activeSearch, statusFilter);
    };

    return (
        <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-4">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Cari ID Order atau No. WhatsApp..."
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                        />
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="bg-[#141414] border border-white/10 rounded-xl py-2.5 px-3 text-xs font-bold text-gray-300 focus:outline-none focus:border-purple-500/50 cursor-pointer appearance-none pr-8 h-full"
                            >
                                <option value="ALL">Semua Status</option>
                                <option value="PENDING">Menunggu</option>
                                <option value="PROCESSING">Diproses</option>
                                <option value="COMPLETED">Selesai</option>
                                <option value="FAILED">Gagal</option>
                                <option value="CANCELLED">Dibatalkan</option>
                            </select>
                            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={12} />
                        </div>
                        <button
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                        >
                            <Search size={14} /> Cari
                        </button>
                        {(activeSearch || statusFilter !== 'ALL') && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </form>
                {(activeSearch || statusFilter !== 'ALL') && (
                    <p className="text-purple-400 text-xs mt-2.5">
                        Filter: {activeSearch && `Pencarian "${activeSearch}" `}{statusFilter !== 'ALL' && `[Status: ${STATUS_CONFIG[statusFilter]?.label || statusFilter}]`} • Ditemukan {total} order.
                    </p>
                )}
            </div>

            {/* Content List */}
            {loading ? (
                <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-12 text-center text-gray-500 flex flex-col items-center gap-3">
                    <Loader2 size={28} className="animate-spin text-purple-500" />
                    <span className="text-xs">Memuat pesanan...</span>
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-10 text-center text-gray-500">
                    {activeSearch || statusFilter !== 'ALL' 
                        ? 'Tidak ada pesanan yang sesuai dengan filter pencarian.' 
                        : 'Belum ada pesanan masuk.'}
                </div>
            ) : (
                orders.map(order => {
                    const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                    const vendor = order.vendor || 'sekalipay';
                    const vendorCfg = VENDOR_CONFIG[vendor] || VENDOR_CONFIG.sekalipay;
                    return (
                        <div key={order.id} className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-4 sm:p-6 hover:border-white/10 transition-all group">
                            <div className="flex flex-col lg:flex-row justify-between gap-4 lg:gap-6">
                                <div className="flex-1 space-y-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-1 rounded">{order.id}</span>
                                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.color}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                                            {statusCfg.label}
                                        </span>
                                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${vendorCfg.color}`}>
                                            <Package size={10} />
                                            {vendorCfg.label}
                                        </span>
                                        <span className="text-[10px] text-gray-500 flex items-center gap-1 ml-auto sm:ml-0">
                                            <Calendar size={12} /> {new Date(order.timestamp).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-base sm:text-lg font-bold text-white">{order.product}</h3>
                                        <p className="text-sm text-gray-400">{order.variant} • Rp {order.price?.toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                        <div className="flex items-center gap-2 text-sm text-gray-300">
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/5 rounded-lg flex items-center justify-center"><User size={14} /></div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase">WhatsApp</p>
                                                <p className="text-xs sm:text-sm">{order.wa_number}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-300">
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/5 rounded-lg flex items-center justify-center"><Mail size={14} /></div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase">Email</p>
                                                <p className="text-xs sm:text-sm">{order.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {order.payment_method && (
                                        <div className="flex items-center gap-2 text-sm text-gray-300">
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/5 rounded-lg flex items-center justify-center"><CreditCard size={14} /></div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase">Pembayaran</p>
                                                <p className="text-xs sm:text-sm">{order.payment_method}</p>
                                            </div>
                                        </div>
                                    )}
                                    {order.account_details && (
                                        <div className="mt-3 p-3.5 bg-purple-500/5 border border-purple-500/10 rounded-2xl space-y-2">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Detail Akun / Lisensi</p>
                                                {order.account_details.type && (
                                                    <span className="text-[8px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded font-mono uppercase">
                                                        {order.account_details.type}
                                                    </span>
                                                )}
                                            </div>
                                            {(() => {
                                                const targetNum = order.account_details.target || order.account_details.sekalipay_note || order.account_details.raw_items?.[0]?.target;
                                                if (targetNum) {
                                                    return (
                                                        <div className="flex flex-col gap-1 bg-white/5 border border-white/5 px-2.5 py-2 rounded-xl text-xs mb-2">
                                                            <span className="text-[10px] text-gray-500 uppercase font-bold">Nomor Tujuan</span>
                                                            <span className="font-mono text-gray-300 select-all">{targetNum}</span>
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
                                                                        <div key={index} className="flex flex-col gap-1 bg-white/5 border border-white/5 px-2.5 py-2.5 rounded-xl text-xs">
                                                                            <div className="flex items-center justify-between gap-3 font-mono text-gray-300">
                                                                                <span className="truncate select-all">{licenseText}</span>
                                                                                <button 
                                                                                    onClick={() => {
                                                                                        navigator.clipboard.writeText(licenseText);
                                                                                        notifySuccess('Lisensi berhasil disalin!');
                                                                                    }}
                                                                                    className="text-purple-400 hover:text-purple-300 text-[10px] uppercase font-bold shrink-0"
                                                                                >
                                                                                    Copy
                                                                                </button>
                                                                            </div>
                                                                            {licenseNote && (
                                                                                <p className="text-[10px] text-gray-500 italic mt-0.5">{licenseNote}</p>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        );
                                                    }
                                                    return (
                                                        <pre className="text-xs font-mono text-gray-400 whitespace-pre-wrap bg-white/5 p-2 rounded-xl border border-white/5 max-h-40 overflow-auto">
                                                            {JSON.stringify(details, null, 2)}
                                                        </pre>
                                                    );
                                                }
                                                return (
                                                    <p className="text-xs text-gray-300 whitespace-pre-wrap">{String(details)}</p>
                                                );
                                            })()}
                                        </div>
                                    )}
                                    {order.testimonial && order.testimonial !== '-' && (
                                        <div className="bg-white/3 p-3 rounded-xl border border-white/5 italic text-sm text-gray-400">
                                            "{order.testimonial}"
                                        </div>
                                    )}
                                </div>
                                <div className="w-full lg:w-48 flex flex-col gap-3">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openOrderModal(order)}
                                            className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all text-xs font-bold flex items-center justify-center gap-2"
                                        >
                                            <Edit size={14} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(order.id)}
                                            className="flex-1 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all text-xs font-bold flex items-center justify-center gap-2"
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
                <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-400">
                            Menampilkan {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} dari {total} order
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1 || loading}
                                className="flex items-center gap-1 px-3 py-2 bg-white/5 hover:bg-white/10 disabled:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all text-xs font-bold"
                            >
                                <ChevronLeft size={14} /> Prev
                            </button>
                            <span className="text-sm text-gray-300 px-3">
                                Halaman {page} dari {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages || totalPages === 0 || loading}
                                className="flex items-center gap-1 px-3 py-2 bg-white/5 hover:bg-white/10 disabled:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all text-xs font-bold"
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
