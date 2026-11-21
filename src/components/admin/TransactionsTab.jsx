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
    topup: { label: 'Top-up', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: ArrowDownLeft },
    purchase: { label: 'Pembelian', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: ArrowUpRight },
    refund: { label: 'Refund', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: RotateCcw },
};

const STATUS_CONFIG = {
    completed: { label: 'Selesai', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    pending: { label: 'Menunggu', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
    failed: { label: 'Gagal', color: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
    cancelled: { label: 'Dibatalkan', color: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
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
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Transaksi Saldo</h2>
                    <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                        Log mutasi dan riwayat transaksi saldo pengguna (balance_transactions)
                    </p>
                </div>
                <button
                    onClick={() => { fetchStats(); fetchTransactions(page, activeSearch, typeFilter, statusFilter); }}
                    disabled={loading || statsLoading}
                    className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                    <RefreshCw size={14} className={`${(loading || statsLoading) ? 'animate-spin text-purple-600' : ''}`} />
                    <span>Segarkan</span>
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Saldo User */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Saldo User</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                            <Wallet size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 font-mono">
                        {statsLoading ? (
                            <span className="text-slate-400 text-sm">Memuat...</span>
                        ) : (
                            formatRp(stats?.totalUserBalance || 0)
                        )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">
                        {stats?.totalUsers || 0} akun pengguna terdaftar
                    </p>
                </div>

                {/* Total Purchase */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Pembelian Saldo</span>
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
                            <ArrowUpRight size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 font-mono">
                        {statsLoading ? (
                            <span className="text-slate-400 text-sm">Memuat...</span>
                        ) : (
                            formatRp(stats?.totalPurchase || 0)
                        )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">
                        {stats?.countPurchase || 0} order dibayar saldo
                    </p>
                </div>

                {/* Total Refund */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Refund Saldo</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
                            <RotateCcw size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 font-mono">
                        {statsLoading ? (
                            <span className="text-slate-400 text-sm">Memuat...</span>
                        ) : (
                            formatRp(stats?.totalRefund || 0)
                        )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">
                        {stats?.countRefund || 0} transaksi pengembalian
                    </p>
                </div>

                {/* Pending */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top-up Menunggu</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
                            <Clock size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 font-mono flex items-center gap-2">
                        {statsLoading ? (
                            <span className="text-slate-400 text-sm">Memuat...</span>
                        ) : (
                            <>
                                <span>{stats?.pendingCount || 0}</span>
                                {Boolean(stats?.pendingCount > 0) && (
                                    <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                                        Perlu dicek
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">
                        Total {stats?.totalCount || 0} riwayat keseluruhan
                    </p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-3 shadow-xs">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari Ref ID, invoice PG, keterangan, nama, email, no HP..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-purple-500 transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-xs"
                        >
                            Cari
                        </button>
                        {(activeSearch || typeFilter !== 'ALL' || statusFilter !== 'ALL') && (
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </form>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                    {/* Tipe filter */}
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                        <span className="text-xs text-slate-400 mr-1 font-bold uppercase tracking-wider text-[10px]">Tipe:</span>
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
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                    typeFilter === item.id
                                        ? 'bg-purple-600 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="h-4 w-[1px] bg-slate-200 hidden sm:block mx-1" />

                    {/* Status filter */}
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                        <span className="text-xs text-slate-400 mr-1 font-bold uppercase tracking-wider text-[10px]">Status:</span>
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
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                    statusFilter === item.id
                                        ? 'bg-purple-600 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                {loading ? (
                    <div className="p-16 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-7 h-7 animate-spin text-purple-600" />
                        <span className="text-xs text-slate-500 font-semibold">Memuat data transaksi saldo...</span>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="p-16 text-center">
                        <Wallet className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-700 font-bold text-sm">Tidak ada transaksi ditemukan</p>
                        <p className="text-slate-400 text-xs mt-1">Coba sesuaikan kata kunci pencarian atau ubah filter.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
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
                            <tbody className="divide-y divide-slate-100">
                                {transactions.map((tx) => {
                                    const typeMeta = TYPE_CONFIG[tx.type] || { label: tx.type, color: 'bg-slate-100 text-slate-700 border-slate-200', icon: Wallet };
                                    const statusMeta = STATUS_CONFIG[tx.status] || { label: tx.status, color: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' };
                                    const TypeIcon = typeMeta.icon;
                                    const isCredit = tx.type === 'topup' || tx.type === 'refund';

                                    return (
                                        <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                                            {/* Waktu */}
                                            <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500 font-medium">
                                                {formatDate(tx.created_at)}
                                            </td>

                                            {/* User */}
                                            <td className="px-4 py-3.5">
                                                <div className="min-w-[140px] max-w-[200px]">
                                                    <p className="text-slate-900 font-bold truncate text-xs sm:text-sm">
                                                        {tx.user_profiles?.display_name || 'User'}
                                                    </p>
                                                    <p className="text-slate-400 text-xs truncate">
                                                        {tx.user_profiles?.email || '-'}
                                                    </p>
                                                </div>
                                            </td>

                                            {/* Tipe */}
                                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${typeMeta.color}`}>
                                                    <TypeIcon size={11} />
                                                    {typeMeta.label}
                                                </span>
                                            </td>

                                            {/* Nominal */}
                                            <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                                <span className={`font-black font-mono text-sm ${isCredit ? 'text-emerald-700' : 'text-rose-600'}`}>
                                                    {isCredit ? '+' : '-'}{formatRp(tx.amount || 0)}
                                                </span>
                                            </td>

                                            {/* Mutasi Saldo */}
                                            <td className="px-4 py-3.5 text-right text-xs whitespace-nowrap hidden md:table-cell">
                                                <div className="font-mono">
                                                    <span className="text-slate-400">{formatRp(tx.balance_before || 0)}</span>
                                                    <span className="mx-1 text-slate-300">→</span>
                                                    <span className="text-slate-800 font-bold">{formatRp(tx.balance_after || 0)}</span>
                                                </div>
                                            </td>

                                            {/* Ref ID */}
                                            <td className="px-4 py-3.5 hidden sm:table-cell whitespace-nowrap">
                                                {tx.reference_id ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-mono font-bold text-slate-700 max-w-[130px] truncate" title={tx.reference_id}>
                                                            {tx.reference_id}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopy(tx.reference_id, tx.id)}
                                                            className="text-slate-400 hover:text-purple-600 p-1 rounded transition-colors"
                                                            title="Salin Reference ID"
                                                        >
                                                            {copiedId === tx.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">-</span>
                                                )}
                                            </td>

                                            {/* Metode / PG */}
                                            <td className="px-4 py-3.5 text-center hidden lg:table-cell whitespace-nowrap">
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-mono font-bold uppercase">
                                                    {tx.pg_provider || (tx.reference_id?.startsWith('ADMIN') ? 'Manual Admin' : 'System')}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusMeta.color}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                                                    {statusMeta.label}
                                                </span>
                                            </td>

                                            {/* Aksi */}
                                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                                <button
                                                    onClick={() => setSelectedTx(tx)}
                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-colors inline-flex items-center justify-center border border-slate-200"
                                                    title="Lihat Detail Transaksi"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && pagination.total > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 border-t border-slate-100 bg-slate-50/50">
                        <span className="text-xs text-slate-500 font-medium">
                            Menampilkan {(page - 1) * 15 + 1}–{Math.min(page * 15, pagination.total)} dari {pagination.total} transaksi
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={14} /> Sebelumnya
                            </button>
                            <span className="text-xs text-slate-700 font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-200">
                                Halaman {page} dari {pagination.totalPages || 1}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.totalPages || 1, p + 1))}
                                disabled={page >= (pagination.totalPages || 1)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                Berikutnya <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
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

// Detail Modal Subcomponent
function DetailModal({ tx, onClose, formatDate }) {
    const isCredit = tx.type === 'topup' || tx.type === 'refund';
    const typeMeta = TYPE_CONFIG[tx.type] || { label: tx.type, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    const statusMeta = STATUS_CONFIG[tx.status] || { label: tx.status, color: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg relative z-10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Detail Transaksi Saldo</h3>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{tx.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 p-1 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4 overflow-y-auto">
                    {/* Amount & Status Banner */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nominal Transaksi</span>
                            <span className={`text-2xl font-black font-mono ${isCredit ? 'text-emerald-700' : 'text-rose-600'}`}>
                                {isCredit ? '+' : '-'}{formatRp(tx.amount || 0)}
                            </span>
                        </div>
                        <div className="text-right space-y-1">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusMeta.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                                {statusMeta.label}
                            </span>
                            <div className="block">
                                <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold border ${typeMeta.color}`}>
                                    {typeMeta.label}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Identitas Pengguna</h4>
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">Nama:</span>
                                <span className="text-slate-900 font-bold">{tx.user_profiles?.display_name || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">Email:</span>
                                <span className="text-slate-800 font-mono font-medium">{tx.user_profiles?.email || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">Nomor Telepon:</span>
                                <span className="text-slate-800 font-mono">{tx.user_profiles?.phone || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">User ID:</span>
                                <span className="text-slate-500 font-mono text-[11px] truncate max-w-[200px]" title={tx.user_id}>{tx.user_id}</span>
                            </div>
                        </div>
                    </div>

                    {/* Balance Info */}
                    <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mutasi Saldo</h4>
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">Saldo Sebelum:</span>
                                <span className="text-slate-700 font-mono font-semibold">{formatRp(tx.balance_before || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">Saldo Sesudah:</span>
                                <span className="text-emerald-700 font-mono font-bold">{formatRp(tx.balance_after || 0)}</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-200 pt-2">
                                <span className="text-slate-500 font-medium">Keterangan:</span>
                                <span className="text-slate-800 font-semibold text-right max-w-[240px]">{tx.description || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">Reference ID:</span>
                                <span className="text-purple-700 font-mono font-bold select-all">{tx.reference_id || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">Waktu Dibuat:</span>
                                <span className="text-slate-700">{formatDate(tx.created_at)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Gateway Info */}
                    {(tx.pg_provider || tx.pg_invoice || tx.pg_qr_link) && (
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Informasi Payment Gateway</h4>
                            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-500 font-medium">Gateway Provider:</span>
                                    <span className="text-purple-700 font-bold uppercase">{tx.pg_provider || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 font-medium">PG Invoice:</span>
                                    <span className="text-slate-800 font-mono select-all font-semibold">{tx.pg_invoice || '-'}</span>
                                </div>
                                {tx.pg_total && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 font-medium">Total Ditagihkan:</span>
                                        <span className="text-slate-900 font-mono font-bold">{formatRp(tx.pg_total)}</span>
                                    </div>
                                )}
                                {tx.pg_expired_at && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 font-medium">Batas Waktu Bayar:</span>
                                        <span className="text-slate-700">{formatDate(tx.pg_expired_at)}</span>
                                    </div>
                                )}
                                {tx.pg_qr_link && (
                                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                                        <span className="text-slate-500 font-medium">QR Code Link:</span>
                                        <a
                                            href={tx.pg_qr_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-purple-600 hover:text-purple-800 flex items-center gap-1 font-bold"
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
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 px-5 py-2 rounded-xl text-xs font-bold transition-colors shadow-xs"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
