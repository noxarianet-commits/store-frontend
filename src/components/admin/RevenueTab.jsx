import { DollarSign, Package, Sparkles, AlertCircle, Settings } from 'lucide-react';
import StatCard from '../ui/StatCard';

const RevenueTab = ({ orders, settings, updateSetting }) => {
    const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.price) || 0), 0);
    const capital = Number(settings.initial_capital) || 0;
    const netProfit = totalRevenue - capital;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <StatCard
                    title="Omzet (Kotor)"
                    value={`Rp ${totalRevenue.toLocaleString('id-ID')}`}
                    icon={DollarSign}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Modal Awal"
                    value={`Rp ${Number(settings.initial_capital || 0).toLocaleString('id-ID')}`}
                    icon={Package}
                    color="bg-rose-500"
                />
                <StatCard
                    title="Laba Bersih"
                    value={`Rp ${netProfit.toLocaleString('id-ID')}`}
                    icon={Sparkles}
                    color={netProfit >= 0 ? "bg-emerald-500" : "bg-rose-500"}
                />
            </div>

            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900">Catatan Modal Awal</h3>
                        <p className="text-xs text-slate-500 mt-1">Masukkan total modal awal untuk menghitung estimasi laba bersih</p>
                    </div>
                    <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 border border-slate-200">
                        <Settings size={18} />
                    </div>
                </div>

                <div className="max-w-md">
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2 tracking-wider">Update Modal Awal (Rp)</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="number"
                            defaultValue={settings.initial_capital}
                            onBlur={(e) => updateSetting('initial_capital', parseInt(e.target.value) || 0)}
                            className="w-full sm:flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-purple-500 transition-colors"
                            placeholder="Contoh: 1000000"
                        />
                        <div className="bg-purple-50 text-purple-700 px-5 py-3 rounded-xl text-xs font-bold border border-purple-200 flex items-center justify-center whitespace-nowrap">
                            Simpan Otomatis
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5 italic">
                        <AlertCircle size={13} className="text-purple-500 shrink-0" />
                        <span>Rumus: Laba Bersih = Omzet - Modal Awal</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RevenueTab;
