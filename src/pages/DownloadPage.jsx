import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Download,
    RefreshCw,
    ShieldCheck,
    Smartphone,
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
        <div className="min-h-screen w-full font-sans text-slate-800 bg-grid-pattern">
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-purple-100/60 shadow-sm">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
                    <Link to="/" className="flex items-center gap-2.5 min-w-0">
                        <img src="/logo.png" alt="Noxarianet" className="w-9 h-9 rounded-lg object-contain shrink-0" />
                        <span className="text-xl font-bold tracking-tight text-slate-900 truncate">
                            Noxaria<span className="text-purple-600">net</span>
                        </span>
                    </Link>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-purple-600 border border-slate-200 hover:border-purple-200 bg-white px-3.5 py-2 rounded-xl transition-colors shrink-0"
                    >
                        <ArrowLeft size={14} /> Kembali ke Toko
                    </Link>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-12 md:py-16">
                <section className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 lg:gap-14 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-full px-3.5 py-1.5 mb-5">
                            <Smartphone size={14} className="text-purple-600" />
                            <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-purple-700">
                                Aplikasi Android
                            </span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-[-0.035em] text-slate-950 leading-[1.08] mb-5">
                            Noxarianet Store
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-violet-500 to-pink-500">
                                di genggamanmu.
                            </span>
                        </h1>

                        <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-xl mb-8">
                            Top up, bayar tagihan, cek pesanan, dan hubungi CS lebih cepat lewat aplikasi resmi
                            Noxarianet. Unduh APK terbaru langsung dari halaman ini.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3">
                            {downloadUrl ? (
                                <a
                                    href={downloadUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3.5 rounded-xl text-sm font-bold transition-colors shadow-md shadow-purple-500/20"
                                >
                                    <Download size={18} /> Download APK
                                </a>
                            ) : (
                                <button
                                    type="button"
                                    disabled
                                    className="inline-flex items-center justify-center gap-2 bg-slate-200 text-slate-500 px-6 py-3.5 rounded-xl text-sm font-bold cursor-not-allowed"
                                >
                                    <Download size={18} /> {loading ? 'Memuat link…' : 'Link belum tersedia'}
                                </button>
                            )}
                            <Link
                                to="/cs"
                                className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-purple-200 text-slate-700 hover:text-purple-600 px-6 py-3.5 rounded-xl text-sm font-bold transition-colors"
                            >
                                Hubungi CS
                            </Link>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-6 text-[11px] font-semibold text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                                <ShieldCheck size={14} className="text-emerald-500" /> APK resmi Noxarianet
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <CheckCircle2 size={14} className="text-emerald-500" /> Gratis
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <Smartphone size={14} className="text-purple-500" /> Khusus Android
                            </span>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-br from-purple-200/50 via-violet-100/40 to-pink-100/50 rounded-[2rem] blur-2xl" aria-hidden="true" />
                        <div className="relative bg-white border border-purple-100 rounded-3xl p-6 shadow-[0_18px_50px_-18px_rgba(124,58,237,0.25)]">
                            <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
                                <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center overflow-hidden">
                                    <img src="/logo.png" alt="" className="w-8 h-8 object-contain" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-extrabold text-slate-900 leading-tight">Noxarianet</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Android App</p>
                                </div>
                            </div>

                            {loading ? (
                                <div className="py-5 space-y-3 animate-pulse">
                                    <div className="h-3 w-24 bg-slate-100 rounded" />
                                    <div className="h-9 bg-slate-100 rounded-xl" />
                                    <div className="h-3 w-32 bg-slate-100 rounded" />
                                    <div className="h-9 bg-slate-100 rounded-xl" />
                                    <div className="h-11 bg-slate-100 rounded-xl mt-4" />
                                </div>
                            ) : error ? (
                                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                                    <p className="text-xs font-bold text-amber-800 flex items-center gap-2">
                                        <AlertTriangle size={15} /> {error}
                                    </p>
                                    <p className="text-[11px] text-amber-700 mt-1.5">
                                        Coba muat ulang, atau hubungi CS untuk mendapatkan link APK terbaru.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={loadConfig}
                                        disabled={loading}
                                        className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                                    >
                                        <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Coba lagi
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="py-4 space-y-3">
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-[11px] font-semibold text-slate-500">Versi terbaru</span>
                                            <span className="font-mono text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
                                                {latestVersion}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-[11px] font-semibold text-slate-500">Minimum didukung</span>
                                            <span className="font-mono text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
                                                {minVersion}
                                            </span>
                                        </div>
                                    </div>

                                    {downloadUrl ? (
                                        <a
                                            href={downloadUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-full inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl text-sm font-bold transition-colors"
                                        >
                                            <Download size={17} /> Download APK {latestVersion}
                                        </a>
                                    ) : (
                                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[11px] text-amber-800 leading-relaxed">
                                            Link unduhan belum diatur admin. Silakan hubungi CS untuk mendapatkan APK terbaru.
                                        </div>
                                    )}

                                    {releaseNotes ? (
                                        <div className="mt-4 pt-4 border-t border-slate-100">
                                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">
                                                Catatan rilis
                                            </p>
                                            <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line">
                                                {releaseNotes}
                                            </p>
                                        </div>
                                    ) : null}
                                </>
                            )}
                        </div>
                    </div>
                </section>

                <section className="mt-16">
                    <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-xl font-extrabold text-slate-900">Cara memasang aplikasi</h2>
                        <span className="h-px flex-1 bg-slate-200" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {INSTALL_STEPS.map((step, index) => (
                            <div key={step.title} className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm">
                                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-extrabold mb-4">
                                    {index + 1}
                                </div>
                                <h3 className="text-sm font-extrabold text-slate-900 mb-1.5">{step.title}</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm">
                        <h3 className="text-sm font-extrabold text-slate-900 mb-1.5">Sudah punya aplikasi?</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Unduh APK terbaru lalu instal di atas aplikasi lama. Data akun dan riwayat pesanan
                            tetap tersimpan. Jika muncul pesan “versi sudah kadaluarsa”, ikuti tombol update
                            untuk membuka halaman ini.
                        </p>
                    </div>
                    <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm">
                        <h3 className="text-sm font-extrabold text-slate-900 mb-1.5">Butuh bantuan?</h3>
                        <p className="text-xs text-slate-500 leading-relaxed mb-3">
                            Jika instalasi gagal atau link unduhan tidak berfungsi, hubungi CS agar dibantu
                            mendapatkan APK yang benar.
                        </p>
                        <Link to="/cs" className="text-xs font-bold text-purple-600 hover:text-purple-700">
                            Buka halaman bantuan →
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="border-t border-purple-100 bg-white/80 backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
                    <span>© {new Date().getFullYear()} Noxarianet Store</span>
                    <div className="flex items-center gap-4">
                        <Link to="/" className="hover:text-purple-600 transition">Beranda</Link>
                        <Link to="/faq" className="hover:text-purple-600 transition">FAQ</Link>
                        <Link to="/cs" className="hover:text-purple-600 transition">Bantuan CS</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default DownloadPage;
