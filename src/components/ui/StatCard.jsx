import { TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 hover:border-purple-300 shadow-xs hover:shadow-md transition-all group select-none">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-slate-800`}>
                <Icon className={color.replace('bg-', 'text-')} size={22} />
            </div>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <TrendingUp size={13} />
            </div>
        </div>
        <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono tracking-tight">{value}</h3>
        </div>
    </div>
);

export default StatCard;
