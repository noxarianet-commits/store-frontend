/* BalanceCard — Sederhana, Bersih & Langsung Bisa Top Up Saldo */
import { Wallet, PlusCircle } from 'lucide-react';
import { formatRp } from '../../utils/currencyUtils';

export default function BalanceCard({ balance, onTopup }) {
    const numBalance = Number(balance || 0);

    return (
        <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-purple-100/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200/80 shadow-xs">
                    <Wallet className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                    <span className="text-xs font-semibold text-slate-500">Saldo Noxarianet Anda</span>
                    <div className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-0.5">
                        {formatRp(numBalance)}
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={onTopup}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl sm:rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
                <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Top Up Saldo</span>
            </button>
        </div>
    );
}
