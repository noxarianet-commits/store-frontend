import { useState } from 'react';
import {
    BarChart3,
    ShoppingBag,
    TrendingUp,
    CheckCircle2,
    Clock,
    XCircle,
    AlertTriangle,
    Wallet,
    ArrowUpRight,
    Copy,
    Check
} from 'lucide-react';
import SmoothAreaChart from '../ui/SmoothAreaChart';
import { formatRp } from '../../utils/currencyUtils';

const DashboardTab = ({ orders = [] }) => {
    const [period, setPeriod] = useState('7d');
    const [copiedId, setCopiedId] = useState(null);

    const handleCopyId = (id) => {
        if (!id) return;
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getStats = () => {
        if (!Array.isArray(orders) || orders.length === 0) {
            return {
                totalRevenue: 0, completedRevenue: 0, pendingRevenue: 0,
                totalOrders: 0,
                completedCount: 0, pendingCount: 0, processingCount: 0, failedCount: 0,
                chartData: [],
                recentOrders: []
            };
        }

        const completedOrders = orders.filter(o => o?.status === 'COMPLETED');
        const pendingOrders = orders.filter(o => o?.status === 'PENDING');
        const processingOrders = orders.filter(o => o?.status === 'PROCESSING' || o?.status === 'REFUND_PENDING');
        const failedOrders = orders.filter(o => ['FAILED', 'CANCELLED', 'REFUNDED'].includes(o?.status));

        const totalRevenue = orders.reduce((sum, o) => sum + (Number(o?.price) || 0), 0);
        const completedRevenue = completedOrders.reduce((sum, o) => sum + (Number(o?.price) || 0), 0);
        const pendingRevenue = pendingOrders.reduce((sum, o) => sum + (Number(o?.price) || 0), 0);

        const days = period === '30d' ? 30 : 7;
        const dailyData = {};
        const dateRange = [...Array(days)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (days - 1 - i));
            return d.toISOString().split('T')[0];
        });

        dateRange.forEach(date => dailyData[date] = 0);
        orders.forEach(order => {
            const date = new Date(order.timestamp).toISOString().split('T')[0];
            if (dailyData[date] !== undefined) {
                dailyData[date] += Number(order.price) || 0;
            }
        });

        const chartData = dateRange.map(date => {
            const d = new Date(date);
            return {
                date: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
                value: dailyData[date]
            };
        });

        // 5 most recent orders
        const recentOrders = [...orders]
            .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
            .slice(0, 5);

        return {
            totalRevenue, completedRevenue, pendingRevenue,
            totalOrders: orders.length,
            completedCount: completedOrders.length,
            pendingCount: pendingOrders.length,
            processingCount: processingOrders.length,
            failedCount: failedOrders.length,
            chartData,
            recentOrders
        };
    };

    const {
        totalRevenue, completedRevenue, pendingRevenue, totalOrders,
        completedCount, pendingCount, processingCount, failedCount,
        chartData, recentOrders
    } = getStats();

    const getStatusBadge = (status) => {
        const s = (status || '').toUpperCase();
        switch (s) {
            case 'COMPLETED':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={10} className="text-emerald-600" /> Selesai
                    </span>
                );
            case 'PROCESSING':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <Clock size={10} className="text-blue-600 animate-pulse" /> Diproses
                    </span>
                );
            case 'PENDING':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock size={10} className="text-amber-600" /> Menunggu
                    </span>
                );
            case 'FAILED':
            case 'CANCELLED':
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle size={10} className="text-rose-600" /> Batal/Gagal
                    </span>
                );
        }
    };

    return (
        <div className="space-y-5">
            {/* 4 Top KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Pendapatan Selesai */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                            Pendapatan Bersih
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/60">
                            <TrendingUp size={16} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono">
                            {formatRp(completedRevenue)}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                            <span>Total masuk dari {completedCount} transaksi</span>
                        </p>
                    </div>
                </div>

                {/* 2. Total Pesanan */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                            Total Pesanan
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100/60">
                            <ShoppingBag size={16} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono">
                            {totalOrders}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                            <span>Tingkat sukses: {totalOrders > 0 ? Math.round((completedCount / totalOrders) * 100) : 100}%</span>
                        </p>
                    </div>
                </div>

                {/* 3. Menunggu / Proses */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                            Antrean Transaksi
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/60">
                            <Clock size={16} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono">
                            {pendingCount + processingCount}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-1">
                            <span className="text-amber-700 font-semibold">{pendingCount} menunggu</span>, {processingCount} proses
                        </p>
                    </div>
                </div>

                {/* 4. Gagal / Batal */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                            Kendala / Batal
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100/60">
                            <XCircle size={16} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono">
                            {failedCount}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-1">
                            Termasuk dibatalkan &amp; direfund
                        </p>
                    </div>
                </div>
            </div>

            {/* Grafik Pendapatan */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                            Grafik Arus Pendapatan
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            {period === '30d' ? 'Statistik akumulasi 30 hari terakhir' : 'Statistik akumulasi 7 hari terakhir'}
                        </p>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <BarChart3 size={18} />
                    </div>
                </div>
                <SmoothAreaChart data={chartData} period={period} onPeriodChange={setPeriod} />
            </div>

            {/* 5 Pesanan Terkini (Live Recent Orders Preview) */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                            Pesanan Terkini
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            5 transaksi terbaru yang masuk ke sistem
                        </p>
                    </div>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-full">
                        Live Data
                    </span>
                </div>

                {recentOrders.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                        Belum ada pesanan terbaru tercatat.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                    <th className="py-2.5 px-3">ID Pesanan</th>
                                    <th className="py-2.5 px-3">Produk / Layanan</th>
                                    <th className="py-2.5 px-3">Nominal</th>
                                    <th className="py-2.5 px-3">Waktu</th>
                                    <th className="py-2.5 px-3 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                {recentOrders.map((ord) => (
                                    <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="py-3 px-3">
                                            <div className="flex items-center gap-1.5 font-mono text-[11px]">
                                                <span className="font-semibold text-slate-800">{ord.id}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopyId(ord.id)}
                                                    className="text-slate-400 hover:text-purple-600 transition-colors cursor-pointer"
                                                    title="Salin ID"
                                                >
                                                    {copiedId === ord.id ? (
                                                        <Check size={12} className="text-emerald-600" />
                                                    ) : (
                                                        <Copy size={12} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="py-3 px-3">
                                            <div className="font-bold text-slate-900 leading-snug">
                                                {ord.product || ord.product_name || 'Produk'}
                                            </div>
                                            {ord.variant && (
                                                <div className="text-[10px] text-slate-500">{ord.variant}</div>
                                            )}
                                        </td>
                                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                                            {formatRp(ord.price || 0)}
                                        </td>
                                        <td className="py-3 px-3 text-[11px] text-slate-500">
                                            {ord.timestamp
                                                ? new Date(ord.timestamp).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                                : '-'}
                                        </td>
                                        <td className="py-3 px-3 text-right">
                                            {getStatusBadge(ord.status)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardTab;
