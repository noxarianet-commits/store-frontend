import { Sparkles, ShieldCheck } from 'lucide-react';

const WelcomeMarquee = () => (
    <div className="mb-4 sm:mb-6 rounded-2xl overflow-hidden border border-purple-100 bg-gradient-to-r from-purple-50/90 via-white to-purple-50/70 p-4 sm:p-5 shadow-xs relative select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20 shrink-0">
                    <Sparkles size={20} />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                            Selamat Datang, <span className="text-purple-600">Andika Khairul .A</span>
                        </h2>
                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck size={11} className="text-emerald-600" />
                            <span>Admin Resmi</span>
                        </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                        Sistem Manajemen Operasional Noxarianet &bull; Integrasi Sekalipay &amp; OkeConnect
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="text-[11px] font-semibold text-slate-500 bg-white/90 border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-2xs">
                    Ekosistem Digital Otomatis
                </span>
            </div>
        </div>
    </div>
);

export default WelcomeMarquee;
