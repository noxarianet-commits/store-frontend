import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowLeft,
    Bell,
    CheckCircle2,
    Download,
    Eye,
    EyeOff,
    Gamepad2,
    History,
    Home,
    MessageSquare,
    Plus,
    Receipt,
    RefreshCw,
    ShieldCheck,
    ShoppingBag,
    Smartphone,
    User,
    Zap,
} from 'lucide-react';
import api from '../api';

function isHttpUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return false;
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

const INSTALL_STEPS = [
    {
        title: 'Unduh file APK',
        desc: 'Tekan tombol Download APK. File akan diunduh langsung ke perangkat Android kamu.',
    },
    {
        title: 'Izinkan instalasi',
        desc: 'Saat diminta, izinkan browser atau pengelola file memasang aplikasi dari sumber ini.',
    },
    {
        title: 'Buka & masuk',
        desc: 'Instal aplikasi, lalu masuk dengan akun Noxarianet yang sama seperti di website.',
    },
];

const DownloadPage = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showBalance, setShowBalance] = useState(true);

    const loadConfig = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.getMobileConfig();
            setConfig(res.data?.data || null);
        } catch (err) {
            setError(err.response?.data?.error || 'Informasi aplikasi belum bisa dimuat.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let active = true;

        api.getMobileConfig()
            .then((res) => {
                if (!active) return;
                setConfig(res.data?.data || null);
                setError('');
            })
            .catch((err) => {
                if (!active) return;
                setError(err.response?.data?.error || 'Informasi aplikasi belum bisa dimuat.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    const latestVersion = config?.latest_version || (loading ? '…' : '—');
    const minVersion = config?.min_version || (loading ? '…' : '—');
    const downloadUrl = isHttpUrl(config?.download_url) ? config.download_url.trim() : '';
    const releaseNotes = typeof config?.release_notes === 'string' ? config.release_notes.trim() : '';

    return (
        <div className="relative min-h-screen w-full font-sans text-slate-800 bg-grid-pattern overflow-x-hidden">
            {/* Ambient Background Gradient Glows for Glassmorphism */}
            <div className="fixed top-12 left-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="fixed top-1/3 right-10 w-[30rem] h-[30rem] bg-indigo-400/15 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="fixed bottom-10 left-10 w-80 h-80 bg-pink-400/15 rounded-full blur-3xl pointer-events-none -z-10" />

            <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/60 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
                    <Link to="/" className="flex items-center gap-2.5 min-w-0 group">
                        <img src="/logo.png" alt="Noxarianet" className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-contain shrink-0 shadow-xs group-hover:scale-105 transition-transform" />
                        <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 truncate">
                            Noxaria<span className="text-purple-600">net</span>
                        </span>
                    </Link>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-purple-600 bg-white/80 hover:bg-white backdrop-blur-md border border-slate-200/80 hover:border-purple-200 px-3.5 py-2 rounded-xl shadow-xs transition-all shrink-0 hover:-translate-x-0.5"
                    >
                        <ArrowLeft size={14} /> <span className="hidden xs:inline">Kembali ke</span> Toko
                    </Link>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-14">
                <section className="grid grid-cols-1 lg:grid-cols-[1.15fr_360px] xl:grid-cols-[1.2fr_380px] gap-8 lg:gap-12 items-center">
                    {/* Left Column: Glass Card Hero Content */}
                    <div className="relative bg-white/65 backdrop-blur-xl border border-white/80 p-6 sm:p-9 md:p-10 rounded-3xl sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(124,58,237,0.06)] ring-1 ring-purple-100/50">
                        {/* Android Badge */}
                        <div className="inline-flex items-center gap-2 bg-purple-500/10 backdrop-blur-md border border-purple-300/40 rounded-full px-3.5 py-1.5 mb-5 shadow-xs">
                            <Smartphone size={13} className="text-purple-600" />
                            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.16em] text-purple-700">
                                Aplikasi Android Resmi
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>

                        {/* Heading */}
                        <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-black tracking-[-0.04em] text-slate-950 leading-[1.1] mb-4 sm:mb-5">
                            Noxarianet Store
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-violet-600 to-pink-500">
                                di genggamanmu.
                            </span>
                        </h1>

                        {/* Description */}
                        <p className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-xl mb-6 sm:mb-8 font-normal">
                            Top up game, beli pulsa & paket data, bayar tagihan PPOB, cek pesanan, dan hubungi CS
                            lebih cepat lewat aplikasi resmi Noxarianet.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            {downloadUrl ? (
                                <a
                                    href={downloadUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-7 py-3.5 rounded-2xl text-sm sm:text-base font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                                >
                                    <Download size={18} />
                                    <span>Download APK</span>
                                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-lg font-mono">v{latestVersion}</span>
                                </a>
                            ) : (
                                <button
                                    type="button"
                                    disabled
                                    className="inline-flex items-center justify-center gap-2 bg-slate-200/80 backdrop-blur-md text-slate-500 px-6 py-3.5 rounded-2xl text-sm font-bold cursor-not-allowed border border-slate-200"
                                >
                                    <Download size={18} /> {loading ? 'Memuat link…' : 'Link belum tersedia'}
                                </button>
                            )}
                            <Link
                                to="/cs"
                                className="inline-flex items-center justify-center gap-2 bg-white/80 hover:bg-white backdrop-blur-md border border-purple-100 hover:border-purple-300 text-slate-700 hover:text-purple-700 px-6 py-3.5 rounded-2xl text-sm sm:text-base font-bold shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all"
                            >
                                Hubungi CS
                            </Link>
                        </div>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-6 sm:mt-7">
                            <span className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-md border border-purple-100/80 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold text-slate-700 shadow-sm">
                                <ShieldCheck size={14} className="text-emerald-500" /> APK Resmi
                            </span>
                            <span className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-md border border-purple-100/80 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold text-slate-700 shadow-sm">
                                <CheckCircle2 size={14} className="text-emerald-500" /> 100% Gratis
                            </span>
                            <span className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-md border border-purple-100/80 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold text-slate-700 shadow-sm">
                                <Smartphone size={14} className="text-purple-500" /> Khusus Android
                            </span>
                        </div>
                    </div>

                    {/* Right Column: Animated Smartphone Mockup */}
                    <div className="relative flex flex-col items-center w-full max-w-full">
                        {/* Glow ambient background */}
                        <div className="absolute -inset-4 bg-gradient-to-br from-purple-300/40 via-violet-200/30 to-pink-200/40 rounded-[2.5rem] blur-3xl pointer-events-none" aria-hidden="true" />

                        {/* Floating Interactive Glass Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: [0, -6, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            className="hidden sm:flex absolute -top-4 -left-3 z-20 items-center gap-2 bg-white/85 backdrop-blur-xl border border-white/80 px-3.5 py-1.5 rounded-full shadow-lg shadow-purple-500/10 text-[11px] font-bold text-purple-900"
                        >
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            <span>v{latestVersion} • Terverifikasi Aman</span>
                        </motion.div>

                        {/* IPHONE MOCKUP FRAME (SEAMLESS SLIM BEZEL + TRUE DYNAMIC ISLAND) */}
                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                            className="relative w-full max-w-[275px] xs:max-w-[290px] sm:max-w-[310px] mx-auto rounded-[2.8rem] sm:rounded-[3rem] p-[5px] bg-slate-950 shadow-[0_25px_60px_-15px_rgba(79,40,150,0.38)] ring-1 ring-slate-800/80 z-10 shrink-0 select-none"
                        >
                            {/* iPhone Physical Side Buttons */}
                            <div className="absolute -left-[6px] top-20 w-[2.5px] h-5 bg-slate-700 rounded-l-[1px]" title="Action Button" />
                            <div className="absolute -left-[6px] top-28 w-[2.5px] h-9 bg-slate-700 rounded-l-[1px]" title="Volume Up" />
                            <div className="absolute -left-[6px] top-40 w-[2.5px] h-9 bg-slate-700 rounded-l-[1px]" title="Volume Down" />
                            <div className="absolute -right-[6px] top-28 w-[2.5px] h-12 bg-slate-700 rounded-r-[1px]" title="Power Button" />

                            {/* Phone Screen Display (Seamless Edge-to-Edge) */}
                            <div className="relative rounded-[2.5rem] sm:rounded-[2.7rem] overflow-hidden bg-white text-slate-800 shadow-inner flex flex-col text-left">
                                {/* App Header with Integrated Dynamic Island */}
                                <div className="bg-gradient-to-b from-[#230441] via-[#2d0955] to-[#431282] px-3 pt-2 pb-3 text-white relative">
                                    {/* True iPhone Dynamic Island (Fixed Pill Width, No Stretch) */}
                                    <div className="w-[90px] h-[22px] bg-black rounded-full mx-auto flex items-center justify-between px-2.5 shadow-sm ring-1 ring-white/10 mb-2.5 shrink-0">
                                        {/* Sensor */}
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#0a0a14]" />
                                        {/* Camera Lens with Specular Reflection */}
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#0c0c1b] border border-blue-950/70 flex items-center justify-center">
                                            <div className="w-0.5 h-0.5 rounded-full bg-cyan-400/80" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm shrink-0">
                                                <img src="/logo.png" alt="Noxarianet" className="w-4 h-4 object-contain" />
                                            </div>
                                            <span className="text-[10.5px] sm:text-[11px] font-black tracking-wider text-white">NOXARIANET</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center">
                                                <MessageSquare size={12} className="text-white" />
                                            </div>
                                            <div className="w-6 h-6 rounded-full bg-white/15 relative flex items-center justify-center">
                                                <Bell size={12} className="text-white" />
                                                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-pink-500 rounded-full ring-1 ring-purple-900" />
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-[11px] font-bold mt-2 mb-1.5 text-white">Halo, Andika</p>

                                    {/* Saldo Card */}
                                    <div className="bg-[#240748]/90 border border-purple-300/20 rounded-xl p-2.5 shadow-md">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9.5px] font-medium text-purple-200">Saldo Noxarianet</span>
                                            <div className="bg-white/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                <span className="text-[7.5px] font-extrabold tracking-wider text-emerald-300">SALDO AKTIF</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-base font-extrabold text-white tracking-tight">
                                                {showBalance ? 'Rp 1.000.000' : 'Rp ••••••••'}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setShowBalance(!showBalance)}
                                                className="text-purple-300 hover:text-white transition-colors cursor-pointer"
                                                title="Sembunyikan/Tampilkan Saldo"
                                            >
                                                {showBalance ? <Eye size={12} /> : <EyeOff size={12} />}
                                            </button>
                                        </div>
                                        <p className="text-[7.5px] text-purple-300/70 mt-0.5">Batas saldo Rp 1.000.000</p>
                                        <div className="grid grid-cols-2 gap-1.5 mt-2">
                                            <div className="bg-white text-purple-950 font-extrabold text-[8.5px] py-1.5 rounded-md flex items-center justify-center gap-1 shadow-sm">
                                                <Plus size={10} strokeWidth={3} /> Top up
                                            </div>
                                            <div className="bg-white/10 border border-white/20 text-white font-bold text-[8.5px] py-1.5 rounded-md flex items-center justify-center gap-1">
                                                <History size={10} /> Riwayat
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Body Sections */}
                                <div className="bg-[#fafafa] p-2.5 space-y-2.5">
                                    {/* Kategori Section */}
                                    <div>
                                        <p className="text-[7px] font-extrabold tracking-widest text-slate-400 uppercase">JELAJAHI</p>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[10px] font-black text-slate-800">Kategori</span>
                                            <span className="text-[8.5px] font-bold text-purple-700">Semua</span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-1 text-center">
                                            {/* Aplikasi Premium */}
                                            <div className="flex flex-col items-center">
                                                <div className="w-9 h-9 rounded-full bg-[#eef4ff] border border-blue-100 flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                                                    <svg viewBox="0 0 32 32" className="w-4.5 h-4.5" fill="none">
                                                        <path d="M7 6C7 4.89543 7.89543 4 9 4H19L25 10V26C25 27.1046 24.1046 28 23 28H9C7.89543 28 7 27.1046 7 26V6Z" fill="#3B82F6" />
                                                        <path d="M19 4V10H25L19 4Z" fill="#93C5FD" />
                                                        <rect x="5" y="14" width="22" height="9" rx="3" fill="#FBBF24" stroke="#F59E0B" strokeWidth="0.5" />
                                                        <text x="16" y="20.5" textAnchor="middle" fill="#78350F" fontSize="6.5" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.5">APK</text>
                                                    </svg>
                                                </div>
                                                <span className="text-[7.5px] font-bold text-slate-700 leading-tight mt-1">Aplikasi<br />Premium</span>
                                            </div>

                                            {/* E-Wallet */}
                                            <div className="flex flex-col items-center">
                                                <div className="w-9 h-9 rounded-full bg-[#f6f0ff] border border-purple-100 flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                                                    <svg viewBox="0 0 32 32" className="w-4.5 h-4.5" fill="none">
                                                        <rect x="5" y="8" width="22" height="16" rx="4" fill="#8B5CF6" />
                                                        <path d="M5 12H27" stroke="#C4B5FD" strokeWidth="1.5" />
                                                        <rect x="18" y="15" width="6" height="5" rx="1.5" fill="#DDD6FE" />
                                                        <circle cx="21" cy="17.5" r="1" fill="#7C3AED" />
                                                    </svg>
                                                </div>
                                                <span className="text-[7.5px] font-bold text-slate-700 leading-tight mt-1">E-Wallet</span>
                                            </div>

                                            {/* Game */}
                                            <div className="flex flex-col items-center">
                                                <div className="w-9 h-9 rounded-full bg-[#eef4ff] border border-blue-100 flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                                                    <Gamepad2 size={16} className="text-blue-500" />
                                                </div>
                                                <span className="text-[7.5px] font-bold text-slate-700 leading-tight mt-1">Game</span>
                                            </div>

                                            {/* Token PLN */}
                                            <div className="flex flex-col items-center">
                                                <div className="w-9 h-9 rounded-full bg-[#fff8ed] border border-amber-100 flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                                                    <Zap size={16} className="text-amber-500 fill-amber-500" />
                                                </div>
                                                <span className="text-[7.5px] font-bold text-slate-700 leading-tight mt-1">Token PLN</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tagihan Section */}
                                    <div>
                                        <p className="text-[7px] font-extrabold tracking-widest text-slate-400 uppercase">BAYAR TAGIHAN</p>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-black text-slate-800">Kategori tagihan</span>
                                            <span className="text-[8.5px] font-bold text-purple-700">Semua</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 overflow-hidden">
                                            <div className="inline-flex items-center gap-1 bg-[#e8f7f5] border border-[#a7f3d0] text-[#0d766e] px-2 py-0.5 rounded-full text-[8px] font-extrabold shrink-0">
                                                <Receipt size={10} /> Tagihan & PPOB
                                            </div>
                                            <div className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[8px] font-bold shrink-0 opacity-70">
                                                <Receipt size={10} /> Pascabayar
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pilihan Cepat Section */}
                                    <div>
                                        <p className="text-[7px] font-extrabold tracking-widest text-slate-400 uppercase">PALING DICARI</p>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-black text-slate-800">Pilihan cepat</span>
                                            <span className="text-[8.5px] font-bold text-purple-700">Lihat semua</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            <div className="p-1.5 rounded-lg border border-slate-100 bg-white shadow-sm flex items-center gap-1.5">
                                                <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center shrink-0">
                                                    <svg viewBox="0 0 32 32" className="w-4 h-4">
                                                        <path d="M8 22C12 22 14 16 16 11C18 6 20 8 24 16" stroke="#00E5FF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                                                        <path d="M10 22C13 22 15 17 17 13C19 9 21 11 23 16" stroke="#D946EF" strokeWidth="2" strokeLinecap="round" fill="none" />
                                                    </svg>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[8.5px] font-bold text-slate-800 truncate">Alight Motion</p>
                                                    <p className="text-[7px] text-purple-600 font-semibold">Pro</p>
                                                </div>
                                            </div>

                                            <div className="p-1.5 rounded-lg border border-slate-100 bg-white shadow-sm flex items-center gap-1.5">
                                                <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#00c4cc] to-[#7d2ae8] flex items-center justify-center shrink-0">
                                                    <span className="text-white font-serif italic text-[8px] font-bold">Canva</span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[8.5px] font-bold text-slate-800 truncate">Canva Pro</p>
                                                    <p className="text-[7px] text-purple-600 font-semibold">Premium</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Navigation Bar */}
                                <div className="bg-white border-t border-slate-100 px-3 pt-1.5 pb-1 flex items-center justify-around">
                                    <div className="flex flex-col items-center text-purple-700">
                                        <Home size={14} />
                                        <span className="text-[7px] font-extrabold mt-0.5">Beranda</span>
                                    </div>
                                    <div className="flex flex-col items-center text-slate-400">
                                        <ShoppingBag size={14} />
                                        <span className="text-[7px] font-medium mt-0.5">Katalog</span>
                                    </div>
                                    <div className="flex flex-col items-center text-slate-400">
                                        <Receipt size={14} />
                                        <span className="text-[7px] font-medium mt-0.5">Pesanan</span>
                                    </div>
                                    <div className="flex flex-col items-center text-slate-400">
                                        <User size={14} />
                                        <span className="text-[7px] font-medium mt-0.5">Akun</span>
                                    </div>
                                </div>

                                {/* iPhone Home Indicator Bar */}
                                <div className="bg-white pb-1.5 pt-0.5 flex justify-center">
                                    <div className="w-24 sm:w-28 h-1 bg-slate-300 rounded-full" />
                                </div>
                            </div>
                        </motion.div>

                        {/* COMPACT FROSTED GLASS DOWNLOAD CARD */}
                        <div className="w-full max-w-[280px] xs:max-w-[295px] sm:max-w-[310px] mt-3.5 bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-3.5 sm:p-4 shadow-[0_15px_35px_-10px_rgba(124,58,237,0.15)] ring-1 ring-purple-100/50 z-10">
                            {loading ? (
                                <div className="py-1 space-y-2.5 animate-pulse">
                                    <div className="h-3.5 w-24 bg-slate-100 rounded" />
                                    <div className="h-9 bg-slate-100 rounded-xl" />
                                </div>
                            ) : error ? (
                                <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-center">
                                    <p className="text-xs font-bold text-amber-800 flex items-center justify-center gap-1.5">
                                        <AlertTriangle size={13} /> {error}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={loadConfig}
                                        disabled={loading}
                                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-200 px-3 py-1 rounded-lg transition-colors cursor-pointer"
                                    >
                                        <RefreshCw size={11} className={loading ? 'animate-spin' : ''} /> Coba lagi
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-purple-100/60 text-xs">
                                        <span className="font-semibold text-slate-600">Versi terbaru:</span>
                                        <span className="font-mono font-bold text-purple-700 bg-purple-500/10 border border-purple-200/80 rounded-lg px-2 py-0.5">
                                            v{latestVersion}
                                        </span>
                                    </div>

                                    {downloadUrl ? (
                                        <a
                                            href={downloadUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-purple-500/25 active:scale-[0.98]"
                                        >
                                            <Download size={15} /> Download APK {latestVersion}
                                        </a>
                                    ) : (
                                        <div className="rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-[10.5px] text-amber-800 text-center font-medium">
                                            Link unduhan belum diatur admin.
                                        </div>
                                    )}

                                    {releaseNotes ? (
                                        <div className="mt-2.5 pt-2.5 border-t border-purple-100/60">
                                            <p className="text-[8.5px] font-extrabold uppercase tracking-widest text-slate-400 mb-0.5">
                                                Catatan rilis
                                            </p>
                                            <p className="text-[10px] text-slate-600 leading-relaxed whitespace-pre-line">
                                                {releaseNotes}
                                            </p>
                                        </div>
                                    ) : null}
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* SECTION: CARA MEMASANG (FROSTED GLASS CARDS) */}
                <section className="mt-14 sm:mt-16">
                    <div className="flex items-center gap-3 mb-6 sm:mb-8">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-200/60 text-purple-600">
                            <Smartphone size={16} />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Cara memasang aplikasi</h2>
                        <span className="h-px flex-1 bg-gradient-to-r from-purple-200/60 to-transparent" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                        {INSTALL_STEPS.map((step, index) => (
                            <div
                                key={step.title}
                                className="relative bg-white/65 backdrop-blur-xl border border-white/80 hover:border-purple-300/80 rounded-3xl p-6 sm:p-7 shadow-[0_10px_30px_rgba(124,58,237,0.04)] hover:shadow-[0_20px_40px_rgba(124,58,237,0.1)] hover:-translate-y-1 transition-all duration-300 ring-1 ring-purple-100/40 group"
                            >
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center text-sm font-black mb-4 shadow-md shadow-purple-500/30 group-hover:scale-110 transition-transform">
                                    {index + 1}
                                </div>
                                <h3 className="text-base font-extrabold text-slate-900 mb-2">{step.title}</h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SECTION: BANTUAN & UPDATE (FROSTED GLASS CARDS) */}
                <section className="mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-white/65 backdrop-blur-xl border border-white/80 hover:border-purple-200/80 rounded-3xl p-6 sm:p-7 shadow-[0_10px_30px_rgba(124,58,237,0.04)] ring-1 ring-purple-100/40 transition-all">
                        <h3 className="text-base font-extrabold text-slate-900 mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-500" /> Sudah punya aplikasi?
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            Unduh APK terbaru lalu pasang di atas aplikasi lama. Data akun dan riwayat transaksi
                            kamu tetap tersimpan dengan aman tanpa perlu uninstall terlebih dahulu.
                        </p>
                    </div>
                    <div className="bg-white/65 backdrop-blur-xl border border-white/80 hover:border-purple-200/80 rounded-3xl p-6 sm:p-7 shadow-[0_10px_30px_rgba(124,58,237,0.04)] ring-1 ring-purple-100/40 transition-all flex flex-col justify-between">
                        <div>
                            <h3 className="text-base font-extrabold text-slate-900 mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Butuh bantuan?
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                                Jika instalasi gagal atau file tidak dapat dibuka di perangkat kamu, CS kami siap membantu langkah pemasangan sampai berhasil.
                            </p>
                        </div>
                        <Link to="/cs" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-purple-600 hover:text-purple-700 group">
                            <span>Hubungi Bantuan CS</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="border-t border-purple-100/60 bg-white/60 backdrop-blur-xl mt-12 sm:mt-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                    <span>© {new Date().getFullYear()} Noxarianet Store. Hak Cipta Dilindungi.</span>
                    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                        <Link to="/" className="hover:text-purple-600 transition font-medium">Beranda</Link>
                        <Link to="/faq" className="hover:text-purple-600 transition font-medium">FAQ</Link>
                        <Link to="/privacy" className="hover:text-purple-600 transition font-medium">Kebijakan Privasi</Link>
                        <Link to="/cs" className="hover:text-purple-600 transition font-medium">Bantuan CS</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default DownloadPage;
