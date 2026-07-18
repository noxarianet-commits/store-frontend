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
        PENDING: { label: 'Menunggu Pembayaran', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-100', icon: <Clock size={16} className="text-yellow-600" /> },
        PROCESSING: { label: 'Sedang Diproses', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', icon: <Loader2 size={16} className="text-blue-600 animate-spin" /> },
        COMPLETED: { label: 'Selesai!', color: 'text-green-600', bg: 'bg-green-50 border-green-100', icon: <CheckCircle2 size={16} className="text-green-600" /> },
        FAILED: { label: 'Gagal', color: 'text-red-600', bg: 'bg-red-50 border-red-100', icon: <AlertCircle size={16} className="text-red-600" /> },
        CANCELLED: { label: 'Dibatalkan', color: 'text-slate-500', bg: 'bg-slate-50 border-slate-100', icon: <AlertCircle size={16} className="text-slate-500" /> },
    };
    
    const currentStatus = statusConfig[orderStatus?.status] || statusConfig['PENDING'];

    return (
        <div>
            {/* Info Tunggu */}
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5">
                <Info size={18} className="text-blue-600 mt-0.5 shrink-0" />
                <div>
                    <p className="text-blue-700 text-sm font-semibold">Mohon Ditunggu</p>
                    <p className="text-blue-600/80 text-xs mt-0.5">Pesanan akan diproses selama 1-5 menit dan detail akun akan dikirim ke Email Anda. Mohon tetap di halaman ini.</p>
                </div>
            </div>

            {/* Status Badge */}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border mb-5 ${currentStatus.bg}`}>
                {currentStatus.icon}
                <span className={`text-sm font-semibold ${currentStatus.color}`}>{currentStatus.label}</span>
                {(orderStatus?.status === 'PENDING' || orderStatus?.status === 'PROCESSING') && (
                    <div className="ml-auto flex items-center gap-1.5 text-gray-500 text-xs">
                        <Wifi size={12} className="animate-pulse" /> live
                    </div>
                )}
            </div>

            {/* PENDING — tampilkan instruksi bayar */}
            {(orderStatus?.status === 'PENDING' || !orderStatus?.status) && paymentResult && (
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
            {(orderStatus?.status === 'PENDING' || !orderStatus?.status) && !paymentResult && (
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

            {/* PROCESSING */}
            {orderStatus?.status === 'PROCESSING' && (
                <div className="relative rounded-2xl overflow-hidden mb-6 border border-blue-100">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/40 to-purple-50" />
                    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl overflow-hidden">
                        <div className="h-full w-full bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-pulse" />
                    </div>
                    <div className="relative text-center py-10 px-6">
                        {/* Animated rings + icon */}
                        <div className="relative w-24 h-24 mx-auto mb-5">
                            <div className="absolute inset-0 rounded-full border-4 border-blue-200/40 animate-ping" style={{animationDuration:'2.2s'}} />
                            <div className="absolute inset-2 rounded-full border-4 border-purple-200/30 animate-ping" style={{animationDuration:'3s',animationDelay:'0.7s'}} />
                            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-200/60">
                                <Loader2 size={26} className="text-white animate-spin" />
                            </div>
                        </div>

                        <h3 className="text-lg font-extrabold text-slate-800 mb-1">Pesanan Sedang Diproses</h3>
                        <p className="text-sm text-slate-500 mb-6 px-4">Pembayaran dikonfirmasi! Detail akun akan segera dikirim ke Email Anda.</p>

                        {/* Progress Steps */}
                        <div className="flex items-start justify-center gap-0 mb-5">
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center">
                                    <CheckCircle2 size={15} className="text-green-500" />
                                </div>
                                <span className="text-[10px] text-green-600 font-semibold mt-1.5">Bayar</span>
                            </div>
                            <div className="w-10 h-0.5 bg-green-300 mt-4" />
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center">
                                    <CheckCircle2 size={15} className="text-green-500" />
                                </div>
                                <span className="text-[10px] text-green-600 font-semibold mt-1.5">Verifikasi</span>
                            </div>
                            <div className="w-10 h-0.5 bg-gradient-to-r from-green-300 to-blue-400 mt-4" />
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-blue-600 flex items-center justify-center shadow-md shadow-blue-200/50">
                                    <Loader2 size={14} className="text-white animate-spin" />
                                </div>
                                <span className="text-[10px] text-blue-600 font-bold mt-1.5">Proses</span>
                            </div>
                            <div className="w-10 h-0.5 bg-slate-200 mt-4" />
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center">
                                    <span className="text-slate-300 text-sm">✉️</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-semibold mt-1.5">Kirim Email</span>
                            </div>
                        </div>

                        {/* Bouncing dots */}
                        <div className="flex items-center justify-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{animationDelay:'0ms'}} />
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{animationDelay:'180ms'}} />
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{animationDelay:'360ms'}} />
                        </div>
                    </div>
                </div>
            )}

            {/* COMPLETED */}
            {orderStatus?.status === 'COMPLETED' && (
                <div className="mb-6">
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-green-800 mb-1">Terima Kasih!</h3>
                        <p className="text-sm text-green-700 mb-4">Transaksi berhasil dan pesanan Anda telah diproses.</p>

                        {/* Tampilkan data akun (SN/Lisensi) jika ada */}
                        {validTexts.length > 0 && (
                            <div className="mt-4 bg-white rounded-xl border border-green-100 p-4 shadow-sm text-left relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-green-400"></div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Detail Pesanan</h4>
                                <div className="space-y-2">
                                    {validTexts.map((text, idx) => (
                                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                                            <span className="font-mono text-sm text-slate-700 break-all leading-tight">{text}</span>
                                            <button
                                                onClick={() => copyToClipboard(text)}
                                                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-purple-300 hover:text-purple-600 rounded-md text-xs font-semibold text-slate-500 transition-colors"
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
                    <button
                        onClick={() => { setStep(1); window.location.href = '/'; }}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm"
                    >Kembali ke Beranda</button>
                </div>
            )}

            {/* FAILED / CANCELLED */}
            {(orderStatus?.status === 'FAILED' || orderStatus?.status === 'CANCELLED') && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-red-800 mb-1">Pesanan {orderStatus?.status === 'FAILED' ? 'Gagal' : 'Dibatalkan'}</h3>
                    <p className="text-sm text-red-700 mb-4">{orderStatus?.error_message || 'Terjadi kesalahan atau pesanan dibatalkan/kadaluarsa.'}</p>
                    <button
                        onClick={() => { setStep(1); window.location.href = '/'; }}
                        className="w-full bg-white border border-red-200 hover:bg-red-50 text-red-700 font-bold py-3.5 rounded-xl transition-colors shadow-sm"
                    >Kembali ke Beranda</button>
                </div>
            )}

        </div>
    );
};

export default PaymentStep;
