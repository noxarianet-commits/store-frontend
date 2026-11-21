import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Search, Filter, Loader2, ChevronLeft, ChevronRight, LifeBuoy, AlertTriangle, Inbox, CheckCircle2, Clock, Flag, Mail, Phone } from 'lucide-react';
import api from '../../api';
import TicketThreadModal from './TicketThreadModal';

const STATUS_CONFIG = {
    open: { label: 'Terbuka', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
    pending: { label: 'Menunggu', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
    closed: { label: 'Selesai', color: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
};

const PRIORITY_CONFIG = {
    low: { label: 'Rendah', color: 'bg-slate-100 text-slate-600 border-slate-200' },
    normal: { label: 'Normal', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    high: { label: 'Tinggi', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    urgent: { label: 'Mendesak', color: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const CATEGORY_LABELS = {
    umum: 'Umum',
    pesanan: 'Pesanan',
    pembayaran: 'Pembayaran',
    produk: 'Produk',
    akun: 'Akun',
    lainnya: 'Lainnya',
};

const PAGE_SIZE = 20;

const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const TicketsTab = () => {
    const [tickets, setTickets] = useState([]);
    const [stats, setStats] = useState({ open: 0, pending: 0, closed: 0, urgent: 0 });
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [priorityFilter, setPriorityFilter] = useState('ALL');
    const [openTicket, setOpenTicket] = useState(null);
    const [modalRefreshKey, setModalRefreshKey] = useState(0);

    const stateRef = useRef({ page: 1, activeSearch: '', statusFilter: 'ALL', priorityFilter: 'ALL', openTicket: null });
    useEffect(() => {
        stateRef.current = { page, activeSearch, statusFilter, priorityFilter, openTicket };
    }, [page, activeSearch, statusFilter, priorityFilter, openTicket]);

    const fetchStats = useCallback(async () => {
        try {
            const res = await api.getAdminTicketStats();
            if (res.data?.stats) {
                setStats(res.data.stats);
            }
        } catch (err) {
            console.error('Gagal mengambil statistik tiket:', err);
        }
    }, []);

    const fetchTickets = useCallback(async (
        targetPage = 1,
        search = activeSearch,
        status = statusFilter,
        priority = priorityFilter
    ) => {
        setLoading(true);
        try {
            const params = { page: targetPage, limit: PAGE_SIZE };
            if (search.trim()) params.search = search.trim();
            if (status !== 'ALL') params.status = status;
            if (priority !== 'ALL') params.priority = priority;

            const res = await api.getAdminTickets({ params });
            const data = res.data || {};
            setTickets(Array.isArray(data.tickets) ? data.tickets : []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
            setPage(data.page || targetPage);
        } catch (err) {
            console.error('Gagal mengambil daftar tiket:', err);
        } finally {
            setLoading(false);
        }
    }, [activeSearch, statusFilter, priorityFilter]);

    useEffect(() => {
        fetchStats();
        fetchTickets(1, '', 'ALL', 'ALL');
    }, [fetchStats, fetchTickets]);

    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) return undefined;

        const base = String(api.defaults.baseURL || '').replace(/\/$/, '');
        const source = new EventSource(`${base}/admin/tickets/stream?token=${encodeURIComponent(adminToken)}`);

        let timer = null;
        const scheduleRefresh = () => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                const current = stateRef.current;
                fetchStats();
                fetchTickets(current.page, current.activeSearch, current.statusFilter, current.priorityFilter);
                if (current.openTicket) setModalRefreshKey((key) => key + 1);
            }, 400);
        };

        source.addEventListener('created', scheduleRefresh);
        source.addEventListener('message', scheduleRefresh);
        source.addEventListener('status', scheduleRefresh);

        return () => {
            if (timer) clearTimeout(timer);
            source.close();
        };
    }, [fetchStats, fetchTickets]);

    const handleSearch = (event) => {
        if (event) event.preventDefault();
        const trimmed = searchInput.trim();
        setActiveSearch(trimmed);
        setPage(1);
        fetchTickets(1, trimmed, statusFilter, priorityFilter);
    };

    const handleStatusChange = (value) => {
        setStatusFilter(value);
        setPage(1);
        fetchTickets(1, activeSearch, value, priorityFilter);
    };

    const handlePriorityChange = (value) => {
        setPriorityFilter(value);
        setPage(1);
        fetchTickets(1, activeSearch, statusFilter, value);
    };

    const handleReset = () => {
        setSearchInput('');
        setActiveSearch('');
        setStatusFilter('ALL');
        setPriorityFilter('ALL');
        setPage(1);
        fetchTickets(1, '', 'ALL', 'ALL');
    };

    const handlePageChange = (targetPage) => {
        if (targetPage < 1 || targetPage > totalPages) return;
        setPage(targetPage);
        fetchTickets(targetPage, activeSearch, statusFilter, priorityFilter);
    };

    const handleModalUpdated = useCallback(() => {
        fetchStats();
        const current = stateRef.current;
        fetchTickets(current.page, current.activeSearch, current.statusFilter, current.priorityFilter);
    }, [fetchStats, fetchTickets]);

    const statCards = [
        { label: 'Terbuka', value: stats.open, icon: LifeBuoy, color: 'text-blue-600 bg-blue-50 border-blue-100' },
        { label: 'Menunggu', value: stats.pending, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-100' },
        { label: 'Butuh Perhatian', value: stats.urgent, icon: AlertTriangle, color: 'text-rose-600 bg-rose-50 border-rose-100' },
        { label: 'Selesai', value: stats.closed, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    ];

    const hasFilter = activeSearch || statusFilter !== 'ALL' || priorityFilter !== 'ALL';

    return (
        <div className="space-y-4">
            {/* Statistik */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${card.color}`}>
                                <Icon size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{card.label}</p>
                                <p className="text-xl font-black text-slate-900 font-mono">{card.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Search & Filter */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Cari no. tiket, nama, email, WA, atau ID pesanan..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-500 transition-colors"
                        />
                    </div>
                    <div className="flex gap-2 shrink-0 flex-wrap">
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-purple-500 cursor-pointer appearance-none pr-8 h-full"
                            >
                                <option value="ALL">Semua Status</option>
                                <option value="open">Terbuka</option>
                                <option value="pending">Menunggu</option>
                                <option value="closed">Selesai</option>
                            </select>
                            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                        </div>
                        <div className="relative">
                            <select
                                value={priorityFilter}
                                onChange={(e) => handlePriorityChange(e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-purple-500 cursor-pointer appearance-none pr-8 h-full"
                            >
                                <option value="ALL">Semua Prioritas</option>
                                <option value="urgent">Mendesak</option>
                                <option value="high">Tinggi</option>
                                <option value="normal">Normal</option>
                                <option value="low">Rendah</option>
                            </select>
                            <Flag className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                        </div>
                        <button
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
                        >
                            <Search size={14} /> Cari
                        </button>
                        {hasFilter && (
                            <button
                                type="button"
                                onClick={handleReset}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </form>
                {hasFilter && (
                    <p className="text-purple-600 text-xs mt-2.5 font-medium">
                        Ditemukan {total} tiket{activeSearch ? ` untuk "${activeSearch}"` : ''}.
                    </p>
                )}
            </div>

            {/* Daftar */}
            {loading ? (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center gap-3 shadow-xs">
                    <Loader2 size={28} className="animate-spin text-purple-600" />
                    <span className="text-xs font-semibold">Memuat tiket...</span>
                </div>
            ) : tickets.length === 0 ? (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-500 shadow-xs">
                    <Inbox size={28} className="mx-auto mb-3 text-slate-400" />
                    {hasFilter ? 'Tidak ada tiket yang sesuai filter.' : 'Belum ada tiket bantuan masuk.'}
                </div>
            ) : (
                tickets.map((ticket) => {
                    const statusCfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
                    const priorityCfg = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.normal;
                    return (
                        <button
                            key={ticket.id}
                            onClick={() => setOpenTicket(ticket.ticket_number)}
                            className="w-full text-left bg-white border border-slate-200/80 hover:border-purple-300 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all group"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                                <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-lg">{ticket.ticket_number}</span>
                                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.color}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                                            {statusCfg.label}
                                        </span>
                                        {(ticket.priority === 'high' || ticket.priority === 'urgent') && (
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityCfg.color}`}>
                                                <Flag size={10} /> {priorityCfg.label}
                                            </span>
                                        )}
                                        <span className="text-[10px] text-slate-400 ml-auto font-medium">{formatDate(ticket.last_message_at)}</span>
                                    </div>
                                    <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate group-hover:text-purple-700 transition-colors">
                                        {ticket.subject}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                                        <span className="font-medium text-slate-700">{ticket.guest_name || 'Tanpa nama'}</span>
                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-600">{CATEGORY_LABELS[ticket.category] || 'Umum'}</span>
                                        {ticket.order_id && <span className="font-mono text-slate-500 font-semibold">{ticket.order_id}</span>}
                                        {ticket.guest_email && <span className="inline-flex items-center gap-1"><Mail size={11} className="text-slate-400" /> {ticket.guest_email}</span>}
                                        {ticket.guest_wa && <span className="inline-flex items-center gap-1"><Phone size={11} className="text-slate-400" /> {ticket.guest_wa}</span>}
                                        <span className="text-slate-400 italic">
                                            {ticket.last_message_by === 'admin' ? 'Terakhir dibalas admin' : 'Menunggu balasan admin'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })
            )}

            {/* Pagination */}
            {!loading && totalPages > 0 && (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-slate-500 font-medium">
                            Menampilkan {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} dari {total} tiket
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1 || loading}
                                className="flex items-center gap-1 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 rounded-xl transition-all text-xs font-bold"
                            >
                                <ChevronLeft size={14} /> Prev
                            </button>
                            <span className="text-sm text-slate-700 font-semibold px-2">Halaman {page} dari {totalPages}</span>
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

            <AnimatePresence>
                {openTicket && (
                    <TicketThreadModal
                        ticketNumber={openTicket}
                        onClose={() => setOpenTicket(null)}
                        onUpdated={handleModalUpdated}
                        refreshKey={modalRefreshKey}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default TicketsTab;
