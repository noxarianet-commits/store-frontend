import { useSearchParams, Link } from 'react-router-dom';
import { AlertOctagon, RefreshCw, ServerCrash, ZapOff, Home, HelpCircle } from 'lucide-react';

const ErrorPage = () => {
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type') || 'unknown';

    let icon = <ServerCrash size={36} className="text-rose-500" />;
    let badge = 'Server Error';
    let title = 'Oops! Terjadi Kesalahan';
    let message = 'Sistem sedang mengalami gangguan sementara. Silakan coba beberapa saat lagi.';

    if (type === 'ratelimit') {
        icon = <ZapOff size={36} className="text-amber-500" />;
        badge = 'Rate Limit';
        title = 'Terlalu Banyak Permintaan';
        message = 'Anda telah melakukan terlalu banyak aksi dalam waktu singkat. Mohon tunggu beberapa detik sebelum mencoba kembali.';
    } else if (type === 'network') {
        icon = <AlertOctagon size={36} className="text-orange-500" />;
        badge = 'Koneksi Terputus';
        title = 'Gagal Terhubung ke Server';
        message = 'Pastikan koneksi internet Anda stabil atau server mungkin sedang dalam proses penyegaran.';
    } else if (type === 'server') {
        icon = <ServerCrash size={36} className="text-rose-500" />;
        badge = 'Maintenance';
        title = 'Server Sedang Dalam Pemeliharaan';
        message = 'Sedang terjadi pemeliharaan rutin pada sistem kami. Tim teknis sedang menyelesaikannya secepat mungkin.';
    }

    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-[#FAF9FF] flex flex-col justify-between items-center px-4 py-6 sm:py-8 selection:bg-purple-500 selection:text-white font-sans overflow-x-hidden">
            {/* Top brand header */}
            <header className="w-full max-w-4xl flex items-center justify-between py-2">
                <Link to="/" className="flex items-center gap-2.5">
                    <img src="/logo.png" alt="Noxarianet" className="w-9 h-9 rounded-xl object-contain shadow-xs" />
                    <div>
                        <span className="text-lg font-black text-slate-900 tracking-tight">
                            Noxaria<span className="text-purple-600">net</span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 block -mt-1 tracking-wider uppercase">
                            Store
                        </span>
                    </div>
                </Link>
                <Link
                    to="/cs"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-purple-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition-all shadow-xs"
                >
                    <HelpCircle size={14} className="text-purple-600" />
                    <span>Hubungi CS</span>
                </Link>
            </header>

            {/* Error Card */}
            <main className="my-auto w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 text-center shadow-xl shadow-slate-200/60">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4 shadow-xs">
                    {icon}
                </div>

                <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                    {badge}
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
                    {title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6 font-medium">
                    {message}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={handleRetry}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer"
                    >
                        <RefreshCw size={15} />
                        <span>Muat Ulang Halaman</span>
                    </button>
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all"
                    >
                        <Home size={15} />
                        <span>Beranda</span>
                    </Link>
                </div>
            </main>

            <footer className="w-full text-center py-4 border-t border-slate-200/60 text-[11px] text-slate-400">
                © {new Date().getFullYear()} Noxarianet Store • Seluruh Hak Cipta Dilindungi
            </footer>
        </div>
    );
};

export default ErrorPage;
