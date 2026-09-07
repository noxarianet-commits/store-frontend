import { useState, useEffect } from 'react';
import { Clock, Loader2, CheckCircle2, AlertCircle, Wifi, Copy, RefreshCw, Download } from 'lucide-react';
import { formatRp } from '../../utils/currencyUtils';

function CountdownTimer({ expiredAt }) {
    const [remaining, setRemaining] = useState('');
    useEffect(() => {
        if (!expiredAt) return undefined;
        const tick = () => {
            const diff = new Date(expiredAt) - new Date();
            if (diff <= 0) return setRemaining('Kadaluarsa');
            const m = Math.floor(diff / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setRemaining(`${m}:${s.toString().padStart(2, '0')}`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [expiredAt]);
    return expiredAt ? <div className="flex items-center justify-center gap-1.5 font-mono text-xs text-[var(--gold)]"><Clock size={13} /> Kadaluarsa dalam {remaining}</div> : null;
}

const statusConfig = {
    PENDING: { label: 'Menunggu pembayaran', color: 'text-[var(--gold)]', bg: 'bg-[#f7eedb]', icon: <Clock size={16} /> },
    PROCESSING: { label: 'Sedang diproses', color: 'text-[var(--coral-dark)]', bg: 'bg-[#fae7df]', icon: <Loader2 size={16} className="animate-spin" /> },
    COMPLETED: { label: 'Pesanan selesai', color: 'text-[var(--teal)]', bg: 'bg-[var(--teal-soft)]', icon: <CheckCircle2 size={16} /> },
    FAILED: { label: 'Pesanan gagal', color: 'text-[var(--danger)]', bg: 'bg-[#f8e3df]', icon: <AlertCircle size={16} /> },
    CANCELLED: { label: 'Pesanan dibatalkan', color: 'text-[var(--muted)]', bg: 'bg-[#eeeae2]', icon: <AlertCircle size={16} /> },
};

const PaymentStep = ({ orderStatus, paymentResult, isRefreshing, manualRefresh, downloadQR, copied, copyToClipboard, handleSudahBayar, validTexts }) => {
    const [copiedOrderId, setCopiedOrderId] = useState(false);
    const displayOrderId = orderStatus?.order_id || paymentResult?.order_id || paymentResult?.id || paymentResult?.orderId;
    const effectiveStatus = orderStatus?.status === 'PROCESSING_LOCK' ? 'PROCESSING' : orderStatus?.status;
    const currentStatus = statusConfig[effectiveStatus] || statusConfig.PENDING;

    const copyOrderId = () => {
        if (!displayOrderId) return;
        copyToClipboard(displayOrderId);
        setCopiedOrderId(true);
        setTimeout(() => setCopiedOrderId(false), 2000);
    };

    const qrImageSrc = paymentResult?.qr_link || (paymentResult?.qr_string ? `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(paymentResult.qr_string)}` : null);
    const isWaiting = effectiveStatus === 'PENDING' || effectiveStatus === 'PROCESSING' || !effectiveStatus;

    return (
        <div className="space-y-5">
            {isWaiting && (
                <div className="flex items-start gap-3 border border-[var(--line)] bg-[var(--teal-soft)] p-4 text-sm text-[var(--teal)]">
                    <Wifi size={17} className="mt-0.5 shrink-0 animate-pulse" />
                    <div><p className="font-bold">Mohon ditunggu</p><p className="mt-1 text-xs leading-relaxed">Status pesanan dipantau otomatis. Detail akan dikirim ke Email dan WhatsApp setelah proses selesai.</p></div>
                </div>
            )}

            <div className={`flex items-center gap-2 border px-4 py-3 ${currentStatus.bg} ${currentStatus.color}`}>
                {currentStatus.icon}<span className="text-sm font-bold">{currentStatus.label}</span>
                {isWaiting && <span className="ml-auto font-mono text-[10px] uppercase tracking-[.08em]">live</span>}
            </div>

            {(effectiveStatus === 'PENDING' || !effectiveStatus) && paymentResult && (
                <div>
                    <div className="mb-5 border-b border-[var(--line)] pb-5 text-center">
                        <p className="font-mono text-[10px] uppercase tracking-[.1em] text-[var(--muted)]">Total pembayaran</p>
                        <p className="mt-2 text-4xl font-extrabold text-[var(--ink)]">{formatRp(paymentResult.total || (paymentResult.amount + (paymentResult.unique_code || 0)))}</p>
                        {paymentResult.unique_code > 0 && <p className="mx-auto mt-3 max-w-sm bg-[#f7eedb] p-2 text-[11px] font-medium text-[#765514]">Bayar tepat hingga 3 digit terakhir.</p>}
                        <div className="mt-3"><CountdownTimer expiredAt={orderStatus?.pg_expired_at} /></div>
                    </div>

                    <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
                        <div className="mb-4 flex items-center justify-between"><p className="text-sm font-bold">Scan QRIS untuk membayar</p><button type="button" aria-label="Refresh status" onClick={manualRefresh} disabled={isRefreshing} className="p-2 text-[var(--muted)] hover:text-[var(--coral-dark)]"><RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} /></button></div>
                        <div className="flex justify-center">
                            {qrImageSrc ? <button type="button" aria-label="Simpan QRIS" onClick={() => downloadQR(qrImageSrc)} className="group border border-[var(--line-strong)] bg-white p-3"><img src={qrImageSrc} alt="QRIS pembayaran" className="h-56 w-56 object-contain" /></button> : <div className="flex h-56 w-56 items-center justify-center border border-dashed border-[var(--line-strong)] text-[var(--muted)]"><Loader2 size={22} className="animate-spin" /></div>}
                        </div>
                        {qrImageSrc && <button type="button" onClick={() => downloadQR(qrImageSrc)} className="mt-4 flex w-full items-center justify-center gap-2 border border-[var(--line)] py-2.5 text-xs font-bold text-[var(--coral-dark)] hover:bg-[#fae7df]"><Download size={15} /> Simpan QR Code</button>}
                        {displayOrderId && <div className="mt-4 border-t border-[var(--line)] pt-4"><div className="flex items-center justify-between gap-3 text-xs"><span className="text-[var(--muted)]">Order ID</span><button type="button" onClick={copyOrderId} className="flex items-center gap-2 font-mono font-bold text-[var(--coral-dark)]">{displayOrderId}{copiedOrderId ? <CheckCircle2 size={14} /> : <Copy size={14} />}</button></div><p className="mt-3 bg-[#f7eedb] p-2.5 text-[11px] leading-relaxed text-[#765514]">Simpan Order ID ini jika Anda perlu menghubungi admin.</p></div>}
                        <p className="mt-4 bg-[#eeeae2] py-2 text-center text-[11px] text-[var(--muted)]">Gunakan E-Wallet atau M-Banking untuk scan.</p>
                        <button type="button" onClick={handleSudahBayar} className="btn-primary mt-3 w-full">Saya sudah bayar</button>
                    </div>
                </div>
            )}

            {(effectiveStatus === 'PENDING' || !effectiveStatus) && !paymentResult && <StatusPanel icon={<Clock size={28} />} title="Menunggu konfirmasi pembayaran" text="Sistem sedang mendeteksi pembayaran Anda. Mohon tetap di halaman ini." tone="gold" />}
            {effectiveStatus === 'PROCESSING' && <StatusPanel icon={<Loader2 size={28} className="animate-spin" />} title="Pesanan sedang diproses" text="Pembayaran terkonfirmasi. Detail pesanan akan segera dikirim ke Email dan WhatsApp Anda." tone="coral" />}

            {effectiveStatus === 'COMPLETED' && <div className="border border-[var(--teal)] bg-[var(--teal-soft)] p-6 text-center"><CheckCircle2 size={38} className="mx-auto text-[var(--teal)]" /><h3 className="mt-3 text-xl font-extrabold text-[var(--teal)]">Terima kasih, pesanan selesai.</h3><p className="mt-2 text-sm text-[var(--teal)]">Detail pesanan telah diproses. Periksa Email Anda.</p>{validTexts?.length > 0 && <div className="mt-5 space-y-2 text-left">{validTexts.map((text, index) => <div key={index} className="flex items-center justify-between gap-3 border border-[var(--line)] bg-[var(--surface)] p-3"><span className="break-all font-mono text-xs text-[var(--ink)]">{text}</span><button type="button" aria-label={`Salin detail ${index + 1}`} onClick={() => copyToClipboard(text)} className="shrink-0 text-[var(--coral-dark)]">{copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}</button></div>)}</div>}</div>}

            {(effectiveStatus === 'FAILED' || effectiveStatus === 'CANCELLED') && <div className="border border-[#e4aaa3] bg-[#f8e3df] p-5 text-center"><AlertCircle size={30} className="mx-auto text-[var(--danger)]" /><h3 className="mt-3 font-extrabold text-[var(--danger)]">Pesanan {effectiveStatus === 'FAILED' ? 'gagal' : 'dibatalkan'}</h3><p className="mt-2 text-sm text-[var(--danger)]">{orderStatus?.error_message || 'Terjadi kesalahan atau pesanan kadaluarsa.'}</p></div>}
        </div>
    );
};

const StatusPanel = ({ icon, title, text, tone }) => {
    const toneClass = tone === 'gold' ? 'border-[var(--gold)] bg-[#f7eedb] text-[#765514]' : 'border-[var(--coral)] bg-[#fae7df] text-[var(--coral-dark)]';
    return <div className={`p-8 text-center ${toneClass}`}><div className="mx-auto flex h-16 w-16 items-center justify-center border border-current">{icon}</div><h3 className="mt-4 text-lg font-extrabold">{title}</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed">{text}</p><div className="mt-5 flex justify-center gap-1"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:200ms]" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:400ms]" /></div></div>;
};

export default PaymentStep;
