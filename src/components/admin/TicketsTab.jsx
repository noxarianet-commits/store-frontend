import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Search, Filter, Loader2, ChevronLeft, ChevronRight, LifeBuoy, AlertTriangle, Inbox, CheckCircle2, Clock, Flag, Mail, Phone } from 'lucide-react';
import api from '../../api';
import TicketThreadModal from './TicketThreadModal';

const STATUS_CONFIG = {
    open: { label: 'Terbuka', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30', dot: 'bg-blue-400' },
    pending: { label: 'Menunggu', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30', dot: 'bg-amber-400' },
    closed: { label: 'Selesai', color: 'bg-gray-500/15 text-gray-400 border-gray-500/30', dot: 'bg-gray-400' },
};

const PRIORITY_CONFIG = {
    low: { label: 'Rendah', color: 'bg-gray-500/15 text-gray-400 border-gray-500/30' },
    normal: { label: 'Normal', color: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
    high: { label: 'Tinggi', color: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
    urgent: { label: 'Mendesak', color: 'bg-red-500/15 text-red-400 border-red-500/30' },
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

    // Nilai terbaru untuk handler SSE (EventSource tidak boleh dibuat ulang tiap filter berubah).
    const stateRef = useRef({ page: 1, activeSearch: '', statusFilter: 'ALL', priorityFilter: 'ALL', openTicket: null });
    useEffect(() => {
        stateRef.current = { page, activeSearch, statusFilter, priorityFilter, openTicket };
    }, [page, activeSearch, statusFilter, priorityFilter, openTicket]);

    const fetchStats = useCallback(async () => {
        try {
            const res = await api.getAdminTicketStats();
            setStats(res.data?.data || { open: 0, pending: 0, closed: 0, urgent: 0 });
        } catch {
            // Statistik bukan data kritis — biarkan nilai lama.
        }
    }, []);

    const fetchTickets = useCallback(async (targetPage = 1, search = '', status = 'ALL', priority = 'ALL') => {
        setLoading(true);
        try {
            const params = { page: targetPage, limit: PAGE_SIZE };
            if (search.trim()) params.search = search.trim();
            if (status !== 'ALL') params.status = status;
            if (priority !== 'ALL') params.priority = priority;

            const res = await api.getAdminTickets(params);
            setTickets(res.data?.data || []);
            setTotal(res.data?.pagination?.total || 0);
            setTotalPages(res.data?.pagination?.totalPages || 1);
            setPage(res.data?.pagination?.page || targetPage);
        } catch (err) {
            console.error('Gagal memuat tiket:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Muat pertama kali — setTimeout 0 mengikuti pola AdminDashboard agar tidak
    // memicu render berantai di dalam body effect.
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStats();
            fetchTickets(1);
        }, 0);
        return () => clearTimeout(timer);
    }, [fetchStats, fetchTickets]);

    // SSE feed admin — refresh daftar & statistik saat ada tiket/pesan baru.
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
        { label: 'Terbuka', value: stats.open, icon: LifeBuoy, color: 'text-blue-400 bg-blue-500/10' },
        { label: 'Menunggu', value: stats.pending, icon: Clock, color: 'text-amber-400 bg-amber-500/10' },
        { label: 'Butuh Perhatian', value: stats.urgent, icon: AlertTriangle, color: 'text-red-400 bg-red-500/10' },
        { label: 'Selesai', value: stats.closed, icon: CheckCircle2, color: 'text-green-400 bg-green-500/10' },
    ];

    const hasFilter = activeSearch || statusFilter !== 'ALL' || priorityFilter !== 'ALL';

    return (
        <div className="space-y-4">
            {/* Statistik */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.color}`}>
                                <Icon size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{card.label}</p>
                                <p className="text-xl font-bold text-white">{card.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Search & Filter */}
            <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-4">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Cari no. tiket, nama, email, WA, atau ID pesanan..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                        />
                    </div>
                    <div className="flex gap-2 shrink-0 flex-wrap">
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="bg-[#141414] border border-white/10 rounded-xl py-2.5 px-3 text-xs font-bold text-gray-300 focus:outline-none focus:border-purple-500/50 cursor-pointer appearance-none pr-8 h-full"
                            >
                                <option value="ALL">Semua Status</option>
                                <option value="open">Terbuka</option>
                                <option value="pending">Menunggu</option>
                                <option value="closed">Selesai</option>
                            </select>
                            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={12} />
                        </div>
                        <div className="relative">
                            <select
                                value={priorityFilter}
                                onChange={(e) => handlePriorityChange(e.target.value)}
                                className="bg-[#141414] border border-white/10 rounded-xl py-2.5 px-3 text-xs font-bold text-gray-300 focus:outline-none focus:border-purple-500/50 cursor-pointer appearance-none pr-8 h-full"
                            >
                                <option value="ALL">Semua Prioritas</option>
                                <option value="urgent">Mendesak</option>
                                <option value="high">Tinggi</option>
                                <option value="normal">Normal</option>
                                <option value="low">Rendah</option>
                            </select>
                            <Flag className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={12} />
                        </div>
                        <button
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                        >
                            <Search size={14} /> Cari
                        </button>
                        {hasFilter && (
                            <button
                                type="button"
                                onClick={handleReset}
                                className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </form>
                {hasFilter && (
                    <p className="text-purple-400 text-xs mt-2.5">
                        Ditemukan {total} tiket{activeSearch ? ` untuk "${activeSearch}"` : ''}.
                    </p>
                )}
            </div>

            {/* Daftar */}
            {loading ? (
                <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-12 text-center text-gray-500 flex flex-col items-center gap-3">
                    <Loader2 size={28} className="animate-spin text-purple-500" />
                    <span className="text-xs">Memuat tiket...</span>
                </div>
            ) : tickets.length === 0 ? (
                <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-12 text-center text-gray-500">
                    <Inbox size={28} className="mx-auto mb-3 text-gray-600" />
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
                            className="w-full text-left bg-[#0E0E0E] border border-white/5 hover:border-purple-500/30 rounded-2xl p-4 sm:p-5 transition-all group"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                                <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-1 rounded">{ticket.ticket_number}</span>
                                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.color}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                                            {statusCfg.label}
                                        </span>
                                        {(ticket.priority === 'high' || ticket.priority === 'urgent') && (
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityCfg.color}`}>
                                                <Flag size={10} /> {priorityCfg.label}
                                            </span>
                                        )}
                                        <span className="text-[10px] text-gray-500 ml-auto">{formatDate(ticket.last_message_at)}</span>
                                    </div>
                                    <h3 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                                        {ticket.subject}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                                        <span>{ticket.guest_name || 'Tanpa nama'}</span>
                                        <span>{CATEGORY_LABELS[ticket.category] || 'Umum'}</span>
                                        {ticket.order_id && <span className="font-mono">{ticket.order_id}</span>}
                                        {ticket.guest_email && <span className="inline-flex items-center gap-1"><Mail size={11} /> {ticket.guest_email}</span>}
                                        {ticket.guest_wa && <span className="inline-flex items-center gap-1"><Phone size={11} /> {ticket.guest_wa}</span>}
                                        <span className="text-gray-600">
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
                <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-400">
                            Menampilkan {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} dari {total} tiket
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1 || loading}
                                className="flex items-center gap-1 px-3 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all text-xs font-bold"
                            >
                                <ChevronLeft size={14} /> Prev
                            </button>
                            <span className="text-sm text-gray-300 px-3">Halaman {page} dari {totalPages}</span>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages || totalPages === 0 || loading}
                                className="flex items-center gap-1 px-3 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all text-xs font-bold"
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
