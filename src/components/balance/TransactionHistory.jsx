import { useState, useEffect, useCallback } from 'react';
import { ArrowUpRight, ArrowDownLeft, CornerUpLeft, Loader2, QrCode, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api';
import { formatRp } from '../../utils/currencyUtils';

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
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
            case 'topup': return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
            case 'purchase': return <ArrowUpRight className="w-5 h-5 text-red-600" />;
            case 'refund': return <CornerUpLeft className="w-5 h-5 text-blue-600" />;
            default: return null;
        }
    };

    const getIconBg = (type) => {
        switch (type) {
            case 'topup': return 'bg-green-100';
            case 'purchase': return 'bg-red-100';
            case 'refund': return 'bg-blue-100';
            default: return 'bg-slate-100';
        }
    };

    const formatAmount = (amount, type) => {
        const prefix = type === 'purchase' ? '-' : '+';
        const color = type === 'purchase' ? 'text-slate-800' : type === 'topup' ? 'text-green-600' : 'text-blue-600';
        return <span className={`font-bold ${color}`}>{prefix} {formatRp(amount)}</span>;
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                <div>
                    <h3 className="font-bold text-slate-800">Riwayat Transaksi</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Catatan seluruh mutasi kredit dan debit saldo akun Anda</p>
                </div>
                
                <select
                    value={filter}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500 font-medium text-slate-700"
                >
                    <option value="semua">Semua Transaksi</option>
                    <option value="topup">Top Up</option>
                    <option value="purchase">Pembelian</option>
                    <option value="refund">Refund</option>
                </select>
            </div>

            <div className="p-0">
                {isLoading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                        <span className="text-xs text-slate-400">Memuat riwayat transaksi...</span>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 text-sm">
                        Tidak ada riwayat transaksi.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {transactions.map((trx) => (
                            <div key={trx.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getIconBg(trx.type)}`}>
                                        {getIcon(trx.type)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800 mb-0.5 line-clamp-1">{trx.description}</p>
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                            <span>{new Date(trx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                            {trx.status && (
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                                    trx.status === 'success' || trx.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    trx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {trx.status === 'completed' ? 'SELESAI' : trx.status.toUpperCase()}
                                                </span>
                                            )}
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
                    <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50/50">
                        <span className="text-slate-500">
                            Menampilkan {(page - 1) * 10 + 1}–{Math.min(page * 10, pagination.total)} dari {pagination.total} transaksi
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page <= 1}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium bg-white"
                            >
                                <ChevronLeft size={14} /> Sebelumnya
                            </button>
                            <span className="text-slate-700 font-semibold px-2.5 py-1 rounded-md bg-white border border-slate-200">
                                Halaman {page} dari {pagination.totalPages || 1}
                            </span>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page >= (pagination.totalPages || 1)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium bg-white"
                            >
                                Berikutnya <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
