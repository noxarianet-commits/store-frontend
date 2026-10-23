import { useState, useEffect, useCallback } from 'react';
import { 
    ArrowUpRight, 
    ArrowDownLeft, 
    CornerUpLeft, 
    Loader2, 
    QrCode, 
    ChevronLeft, 
    ChevronRight, 
    History, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    AlertCircle 
} from 'lucide-react';
import api from '../../api';
import { formatRp } from '../../utils/currencyUtils';

const FILTER_OPTIONS = [
    { id: 'semua', label: 'Semua' },
    { id: 'topup', label: 'Top Up' },
    { id: 'purchase', label: 'Pembelian' },
    { id: 'refund', label: 'Refund' }
];

export default function TransactionHistory({ onViewQr }) {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
    const [filter, setFilter] = useState('semua');

    const fetchHistory = useCallback(async (pageNum, filterType) => {
        try {
            setIsLoading(true);
            const params = { page: pageNum, limit: 10 };
            if (filterType !== 'semua') params.type = filterType;
            
            const res = await api.getBalanceHistory(params);
            const list = res.data?.data || res.data?.transactions || [];
            setTransactions(list);
            if (res.data?.pagination) {
                setPagination(res.data.pagination);
            } else {
                setPagination({
                    total: list.length,
                    page: pageNum,
                    limit: 10,
                    totalPages: 1
                });
            }
        } catch (error) {
            console.error('Failed to fetch history', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory(page, filter);
    }, [page, filter, fetchHistory]);

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || (pagination.totalPages && newPage > pagination.totalPages)) return;
        setPage(newPage);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'topup': return <ArrowDownLeft className="w-4 h-4 text-emerald-600" />;
            case 'purchase': return <ArrowUpRight className="w-4 h-4 text-rose-600" />;
            case 'refund': return <CornerUpLeft className="w-4 h-4 text-blue-600" />;
            default: return <History className="w-4 h-4 text-purple-600" />;
        }
    };

    const getIconBg = (type) => {
        switch (type) {
            case 'topup': return 'bg-emerald-50 border border-emerald-100';
            case 'purchase': return 'bg-rose-50 border border-rose-100';
            case 'refund': return 'bg-blue-50 border border-blue-100';
            default: return 'bg-slate-100 border border-slate-200';
        }
    };

    const formatAmount = (amount, type) => {
        const prefix = type === 'purchase' ? '-' : '+';
        const color = type === 'purchase' ? 'text-slate-800' : type === 'topup' ? 'text-emerald-600' : 'text-blue-600';
        return <span className={`font-bold font-mono text-sm sm:text-base ${color}`}>{prefix} {formatRp(amount)}</span>;
    };

    const getStatusBadge = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'success' || s === 'completed') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    SELESAI
                </span>
            );
        }
        if (s === 'pending') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                    <Clock className="w-3 h-3 text-amber-600" />
                    MENUNGGU
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                <XCircle className="w-3 h-3 text-rose-600" />
                {status?.toUpperCase() || 'GAGAL'}
            </span>
        );
    };

    return (
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-sm border border-slate-100/90 overflow-hidden">
            {/* Header + Filters */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <History className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-800">Riwayat Transaksi</h3>
                        <p className="text-xs text-slate-500">Catatan mutasi kredit dan debit saldo akun Anda</p>
                    </div>
                </div>
                
                {/* Modern Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60">
                    {FILTER_OPTIONS.map((opt) => (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleFilterChange(opt.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                filter === opt.id
                                    ? 'bg-white text-purple-700 shadow-xs'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content List */}
            <div className="p-0">
                {isLoading ? (
                    <div className="p-16 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-7 h-7 animate-spin text-purple-600" />
                        <span className="text-xs font-medium text-slate-500">Memuat riwayat transaksi...</span>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="p-14 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
                            <History className="w-7 h-7" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 mb-1">Belum Ada Transaksi</h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            Belum ada aktivitas mutasi saldo yang sesuai dengan filter yang dipilih.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100/80">
                        {transactions.map((trx) => (
                            <div 
                                key={trx.id} 
                                className="p-4 sm:p-6 hover:bg-purple-50/20 transition-all flex items-center justify-between gap-4"
                            >
                                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 shadow-xs ${getIconBg(trx.type)}`}>
                                        {getIcon(trx.type)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-slate-800 text-xs sm:text-sm mb-1 truncate">
                                            {trx.description}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                                            <span className="inline-flex items-center gap-1 text-[11px]">
                                                <Clock className="w-3 h-3 text-slate-400" />
                                                {new Date(trx.created_at).toLocaleDateString('id-ID', { 
                                                    day: 'numeric', 
                                                    month: 'short', 
                                                    year: 'numeric', 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </span>
                                            {trx.status && getStatusBadge(trx.status)}
                                            {trx.type === 'topup' && trx.status === 'pending' && (trx.pg_qr_link || trx.reference_id) && onViewQr && (
                                                <button
                                                    type="button"
                                                    onClick={() => onViewQr(trx)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors shadow-xs"
                                                >
                                                    <QrCode className="w-3 h-3" />
                                                    Lihat QRIS
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    {formatAmount(trx.amount, trx.type)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Pagination Controls ── */}
                {!isLoading && pagination.total > 0 && (
                    <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50/60">
                        <span className="text-slate-500 font-medium">
                            Menampilkan <strong className="text-slate-700 font-semibold">{(page - 1) * 10 + 1}</strong>–<strong className="text-slate-700 font-semibold">{Math.min(page * 10, pagination.total)}</strong> dari <strong className="text-slate-700 font-semibold">{pagination.total}</strong> transaksi
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page <= 1}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-white hover:text-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold bg-white shadow-xs"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" /> Sebelumnya
                            </button>
                            <span className="text-purple-700 font-bold px-3 py-1 rounded-xl bg-purple-50 border border-purple-100">
                                {page} / {pagination.totalPages || 1}
                            </span>
                            <button
                                type="button"
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page >= (pagination.totalPages || 1)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-white hover:text-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold bg-white shadow-xs"
                            >
                                Berikutnya <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
