
import { DollarSign, Package, Sparkles, AlertCircle, Settings } from 'lucide-react';
import StatCard from '../ui/StatCard';

const RevenueTab = ({ orders, settings, updateSetting }) => {
    const totalRevenue = orders.reduce((sum, order) => sum + (order.price || 0), 0);
    const netProfit = totalRevenue - settings.initial_capital;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Omzet (Kotor)"
                    value={`Rp ${totalRevenue.toLocaleString('id-ID')}`}
                    icon={DollarSign}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Modal Awal"
                    value={`Rp ${Number(settings.initial_capital).toLocaleString('id-ID')}`}
                    icon={Package}
                    color="bg-red-500"
                />
                <StatCard
                    title="Laba Bersih"
                    value={`Rp ${netProfit.toLocaleString('id-ID')}`}
                    icon={Sparkles}
                    color={netProfit >= 0 ? "bg-green-500" : "bg-red-500"}
                />
            </div>

            <div className="bg-[#0E0E0E] border border-white/5 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white">Catatan Modal Awal</h3>
                        <p className="text-xs text-gray-500 mt-1">Masukkan total modal awal untuk menghitung laba bersih</p>
                    </div>
                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-400">
                        <Settings size={20} />
                    </div>
                </div>

                <div className="max-w-md">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">Update Modal Awal (Rp)</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="number"
                            defaultValue={settings.initial_capital}
                            onBlur={(e) => updateSetting('initial_capital', parseInt(e.target.value) || 0)}
                            className="w-full sm:flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500/50"
                            placeholder="Contoh: 1000000"
                        />
                        <div className="bg-purple-600/10 text-purple-400 px-6 py-4 rounded-xl text-sm font-bold border border-purple-500/20 flex items-center justify-center whitespace-nowrap">
                            Simpan Otomatis
                        </div>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-3 flex items-center gap-2 italic">
                        <AlertCircle size={12} /> Laba Bersih = Omzet - Modal Awal
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RevenueTab;
