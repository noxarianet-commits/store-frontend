import { useState } from 'react';
import { BarChart3, ShoppingBag, TrendingUp, CheckCircle2, Clock, XCircle, AlertTriangle, Wallet } from 'lucide-react';
import SmoothAreaChart from '../ui/SmoothAreaChart';

const DashboardTab = ({ orders = [] }) => {
    const [period, setPeriod] = useState('7d');

    const getStats = () => {
        if (!Array.isArray(orders) || orders.length === 0) {
            return {
                totalRevenue: 0, completedRevenue: 0, pendingRevenue: 0,
                totalOrders: 0,
                completedCount: 0, pendingCount: 0, processingCount: 0, failedCount: 0,
                chartData: []
            };
        }

        const completedOrders = orders.filter(o => o?.status === 'COMPLETED');
        const pendingOrders = orders.filter(o => o?.status === 'PENDING');
        const processingOrders = orders.filter(o => o?.status === 'PROCESSING');
        const failedOrders = orders.filter(o => o?.status === 'FAILED' || o?.status === 'CANCELLED');

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

        return {
            totalRevenue, completedRevenue, pendingRevenue,
            totalOrders: orders.length,
            completedCount: completedOrders.length,
            pendingCount: pendingOrders.length,
            processingCount: processingOrders.length,
            failedCount: failedOrders.length,
            chartData
        };
    };

    const {
        totalRevenue, completedRevenue, pendingRevenue, totalOrders,
        completedCount, pendingCount, processingCount, failedCount,
        chartData
    } = getStats();

    return (
        <div className="space-y-3 sm:space-y-5">
            {/* Grafik Pendapatan */}
            <div className="bg-[#0E0E0E] border border-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between mb-3 sm:mb-5">
                    <div>
                        <h3 className="text-sm sm:text-lg font-bold text-white">Grafik Pendapatan</h3>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                            {period === '30d' ? '30 hari terakhir' : '7 hari terakhir'}
                        </p>
                    </div>
                    <BarChart3 className="text-purple-500 hidden sm:block" size={22} />
                </div>
                <SmoothAreaChart data={chartData} period={period} onPeriodChange={setPeriod} />
            </div>

            {/* Ringkasan Status Pesanan */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-4">
                <div className="bg-[#0E0E0E] border border-white/5 rounded-xl p-3 sm:p-4 hover:border-green-500/30 transition-all">
                    <div className="w-7 h-7 sm:w-9 sm:h-9 bg-green-500/10 rounded-lg flex items-center justify-center mb-2">
                        <CheckCircle2 size={14} className="text-green-500 sm:w-[18px] sm:h-[18px]" />
                    </div>
                    <p className="text-gray-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Selesai</p>
                    <h4 className="text-lg sm:text-2xl font-bold text-white mt-0.5">{completedCount}</h4>
                </div>
                <div className="bg-[#0E0E0E] border border-white/5 rounded-xl p-3 sm:p-4 hover:border-yellow-500/30 transition-all">
                    <div className="w-7 h-7 sm:w-9 sm:h-9 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-2">
                        <Clock size={14} className="text-yellow-500 sm:w-[18px] sm:h-[18px]" />
                    </div>
                    <p className="text-gray-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Menunggu</p>
                    <h4 className="text-lg sm:text-2xl font-bold text-white mt-0.5">{pendingCount}</h4>
                </div>
                <div className="bg-[#0E0E0E] border border-white/5 rounded-xl p-3 sm:p-4 hover:border-blue-500/30 transition-all">
                    <div className="w-7 h-7 sm:w-9 sm:h-9 bg-blue-500/10 rounded-lg flex items-center justify-center mb-2">
                        <AlertTriangle size={14} className="text-blue-500 sm:w-[18px] sm:h-[18px]" />
                    </div>
                    <p className="text-gray-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Diproses</p>
                    <h4 className="text-lg sm:text-2xl font-bold text-white mt-0.5">{processingCount}</h4>
                </div>
                <div className="bg-[#0E0E0E] border border-white/5 rounded-xl p-3 sm:p-4 hover:border-red-500/30 transition-all">
                    <div className="w-7 h-7 sm:w-9 sm:h-9 bg-red-500/10 rounded-lg flex items-center justify-center mb-2">
                        <XCircle size={14} className="text-red-500 sm:w-[18px] sm:h-[18px]" />
                    </div>
                    <p className="text-gray-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Gagal/Batal</p>
                    <h4 className="text-lg sm:text-2xl font-bold text-white mt-0.5">{failedCount}</h4>
                </div>
            </div>

            {/* Total Pesanan & Pendapatan */}
            <div className="grid grid-cols-1 gap-2.5 sm:gap-4 sm:grid-cols-3">
                <div className="bg-[#0E0E0E] border border-white/5 rounded-xl p-3.5 sm:p-5 flex items-center gap-3 hover:border-purple-500/30 transition-all">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 shrink-0">
                        <ShoppingBag size={18} className="sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-gray-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Total Pesanan</p>
                        <h4 className="text-base sm:text-xl font-bold text-white truncate">{totalOrders}</h4>
                    </div>
                </div>
                <div className="bg-[#0E0E0E] border border-white/5 rounded-xl p-3.5 sm:p-5 flex items-center gap-3 hover:border-blue-500/30 transition-all">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                        <Wallet size={18} className="sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-gray-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Total Pendapatan</p>
                        <h4 className="text-base sm:text-xl font-bold text-white truncate">Rp {totalRevenue.toLocaleString('id-ID')}</h4>
                        {pendingRevenue > 0 && (
                            <p className="text-[9px] sm:text-[10px] text-yellow-500/70 mt-0.5 truncate">Rp {pendingRevenue.toLocaleString('id-ID')} menunggu</p>
                        )}
                    </div>
                </div>
                <div className="bg-[#0E0E0E] border border-white/5 rounded-xl p-3.5 sm:p-5 flex items-center gap-3 hover:border-green-500/30 transition-all">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 shrink-0">
                        <TrendingUp size={18} className="sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-gray-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Pendapatan Selesai</p>
                        <h4 className="text-base sm:text-xl font-bold text-green-400 truncate">Rp {completedRevenue.toLocaleString('id-ID')}</h4>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardTab;
