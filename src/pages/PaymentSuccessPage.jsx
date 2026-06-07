import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    CheckCircle2, AlertCircle, Loader2, Copy, Shield,
    ArrowLeft, Clock, RefreshCw, Wifi
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
            sub: 'Detail akun telah dikirim ke WhatsApp Anda.',
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
        <div className="min-h-screen font-sans text-gray-200 bg-[#0A0A0A]">
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
                        <div className="text-center py-8">
                            <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-400 text-sm">Mengambil status pesanan...</p>
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
                                    <p className="text-xs text-gray-500 mt-2 text-center">Detail akun juga dikirim ke WhatsApp Anda.</p>
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
