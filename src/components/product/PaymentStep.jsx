import React, { useState, useEffect } from 'react';
import { Clock, Loader2, CheckCircle2, AlertCircle, Wifi, Info, Copy, RefreshCw, Star, Download } from 'lucide-react';
import { formatRp } from '../../utils/currencyUtils';

const ORDER_PROCESS_CONFIG = {
    auto: { label: 'Instan', color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
    h2h: { label: 'Instan', color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
    manual: { label: 'Manual', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-100' },
    smm: { label: 'SMM', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
};

function CountdownTimer({ expiredAt }) {
    const [remaining, setRemaining] = useState('');

    useEffect(() => {
        if (!expiredAt) return;
        const tick = () => {
            const diff = new Date(expiredAt) - new Date();
            if (diff <= 0) {
                setRemaining('Kadaluarsa');
                return;
            }
            const m = Math.floor(diff / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setRemaining(`${m}:${s.toString().padStart(2, '0')}`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [expiredAt]);

    if (!expiredAt) return null;
    return (
        <div className="flex items-center gap-1.5 text-yellow-600 text-xs font-semibold">
            <Clock size={13} />
            <span>Kadaluarsa dalam: <span className="font-mono font-bold">{remaining}</span></span>
        </div>
    );
}

const PaymentStep = ({
    orderStatus,
    paymentResult,
    isRefreshing,
    manualRefresh,
    downloadQR,
    copied,
    copyToClipboard,
    handleSudahBayar,
    validTexts,
    setStep,
    product,
    rating,
    setRating,
    testimonialMsg,
    setTestimonialMsg,
    isSubmitting,
    submitTestimonial,
    testimonialSubmitted
}) => {
    const statusConfig = {
        PENDING: { 
            label: 'Menunggu Pembayaran', 
            color: 'text-yellow-600', 
            bg: 'bg-yellow-50 border-yellow-100', 
            icon: (
                <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
                    <Loader2 size={16} className="text-yellow-600 animate-spin absolute" />
                    <Clock size={10} className="text-yellow-600" />
                </div>
            )
        },
        PROCESSING: { 
            label: 'Sedang Diproses', 
            color: 'text-blue-600', 
            bg: 'bg-blue-50 border-blue-100', 
            icon: (
                <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
                    <Loader2 size={16} className="text-blue-600 animate-spin absolute" />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                </div>
            )
        },
        COMPLETED: { label: 'Selesai!', color: 'text-green-600', bg: 'bg-green-50 border-green-100', icon: <CheckCircle2 size={16} className="text-green-600" /> },
        FAILED: { label: 'Gagal', color: 'text-red-600', bg: 'bg-red-50 border-red-100', icon: <AlertCircle size={16} className="text-red-600" /> },
        CANCELLED: { label: 'Dibatalkan', color: 'text-slate-500', bg: 'bg-slate-50 border-slate-100', icon: <AlertCircle size={16} className="text-slate-500" /> },
    };
    
    const effectiveStatus = orderStatus?.status === 'PROCESSING_LOCK' ? 'PROCESSING' : orderStatus?.status;
    const currentStatus = statusConfig[effectiveStatus] || statusConfig['PENDING'];

    return (
        <div>
            {/* Info Tunggu */}
            {(effectiveStatus === 'PENDING' || effectiveStatus === 'PROCESSING' || !effectiveStatus) && (
                <div className="flex items-start gap-3 bg-blue-50/80 border border-blue-100/70 rounded-xl px-4 py-3 mb-5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-blue-500/5 animate-pulse pointer-events-none" />
                    <div className="relative flex items-center justify-center shrink-0 mt-0.5 w-5 h-5">
                        <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping" />
                        <Loader2 size={16} className="text-blue-600 animate-spin relative z-10" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-blue-700 text-sm font-semibold">Mohon Ditunggu</p>
                        <p className="text-blue-600/80 text-xs mt-0.5">Pesanan akan diproses selama 1-5 menit dan detail akun akan dikirim ke Email Anda. Mohon tetap di halaman ini.</p>
                    </div>
                </div>
            )}

            {/* Status Badge */}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border mb-5 ${currentStatus.bg}`}>
                {currentStatus.icon}
                <span className={`text-sm font-semibold ${currentStatus.color}`}>{currentStatus.label}</span>
                {(effectiveStatus === 'PENDING' || effectiveStatus === 'PROCESSING') && (
                    <div className="ml-auto flex items-center gap-1.5 text-gray-500 text-xs">
                        <Wifi size={12} className="animate-pulse" /> live
                    </div>
                )}
            </div>

            {/* PENDING — tampilkan instruksi bayar */}
            {(effectiveStatus === 'PENDING' || !effectiveStatus) && paymentResult && (
                <div>
                    <div className="text-center mb-5">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Pembayaran</p>
                        <p className="text-4xl font-extrabold text-slate-900">{formatRp(paymentResult.total || paymentResult.amount)}</p>
                        {paymentResult.fee > 0 && (
                            <p className="text-xs text-slate-400 mt-1">Termasuk fee QRIS {formatRp(paymentResult.fee)}</p>
                        )}
                        <div className="flex justify-center mt-3">
                            <CountdownTimer expiredAt={orderStatus?.pg_expired_at} />
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-5 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3">
                            <button
                                onClick={manualRefresh}
                                disabled={isRefreshing}
                                className="text-slate-400 hover:text-purple-600 transition p-2 bg-slate-50 hover:bg-purple-50 rounded-full"
                                title="Refresh Status"
                            >
                                <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                            </button>
                        </div>
                        <p className="text-sm font-bold text-center text-slate-800 mb-4 flex items-center justify-center gap-2">
                            <span>Scan QR Code</span>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] uppercase tracking-wider">QRIS</span>
                        </p>
                        <div className="flex justify-center mb-4">
                            {paymentResult.qr_link ? (
                                <div className="p-3 bg-white border-2 border-dashed border-purple-200 rounded-2xl shadow-sm relative group cursor-pointer" onClick={() => downloadQR(paymentResult.qr_link)}>
                                    <img src={paymentResult.qr_link} alt="QRIS" className="w-56 h-56 object-contain" />
                                    <div className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Download size={32} className="text-white mb-2" />
                                        <span className="text-white text-sm font-bold">Simpan QR</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-56 h-56 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                                    <Loader2 size={24} className="animate-spin mb-2" />
                                    <span className="text-xs">Memuat QR...</span>
                                </div>
                            )}
                        </div>
                        {paymentResult.qr_link && (
                            <button
                                onClick={() => downloadQR(paymentResult.qr_link)}
                                className="w-full py-2.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-purple-100 mb-4"
                            >
                                <Download size={16} /> Simpan QR Code
                            </button>
                        )}
                        <p className="text-xs text-center text-slate-500 mb-3 bg-slate-50 py-2 rounded-lg">Gunakan aplikasi E-Wallet / M-Banking untuk scan.</p>
                        <button
                            onClick={handleSudahBayar}
                            className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition shadow-sm"
                        >Saya Sudah Bayar</button>
                    </div>
                </div>
            )}

            {/* PENDING tanpa paymentResult — waiting confirmation */}
            {(effectiveStatus === 'PENDING' || !effectiveStatus) && !paymentResult && (
                <div className="relative rounded-2xl overflow-hidden mb-6 border border-yellow-100">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-amber-50/40 to-orange-50" />
                    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl overflow-hidden">
                        <div className="h-full w-full bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 animate-pulse" />
                    </div>
                    <div className="relative text-center py-10 px-6">
                        <div className="relative w-24 h-24 mx-auto mb-5">
                            <div className="absolute inset-0 rounded-full border-4 border-yellow-200/40 animate-ping" style={{animationDuration:'2.2s'}} />
                            <div className="absolute inset-2 rounded-full border-4 border-amber-200/30 animate-ping" style={{animationDuration:'3s',animationDelay:'0.6s'}} />
                            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-200/60">
                                <Clock size={24} className="text-white" />
                            </div>
                        </div>
                        <h3 className="text-lg font-extrabold text-slate-800 mb-1">Menunggu Konfirmasi Pembayaran</h3>
                        <p className="text-sm text-slate-500 mb-5 px-4">Sistem sedang mendeteksi pembayaran Anda. Mohon tetap di halaman ini.</p>
                        <div className="flex items-center justify-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce" style={{animationDelay:'0ms'}} />
                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{animationDelay:'180ms'}} />
                            <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{animationDelay:'360ms'}} />
                        </div>
                    </div>
                </div>
            )}

            {/* PROCESSING — Premium Loading Experience */}
            {effectiveStatus === 'PROCESSING' && (
                <div className="relative rounded-2xl overflow-hidden mb-6 border border-indigo-200/60 shadow-lg shadow-indigo-100/40">
                    {/* Animated gradient background */}
                    <div className="absolute inset-0" style={{
                        background: 'linear-gradient(135deg, #f5f3ff 0%, #e0e7ff 25%, #f3e8ff 50%, #e0e7ff 75%, #f5f3ff 100%)',
                        backgroundSize: '400% 400%',
                        animation: 'gradientShift 6s ease infinite'
                    }} />
                    
                    {/* Floating cyan/purple processing particles */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="absolute w-2 h-2 rounded-full" style={{
                                background: ['#818cf8', '#a78bfa', '#c084fc', '#38bdf8', '#818cf8', '#6366f1', '#a78bfa', '#f472b6'][i % 8],
                                left: `${10 + i * 11}%`,
                                bottom: '-8px',
                                animation: `floatParticles ${3 + (i % 3) * 0.8}s ease-in-out infinite`,
                                animationDelay: `${i * 0.4}s`,
                                opacity: 0.6
                            }} />
                        ))}
                    </div>

                    {/* Top progress bar — animated slide */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl overflow-hidden bg-indigo-100">
                        <div className="h-full rounded-full" style={{
                            background: 'linear-gradient(90deg, #818cf8, #a78bfa, #c084fc, #a78bfa, #818cf8)',
                            backgroundSize: '200% 100%',
                            animation: 'shimmerBar 2s ease-in-out infinite',
                            width: '100%'
                        }} />
                    </div>

                    <div className="relative text-center py-12 px-6">
                        {/* Orbiting spinner */}
                        <div className="relative w-28 h-28 mx-auto mb-7">
                            {/* Outer orbit ring */}
                            <div className="absolute inset-0 rounded-full" style={{
                                border: '3px dashed rgba(129, 140, 248, 0.25)',
                                animation: 'spinSlow 8s linear infinite'
                            }} />
                            {/* Middle glow ring */}
                            <div className="absolute inset-2 rounded-full" style={{
                                border: '2px solid rgba(167, 139, 250, 0.2)',
                                animation: 'spinSlow 6s linear infinite reverse'
                            }} />
                            {/* Pulsing glow behind center */}
                            <div className="absolute inset-4 rounded-full" style={{
                                background: 'radial-gradient(circle, rgba(129, 140, 248, 0.3) 0%, transparent 70%)',
                                animation: 'pulseGlow 2s ease-in-out infinite'
                            }} />
                            {/* Center icon */}
                            <div className="absolute inset-5 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-300/50">
                                <Loader2 size={28} className="text-white animate-spin" />
                            </div>
                            {/* Orbiting dot */}
                            <div className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 shadow-md shadow-purple-300/60" style={{
                                top: '50%',
                                left: '50%',
                                transformOrigin: '-42px 0',
                                animation: 'orbitDot 3s linear infinite'
                            }} />
                        </div>

                        {/* Shimmer heading */}
                        <h3 className="text-xl font-extrabold mb-2" style={{
                            background: 'linear-gradient(90deg, #312e81, #6366f1, #a78bfa, #6366f1, #312e81)',
                            backgroundSize: '200% auto',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            animation: 'shimmerText 3s linear infinite'
                        }}>Pesanan Sedang Diproses</h3>
                        <p className="text-sm text-slate-600 font-semibold mb-6 px-2 max-w-sm mx-auto leading-relaxed">
                            Pembayaran berhasil dikonfirmasi! Pesanan Anda sedang diproses, mohon tunggu 1-5 menit. Detail pesanan akan segera dikirim ke Email & WhatsApp Anda.
                        </p>

                        {/* Info Notice Box */}
                        <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 mx-auto max-w-sm mb-6 text-left flex items-start gap-2.5">
                            <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-700 leading-relaxed font-medium">
                                <strong>Mohon jangan menutup atau merefresh halaman ini.</strong> Sistem sedang mengirimkan pesanan instan Anda secara real-time.
                            </p>
                        </div>

                        {/* Premium Progress Steps */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-indigo-100/60 p-5 mx-auto max-w-sm mb-6">
                            <div className="flex items-start justify-between gap-0">
                                {/* Step 1: Bayar — completed */}
                                <div className="flex flex-col items-center flex-1">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-md shadow-green-200/60">
                                        <CheckCircle2 size={16} className="text-white" />
                                    </div>
                                    <span className="text-[10px] text-green-600 font-bold mt-2 tracking-wide">Bayar</span>
                                </div>

                                {/* Connector 1 — completed */}
                                <div className="flex-1 max-w-[40px] mt-[18px]">
                                    <div className="h-[3px] rounded-full bg-gradient-to-r from-green-400 to-green-400" />
                                </div>

                                {/* Step 2: Verifikasi — completed */}
                                <div className="flex flex-col items-center flex-1">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-md shadow-green-200/60">
                                        <CheckCircle2 size={16} className="text-white" />
                                    </div>
                                    <span className="text-[10px] text-green-600 font-bold mt-2 tracking-wide">Verifikasi</span>
                                </div>

                                {/* Connector 2 — in-progress animated */}
                                <div className="flex-1 max-w-[40px] mt-[18px] overflow-hidden rounded-full">
                                    <div className="h-[3px] rounded-full" style={{
                                        background: 'linear-gradient(90deg, #22c55e, #818cf8, #a78bfa)',
                                        backgroundSize: '200% 100%',
                                        animation: 'shimmerBar 1.5s ease-in-out infinite'
                                    }} />
                                </div>

                                {/* Step 3: Proses — active */}
                                <div className="flex flex-col items-center flex-1">
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-full bg-indigo-400/30 animate-ping" style={{ animationDuration: '2s' }} />
                                        <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-300/60">
                                            <Loader2 size={15} className="text-white animate-spin" />
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-indigo-600 font-extrabold mt-2 tracking-wide">Proses</span>
                                </div>

                                {/* Connector 3 — pending */}
                                <div className="flex-1 max-w-[40px] mt-[18px]">
                                    <div className="h-[3px] rounded-full bg-slate-200" />
                                </div>

                                {/* Step 4: Kirim — pending */}
                                <div className="flex flex-col items-center flex-1">
                                    <div className="w-9 h-9 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center">
                                        <span className="text-sm">✉️</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-semibold mt-2 tracking-wide">Kirim</span>
                                </div>
                            </div>
                        </div>

                        {/* Pulsing dots */}
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-400" style={{ animation: 'dotPulse 1.4s ease-in-out infinite', animationDelay: '0ms' }} />
                            <div className="w-2 h-2 rounded-full bg-purple-500" style={{ animation: 'dotPulse 1.4s ease-in-out infinite', animationDelay: '200ms' }} />
                            <div className="w-2 h-2 rounded-full bg-violet-500" style={{ animation: 'dotPulse 1.4s ease-in-out infinite', animationDelay: '400ms' }} />
                        </div>
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
                            from { transform: rotate(0deg) translateX(42px); }
                            to { transform: rotate(360deg) translateX(42px); }
                        }
                        @keyframes dotPulse {
                            0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
                            40% { transform: scale(1.2); opacity: 1; }
                        }
                        @keyframes floatParticles {
                            0% { transform: translateY(120%) scale(0.8); opacity: 0; }
                            50% { opacity: 0.7; }
                            100% { transform: translateY(-20px) scale(1.2); opacity: 0; }
                        }
                    `}</style>
                </div>
            )}

            {/* COMPLETED — Celebration */}
            {effectiveStatus === 'COMPLETED' && (
                <div className="mb-6">
                    <div className="relative rounded-2xl overflow-hidden border border-emerald-200/60 shadow-lg shadow-emerald-100/30">
                        {/* Background */}
                        <div className="absolute inset-0" style={{
                            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 30%, #f0fdf4 60%, #d1fae5 100%)',
                            backgroundSize: '400% 400%',
                            animation: 'gradientShift 8s ease infinite'
                        }} />
                        
                        {/* Confetti particles */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="absolute w-2 h-2 rounded-full" style={{
                                    background: ['#34d399', '#a78bfa', '#fbbf24', '#f472b6', '#60a5fa', '#fb923c'][i],
                                    left: `${15 + i * 14}%`,
                                    top: '-8px',
                                    animation: `confettiFall ${2.5 + i * 0.4}s ease-in-out infinite`,
                                    animationDelay: `${i * 0.5}s`,
                                    opacity: 0.7
                                }} />
                            ))}
                        </div>

                        {/* Top bar */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400" />

                        <div className="relative text-center py-10 px-6">
                            {/* Success icon */}
                            <div className="relative w-24 h-24 mx-auto mb-6">
                                <div className="absolute inset-0 rounded-full bg-green-300/20 animate-ping" style={{ animationDuration: '2.5s' }} />
                                <div className="absolute inset-2 rounded-full bg-green-200/15" style={{ animation: 'pulseGlow 2s ease-in-out infinite' }} />
                                <div className="absolute inset-3 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-xl shadow-green-300/50">
                                    <CheckCircle2 size={36} className="text-white" />
                                </div>
                            </div>

                            {/* Shimmer heading */}
                            <h3 className="text-xl font-extrabold mb-2" style={{
                                background: 'linear-gradient(90deg, #065f46, #10b981, #34d399, #10b981, #065f46)',
                                backgroundSize: '200% auto',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                animation: 'shimmerText 3s linear infinite'
                            }}>Terima Kasih! 🎉</h3>
                            <p className="text-sm text-emerald-700/80 mb-6 max-w-xs mx-auto leading-relaxed">
                                Transaksi berhasil dan pesanan Anda telah diproses.
                            </p>

                            {/* Detail Pesanan */}
                            {validTexts.length > 0 && (
                                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-emerald-100/60 p-5 text-left relative overflow-hidden mx-auto max-w-sm">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-green-500 rounded-r" />
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-2">Detail Pesanan</h4>
                                    <div className="space-y-2">
                                        {validTexts.map((text, idx) => (
                                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white/80 rounded-xl border border-emerald-50 shadow-sm">
                                                <span className="font-mono text-sm text-slate-700 break-all leading-tight">{text}</span>
                                                <button
                                                    onClick={() => copyToClipboard(text)}
                                                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-300 hover:text-emerald-600 rounded-lg text-xs font-semibold text-slate-500 transition-all duration-200 hover:shadow-sm"
                                                >
                                                    {copied ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
                                                    {copied ? 'Disalin!' : 'Salin'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confetti keyframes */}
                        <style>{`
                            @keyframes confettiFall {
                                0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
                                10% { opacity: 0.8; }
                                100% { transform: translateY(400px) rotate(720deg); opacity: 0; }
                            }
                        `}</style>
                    </div>

                    <button
                        onClick={() => { setStep(1); window.location.href = '/'; }}
                        className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-md shadow-green-200/40 hover:shadow-lg hover:shadow-green-200/50 hover:-translate-y-0.5 active:translate-y-0"
                    >Kembali ke Beranda</button>
                </div>
            )}

            {/* FAILED / CANCELLED */}
            {(effectiveStatus === 'FAILED' || effectiveStatus === 'CANCELLED') && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-red-800 mb-1">Pesanan {effectiveStatus === 'FAILED' ? 'Gagal' : 'Dibatalkan'}</h3>
                    <p className="text-sm text-red-700 mb-4">{orderStatus?.error_message || 'Terjadi kesalahan atau pesanan dibatalkan/kadaluarsa.'}</p>
                    
                    {/* Hubungi Admin Button */}
                    <a
                        href={`https://wa.me/6285199605580?text=${encodeURIComponent(
                            `Halo admin, pesanan saya ${effectiveStatus === 'FAILED' ? 'Gagal' : 'Dibatalkan'}.\n\n` +
                            `Detail Pesanan:\n` +
                            `- ID Pesanan: ${orderStatus?.order_id || paymentResult?.order_id || '-'}\n` +
                            `- Invoice: ${orderStatus?.pg_invoice || '-'}\n` +
                            `- Produk: ${product?.name || orderStatus?.product_name || '-'}\n` +
                            `- Varian: ${orderStatus?.variant_name || '-'}\n` +
                            `- Alasan: ${orderStatus?.error_message || 'Tidak diketahui'}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm mb-3 text-sm"
                    >
                        Hubungi Admin via WhatsApp
                    </a>

                    <button
                        onClick={() => { setStep(1); window.location.href = '/'; }}
                        className="w-full bg-white border border-red-200 hover:bg-red-50 text-red-700 font-bold py-3.5 rounded-xl transition-colors shadow-sm text-sm"
                    >Kembali ke Beranda</button>
                </div>
            )}

        </div>
    );
};

export default PaymentStep;
