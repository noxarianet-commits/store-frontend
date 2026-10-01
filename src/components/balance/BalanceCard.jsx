/* BalanceCard — Saldo display with progress bar */
import { Wallet, Plus } from 'lucide-react';
import { formatRp } from '../../utils/currencyUtils';

export default function BalanceCard({ balance, balanceLimit, onTopup }) {
    const usagePercent = balanceLimit ? Math.min(100, (balance / balanceLimit) * 100) : 0;
    
    return (
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white shadow-xl shadow-purple-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <Wallet className="w-32 h-32 rotate-12" />
            </div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-2 text-purple-100 mb-2">
                    <Wallet className="w-5 h-5" />
                    <span className="font-medium">Saldo Akun</span>
                </div>
                
                <div className="text-3xl sm:text-4xl font-bold mb-6">
                    {formatRp(balance || 0)}
                </div>
                
                <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm text-purple-100">
                        <span>Kapasitas Saldo</span>
                        <span>{formatRp(balanceLimit || 0)}</span>
                    </div>
                    <div className="h-2 bg-purple-900/50 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-white rounded-full"
                            style={{ width: `${usagePercent}%` }}
                        />
                    </div>
                </div>

                <button
                    onClick={onTopup}
                    className="w-full sm:w-auto bg-white text-purple-600 hover:bg-purple-50 py-3 px-6 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Top Up Saldo
                </button>
            </div>
        </div>
    );
}
