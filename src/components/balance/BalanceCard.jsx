/* BalanceCard — Saldo display with progress bar */
import { Wallet, PlusCircle, ShieldCheck, Sparkles } from 'lucide-react';

export default function BalanceCard({ balance, balanceLimit, onTopup }) {
    const numBalance = Number(balance || 0);
    const numLimit = Number(balanceLimit || 0);
    const usagePercent = numLimit > 0 ? Math.min(100, Math.round((numBalance / numLimit) * 100)) : 0;
    
    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-800 via-purple-700 to-indigo-900 p-5 sm:p-7 text-white shadow-xl shadow-purple-950/20 border border-purple-400/25">
            {/* Subtle, Non-Intrusive Aesthetic Watermark (Faint, Softly Faded) */}
            <div className="absolute -top-4 -right-4 pointer-events-none select-none opacity-[0.035] overflow-hidden">
                <Wallet className="w-44 h-44 sm:w-56 sm:h-56 text-white -rotate-12 transform" />
            </div>

            {/* Subtle card edge rings */}
            <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full border border-white/[0.03] pointer-events-none" />
            <div className="absolute -left-4 -top-4 w-28 h-28 rounded-full border border-white/[0.03] pointer-events-none" />

            <div className="relative z-10 flex flex-col justify-between">
                {/* Header Row: Badges with Responsive Flex */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] sm:text-xs font-semibold text-purple-100">
                        <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-200" />
                        <span>Dompet Digital Utama</span>
                    </div>

                    <div className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-300 bg-emerald-500/20 px-2.5 sm:px-3 py-1 rounded-full border border-emerald-400/25 backdrop-blur-sm">
                        <ShieldCheck className="w-3 h-3 text-emerald-300" />
                        <span>Aktif & Terlindungi</span>
                    </div>
                </div>
                
                {/* Balance Amount with Natural Typography (No monospaced wide gap) */}
                <div className="mb-4 sm:mb-5">
                    <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-purple-200 mb-0.5 font-medium">
                        <Sparkles className="w-3 h-3 text-purple-300" />
                        <span>Total Saldo Tersedia</span>
                    </div>
                    <div className="flex items-baseline gap-1 text-white drop-shadow-sm font-sans tracking-tight">
                        <span className="text-xl sm:text-2xl font-bold text-purple-200">Rp</span>
                        <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight">
                            {numBalance.toLocaleString('id-ID')}
                        </span>
                    </div>
                </div>
                
                {/* Capacity Progress Bar Box */}
                <div className="space-y-2 mb-5 bg-black/25 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/10 shadow-inner">
                    <div className="flex justify-between items-center text-[11px] sm:text-xs font-medium text-purple-100">
                        <span className="text-purple-200">Kapasitas Maksimal Akun</span>
                        <span className="font-mono font-bold text-white">
                            Rp {numLimit.toLocaleString('id-ID')}
                        </span>
                    </div>
                    <div className="h-2 sm:h-2.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
                        <div 
                            className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500 shadow-sm"
                            style={{ width: `${Math.max(2, usagePercent)}%` }}
                        />
                    </div>
                    <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-purple-200/90 pt-0.5 font-medium">
                        <span>Terpakai: {usagePercent}%</span>
                        <span>Sisa: Rp {Math.max(0, numLimit - numBalance).toLocaleString('id-ID')}</span>
                    </div>
                </div>

                {/* Action Button (Full width on mobile, auto on desktop) */}
                <div>
                    <button
                        type="button"
                        onClick={onTopup}
                        className="w-full sm:w-auto bg-white hover:bg-purple-50 active:scale-[0.99] text-purple-700 py-3 sm:py-3.5 px-5 sm:px-6 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/15 group"
                    >
                        <PlusCircle className="w-4 h-4 text-purple-600 transition-transform group-hover:rotate-90 duration-200" />
                        <span>Isi Saldo (Top Up via QRIS)</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
