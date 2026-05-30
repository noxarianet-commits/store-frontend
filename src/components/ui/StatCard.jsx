
import { TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-5 sm:p-6 hover:border-purple-500/30 transition-all group">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                <Icon className={color.replace('bg-', 'text-')} size={24} />
            </div>
            <TrendingUp size={16} className="text-green-500" />
        </div>
        <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
        </div>
    </div>
);

export default StatCard;
