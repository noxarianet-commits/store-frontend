import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    CheckCircle2, AlertCircle, Loader2, Copy, Shield,
    ArrowLeft, Clock, RefreshCw, Wifi, Info
} from 'lucide-react';
import api from '../api';

// ══════════════════════════════════════════════════════════════════════════
// HELPER
// ══════════════════════════════════════════════════════════════════════════
function formatRp(num) {
    return `Rp ${Number(num).toLocaleString('id-ID')}`;
}

// ══════════════════════════════════════════════════════════════════════════
// PaymentSuccessPage
// Halaman return_url yang dikunjungi user setelah selesai di halaman PG.
// Polling status order dari Supabase via backend.
// ══════════════════════════════════════════════════════════════════════════
const PaymentSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get('order_id');

    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState('');
    const pollingRef = useRef(null);

    const copyToClipboard = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(''), 2000);
    };

    // ── Polling order status ─────────────────────────────────────────────
    useEffect(() => {
        if (!orderId) {
            setLoading(false);
            return;
        }

        const fetchStatus = async () => {
            try {
                const res = await api.get(`/payments/status/${orderId}`);
                const data = res.data?.data;
                setOrderData(data);
                setLoading(false);

                // Berhenti polling jika sudah final
                if (data?.status === 'COMPLETED' || data?.status === 'FAILED' || data?.status === 'CANCELLED') {
                    stopPolling();
                }
            } catch {
                setLoading(false);
            }
        };

        fetchStatus();
        pollingRef.current = setInterval(fetchStatus, 5000);

        return () => stopPolling();
    }, [orderId]);

    function stopPolling() {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    }

    // ── Status config ────────────────────────────────────────────────────
    const statusConfig = {
        PENDING: {
            label: 'Menunggu Konfirmasi Pembayaran',
            sub: 'Pembayaran Anda sedang diverifikasi. Harap tunggu...',
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/10 border-yellow-500/20',
            icon: <Clock size={32} className="text-yellow-400" />,
            ringColor: 'border-yellow-500/30',
        },
        PROCESSING: {
            label: 'Pembayaran Dikonfirmasi!',
            sub: 'Pesanan Anda sedang diproses secara otomatis...',
            color: 'text-blue-400',
            bg: 'bg-blue-500/10 border-blue-500/20',
            icon: <Loader2 size={32} className="text-blue-400 animate-spin" />,
            ringColor: 'border-blue-500/30',
        },
        COMPLETED: {
            label: 'Pesanan Selesai!',
            sub: 'Detail akun telah dikirim ke Email Anda.',
            color: 'text-green-400',
            bg: 'bg-green-500/10 border-green-500/20',
            icon: <CheckCircle2 size={32} className="text-green-400" />,
            ringColor: 'border-green-500/30',
        },
        FAILED: {
            label: 'Pesanan Gagal',
            sub: 'Terjadi kesalahan. Tim admin telah dinotifikasi.',
            color: 'text-red-400',
            bg: 'bg-red-500/10 border-red-500/20',
            icon: <AlertCircle size={32} className="text-red-400" />,
            ringColor: 'border-red-500/30',
        },
        CANCELLED: {
            label: 'Pesanan Dibatalkan',
            sub: 'Pesanan ini telah dibatalkan.',
            color: 'text-gray-400',
            bg: 'bg-white/5 border-white/10',
            icon: <AlertCircle size={32} className="text-gray-400" />,
            ringColor: 'border-white/20',
        },
    };

    const status = statusConfig[orderData?.status] || statusConfig['PENDING'];

    // ── No order ID ──────────────────────────────────────────────────────
    if (!orderId) {
        return (
            <div className="min-h-screen font-sans text-gray-200 flex items-center justify-center px-4">
                <div className="text-center">
                    <p className="text-white font-bold text-lg mb-2">Order ID tidak ditemukan.</p>
                    <Link to="/" className="text-purple-400 text-sm hover:underline">Kembali ke beranda</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen font-sans text-gray-200">
            {/* HEADER */}
            <nav className="sticky top-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2.5">
                        <img src="/logo.png" alt="noxarianet" className="w-9 h-9 rounded-lg object-contain" />
                        <span className="text-xl font-bold tracking-tight text-white">noxaria<span className="text-purple-400">net</span></span>
                    </Link>
                </div>
            </nav>

            <main className="max-w-lg mx-auto px-4 py-12">
                <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-gray-400 hover:text-white transition-all mb-8 text-sm font-medium">
                    <ArrowLeft size={16} /> Kembali ke Beranda
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-8"
                >
                    {loading ? (
                        <div className="text-center py-10 px-4 relative overflow-hidden bg-white/3 border border-white/5 rounded-2xl">
                            {/* Top shimmer loader line */}
                            <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden bg-white/5">
                                <div className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" style={{
                                    backgroundSize: '200% 100%',
                                    animation: 'shimmerBar 1.5s ease-in-out infinite',
                                    width: '100%'
                                }} />
                            </div>
                            
                            {/* Futuristic loading animation */}
                            <div className="relative w-16 h-16 mx-auto mb-5">
                                <div className="absolute inset-0 rounded-full border border-purple-500/20 animate-ping" />
                                <div className="absolute inset-2 rounded-full border border-purple-500/40 animate-pulse" />
                                <div className="absolute inset-3 rounded-full bg-purple-500/10 flex items-center justify-center">
                                    <Loader2 className="animate-spin text-purple-400" size={20} />
                                </div>
                            </div>
                            
                            <h3 className="text-sm font-bold text-white mb-1 animate-pulse">Menghubungkan ke Sistem...</h3>
                            <p className="text-xs text-gray-400">Mohon tunggu, sedang mengambil status transaksi terbaru.</p>
                            
                            {/* Inline keyframe styles for loading state */}
                            <style>{`
                                @keyframes shimmerBar {
                                    0% { background-position: -200% 0; }
                                    100% { background-position: 200% 0; }
                                }
                            `}</style>
                        </div>
                    ) : orderData?.status === 'PROCESSING' ? (
                        <div>
                            {/* PROCESSING — Premium Loading Experience (Dark Theme) */}
                            <div className="relative rounded-2xl overflow-hidden mb-6 border border-purple-500/20 shadow-lg shadow-purple-500/5">
                                {/* Animated dark violet gradient background */}
                                <div className="absolute inset-0" style={{
                                    background: 'linear-gradient(135deg, #090514 0%, #120924 30%, #1c0a3a 60%, #120924 100%)',
                                    backgroundSize: '400% 400%',
                                    animation: 'gradientShift 6s ease infinite'
                                }} />
                                
                                {/* Floating cyan/purple processing particles */}
                                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                    {[...Array(8)].map((_, i) => (
                                        <div key={i} className="absolute w-1.5 h-1.5 rounded-full" style={{
                                            background: ['#818cf8', '#a78bfa', '#c084fc', '#38bdf8', '#818cf8', '#6366f1', '#a78bfa', '#f472b6'][i % 8],
                                            left: `${10 + i * 11}%`,
                                            bottom: '-8px',
                                            animation: `floatParticles ${3 + (i % 3) * 0.8}s ease-in-out infinite`,
                                            animationDelay: `${i * 0.4}s`,
                                            opacity: 0.5
                                        }} />
                                    ))}
                                </div>

                                {/* Top progress bar — animated slide */}
                                <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl overflow-hidden bg-purple-950">
                                    <div className="h-full rounded-full" style={{
                                        background: 'linear-gradient(90deg, #818cf8, #a78bfa, #c084fc, #a78bfa, #818cf8)',
                                        backgroundSize: '200% 100%',
                                        animation: 'shimmerBar 2s ease-in-out infinite',
                                        width: '100%'
                                    }} />
                                </div>

                                <div className="relative text-center py-10 px-4">
                                    {/* Orbiting spinner */}
                                    <div className="relative w-24 h-24 mx-auto mb-6">
                                        {/* Outer orbit ring */}
                                        <div className="absolute inset-0 rounded-full" style={{
                                            border: '2px dashed rgba(167, 139, 250, 0.2)',
                                            animation: 'spinSlow 8s linear infinite'
                                        }} />
                                        {/* Middle glow ring */}
                                        <div className="absolute inset-2 rounded-full" style={{
                                            border: '1.5px solid rgba(167, 139, 250, 0.1)',
                                            animation: 'spinSlow 6s linear infinite reverse'
                                        }} />
                                        {/* Pulsing glow behind center */}
                                        <div className="absolute inset-4 rounded-full" style={{
                                            background: 'radial-gradient(circle, rgba(167, 139, 250, 0.2) 0%, transparent 70%)',
                                            animation: 'pulseGlow 2s ease-in-out infinite'
                                        }} />
                                        {/* Center icon */}
                                        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 flex items-center justify-center shadow-lg shadow-purple-900/50">
                                            <Loader2 size={24} className="text-white animate-spin" />
                                        </div>
                                        {/* Orbiting dot */}
                                        <div className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 shadow-md shadow-purple-500/55" style={{
                                            top: '50%',
                                            left: '50%',
                                            transformOrigin: '-36px 0',
                                            animation: 'orbitDot 3s linear infinite'
                                        }} />
                                    </div>

                                    {/* Shimmer heading */}
                                    <h3 className="text-xl font-extrabold mb-2" style={{
                                        background: 'linear-gradient(90deg, #a78bfa, #c084fc, #e9d5ff, #c084fc, #a78bfa)',
                                        backgroundSize: '200% auto',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        animation: 'shimmerText 3s linear infinite'
                                    }}>Sistem Memproses Pesanan</h3>
                                    
                                    <p className="text-xs text-purple-200/70 mb-5 px-2 max-w-xs mx-auto leading-relaxed">
                                        Pembayaran Terkonfirmasi! Detail akun sedang diproses dan dikirim ke Email & WhatsApp Anda.
                                    </p>

                                    {/* Live monitoring status */}
                                    <div className="flex items-center justify-center gap-1.5 text-purple-400/60 text-xs mb-6">
                                        <Wifi size={12} className="animate-pulse text-purple-400" />
                                        <span>Memantau status secara realtime...</span>
                                    </div>

                                    {/* Info Notice Box */}
                                    <div className="bg-purple-950/40 border border-purple-900/40 rounded-xl p-3 mx-auto max-w-xs mb-6 text-left flex items-start gap-2.5">
                                        <Info size={14} className="text-purple-400 shrink-0 mt-0.5" />
                                        <p className="text-[11px] text-purple-200/80 leading-relaxed">
                                            <strong>Jangan tutup tab ini.</strong> Halaman ini akan diperbarui secara otomatis begitu pesanan selesai dikirim oleh sistem.
                                        </p>
                                    </div>

                                    {/* Premium Progress Steps */}
                                    <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/5 p-4 mx-auto max-w-xs">
                                        <div className="flex items-start justify-between gap-0">
                                            {/* Step 1: Bayar — completed */}
                                            <div className="flex flex-col items-center flex-1">
                                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md">
                                                    <CheckCircle2 size={13} className="text-white" />
                                                </div>
                                                <span className="text-[9px] text-green-400 font-bold mt-1.5 tracking-wide">Bayar</span>
                                            </div>

                                            {/* Connector 1 — completed */}
                                            <div className="flex-1 max-w-[30px] mt-[13px]">
                                                <div className="h-[2px] rounded-full bg-green-500" />
                                            </div>

                                            {/* Step 2: Verifikasi — completed */}
                                            <div className="flex flex-col items-center flex-1">
                                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md">
                                                    <CheckCircle2 size={13} className="text-white" />
                                                </div>
                                                <span className="text-[9px] text-green-400 font-bold mt-1.5 tracking-wide">Verifikasi</span>
                                            </div>

                                            {/* Connector 2 — in-progress animated */}
                                            <div className="flex-1 max-w-[30px] mt-[13px] overflow-hidden rounded-full">
                                                <div className="h-[2px] rounded-full" style={{
                                                    background: 'linear-gradient(90deg, #22c55e, #818cf8, #a78bfa)',
                                                    backgroundSize: '200% 100%',
                                                    animation: 'shimmerBar 1.5s ease-in-out infinite'
                                                }} />
                                            </div>

                                            {/* Step 3: Proses — active */}
                                            <div className="flex flex-col items-center flex-1">
                                                <div className="relative">
                                                    <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" style={{ animationDuration: '2s' }} />
                                                    <div className="relative w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/40">
                                                        <Loader2 size={12} className="text-white animate-spin" />
                                                    </div>
                                                </div>
                                                <span className="text-[9px] text-purple-300 font-extrabold mt-1.5 tracking-wide">Proses</span>
                                            </div>

                                            {/* Connector 3 — pending */}
                                            <div className="flex-1 max-w-[30px] mt-[13px]">
                                                <div className="h-[2px] rounded-full bg-white/10" />
                                            </div>

                                            {/* Step 4: Kirim — pending */}
                                            <div className="flex flex-col items-center flex-1">
                                                <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                                    <span className="text-[10px]">✉️</span>
                                                </div>
                                                <span className="text-[9px] text-gray-500 font-semibold mt-1.5 tracking-wide">Kirim</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order info card */}
                            <div className="bg-white/3 border border-white/5 rounded-xl p-4 mb-5 space-y-2.5 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">ID Pesanan</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-mono text-white font-semibold text-xs">{orderId}</span>
                                        <button onClick={() => copyToClipboard(orderId, 'orderId')} className="text-purple-400 hover:text-purple-300 transition-colors">
                                            <Copy size={13} />
                                        </button>
                                    </div>
                                </div>
                                {orderData && (
                                    <>
                                        {orderData.pg_invoice && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">ID Transaksi</span>
                                                <span className="text-white text-xs font-mono">{orderData.pg_invoice}</span>
                                            </div>
                                        )}
                                        {orderData.pg_paid_at && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Waktu Bayar</span>
                                                <span className="text-white text-xs">{new Date(orderData.pg_paid_at).toLocaleString('id-ID')}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                                {copied === 'orderId' && (
                                    <p className="text-green-400 text-xs text-right">✓ ID disalin!</p>
                                )}
                            </div>

                            {/* Manual refresh button */}
                            <button
                                onClick={async () => {
                                    const res = await api.get(`/payments/status/${orderId}`).catch(() => null);
                                    if (res) setOrderData(res.data?.data);
                                }}
                                className="w-full flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors py-2 mb-4"
                            >
                                <RefreshCw size={12} /> Refresh manual
                            </button>

                            {/* Back button */}
                            <button
                                onClick={() => navigate('/')}
                                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl font-semibold text-white transition-colors text-sm"
                            >
                                Kembali ke Beranda
                            </button>

                            {/* Trust */}
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-5">
                                <Shield size={14} className="text-green-500" />
                                <span>Transaksi Aman & Bergaransi oleh noxarianet</span>
                            </div>

                            {/* Inline keyframes */}
                            <style>{`
                                @keyframes gradientShift {
                                    0%, 100% { background-position: 0% 50%; }
                                    50% { background-position: 100% 50%; }
                                }
                                @keyframes shimmerBar {
                                    0% { background-position: -200% 0; }
                                    100% { background-position: 200% 0; }
                                }
                                @keyframes shimmerText {
                                    0% { background-position: -200% center; }
                                    100% { background-position: 200% center; }
                                }
                                @keyframes spinSlow {
                                    from { transform: rotate(0deg); }
                                    to { transform: rotate(360deg); }
                                }
                                @keyframes pulseGlow {
                                    0%, 100% { opacity: 0.4; transform: scale(1); }
                                    50% { opacity: 0.8; transform: scale(1.1); }
                                }
                                @keyframes orbitDot {
                                    from { transform: rotate(0deg) translateX(36px); }
                                    to { transform: rotate(360deg) translateX(36px); }
                                }
                                @keyframes floatParticles {
                                    0% { transform: translateY(120%) scale(0.8); opacity: 0; }
                                    50% { opacity: 0.7; }
                                    100% { transform: translateY(-20px) scale(1.2); opacity: 0; }
                                }
                            `}</style>
                        </div>
                    ) : (
                        <div>
                            {/* Status icon & heading */}
                            <div className="text-center mb-8">
                                <div className={`w-20 h-20 rounded-full border-2 ${status.ringColor} flex items-center justify-center mx-auto mb-4`}>
                                    {status.icon}
                                </div>
                                <h1 className={`text-2xl font-extrabold ${status.color} mb-2`}>{status.label}</h1>
                                <p className="text-gray-400 text-sm">{status.sub}</p>

                                {/* Live indicator */}
                                {(orderData?.status === 'PENDING' || orderData?.status === 'PROCESSING') && (
                                    <div className="flex items-center justify-center gap-1.5 text-gray-500 text-xs mt-3">
                                        <Wifi size={12} className="animate-pulse text-purple-400" />
                                        <span>Memantau status secara realtime...</span>
                                    </div>
                                )}
                            </div>

                            {/* Order info card */}
                            <div className="bg-white/3 border border-white/5 rounded-xl p-4 mb-5 space-y-2.5 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">ID Pesanan</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-mono text-white font-semibold text-xs">{orderId}</span>
                                        <button onClick={() => copyToClipboard(orderId, 'orderId')} className="text-purple-400 hover:text-purple-300 transition-colors">
                                            <Copy size={13} />
                                        </button>
                                    </div>
                                </div>
                                {orderData && (
                                    <>
                                        {orderData.pg_invoice && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">ID Transaksi</span>
                                                <span className="text-white text-xs font-mono">{orderData.pg_invoice}</span>
                                            </div>
                                        )}
                                        {orderData.pg_paid_at && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Waktu Bayar</span>
                                                <span className="text-white text-xs">{new Date(orderData.pg_paid_at).toLocaleString('id-ID')}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                                {copied === 'orderId' && (
                                    <p className="text-green-400 text-xs text-right">✓ ID disalin!</p>
                                )}
                            </div>

                            {/* COMPLETED — tampilkan licenses */}
                            {orderData?.status === 'COMPLETED' && orderData?.account_details?.licenses?.length > 0 && (
                                <div className="mb-5">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Detail Akun / Lisensi</p>
                                    <div className="space-y-2">
                                        {orderData.account_details.licenses.map((lic, i) => (
                                            <div key={i} className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl px-4 py-3">
                                                <span className="font-mono text-white text-sm break-all">{lic}</span>
                                                <button
                                                    onClick={() => copyToClipboard(lic, `lic-${i}`)}
                                                    className="ml-2 shrink-0 text-purple-400 hover:text-purple-300 transition-colors"
                                                >
                                                    {copied === `lic-${i}` ? (
                                                        <CheckCircle2 size={15} className="text-green-400" />
                                                    ) : (
                                                        <Copy size={15} />
                                                    )}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 text-center">Detail akun juga dikirim ke Email Anda.</p>
                                </div>
                            )}

                            {/* FAILED — pesan ke admin */}
                            {(orderData?.status === 'FAILED' || orderData?.status === 'CANCELLED') && (
                                <div className="mb-5">
                                    {orderData?.error_message && (
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-xs text-red-400">
                                            Alasan: {orderData.error_message}
                                        </div>
                                    )}
                                    <a
                                        href={`https://wa.me/6285199605580?text=Halo%20admin%2C%20pesanan%20saya%20gagal.%20ID%3A%20${orderId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full bg-green-600/20 hover:bg-green-600/30 border border-green-500/20 py-3 rounded-xl font-semibold text-green-400 transition-colors text-sm text-center mb-3"
                                    >
                                        Hubungi Admin via WhatsApp
                                    </a>
                                </div>
                            )}

                            {/* Manual refresh button */}
                            {(orderData?.status === 'PENDING' || orderData?.status === 'PROCESSING') && (
                                <button
                                    onClick={async () => {
                                        const res = await api.get(`/payments/status/${orderId}`).catch(() => null);
                                        if (res) setOrderData(res.data?.data);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors py-2 mb-4"
                                >
                                    <RefreshCw size={12} /> Refresh manual
                                </button>
                            )}

                            {/* Back button */}
                            <button
                                onClick={() => navigate('/')}
                                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl font-semibold text-white transition-colors text-sm"
                            >
                                Kembali ke Beranda
                            </button>

                            {/* Trust */}
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-5">
                                <Shield size={14} className="text-green-500" />
                                <span>Transaksi Aman & Bergaransi oleh noxarianet</span>
                            </div>
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
};

export default PaymentSuccessPage;
