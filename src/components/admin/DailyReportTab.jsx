import { useState, useEffect, useCallback } from 'react';
import {
    CalendarDays,
    RefreshCw,
    Loader2,
    TrendingUp,
    CheckCircle2,
    RotateCcw,
    Sparkles,
    Package,
    Wallet,
    History,
    AlertCircle,
} from 'lucide-react';
import api from '../../api';
import { formatRp } from '../../utils/currencyUtils';
import { notifyError, notifySuccess } from '../../utils/notify';

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const todayWib = () => new Date(Date.now() + WIB_OFFSET_MS).toISOString().slice(0, 10);
// Laporan harian adalah laporan hari yang sudah selesai. Saat tab dibuka
// lewat tengah malam WIB, default-nya laporan kemarin yang baru difinalkan.
const yesterdayWib = () => new Date(Date.now() + WIB_OFFSET_MS - DAY_MS).toISOString().slice(0, 10);

const formatDateLabel = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(`${dateStr}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return dateStr;

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(date);
};

const formatDateTime = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return '-';

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

const STATUS_BADGE = {
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    CANCELLED: 'bg-slate-100 text-slate-700 border-slate-200',
    FAILED: 'bg-rose-50 text-rose-700 border-rose-200',
    REFUNDED: 'bg-purple-50 text-purple-700 border-purple-200',
    REFUND_PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
    PROCESSING_LOCK: 'bg-blue-50 text-blue-700 border-blue-200',
};

const REPORT_STATUS = {
    generated: { label: 'Awal', color: 'bg-slate-100 text-slate-600 border-slate-200' },
    regenerated: { label: 'Diperbarui', color: 'bg-purple-50 text-purple-700 border-purple-200' },
};

export default function DailyReportTab() {
    const [selectedDate, setSelectedDate] = useState(yesterdayWib());
    const [report, setReport] = useState(null);
    const [history, setHistory] = useState([]);
    const [loadingReport, setLoadingReport] = useState(true);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const fetchReport = useCallback(async (date, { silent = false } = {}) => {
        if (!date) return;
        setLoadingReport(true);
        try {
            const res = await api.getDailyReport(date);
            setReport(res.data?.data || null);
            setErrorMsg('');
        } catch (err) {
            setReport(null);
            const message = err.response?.data?.error
                || 'Gagal memuat laporan harian. Pastikan migration 026_daily_reports.sql sudah dijalankan.';
            setErrorMsg(message);
            if (!silent) notifyError(message);
        } finally {
            setLoadingReport(false);
        }
    }, []);

    const fetchHistory = useCallback(async () => {
        setLoadingHistory(true);
        try {
            const res = await api.getDailyReportHistory(30);
            setHistory(res.data?.data || []);
        } catch (err) {
            console.error('Gagal memuat riwayat laporan harian:', err);
            notifyError('Gagal memuat riwayat laporan harian');
        } finally {
            setLoadingHistory(false);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        const loadInitial = async () => {
            try {
                const res = await api.getDailyReport(yesterdayWib());
                if (!cancelled) {
                    setReport(res.data?.data || null);
                    setErrorMsg('');
                }
            } catch (err) {
                if (!cancelled) {
                    setReport(null);
                    setErrorMsg(
                        err.response?.data?.error
                        || 'Gagal memuat laporan harian. Pastikan migration 026_daily_reports.sql sudah dijalankan.'
                    );
                }
                console.error('Gagal memuat laporan harian:', err);
            } finally {
                if (!cancelled) setLoadingReport(false);
            }

            try {
                const res = await api.getDailyReportHistory(30);
                if (!cancelled) setHistory(res.data?.data || []);
            } catch (err) {
                console.error('Gagal memuat riwayat laporan harian:', err);
            } finally {
                if (!cancelled) setLoadingHistory(false);
            }
        };

        loadInitial();

        return () => { cancelled = true; };
    }, []);

    const handleGenerate = async () => {
        if (!selectedDate) return;
        setGenerating(true);
        try {
            const res = await api.generateDailyReport(selectedDate);
            setReport(res.data?.data || null);
            notifySuccess(`Laporan ${formatDateLabel(selectedDate)} berhasil di-generate ulang.`);
            await fetchHistory();
        } catch (err) {
            notifyError(err.response?.data?.error || 'Gagal generate ulang laporan');
        } finally {
            setGenerating(false);
        }
    };

    const handleSelectDate = (date) => {
        if (!date) return;
        setSelectedDate(date);
        fetchReport(date);
    };

    const breakdown = report?.breakdown || {};
    const byStatus = breakdown.by_status || {};
    const byPaymentType = breakdown.by_payment_type || {};
    const topProducts = Array.isArray(breakdown.top_products) ? breakdown.top_products : [];
    const baseCost = Number(breakdown.base_cost_estimate) || 0;
    const refundedOrders = Number(breakdown.refunded_orders) || 0;
    const profit = Number(report?.total_profit) || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Laporan Harian</h2>
                    <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                        Ringkasan transaksi, omzet, dan estimasi laba per tanggal (WIB)
                    </p>
                </div>
                <button
                    onClick={() => { fetchReport(selectedDate); fetchHistory(); }}
                    disabled={loadingReport || loadingHistory}
                    className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                    <RefreshCw size={14} className={`${(loadingReport || loadingHistory) ? 'animate-spin text-purple-600' : ''}`} />
                    <span>Segarkan</span>
                </button>
            </div>

            {errorMsg && (
                <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-4 py-3 text-xs font-medium">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Date picker */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                    <div className="w-full sm:w-auto">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Tanggal Laporan (WIB)
                        </label>
                        <div className="relative">
                            <CalendarDays size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="date"
                                value={selectedDate}
                                max={todayWib()}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full sm:w-52 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-purple-500 transition-colors"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => fetchReport(selectedDate)}
                            disabled={loadingReport || !selectedDate}
                            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-xs"
                        >
                            Muat Laporan
                        </button>
                        <button
                            type="button"
                            onClick={handleGenerate}
                            disabled={generating || !selectedDate}
                            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-60 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors"
                        >
                            {generating ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                            <span>Generate Ulang</span>
                        </button>
                    </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2.5 italic">
                    Laporan dibuat otomatis setiap 00:05 WIB dan dihitung ulang pada 01:05 WIB.
                    Tanggal berjalan masih berisi data sementara; laporan tanggal lain dibuat otomatis saat pertama kali dibuka.
                </p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Omzet (Selesai)</span>
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
                            <TrendingUp size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 font-mono">
                        {loadingReport ? <span className="text-slate-400 text-sm">Memuat...</span> : formatRp(report?.revenue || 0)}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">
                        {report?.completed_orders || 0} order COMPLETED
                    </p>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimasi Laba</span>
                        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${profit >= 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                            <Sparkles size={16} />
                        </div>
                    </div>
                    <div className={`text-2xl font-black font-mono ${profit >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                        {loadingReport ? <span className="text-slate-400 text-sm">Memuat...</span> : formatRp(profit)}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">
                        Omzet − estimasi modal {formatRp(baseCost)}
                    </p>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transaksi Selesai</span>
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                            <CheckCircle2 size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 font-mono">
                        {loadingReport ? <span className="text-slate-400 text-sm">Memuat...</span> : (report?.completed_orders || 0)}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">
                        dari {report?.total_orders || 0} order masuk
                    </p>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dana Direfund</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
                            <RotateCcw size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 font-mono">
                        {loadingReport ? <span className="text-slate-400 text-sm">Memuat...</span> : formatRp(report?.refunded || 0)}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">
                        {refundedOrders} order direfund · {byStatus.CANCELLED || 0} dibatalkan
                    </p>
                </div>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center">
                            <AlertCircle size={16} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Status Order</h3>
                            <p className="text-[11px] text-slate-400">Distribusi seluruh order pada tanggal ini</p>
                        </div>
                    </div>

                    {Object.keys(byStatus).length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-4">Belum ada data order.</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(byStatus)
                                .sort((a, b) => b[1] - a[1])
                                .map(([status, count]) => (
                                    <span
                                        key={status}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${STATUS_BADGE[status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}
                                    >
                                        {status}
                                        <span className="bg-white/70 px-1.5 py-0.5 rounded-md font-mono">{count}</span>
                                    </span>
                                ))}
                        </div>
                    )}

                    <div className="mt-5 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 mb-3">
                            <Wallet size={14} className="text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Metode Pembayaran</span>
                        </div>
                        {Object.keys(byPaymentType).length === 0 ? (
                            <p className="text-xs text-slate-400 italic">Belum ada data.</p>
                        ) : (
                            <div className="space-y-2">
                                {Object.entries(byPaymentType)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([method, count]) => (
                                        <div key={method} className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-slate-700 capitalize">{method}</span>
                                            <span className="font-mono text-slate-500">{count} order</span>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center">
                            <Package size={16} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Produk Teratas</h3>
                            <p className="text-[11px] text-slate-400">Berdasarkan omzet order COMPLETED</p>
                        </div>
                    </div>

                    {topProducts.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-4">Belum ada produk terjual pada tanggal ini.</p>
                    ) : (
                        <div className="space-y-3">
                            {topProducts.map((item, index) => (
                                <div key={`${item.name}-${index}`} className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-lg bg-purple-50 text-purple-700 border border-purple-100 text-[11px] font-black flex items-center justify-center shrink-0">
                                        {index + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                                        <p className="text-[11px] text-slate-400">{item.count} transaksi</p>
                                    </div>
                                    <span className="text-xs font-bold font-mono text-slate-700 whitespace-nowrap">
                                        {formatRp(item.revenue || 0)}
                                    </span>
                                </div>
                            ))}
                            <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-100 text-xs">
                                <span className="text-slate-500 font-medium">Estimasi modal produk</span>
                                <span className="font-mono font-bold text-slate-700">{formatRp(baseCost)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* History */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <History size={16} className="text-slate-400" />
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Riwayat Laporan</h3>
                            <p className="text-[11px] text-slate-400">30 laporan terakhir — klik baris untuk membuka tanggal</p>
                        </div>
                    </div>
                    {loadingHistory && <Loader2 size={16} className="animate-spin text-purple-600" />}
                </div>

                {loadingHistory && history.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-7 h-7 animate-spin text-purple-600" />
                        <span className="text-xs text-slate-500 font-semibold">Memuat riwayat laporan...</span>
                    </div>
                ) : history.length === 0 ? (
                    <div className="p-12 text-center">
                        <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-700 font-bold text-sm">Belum ada laporan tersimpan</p>
                        <p className="text-slate-400 text-xs mt-1">Pilih tanggal lalu klik “Generate Ulang” untuk membuat laporan pertama.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                    <th className="text-left px-4 py-3.5">Tanggal</th>
                                    <th className="text-right px-4 py-3.5">Transaksi</th>
                                    <th className="text-right px-4 py-3.5">Omzet</th>
                                    <th className="text-right px-4 py-3.5">Estimasi Laba</th>
                                    <th className="text-center px-4 py-3.5 hidden sm:table-cell">Status</th>
                                    <th className="text-left px-4 py-3.5 hidden md:table-cell">Dibuat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {history.map((row) => {
                                    const isSelected = row.report_date === selectedDate;
                                    const meta = REPORT_STATUS[row.status] || REPORT_STATUS.generated;

                                    return (
                                        <tr
                                            key={row.id}
                                            onClick={() => handleSelectDate(row.report_date)}
                                            className={`cursor-pointer transition-colors ${isSelected ? 'bg-purple-50/50' : 'hover:bg-slate-50/60'}`}
                                        >
                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <CalendarDays size={14} className={isSelected ? 'text-purple-600' : 'text-slate-400'} />
                                                    <span className={`text-xs sm:text-sm ${isSelected ? 'font-bold text-purple-700' : 'font-semibold text-slate-700'}`}>
                                                        {formatDateLabel(row.report_date)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 text-right text-xs font-mono text-slate-600 whitespace-nowrap">
                                                {row.completed_orders || 0}/{row.total_orders || 0}
                                            </td>
                                            <td className="px-4 py-3.5 text-right text-xs font-mono font-bold text-slate-800 whitespace-nowrap">
                                                {formatRp(row.revenue || 0)}
                                            </td>
                                            <td className={`px-4 py-3.5 text-right text-xs font-mono font-bold whitespace-nowrap ${Number(row.total_profit) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {formatRp(row.total_profit || 0)}
                                            </td>
                                            <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                                                <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold border ${meta.color}`}>
                                                    {meta.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 hidden md:table-cell text-xs text-slate-500 whitespace-nowrap">
                                                {formatDateTime(row.generated_at)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
