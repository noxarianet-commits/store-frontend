import { BarChart3, ShoppingBag, TrendingUp } from 'lucide-react';
import SimpleChart from '../ui/SimpleChart';

const DashboardTab = ({ orders }) => {
    const getStats = () => {
        const totalRevenue = orders.reduce((sum, order) => sum + (order.price || 0), 0);
        const totalOrders = orders.length;

        const dailyData = {};
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        last7Days.forEach(date => dailyData[date] = 0);
        orders.forEach(order => {
            const date = new Date(order.timestamp).toISOString().split('T')[0];
            if (dailyData[date] !== undefined) {
                dailyData[date] += order.price || 0;
            }
        });

        const chartData = last7Days.map(date => ({
            date: date.split('-').slice(1).join('/'),
            value: dailyData[date]
        }));

        return { totalRevenue, totalOrders, chartData };
    };

    const { totalRevenue, totalOrders, chartData } = getStats();

    return (
        <div className="space-y-8">
            <div className="bg-[#0E0E0E] border border-white/5 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-white">Statistik Penjualan</h3>
                        <p className="text-xs text-gray-500 mt-1">Grafik murni dari total pesanan masuk</p>
                    </div>
                    <BarChart3 className="text-purple-500" size={24} />
                </div>
                <SimpleChart data={chartData} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-5 sm:p-6 flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
                        <ShoppingBag size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Total Pesanan</p>
                        <h4 className="text-xl sm:text-2xl font-bold text-white">{totalOrders}</h4>
                    </div>
                </div>
                <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-5 sm:p-6 flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
                        <TrendingUp size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Gross Revenue</p>
                        <h4 className="text-xl sm:text-2xl font-bold text-white">Rp {totalRevenue.toLocaleString('id-ID')}</h4>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardTab;
