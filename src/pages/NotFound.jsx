import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Compass, Clock } from 'lucide-react';
import { getWaUrl } from '../utils/waUtils';
import api from '../api';

const NotFound = () => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(5);
    const [settings, setSettings] = useState(null);

    // Fetch settings untuk mendapatkan nomor WA Admin terbaru
    useEffect(() => {
        let isMounted = true;
        api.get('/settings')
            .then((res) => {
                if (isMounted && res.data) setSettings(res.data);
            })
            .catch(() => {});
        return () => {
            isMounted = false;
        };
    }, []);

    // Hitungan mundur 5 detik untuk redirect otomatis ke beranda
    useEffect(() => {
        if (countdown <= 0) {
            navigate('/');
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown, navigate]);

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/');
        }
    };

    const waLink = getWaUrl(
        settings,
        'Halo Admin Noxarianet, saya ingin melaporkan bahwa halaman yang saya akses tidak ditemukan (Error 404). Mohon bantuannya.'
    );

    return (
        <div className="min-h-screen bg-[#FAF9FF] flex flex-col justify-between items-center px-4 py-6 sm:py-8 relative selection:bg-purple-500 selection:text-white font-sans overflow-x-hidden">
            {/* Top brand header */}
            <header className="w-full max-w-4xl flex items-center justify-between py-2">
                <Link to="/" className="flex items-center gap-2.5 group">
                    <img src="/logo.png" alt="Noxarianet" className="w-9 h-9 rounded-xl object-contain shadow-xs group-hover:scale-105 transition-transform" />
                    <div>
                        <span className="text-lg font-black text-slate-900 tracking-tight">
                            Noxaria<span className="text-purple-600">net</span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 block -mt-1 tracking-wider uppercase">
                            Store
                        </span>
                    </div>
                </Link>
                <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl transition-all shadow-xs"
                >
                    <MessageCircle size={14} className="text-emerald-600" />
                    <span>Hubungi Admin</span>
                </a>
            </header>

            {/* Main 404 Centerpiece */}
            <main className="my-auto flex flex-col items-center text-center max-w-lg w-full px-2 py-6">
                {/* 404 Status Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200/80 mb-3 shadow-xs">
                    <Compass size={13} className="text-purple-600" />
                    <span className="text-[10.5px] font-extrabold uppercase tracking-widest text-purple-700">
                        Error 404 • Halaman Tidak Ditemukan
                    </span>
                </div>

                {/* Big Aesthetic 404 Number */}
                <div className="relative mb-2 select-none">
                    <span className="text-[6.5rem] sm:text-[9.5rem] md:text-[11rem] font-black tracking-tighter leading-none bg-gradient-to-b from-purple-600 via-indigo-600 to-slate-400 bg-clip-text text-transparent">
                        404
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-3xl bg-white/90 border border-purple-100 shadow-xl flex items-center justify-center transform -rotate-6">
                            <Compass size={40} className="text-purple-600 animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Heading & Subheading */}
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
                    Waduh! Halamannya Tidak Ada
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-md mx-auto mb-5 font-medium">
                    Tautan yang Anda tuju mungkin sudah dipindahkan, salah ketik, atau sedang dalam perbaikan.
                </p>

                {/* Countdown Badge 5 Detik */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-50/90 border border-purple-200/80 text-purple-700 text-xs font-semibold mb-7 shadow-xs">
                    <Clock size={15} className="text-purple-600 animate-spin" />
                    <span>
                        Otomatis dialihkan ke beranda dalam{' '}
                        <strong className="font-mono text-sm text-purple-900 font-extrabold">{countdown}</strong> detik
                    </span>
                </div>

                {/* Main Action Buttons: Hubungi Admin & Kembali ke Halaman Sebelumnya */}
                <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                    <a
                        href={waLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer w-full sm:w-auto"
                    >
                        <MessageCircle size={17} />
                        <span>Hubungi Admin</span>
                    </a>

                    <button
                        type="button"
                        onClick={handleBack}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 text-xs sm:text-sm font-bold rounded-2xl shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer w-full sm:w-auto"
                    >
                        <ArrowLeft size={17} />
                        <span>Kembali ke Halaman Sebelumnya</span>
                    </button>
                </div>
            </main>

            {/* Bottom Footer */}
            <footer className="w-full text-center py-4 border-t border-slate-200/60 text-[11px] text-slate-400">
                © {new Date().getFullYear()} Noxarianet Store • Layanan Digital Terpercaya & Otomatis
            </footer>
        </div>
    );
};

export default NotFound;
