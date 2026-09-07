import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2, Copy, Shield, ArrowLeft, Clock, RefreshCw, Wifi } from 'lucide-react';
import api from '../api';
import { getWaUrl } from '../utils/waUtils';

const STATUS = {
    PENDING: { label: 'Menunggu konfirmasi pembayaran', text: 'Pembayaran sedang diverifikasi. Harap tunggu sebentar.', tone: 'gold', icon: <Clock size={30} /> },
    PROCESSING: { label: 'Pembayaran dikonfirmasi', text: 'Pesanan sedang diproses secara otomatis.', tone: 'coral', icon: <Loader2 size={30} className="animate-spin" /> },
    COMPLETED: { label: 'Pesanan selesai', text: 'Detail pesanan telah dikirim ke Email Anda.', tone: 'teal', icon: <CheckCircle2 size={30} /> },
    FAILED: { label: 'Pesanan gagal', text: 'Tim admin telah menerima informasi kendala ini.', tone: 'danger', icon: <AlertCircle size={30} /> },
    CANCELLED: { label: 'Pesanan dibatalkan', text: 'Pesanan ini sudah tidak aktif.', tone: 'muted', icon: <AlertCircle size={30} /> },
};

const PaymentSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get('order_id');
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState('');
    const [settings, setSettings] = useState({});
    const pollingRef = useRef(null);

    useEffect(() => {
        api.get('/settings').then(res => setSettings(res.data || {})).catch(() => {});
    }, []);

    useEffect(() => {
        if (!orderId) { setLoading(false); return undefined; }
        let active = true;
        let delay = 4000;
        const fetchStatus = async () => {
            try {
                const res = await api.get(`/payments/status/${orderId}`);
                const data = res.data?.data;
                if (!active) return;
                setOrderData(data);
                setLoading(false);
                if (!['COMPLETED', 'FAILED', 'CANCELLED'].includes(data?.status)) {
                    delay = Math.min(delay + 2000, 15000);
                    pollingRef.current = setTimeout(fetchStatus, delay);
                }
            } catch {
                if (active) { setLoading(false); pollingRef.current = setTimeout(fetchStatus, 10000); }
            }
        };
        fetchStatus();
        return () => { active = false; if (pollingRef.current) clearTimeout(pollingRef.current); };
    }, [orderId]);

    const copyToClipboard = (value, key) => {
        if (!value) return;
        navigator.clipboard?.writeText(value);
        setCopied(key);
        setTimeout(() => setCopied(''), 2000);
    };

    if (!orderId) return <div className="payment-return-page flex min-h-screen items-center justify-center px-4"><div className="text-center"><p className="font-bold">Order ID tidak ditemukan.</p><Link to="/" className="mt-3 inline-block text-sm text-[var(--coral-dark)] hover:underline">Kembali ke beranda</Link></div></div>;

    const status = STATUS[orderData?.status] || STATUS.PENDING;
    const tone = { gold: 'border-[var(--gold)] bg-[#f7eedb] text-[#765514]', coral: 'border-[var(--coral)] bg-[#fae7df] text-[var(--coral-dark)]', teal: 'border-[var(--teal)] bg-[var(--teal-soft)] text-[var(--teal)]', danger: 'border-[#e4aaa3] bg-[#f8e3df] text-[var(--danger)]', muted: 'border-[var(--line)] bg-[#eeeae2] text-[var(--muted)]' }[status.tone];
    const licenses = orderData?.account_details?.licenses || [];

    return (
        <div className="payment-return-page min-h-screen">
            <nav className="public-nav sticky top-0 z-50">
                <div className="mx-auto flex max-w-[1180px] items-center px-5 py-4 sm:px-8">
                    <Link to="/" className="flex items-center gap-2.5"><img src="/logo.png" alt="noxarianet" className="h-9 w-9 object-contain" /><span className="brand-lockup text-xl font-extrabold">noxaria<span className="brand-accent">net</span></span></Link>
                </div>
            </nav>
            <main className="mx-auto max-w-[620px] px-4 py-10 sm:px-6">
                <button type="button" onClick={() => navigate('/')} className="public-back mb-8 inline-flex items-center gap-2 px-4 py-2 text-sm font-bold"><ArrowLeft size={16} /> Kembali ke Beranda</button>
                <section className="border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-8">
                    {loading ? <div className="py-12 text-center"><Loader2 size={30} className="mx-auto animate-spin text-[var(--coral)]" /><p className="mt-4 text-sm text-[var(--muted)]">Menghubungkan ke sistem...</p></div> : <>
                        <div className={`border p-6 text-center ${tone}`}><div className="mx-auto flex h-16 w-16 items-center justify-center border border-current">{status.icon}</div><h1 className="mt-4 text-xl font-extrabold">{status.label}</h1><p className="mt-2 text-sm">{status.text}</p>{['PENDING', 'PROCESSING'].includes(orderData?.status) && <div className="mt-4 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[.1em]"><Wifi size={13} /> status live</div>}</div>
                        <div className="mt-6 space-y-3 border-b border-[var(--line)] pb-5 text-sm"><DetailRow label="Order ID" value={orderId} action={() => copyToClipboard(orderId, 'order')} copied={copied === 'order'} />{orderData?.pg_invoice && <DetailRow label="Invoice" value={orderData.pg_invoice} mono />}{orderData?.pg_paid_at && <DetailRow label="Waktu bayar" value={new Date(orderData.pg_paid_at).toLocaleString('id-ID')} />}</div>
                        {licenses.length > 0 && <div className="mt-6"><p className="font-mono text-[10px] uppercase tracking-[.1em] text-[var(--muted)]">Detail akun / lisensi</p><div className="mt-3 space-y-2">{licenses.map((license, index) => <DetailRow key={index} label={`Item ${index + 1}`} value={license} action={() => copyToClipboard(license, `license-${index}`)} copied={copied === `license-${index}`} mono />)}</div><p className="mt-3 text-center text-xs text-[var(--muted)]">Detail juga dikirim ke Email Anda.</p></div>}
                        {(orderData?.status === 'FAILED' || orderData?.status === 'CANCELLED') && <div className="mt-6"><p className="border border-[#e4aaa3] bg-[#f8e3df] p-3 text-xs text-[var(--danger)]">{orderData?.error_message || 'Terjadi kesalahan pada pesanan.'}</p><a href={getWaUrl(settings, `Halo admin, pesanan saya bermasalah. ID: ${orderId}`)} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-center bg-[var(--teal)] px-4 py-3 text-sm font-bold text-white">Hubungi Admin via WhatsApp</a></div>}
                        {['PENDING', 'PROCESSING'].includes(orderData?.status) && <button type="button" onClick={async () => { const res = await api.get(`/payments/status/${orderId}`).catch(() => null); if (res) setOrderData(res.data?.data); }} className="mt-5 flex w-full items-center justify-center gap-2 py-2 text-xs font-bold text-[var(--muted)] hover:text-[var(--coral-dark)]"><RefreshCw size={13} /> Refresh manual</button>}
                        <button type="button" onClick={() => navigate('/')} className="btn-secondary mt-4 w-full">Kembali ke Beranda</button><div className="mt-5 flex items-center justify-center gap-2 text-xs text-[var(--muted)]"><Shield size={14} className="text-[var(--teal)]" /> Transaksi aman dan bergaransi oleh noxarianet</div>
                    </>}
                </section>
            </main>
        </div>
    );
};

const DetailRow = ({ label, value, action, copied, mono }) => <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-3 last:border-0 last:pb-0"><span className="text-[var(--muted)]">{label}</span><div className="flex max-w-[70%] items-center gap-2 text-right"><span className={`${mono ? 'break-all font-mono text-xs' : 'text-sm'} font-bold text-[var(--ink)]`}>{value}</span>{action && <button type="button" aria-label={`Salin ${label}`} onClick={action} className="shrink-0 text-[var(--coral-dark)]">{copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}</button>}</div></div>;

export default PaymentSuccessPage;
