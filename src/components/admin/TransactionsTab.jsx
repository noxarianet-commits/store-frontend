import { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Loader2,
    ChevronLeft,
    ChevronRight,
    ArrowDownLeft,
    ArrowUpRight,
    RotateCcw,
    Copy,
    Check,
    RefreshCw,
    Wallet,
    AlertCircle,
    Eye,
    X,
    Clock,
    CheckCircle2,
    XCircle,
    ExternalLink
} from 'lucide-react';
import { formatRp } from '../../utils/currencyUtils';
import { notifySuccess, notifyError } from '../../utils/notify';
import api from '../../api';

const TYPE_CONFIG = {
    topup: { label: 'Top-up', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: ArrowDownLeft },
    purchase: { label: 'Pembelian', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: ArrowUpRight },
    refund: { label: 'Refund', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: RotateCcw },
};

const STATUS_CONFIG = {
    completed: { label: 'Selesai', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' },
    pending: { label: 'Menunggu', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-400' },
    failed: { label: 'Gagal', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30', dot: 'bg-rose-400' },
    cancelled: { label: 'Dibatalkan', color: 'bg-gray-500/15 text-gray-400 border-gray-500/30', dot: 'bg-gray-400' },
};

export default function TransactionsTab() {
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
    const [copiedId, setCopiedId] = useState(null);
    const [selectedTx, setSelectedTx] = useState(null);

    const fetchStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const res = await api.get('/admin/balance-transactions/stats');
            if (res.data?.success) {
                setStats(res.data.stats);
            }
        } catch (err) {
            console.error('Gagal memuat statistik transaksi:', err);
        } finally {
            setStatsLoading(false);
        }
    }, []);

    const fetchTransactions = useCallback(async (targetPage = 1, searchTerm = activeSearch, type = typeFilter, status = statusFilter) => {
        setLoading(true);
        try {
            const params = {
                page: targetPage,
                limit: 15,
            };
            if (searchTerm.trim()) params.search = searchTerm.trim();
            if (type !== 'ALL') params.type = type;
            if (status !== 'ALL') params.status = status;

            const res = await api.get('/admin/balance-transactions', { params });
            if (res.data?.success) {
                setTransactions(res.data.data || []);
                setPagination(res.data.pagination || { total: 0, totalPages: 1 });
            }
        } catch (err) {
            notifyError('Gagal memuat data transaksi saldo');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [activeSearch, typeFilter, statusFilter]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchTransactions(page, activeSearch, typeFilter, statusFilter);
    }, [page, activeSearch, typeFilter, statusFilter, fetchTransactions]);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        const trimmed = search.trim();
        setActiveSearch(trimmed);
        setPage(1);
    };

    const handleClearFilters = () => {
        setSearch('');
        setActiveSearch('');
        setTypeFilter('ALL');
        setStatusFilter('ALL');
        setPage(1);
    };

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        notifySuccess('Reference ID berhasil disalin!');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const formatDate = (isoString) => {
        if (!isoString) return '-';
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Transaksi Saldo</h2>
                    <p className="text-gray-400 text-sm mt-0.5">
                        Log mutasi dan riwayat transaksi saldo pengguna (balance_transactions)
                    </p>
                </div>
                <button
                    onClick={() => { fetchStats(); fetchTransactions(page, activeSearch, typeFilter, statusFilter); }}
                    disabled={loading || statsLoading}
                    className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-medium transition-colors border border-white/5"
                >
                    <RefreshCw size={15} className={`${(loading || statsLoading) ? 'animate-spin text-purple-400' : ''}`} />
                    <span>Segarkan</span>
                </button>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Saldo User */}
                <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gray-400">Total Saldo User</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <Wallet size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {statsLoading ? (
                            <span className="text-gray-500 text-lg">Memuat...</span>
                        ) : (
                            formatRp(stats?.totalUserBalance || 0)
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {stats?.totalUsers || 0} akun pengguna terdaftar
                    </p>
                </div>

                {/* Total Purchase */}
                <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gray-400">Total Pembelian Saldo</span>
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                            <ArrowUpRight size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {statsLoading ? (
                            <span className="text-gray-500 text-lg">Memuat...</span>
                        ) : (
                            formatRp(stats?.totalPurchase || 0)
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {stats?.countPurchase || 0} order dibayar saldo
                    </p>
                </div>

                {/* Total Refund */}
                <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gray-400">Total Refund Saldo</span>
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                            <RotateCcw size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {statsLoading ? (
                            <span className="text-gray-500 text-lg">Memuat...</span>
                        ) : (
                            formatRp(stats?.totalRefund || 0)
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {stats?.countRefund || 0} transaksi pengembalian
                    </p>
                </div>

                {/* Pending */}
                <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gray-400">Top-up Menunggu</span>
                        <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-400">
                            <Clock size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white flex items-center gap-2">
                        {statsLoading ? (
                            <span className="text-gray-500 text-lg">Memuat...</span>
                        ) : (
                            <>
                                <span>{stats?.pendingCount || 0}</span>
                                {Boolean(stats?.pendingCount > 0) && (
                                    <span className="text-[11px] font-semibold bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/30">
                                        Perlu dicek
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Total {stats?.totalCount || 0} riwayat keseluruhan
                    </p>
                </div>
            </div>

            {/* ── Filters & Search ── */}
            <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-4 space-y-3">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari Ref ID, invoice PG, keterangan, nama, email, no HP..."
                            className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-purple-600/20"
                        >
                            Cari
                        </button>
                        {(activeSearch || typeFilter !== 'ALL' || statusFilter !== 'ALL') && (
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </form>

                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
                    {/* Tipe filter */}
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                        <span className="text-xs text-gray-500 mr-1 font-medium">Tipe:</span>
                        {[
                            { id: 'ALL', label: 'Semua' },
                            { id: 'topup', label: 'Top-up' },
                            { id: 'purchase', label: 'Pembelian' },
                            { id: 'refund', label: 'Refund' }
                        ].map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => { setTypeFilter(item.id); setPage(1); }}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                    typeFilter === item.id
                                        ? 'bg-purple-600 text-white shadow-sm'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="h-4 w-[1px] bg-white/10 hidden sm:block mx-1" />

                    {/* Status filter */}
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                        <span className="text-xs text-gray-500 mr-1 font-medium">Status:</span>
                        {[
                            { id: 'ALL', label: 'Semua' },
                            { id: 'completed', label: 'Selesai' },
                            { id: 'pending', label: 'Menunggu' },
                            { id: 'failed', label: 'Gagal' },
                            { id: 'cancelled', label: 'Dibatalkan' }
                        ].map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => { setStatusFilter(item.id); setPage(1); }}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                    statusFilter === item.id
                                        ? 'bg-purple-600 text-white shadow-sm'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="p-16 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-7 h-7 animate-spin text-purple-500" />
                        <span className="text-xs text-gray-500">Memuat data transaksi saldo...</span>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="p-16 text-center">
                        <Wallet className="w-10 h-10 text-gray-600 mx-auto mb-3 opacity-40" />
                        <p className="text-gray-400 font-medium text-sm">Tidak ada transaksi ditemukan</p>
                        <p className="text-gray-600 text-xs mt-1">Coba sesuaikan kata kunci pencarian atau ubah filter.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/5 text-gray-400 text-xs uppercase tracking-wider bg-white/[0.01]">
                                    <th className="text-left px-4 py-3.5">Waktu</th>
                                    <th className="text-left px-4 py-3.5">User</th>
                                    <th className="text-center px-4 py-3.5">Tipe</th>
                                    <th className="text-right px-4 py-3.5">Nominal</th>
                                    <th className="text-right px-4 py-3.5 hidden md:table-cell">Mutasi Saldo</th>
                                    <th className="text-left px-4 py-3.5 hidden sm:table-cell">Ref ID</th>
                                    <th className="text-center px-4 py-3.5 hidden lg:table-cell">Metode</th>
                                    <th className="text-center px-4 py-3.5">Status</th>
                                    <th className="text-center px-4 py-3.5">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {transactions.map((tx) => {
                                    const typeMeta = TYPE_CONFIG[tx.type] || { label: tx.type, color: 'bg-gray-500/10 text-gray-400', icon: Wallet };
                                    const statusMeta = STATUS_CONFIG[tx.status] || { label: tx.status, color: 'bg-gray-500/15 text-gray-400', dot: 'bg-gray-400' };
                                    const TypeIcon = typeMeta.icon;
                                    const isCredit = tx.type === 'topup' || tx.type === 'refund';

                                    return (
                                        <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                                            {/* Waktu */}
                                            <td className="px-4 py-3.5 whitespace-nowrap text-xs text-gray-400">
                                                {formatDate(tx.created_at)}
                                            </td>

                                            {/* User */}
                                            <td className="px-4 py-3.5">
                                                <div className="min-w-[140px] max-w-[200px]">
                                                    <p className="text-white font-medium truncate text-xs sm:text-sm">
                                                        {tx.user_profiles?.display_name || 'User'}
                                                    </p>
                                                    <p className="text-gray-500 text-xs truncate">
                                                        {tx.user_profiles?.email || '-'}
                                                    </p>
                                                </div>
                                            </td>

                                            {/* Tipe */}
                                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${typeMeta.color}`}>
                                                    <TypeIcon size={12} />
                                                    {typeMeta.label}
                                                </span>
                                            </td>

                                            {/* Nominal */}
                                            <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                                <span className={`font-bold font-mono text-sm ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {isCredit ? '+' : '-'}{formatRp(tx.amount || 0)}
                                                </span>
                                            </td>

                                            {/* Mutasi Saldo */}
                                            <td className="px-4 py-3.5 text-right text-xs whitespace-nowrap hidden md:table-cell">
                                                <div className="text-gray-400 font-mono">
                                                    <span className="text-gray-500">{formatRp(tx.balance_before || 0)}</span>
                                                    <span className="mx-1 text-gray-600">→</span>
                                                    <span className="text-gray-200 font-medium">{formatRp(tx.balance_after || 0)}</span>
                                                </div>
                                            </td>

                                            {/* Ref ID */}
                                            <td className="px-4 py-3.5 hidden sm:table-cell whitespace-nowrap">
                                                {tx.reference_id ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-mono text-gray-300 max-w-[130px] truncate" title={tx.reference_id}>
                                                            {tx.reference_id}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopy(tx.reference_id, tx.id)}
                                                            className="text-gray-500 hover:text-white p-1 rounded transition-colors"
                                                            title="Salin Reference ID"
                                                        >
                                                            {copiedId === tx.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-600">-</span>
                                                )}
                                            </td>

                                            {/* Metode / PG */}
                                            <td className="px-4 py-3.5 text-center hidden lg:table-cell whitespace-nowrap">
                                                <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-400 font-mono uppercase">
                                                    {tx.pg_provider || (tx.reference_id?.startsWith('ADMIN') ? 'Manual Admin' : 'System')}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusMeta.color}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                                                    {statusMeta.label}
                                                </span>
                                            </td>

                                            {/* Aksi */}
                                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                                <button
                                                    onClick={() => setSelectedTx(tx)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors inline-flex items-center justify-center"
                                                    title="Lihat Detail Transaksi"
                                                >
                                                    <Eye size={15} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── Pagination ── */}
                {!loading && pagination.total > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 border-t border-white/5 bg-white/[0.01]">
                        <span className="text-xs text-gray-400">
                            Menampilkan {(page - 1) * 15 + 1}–{Math.min(page * 15, pagination.total)} dari {pagination.total} transaksi
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={14} /> Sebelumnya
                            </button>
                            <span className="text-xs text-gray-300 font-medium px-2 bg-white/5 py-1 rounded-md border border-white/5">
                                Halaman {page} dari {pagination.totalPages || 1}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.totalPages || 1, p + 1))}
                                disabled={page >= (pagination.totalPages || 1)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                Berikutnya <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Detail Modal ── */}
            {selectedTx && (
                <DetailModal
                    tx={selectedTx}
                    onClose={() => setSelectedTx(null)}
                    formatDate={formatDate}
                />
            )}
        </div>
    );
}

// ── Detail Modal Subcomponent ──────────────────────────────────────
function DetailModal({ tx, onClose, formatDate }) {
    const isCredit = tx.type === 'topup' || tx.type === 'refund';
    const typeMeta = TYPE_CONFIG[tx.type] || { label: tx.type, color: 'bg-gray-500/10 text-gray-400' };
    const statusMeta = STATUS_CONFIG[tx.status] || { label: tx.status, color: 'bg-gray-500/15 text-gray-400', dot: 'bg-gray-400' };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-[#0E0E0E] border border-white/10 rounded-2xl w-full max-w-lg relative z-10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white">Detail Transaksi Saldo</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{tx.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4 overflow-y-auto">
                    {/* Amount & Status Banner */}
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                        <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Nominal Transaksi</span>
                            <span className={`text-2xl font-bold font-mono ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isCredit ? '+' : '-'}{formatRp(tx.amount || 0)}
                            </span>
                        </div>
                        <div className="text-right space-y-1">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusMeta.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                                {statusMeta.label}
                            </span>
                            <div className="block">
                                <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold border ${typeMeta.color}`}>
                                    {typeMeta.label}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Identitas Pengguna</h4>
                        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Nama:</span>
                                <span className="text-white font-medium">{tx.user_profiles?.display_name || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Email:</span>
                                <span className="text-white font-mono">{tx.user_profiles?.email || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Nomor Telepon:</span>
                                <span className="text-white font-mono">{tx.user_profiles?.phone || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">User ID:</span>
                                <span className="text-gray-400 font-mono text-[11px] truncate max-w-[200px]" title={tx.user_id}>{tx.user_id}</span>
                            </div>
                        </div>
                    </div>

                    {/* Balance Info */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mutasi Saldo</h4>
                        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Saldo Sebelum:</span>
                                <span className="text-gray-300 font-mono font-medium">{formatRp(tx.balance_before || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Saldo Sesudah:</span>
                                <span className="text-emerald-400 font-mono font-bold">{formatRp(tx.balance_after || 0)}</span>
                            </div>
                            <div className="flex justify-between border-t border-white/5 pt-2">
                                <span className="text-gray-500">Keterangan:</span>
                                <span className="text-white text-right max-w-[240px]">{tx.description || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Reference ID:</span>
                                <span className="text-gray-300 font-mono select-all">{tx.reference_id || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Waktu Dibuat:</span>
                                <span className="text-gray-300">{formatDate(tx.created_at)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Gateway Info (if available) */}
                    {(tx.pg_provider || tx.pg_invoice || tx.pg_qr_link) && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Informasi Payment Gateway</h4>
                            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Gateway Provider:</span>
                                    <span className="text-purple-400 font-semibold uppercase">{tx.pg_provider || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">PG Invoice:</span>
                                    <span className="text-gray-300 font-mono select-all">{tx.pg_invoice || '-'}</span>
                                </div>
                                {tx.pg_total && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Total Ditagihkan:</span>
                                        <span className="text-white font-mono font-bold">{formatRp(tx.pg_total)}</span>
                                    </div>
                                )}
                                {tx.pg_expired_at && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Batas Waktu Bayar:</span>
                                        <span className="text-gray-300">{formatDate(tx.pg_expired_at)}</span>
                                    </div>
                                )}
                                {tx.pg_qr_link && (
                                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                                        <span className="text-gray-500">QR Code Link:</span>
                                        <a
                                            href={tx.pg_qr_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
                                        >
                                            Buka QR <ExternalLink size={12} />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 bg-white/[0.01] flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-white/5 hover:bg-white/10 text-gray-300 px-5 py-2 rounded-xl text-xs font-medium transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
