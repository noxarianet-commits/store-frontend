import { useState, useEffect } from 'react';
import { Clock, Loader2, CheckCircle2, AlertCircle, Wifi, Info, Copy, RefreshCw, Download, Mail } from 'lucide-react';
import { formatRp } from '../../utils/currencyUtils';

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
        <div className="flex items-center gap-1.5 text-amber-700 text-xs font-semibold bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
            <Clock size={13} />
            <span>Kadaluarsa dalam <span className="font-mono font-bold tabular">{remaining}</span></span>
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
}) => {
    const [copiedOrderId, setCopiedOrderId] = useState(false);
    const displayOrderId = orderStatus?.order_id || paymentResult?.order_id || paymentResult?.id || paymentResult?.orderId;

    const handleCopyOrderId = (idToCopy) => {
        if (!idToCopy) return;
        if (copyToClipboard) copyToClipboard(idToCopy);
        else if (navigator.clipboard) navigator.clipboard.writeText(idToCopy);
        setCopiedOrderId(true);
        setTimeout(() => setCopiedOrderId(false), 2000);
    };

    const statusConfig = {
        PENDING: { label: 'Menunggu Pembayaran', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: <Clock size={14} className="text-amber-600" /> },
        PROCESSING: { label: 'Sedang Diproses', color: 'text-brand', bg: 'bg-brandSoft border-brandBorder', icon: <Loader2 size={14} className="text-brand animate-spin" /> },
        COMPLETED: { label: 'Selesai', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: <CheckCircle2 size={14} className="text-emerald-600" /> },
        FAILED: { label: 'Gagal', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: <AlertCircle size={14} className="text-red-600" /> },
        CANCELLED: { label: 'Dibatalkan', color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200', icon: <AlertCircle size={14} className="text-slate-500" /> },
    };
    
    const effectiveStatus = orderStatus?.status === 'PROCESSING_LOCK' ? 'PROCESSING' : orderStatus?.status;
    const currentStatus = statusConfig[effectiveStatus] || statusConfig['PENDING'];

    return (
        <div>
            {/* Status Badge — elevation via border, not halo */}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border mb-5 ${currentStatus.bg}`}>
                <span className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                    {currentStatus.icon}
                </span>
                <span className={`text-[13px] font-bold ${currentStatus.color}`}>{currentStatus.label}</span>
                {(effectiveStatus === 'PENDING' || effectiveStatus === 'PROCESSING') && (
                    <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 rounded-full px-2.5 py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> live
                    </span>
                )}
                {(effectiveStatus === 'PENDING' || effectiveStatus === 'PROCESSING') && <Wifi size={12} className="text-slate-400 ml-1 hidden sm:block" />}
            </div>

            {/* PENDING — payment instruction */}
            {(effectiveStatus === 'PENDING' || !effectiveStatus) && paymentResult && (
                <div>
                    <div className="text-center mb-5">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.08em] mb-1.5">Total Pembayaran</p>
                        <p className="text-[32px] font-extrabold text-ink tracking-[-0.02em] tabular">{formatRp(paymentResult.total || (paymentResult.amount + (paymentResult.unique_code || 0)))}</p>
                        {paymentResult.unique_code > 0 && (
                            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 max-w-sm mx-auto text-left flex gap-2.5">
                                <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-xs font-medium text-amber-800 leading-snug">Bayar <span className="font-bold">tepat hingga 3 digit terakhir</span> agar terdeteksi otomatis.</p>
                            </div>
                        )}
                        <div className="flex justify-center mt-3">
                            <CountdownTimer expiredAt={orderStatus?.pg_expired_at} />
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-5 shadow-soft relative">
                        <div className="absolute top-3 right-3">
                            <button onClick={manualRefresh} disabled={isRefreshing} className="w-8 h-8 grid place-items-center text-slate-400 hover:text-brand bg-slate-50 hover:bg-brandSoft border border-slate-200 hover:border-brandBorder rounded-full transition-colors" title="Refresh status">
                                <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
                            </button>
                        </div>

                        <p className="text-[13px] font-bold text-center text-ink mb-4 flex items-center justify-center gap-2">
                            Scan QR Code <span className="px-2 py-0.5 bg-brandSoft text-brand border border-brandBorder rounded-full text-[10px] font-bold tracking-wide">QRIS</span>
                        </p>
                        {(() => {
                            const qrImageSrc = paymentResult.qr_link || (paymentResult.qr_string ? `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(paymentResult.qr_string)}` : null);
                            return (
                                <>
                                    <div className="flex justify-center mb-4">
                                        {qrImageSrc ? (
                                            <div className="p-3 bg-white border border-dashed border-slate-300 rounded-2xl shadow-sm relative group cursor-pointer" onClick={() => downloadQR(qrImageSrc)}>
                                                <img src={qrImageSrc} alt="QRIS" className="w-56 h-56 object-contain rounded-xl" onError={(e) => { if (paymentResult.qr_string && !e.target.src.includes('qrserver.com')) e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(paymentResult.qr_string)}`; }} />
                                                <div className="absolute inset-3 bg-ink/60 rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Download size={22} className="text-white mb-1.5" />
                                                    <span className="text-white text-xs font-bold">Simpan QR</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-56 h-56 bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                                                <Loader2 size={22} className="animate-spin mb-2" />
                                                <span className="text-xs font-medium">Memuat QR...</span>
                                            </div>
                                        )}
                                    </div>
                                    {qrImageSrc && (
                                        <button onClick={() => downloadQR(qrImageSrc)} className="w-full h-11 bg-white border border-slate-200 hover:border-brandBorder hover:bg-brandSoft text-ink hover:text-brand rounded-xl font-semibold text-[13px] transition-colors flex items-center justify-center gap-2 mb-4">
                                            <Download size={16} /> Simpan QR Code
                                        </button>
                                    )}
                                </>
                            );
                        })()}

                        {displayOrderId && (
                            <div className="mb-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Order ID</span>
                                    <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-full border border-slate-200 shadow-sm">
                                        <span className="font-mono text-xs font-bold text-ink tracking-wide tabular">{displayOrderId}</span>
                                        <button type="button" onClick={() => handleCopyOrderId(displayOrderId)} className="w-6 h-6 grid place-items-center text-slate-400 hover:text-brand hover:bg-brandSoft rounded-full transition-colors" title="Salin Order ID">
                                            {copiedOrderId ? <CheckCircle2 size={13} className="text-emerald-600" /> : <Copy size={13} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-2.5 mt-3">
                                    <Info size={13} className="text-amber-600 shrink-0 mt-0.5" />
                                    <p className="text-[11px] font-medium leading-relaxed">Simpan Order ID — butuh saat ada kendala dengan pesanan.</p>
                                </div>
                            </div>
                        )}
                        <p className="text-xs text-center text-slate-500 mb-3 bg-slate-50 border border-slate-100 rounded-xl py-2.5">Gunakan e-wallet / m-banking untuk scan.</p>
                        <button onClick={handleSudahBayar} className="w-full h-12 bg-brand hover:bg-brandDark text-white rounded-xl font-bold text-[13px] transition-colors shadow-sm">Saya Sudah Bayar</button>
                    </div>
                </div>
            )}

            {/* PENDING tanpa paymentResult — waiting */}
            {(effectiveStatus === 'PENDING' || !effectiveStatus) && !paymentResult && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-8 text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-amber-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Clock size={20} className="text-amber-600" />
                    </div>
                    <h3 className="text-[15px] font-extrabold text-ink mb-1">Menunggu konfirmasi pembayaran</h3>
                    <p className="text-[13px] text-slate-600 mb-4 max-w-[36ch] mx-auto">Sistem mendeteksi pembayaran Anda. Mohon tetap di halaman ini.</p>
                    <div className="flex items-center justify-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{animationDelay:'0ms'}} />
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{animationDelay:'150ms'}} />
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{animationDelay:'300ms'}} />
                    </div>
                </div>
            )}

            {/* PROCESSING — refined, solid heading, global keyframes */}
            {effectiveStatus === 'PROCESSING' && (
                <div className="rounded-2xl border border-brandBorder bg-white shadow-soft overflow-hidden mb-6">
                    <div className="h-1.5 bg-brand w-full" />
                    <div className="text-center py-8 px-6">
                        <div className="relative w-20 h-20 mx-auto mb-5">
                            <div className="absolute inset-0 rounded-full border-2 border-brand/10 animate-pulse" />
                            <div className="absolute inset-2 rounded-full bg-brandSoft border border-brandBorder flex items-center justify-center">
                                <Loader2 size={24} className="text-brand animate-spin" />
                            </div>
                        </div>
                        {/* Solid heading, not gradient — craft floor */}
                        <h3 className="text-[16px] font-extrabold text-ink tracking-[-0.02em] mb-2">Pesanan sedang diproses</h3>
                        <p className="text-[13px] text-slate-600 leading-relaxed mb-5 max-w-[38ch] mx-auto">
                            Pembayaran terkonfirmasi. Pesanan diproses 1–5 menit. Detail akan dikirim ke email & WhatsApp.
                        </p>
                        <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 mx-auto max-w-sm mb-5 text-left flex items-start gap-2.5">
                            <Info size={14} className="text-sky-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-sky-800 leading-relaxed font-medium">Jangan tutup atau refresh halaman ini.</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mx-auto max-w-sm">
                            <div className="flex items-center justify-between gap-1">
                                {[
                                    { label: 'Bayar', done: true },
                                    { label: 'Verifikasi', done: true },
                                    { label: 'Proses', active: true },
                                    { label: 'Kirim', done: false },
                                ].map((s, i) => (
                                    <div key={s.label} className="flex items-center gap-1 flex-1 justify-center">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${s.done ? 'bg-emerald-500 border-emerald-500 text-white' : s.active ? 'bg-brand border-brand text-white animate-pulse' : 'bg-white border-slate-200 text-slate-400'}`}>
                                                {s.done ? <CheckCircle2 size={14} /> : s.active ? <Loader2 size={13} className="animate-spin" /> : <Mail size={12} />}
                                            </div>
                                            <span className={`text-[10px] font-bold mt-1.5 ${s.done ? 'text-emerald-700' : s.active ? 'text-brand' : 'text-slate-400'}`}>{s.label}</span>
                                        </div>
                                        {i < 3 && <div className={`flex-1 h-0.5 mx-1 rounded-full ${s.done ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* COMPLETED — solid heading, confetti via global keyframes */}
            {effectiveStatus === 'COMPLETED' && (
                <div className="mb-6">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 overflow-hidden">
                        <div className="h-1.5 bg-emerald-500 w-full" />
                        <div className="text-center py-8 px-6">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <CheckCircle2 size={28} className="text-white" />
                            </div>
                            <h3 className="text-[16px] font-extrabold text-ink tracking-[-0.02em] mb-1.5">Terima kasih — pesanan selesai</h3>
                            <p className="text-[13px] text-slate-600 mb-5 max-w-[32ch] mx-auto">Transaksi berhasil dan pesanan telah diproses.</p>
                            {validTexts.length > 0 && (
                                <div className="bg-white border border-emerald-100 rounded-2xl p-4 text-left mx-auto max-w-sm">
                                    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em] mb-3">Detail Pesanan</h4>
                                    <div className="space-y-2">
                                        {validTexts.map((text, idx) => (
                                            <div key={idx} className="flex items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                                <span className="font-mono text-[13px] text-ink break-all leading-tight tabular">{text}</span>
                                                <button onClick={() => copyToClipboard(text)} className="shrink-0 w-8 h-8 grid place-items-center bg-white border border-slate-200 hover:border-emerald-300 hover:text-emerald-600 rounded-full text-slate-500 transition-colors">
                                                    {copied ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Copy size={13} />}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <button onClick={() => { setStep(1); window.location.href = '/'; }} className="w-full mt-4 h-12 bg-ink hover:bg-black text-white font-bold rounded-xl transition-colors text-[13px]">Kembali ke Beranda</button>
                </div>
            )}

            {/* FAILED / CANCELLED */}
            {(effectiveStatus === 'FAILED' || effectiveStatus === 'CANCELLED') && (
                <div className="bg-white border border-red-200 rounded-2xl p-6 text-center mb-6 shadow-soft">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                        <AlertCircle size={22} />
                    </div>
                    <h3 className="text-[15px] font-extrabold text-ink mb-1">Pesanan {effectiveStatus === 'FAILED' ? 'gagal' : 'dibatalkan'}</h3>
                    <p className="text-[13px] text-slate-600 mb-4 leading-relaxed">{orderStatus?.error_message || 'Terjadi kesalahan atau pesanan dibatalkan/kadaluarsa.'}</p>
                    <a href={`https://wa.me/6285199605580?text=${encodeURIComponent(`Halo admin, pesanan saya ${effectiveStatus === 'FAILED' ? 'Gagal' : 'Dibatalkan'}.\n\nDetail Pesanan:\n- ID Pesanan: ${orderStatus?.order_id || paymentResult?.order_id || '-'}\n- Invoice: ${orderStatus?.pg_invoice || '-'}\n- Produk: ${product?.name || orderStatus?.product_name || '-'}\n- Varian: ${orderStatus?.variant_name || '-'}\n- Alasan: ${orderStatus?.error_message || 'Tidak diketahui'}`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full h-12 bg-[#1d9e48] hover:bg-[#15803d] text-white font-bold rounded-xl transition-colors text-[13px] mb-3">Hubungi Admin via WhatsApp</a>
                    <button onClick={() => { setStep(1); window.location.href = '/'; }} className="w-full h-11 bg-white border border-slate-200 hover:bg-slate-50 text-ink font-bold rounded-xl transition-colors text-[13px]">Kembali ke Beranda</button>
                </div>
            )}
        </div>
    );
};

export default PaymentStep;
