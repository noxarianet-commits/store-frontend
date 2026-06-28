import { useEffect, useState, useRef, Fragment } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, CheckCircle2, Copy, Star, ChevronRight,
    Shield, AlertTriangle, AlertCircle, Clock, RefreshCw,
    Loader2, Wifi, Info, Download
} from 'lucide-react';
import api from '../api';
import Swal from 'sweetalert2';
import { notifySuccess, notifyError, notifyWarning, showAlert } from '../utils/notify';

// ══════════════════════════════════════════════════════════════════════════
// HELPER — Format Rupiah
// ══════════════════════════════════════════════════════════════════════════
function formatRp(num) {
    return `Rp ${Number(num).toLocaleString('id-ID')}`;
}

// ══════════════════════════════════════════════════════════════════════════
// HELPER — Order Process Label & Color
// ══════════════════════════════════════════════════════════════════════════
const ORDER_PROCESS_CONFIG = {
    auto: { label: 'Instan', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
    h2h: { label: 'Instan', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
    manual: { label: 'Manual', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    smm: { label: 'SMM', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
};

function isVariantOutOfStock(variant) {
    return variant.stock === 0 || variant.stock === null || variant.stock === undefined;
}

// ══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENT — Countdown Timer
// ══════════════════════════════════════════════════════════════════════════
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
        <div className="flex items-center gap-1.5 text-yellow-400 text-xs font-medium">
            <Clock size={13} />
            <span>Kadaluarsa dalam: <span className="font-mono font-bold">{remaining}</span></span>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════
const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    // Checkout states
    const [step, setStep] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [formData, setFormData] = useState({
        wa_number: '',
        email: '',
    });
    const [fieldData, setFieldData] = useState({});
    const [providerQty, setProviderQty] = useState('');
    const [validatedAccount, setValidatedAccount] = useState(null);
    const [isValidating, setIsValidating] = useState(false);

    // Testimonial
    const [testimonialMsg, setTestimonialMsg] = useState('');
    const [conceptMsg, setConceptMsg] = useState('');
    const [budget, setBudget] = useState('500k-1jt');
    const [rating, setRating] = useState(5);
    const [testimonialSubmitted, setTestimonialSubmitted] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Payment result (setelah createPayment berhasil)
    const [paymentResult, setPaymentResult] = useState(null);

    // Polling status
    const [orderStatus, setOrderStatus] = useState(null);
    const pollingRef = useRef(null);
    const completedAlertShown = useRef(false);
    const hasRestored = useRef(false);

    // ── SessionStorage persistence ─────────────────────────────────────
    const storageKey = `payment_${id}`;

    useEffect(() => {
        try {
            const saved = sessionStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Restore step & data dari posisi terakhir user
                if (parsed.step) setStep(parsed.step);
                if (parsed.selectedVariant) setSelectedVariant(parsed.selectedVariant);
                if (parsed.formData) setFormData(parsed.formData);
                if (parsed.fieldData) setFieldData(parsed.fieldData);
                if (parsed.providerQty) setProviderQty(parsed.providerQty);
                if (parsed.validatedAccount) setValidatedAccount(parsed.validatedAccount);
                if (parsed.step === 3 && parsed.paymentResult) {
                    setPaymentResult(parsed.paymentResult);
                    setOrderStatus(parsed.orderStatus || null);
                }
                if (parsed.testimonialSubmitted) setTestimonialSubmitted(true);
            }
        } catch (e) { /* ignore */ }
        hasRestored.current = true;
    }, []);

    useEffect(() => {
        // Jangan save sebelum restore selesai (mencegah timpa data saat mount)
        if (!hasRestored.current) return;
        try {
            sessionStorage.setItem(storageKey, JSON.stringify({
                step, selectedVariant, formData, fieldData, providerQty, validatedAccount, paymentResult, orderStatus,
                testimonialSubmitted
            }));
        } catch (e) { /* ignore */ }
    }, [step, selectedVariant, formData, fieldData, providerQty, validatedAccount, paymentResult, orderStatus, testimonialSubmitted]);

    // ── SweetAlert when COMPLETED ──────────────────────────────────────
    useEffect(() => {
        if (orderStatus?.status === 'COMPLETED' && !completedAlertShown.current) {
            completedAlertShown.current = true;
            Swal.fire({
                icon: 'success',
                title: 'Pesanan Selesai!',
                text: 'Pembayaran berhasil dan pesanan Anda telah diproses.',
                background: '#0E0E0E',
                color: '#fff',
                confirmButtonColor: '#7c3aed',
                confirmButtonText: 'Lanjutkan'
            });
        }
    }, [orderStatus?.status]);

    // ── Polling status order setelah payment dibuat ──────────────────────
    useEffect(() => {
        if (step === 3 && paymentResult?.order_id) {
            startPolling(paymentResult.order_id);
        }
        return () => stopPolling();
    }, [step, paymentResult]);

    function startPolling(orderId) {
        stopPolling();
        pollingRef.current = setInterval(async () => {
            try {
                const res = await api.get(`/payments/status/${orderId}`);
                const status = res.data?.data?.status;
                setOrderStatus(res.data?.data);

                if (status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELLED') {
                    stopPolling();
                }
            } catch (err) {
                console.error('Polling error:', err.message);
            }
        }, 5000);
    }

    function stopPolling() {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    }

    // ── Download QR (canvas-based for cross-origin) ───────────────────
    const downloadQR = async (qrUrl) => {
        try {
            // Coba fetch dulu
            const response = await fetch(qrUrl, { mode: 'cors' });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `QR-${paymentResult?.order_id || 'pembayaran'}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            notifySuccess('QR Code berhasil didownload!');
        } catch (e) {
            // Fallback: buka di canvas lalu download
            try {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `QR-${paymentResult?.order_id || 'pembayaran'}.png`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                            notifySuccess('QR Code berhasil didownload!');
                        }
                    }, 'image/png');
                };
                img.onerror = () => {
                    // Last fallback: buka di tab baru
                    window.open(qrUrl, '_blank');
                    notifyWarning('Tidak bisa download otomatis. Silakan klik kanan gambar → Save Image.');
                };
                img.src = qrUrl;
            } catch (err) {
                window.open(qrUrl, '_blank');
            }
        }
    };

    // ── Cek ID / Validate Account ───────────────────────────────────────
    const handleValidateAccount = async () => {
        if (!selectedVariant || !selectedVariant.validation?.available) return;
        
        let customerId = fieldData['customer_id'] || fieldData['note'] || '';
        let zoneId = fieldData['zone_id'] || '';

        if (!customerId) {
            notifyWarning('Masukkan ID target (User ID) terlebih dahulu');
            return;
        }

        setIsValidating(true);
        try {
            const res = await api.post('/sekalipay/validate', {
                item_id: selectedVariant.id,
                customer_id: customerId,
                zone_id: zoneId || undefined,
            });
            setValidatedAccount(res.data);
            notifySuccess(`Akun ditemukan: ${res.data?.account_name || res.data?.display_name}`);
        } catch (err) {
            notifyError(err.response?.data?.error || 'Gagal mengecek akun');
            setValidatedAccount(null);
        } finally {
            setIsValidating(false);
        }
    };
    const handleSudahBayar = () => {
        showAlert({
            title: 'Mohon Ditunggu',
            text: 'Pesanan Anda sedang diproses dan akan dikirimkan via WA secara otomatis setelah proses pesanan selesai.',
            confirmText: 'Baik',
        });
    };

    // ── Manual Refresh Status ───────────────────────────────────────────
    const manualRefresh = async () => {
        if (!paymentResult?.order_id) return;
        setIsRefreshing(true);
        try {
            const res = await api.get(`/payments/status/${paymentResult.order_id}`);
            if (res.data?.data) setOrderStatus(res.data.data);
        } catch (e) { /* ignore */ }
        setIsRefreshing(false);
    };

    // ── Submit Testimonial ──────────────────────────────────────────────
    const submitTestimonial = async () => {
        if (!testimonialMsg.trim()) {
            notifyWarning('Tuliskan pengalaman Anda.');
            return;
        }
        try {
            await api.post('/testimonials', {
                name: formData.wa_number || 'Customer',
                text: testimonialMsg,
                product: product?.name || '',
                rating,
                order_id: paymentResult?.order_id || null
            });
            setTestimonialSubmitted(true);
            notifySuccess('Terima kasih atas testimoninya!');
        } catch (err) {
            notifyError('Tidak bisa menyimpan testimoni.');
        }
    };

    // ── Fetch product ────────────────────────────────────────────────────
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const isServiceRoute = location.pathname.startsWith('/service/');

                const [sekalipayRes, dbRes, servicesRes] = await Promise.all([
                    !isServiceRoute ? api.get('/sekalipay/items').catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } }),
                    !isServiceRoute ? api.get('/products').catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
                    api.get('/services').catch(() => ({ data: [] }))
                ]);

                let foundProduct = null;
                if (!isServiceRoute && sekalipayRes.data && Array.isArray(sekalipayRes.data.data)) {
                    foundProduct = sekalipayRes.data.data.find(p => p.id.toString() === id);
                }
                if (!foundProduct && !isServiceRoute && dbRes.data && Array.isArray(dbRes.data)) {
                    foundProduct = dbRes.data.find(p => p.id.toString() === id);
                }
                if (!foundProduct && servicesRes.data && Array.isArray(servicesRes.data)) {
                    foundProduct = servicesRes.data.find(p => p.id.toString() === id);
                    if (foundProduct) foundProduct.is_service_table = true;
                }

                if (foundProduct) {
                    if (foundProduct.is_active === false) foundProduct.status = 'sold_out';
                    else if (foundProduct.is_active === true) foundProduct.status = 'available';
                    // Normalize variant prices: ensure `price` is always set
                    if (foundProduct.variants) {
                        foundProduct.variants = foundProduct.variants.map(v => ({
                            ...v,
                            price: v.price || v.sell_price || 0,
                        }));
                    }
                    setProduct(foundProduct);
                    // Auto-select first in-stock variant, fallback to first variant
                    const firstInStock = foundProduct.variants?.find(v => v.stock > 0);
                    setSelectedVariant(firstInStock || foundProduct.variants?.[0] || null);
                }
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id, location.pathname]);

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isOpenDenom = selectedVariant?.provider_meta?.open_denom;
    const computedPrice = Math.ceil(isOpenDenom ? (parseInt(providerQty) || 0) + (selectedVariant?.price || 0) : (selectedVariant?.price || 0));

    // ── Submit: buat payment via PG ──────────────────────────────────────
    const submitPayment = async () => {
        if (!formData.wa_number || !formData.email) {
            notifyWarning('Nomor WA dan Email wajib diisi!');
            return;
        }
        
        // Cek validasi open denom
        if (isOpenDenom) {
            const pQty = parseInt(providerQty) || 0;
            const minQty = selectedVariant.provider_meta.min_qty;
            const maxQty = selectedVariant.provider_meta.max_qty;
            if (pQty <= 0) return notifyWarning('Nominal wajib diisi!');
            if (minQty && pQty < minQty) return notifyWarning(`Nominal minimal adalah ${formatRp(minQty)}`);
            if (maxQty && pQty > maxQty) return notifyWarning(`Nominal maksimal adalah ${formatRp(maxQty)}`);
        }

        // Cek mandatory fields (use dynamicFields which merges required_fields + validation)
        for (const f of dynamicFields) {
            if (f.required && f.key !== 'provider_qty' && !fieldData[f.key]) {
                return notifyWarning(`${f.label} wajib diisi!`);
            }
        }

        setIsSubmitting(true);
        try {
            const noteTarget = fieldData.note || fieldData.customer_id || '';
            const noteStr = isOpenDenom 
                ? JSON.stringify({ target: noteTarget, provider_qty: parseInt(providerQty) || 0 })
                : (selectedVariant?.order_process === 'smm' 
                    ? JSON.stringify({ target: fieldData.target || noteTarget, opt_smm: [], comment_smm: '' }) 
                    : noteTarget);

            const res = await api.post('/payments/create', {
                product_id: product.id?.toString(),
                variant_id: selectedVariant?.id,
                variant_name: selectedVariant?.name,
                product_name: product.name,
                amount: computedPrice,
                customer_name: validatedAccount?.account_name || validatedAccount?.display_name || formData.wa_number,
                wa_number: formData.wa_number,
                email: formData.email,
                note: noteStr,
                provider_qty: isOpenDenom ? parseInt(providerQty) : undefined,
            });

            if (res.data?.success) {
                setPaymentResult(res.data.data);
                setOrderStatus({ status: 'PENDING', ...res.data.data });
                setStep(3);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: 'error', title: 'Gagal Membuat Pembayaran',
                text: err.response?.data?.error || 'Terjadi kesalahan. Silakan coba lagi.',
                background: '#0E0E0E', color: '#fff', confirmButtonColor: '#9333ea'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Service (manual WA consultation) ───────────────────────────────
    const handleCustomConsultation = () => {
        if (!formData.wa_number || !formData.email || !conceptMsg) {
            notifyWarning('Mohon lengkapi WA, Email, dan Konsep!');
            return;
        }
        const isWebProduct = product.name?.toLowerCase().includes('web') || product.category?.toLowerCase().includes('jasa');
        const message = isWebProduct
            ? `Halo noxarianet! Saya ingin order Jasa Pembuatan Website.%0A%0A*Informasi Pembeli*%0A- Nomor WA: ${formData.wa_number}%0A- Email: ${formData.email}%0A%0A*Detail Pesanan*%0A- Paket: ${selectedVariant?.name}%0A- Estimasi Budget: ${budget}%0A- Konsep/Fitur: ${conceptMsg}%0A%0AMohon bantuannya untuk detail lebih lanjut.`
            : `Halo noxarianet! Saya ingin request script bot WA.%0A%0A*Informasi Pembeli*%0A- Nomor WA: ${formData.wa_number}%0A- Email: ${formData.email}%0A%0A*Konsep Script*%0A${conceptMsg}%0A%0AMohon bantuannya untuk estimasi harga dan pengerjaan.`;
        window.open(`https://wa.me/6285199605580?text=${message}`, '_blank');
    };

    // ── Loading Skeleton ────────────────────────────────────────────────
    if (loading) return (
        <div className="min-h-screen font-sans text-gray-200">
            {/* HEADER Skeleton */}
            <nav className="sticky top-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-white/5 animate-pulse" />
                        <div className="w-24 h-5 rounded bg-white/5 animate-pulse" />
                    </div>
                </div>
            </nav>

            <main className="max-w-2xl mx-auto px-4 py-10">
                {/* Product Header Skeleton */}
                <div className="mb-8">
                    <div className="w-20 h-3 rounded bg-white/5 animate-pulse mb-3" />
                    <div className="w-48 h-7 rounded bg-white/5 animate-pulse" />
                </div>

                {/* Step Progress Skeleton */}
                <div className="flex items-center gap-2 mb-8">
                    {[1, 2, 3].map((i) => (
                        <Fragment key={i}>
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-white/5 animate-pulse" />
                                <div className="w-16 h-3 rounded bg-white/5 animate-pulse hidden sm:block" />
                            </div>
                            {i < 3 && <div className="flex-1 h-px bg-white/5" />}
                        </Fragment>
                    ))}
                </div>

                {/* Variant Cards Skeleton */}
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white/3 border border-white/5 rounded-2xl p-5 animate-pulse">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="w-32 h-4 rounded bg-white/5 mb-2" />
                                    <div className="w-20 h-3 rounded bg-white/5" />
                                </div>
                                <div className="w-16 h-6 rounded bg-white/5" />
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );

    if (!product) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <p className="text-white text-lg font-bold mb-2">Produk tidak ditemukan.</p>
                <Link to="/" className="text-purple-400 text-sm hover:underline">Kembali ke beranda</Link>
            </div>
        </div>
    );

    const steps = ['Checkout', 'Data Pembeli', 'Pembayaran'];
    const isGameProduct = product?.category?.toLowerCase().includes('game') || product?.category?.toLowerCase().includes('top up') || product?.category?.toLowerCase().includes('topup');
    const isServiceProduct = product?.is_service_table || product?.category?.toLowerCase().includes('jasa');

    // Status badge config
    const statusConfig = {
        PENDING: { label: 'Menunggu Pembayaran', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', icon: <Clock size={16} className="text-yellow-400" /> },
        PROCESSING: { label: 'Sedang Diproses', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: <Loader2 size={16} className="text-blue-400 animate-spin" /> },
        COMPLETED: { label: 'Selesai!', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', icon: <CheckCircle2 size={16} className="text-green-400" /> },
        FAILED: { label: 'Gagal', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: <AlertCircle size={16} className="text-red-400" /> },
        CANCELLED: { label: 'Dibatalkan', color: 'text-gray-400', bg: 'bg-white/5 border-white/10', icon: <AlertCircle size={16} className="text-gray-400" /> },
    };
    const currentStatus = statusConfig[orderStatus?.status] || statusConfig['PENDING'];

    // ── Compute dynamic fields (merge required_fields and validation.fields) ──
    const dynamicFields = [];
    if (selectedVariant) {
        const reqFields = selectedVariant.required_fields || [];
        const valFields = selectedVariant.validation?.available ? (selectedVariant.validation.fields || []) : [];
        const hasCustomerIdInVal = valFields.some(v => v.key === 'customer_id');

        reqFields.forEach(rf => {
            // Hide generic 'note' if validation provides 'customer_id'
            if (rf.key === 'note' && hasCustomerIdInVal) return;
            // Hide required field if validation already covers this exact key
            if (valFields.some(vf => vf.key === rf.key)) return;
            dynamicFields.push(rf);
        });

        valFields.forEach(vf => {
            dynamicFields.push(vf);
        });
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

            <main className="max-w-2xl mx-auto px-4 py-10">
                {/* Product Header */}
                <div className="mb-8">
                    <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">{product.category}</span>
                    <h1 className="text-2xl font-extrabold text-white mt-1">{product.name}</h1>
                </div>

                {/* Sold Out Banner */}
                {product.status === 'sold_out' && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-500/15 rounded-xl flex items-center justify-center shrink-0">
                                <AlertCircle className="text-red-400" size={22} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-red-400">Stok Habis</p>
                                <p className="text-xs text-gray-400">Produk ini sedang tidak tersedia. Silakan cek kembali nanti.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step Progress */}
                <div className="flex items-center gap-2 mb-8">
                    {steps.map((s, i) => (
                        <Fragment key={i}>
                            <div className={`flex items-center gap-2 ${step > i + 1 ? 'text-purple-400' : step === i + 1 ? 'text-white' : 'text-gray-600'}`}>
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                                    step > i + 1 ? 'bg-purple-600 border-purple-600 text-white' : step === i + 1 ? 'border-purple-500 text-purple-400 bg-purple-500/10' : 'border-white/10 text-gray-600'
                                }`}>
                                    {step > i + 1 ? <CheckCircle2 size={14} /> : i + 1}
                                </div>
                                <span className="text-xs font-medium hidden sm:block">{s}</span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`flex-1 h-px transition-all ${step > i + 1 ? 'bg-purple-600' : 'bg-white/10'}`} />
                            )}
                        </Fragment>
                    ))}
                </div>

                {/* Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.25 }}
                        className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-6"
                    >
                        {/* ════ STEP 1: VARIANT ════ */}
                        {step === 1 && (
                            <div>
                                <h2 className="text-base font-bold text-white mb-5">Pilih Paket</h2>
                                <div className="space-y-3 mb-6">
                                    {[...(product.variants || [])].sort((a, b) => (a.price || a.sell_price || 0) - (b.price || b.sell_price || 0)).map((variant, idx) => {
                                        const outOfStock = isVariantOutOfStock(variant);
                                        const processConfig = ORDER_PROCESS_CONFIG[variant.order_process] || null;
                                        return (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                if (!outOfStock) {
                                                    setSelectedVariant(variant);
                                                    setFieldData({});
                                                    setProviderQty('');
                                                    setValidatedAccount(null);
                                                }
                                            }}
                                            disabled={outOfStock}
                                            className={`w-full flex justify-between items-center p-4 rounded-xl border text-left transition-all ${
                                                outOfStock
                                                    ? 'border-white/5 bg-white/2 opacity-50 cursor-not-allowed'
                                                    : selectedVariant?.name === variant.name
                                                        ? 'border-purple-500 bg-purple-500/10'
                                                        : 'border-white/5 hover:border-white/15 bg-white/2'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                                    outOfStock ? 'border-white/10' : selectedVariant?.name === variant.name ? 'border-purple-500' : 'border-white/20'
                                                }`}>
                                                    {!outOfStock && selectedVariant?.name === variant.name && (
                                                        <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-sm font-medium ${outOfStock ? 'text-gray-500 line-through' : 'text-white'}`}>{variant.name}</span>
                                                        {processConfig && (
                                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${processConfig.bg} ${processConfig.color}`}>
                                                                {processConfig.label}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {outOfStock && (
                                                        <span className="text-[10px] text-red-400 font-medium">Stok Habis</span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`text-sm font-bold ${outOfStock ? 'text-gray-500' : 'text-purple-400'}`}>
                                                {(variant.sell_price || variant.price) > 0 ? formatRp(variant.sell_price || variant.price) : 'Tanya via Chat'}
                                            </span>
                                        </button>
                                        );
                                    })}
                                </div>

                                {/* Features */}
                                {product.features && product.features.length > 0 && (
                                    <div className="border-t border-white/5 pt-5 mb-6">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Fitur Termasuk</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {product.features.map((f, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                                    <CheckCircle2 size={14} className="text-purple-400 shrink-0" />{f}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => { window.scrollTo(0, 0); navigate('/'); }}
                                        className="w-1/3 bg-white/5 hover:bg-white/10 py-3.5 rounded-xl font-semibold text-white transition-colors border border-white/5 text-sm"
                                    >Kembali</button>
                                    <button
                                        onClick={() => {
                                            if (isServiceProduct) {
                                                const waText = `Halo noxarianet, saya ingin memesan ${product.name} - Varian: ${selectedVariant?.name || '-'}${(selectedVariant?.sell_price || selectedVariant?.price) ? ` dengan harga ${formatRp(selectedVariant.sell_price || selectedVariant.price)}` : ''}.`;
                                                window.open(`https://wa.me/6285199605580?text=${encodeURIComponent(waText)}`, '_blank');
                                            } else {
                                                setStep(2);
                                                window.scrollTo({ top: 100, behavior: 'smooth' });
                                            }
                                        }}
                                        disabled={product.status === 'sold_out' || !selectedVariant || isVariantOutOfStock(selectedVariant)}
                                        className={`w-2/3 font-semibold py-3.5 rounded-xl transition flex items-center justify-center gap-2 text-sm ${
                                            (product.status === 'sold_out' || !selectedVariant || isVariantOutOfStock(selectedVariant))
                                                ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                                                : 'bg-purple-600 hover:bg-purple-700 text-white'
                                        }`}
                                    >
                                        {(product.status === 'sold_out' || !selectedVariant || isVariantOutOfStock(selectedVariant)) ? 'Stok Habis' : isServiceProduct ? <>Hubungi WhatsApp <ChevronRight size={16} /></> : <>Lanjutkan <ChevronRight size={16} /></>}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ════ STEP 2: FORM ════ */}
                        {step === 2 && (
                            <div>
                                <h2 className="text-base font-bold text-white mb-5">Informasi Pembeli</h2>
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-2">Nomor WhatsApp (Aktif)</label>
                                        <input
                                            name="wa_number"
                                            value={formData.wa_number}
                                            onChange={handleFormChange}
                                            placeholder="Contoh: 08123456789"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-2">Alamat Email Gmail</label>
                                        <input
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleFormChange}
                                            placeholder="Contoh: nama@gmail.com"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                                        />
                                    </div>

                                    {/* ── Dynamic Fields from API ── */}
                                    {dynamicFields.map((field, idx) => (
                                        <div key={`dyn-${idx}`}>
                                            <label className="block text-xs font-medium text-gray-400 mb-2">{field.label} {field.required && '*'}</label>
                                            <input
                                                type={field.key === 'provider_qty' ? 'number' : 'text'}
                                                value={field.key === 'provider_qty' ? providerQty : (fieldData[field.key] || '')}
                                                onChange={(e) => {
                                                    if (field.key === 'provider_qty') setProviderQty(e.target.value);
                                                    else setFieldData({...fieldData, [field.key]: e.target.value});
                                                }}
                                                placeholder={`Masukkan ${field.label}`}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                                            />
                                            {field.key === 'provider_qty' && selectedVariant.provider_meta && (
                                                <p className="text-[10px] text-gray-500 mt-1">Min: {formatRp(selectedVariant.provider_meta.min_qty)} | Max: {formatRp(selectedVariant.provider_meta.max_qty)}</p>
                                            )}
                                        </div>
                                    ))}

                                    {selectedVariant?.validation?.available && (
                                        <div className="pt-2">
                                            <button
                                                onClick={handleValidateAccount}
                                                disabled={isValidating}
                                                className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 py-3 rounded-xl text-sm font-bold transition flex justify-center items-center gap-2"
                                            >
                                                {isValidating ? <Loader2 size={16} className="animate-spin" /> : 'Cek ID / Validasi Akun'}
                                            </button>
                                            {validatedAccount && (
                                                <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2">
                                                    <CheckCircle2 size={16} className="text-green-400" />
                                                    <span className="text-sm font-bold text-green-400">Tujuan: {validatedAccount.account_name || validatedAccount.display_name}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Metode Pembayaran — QRIS via FinCloud */}
                                    {selectedVariant?.price > 0 && !isServiceProduct && (
                                        <div className="bg-white/3 border border-white/5 rounded-xl p-4">
                                            <label className="block text-xs font-medium text-gray-400 mb-2">Metode Pembayaran</label>
                                            <div className="flex items-center gap-3 p-3 rounded-xl border border-purple-500 bg-purple-500/10">
                                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0">
                                                    <span className="text-sm font-black text-black">QR</span>
                                                </div>
                                                <div>
                                                    <span className="block font-bold text-white text-sm">QRIS</span>
                                                    <span className="text-[11px] text-gray-400">Scan QR via E-Wallet / M-Banking</span>
                                                </div>
                                                <CheckCircle2 size={18} className="text-purple-400 ml-auto" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Custom service fields */}
                                    {selectedVariant?.price === 0 && (
                                        <div className="space-y-4">
                                            {product.name?.toLowerCase().includes('web') && (
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-400 mb-3">Estimasi Budget Anda</label>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {[
                                                            { label: 'Rp 50rb - 500rb', value: '50k-500k' },
                                                            { label: 'Rp 500rb - 1jt', value: '500k-1jt' },
                                                            { label: 'Rp 1jt - 2jt', value: '1jt-2jt' },
                                                            { label: 'Rp 2jt - 5jt', value: '2jt-5jt' },
                                                            { label: 'Diatas Rp 5jt', value: 'Diatas 5jt' }
                                                        ].map(opt => (
                                                            <button
                                                                key={opt.value}
                                                                type="button"
                                                                onClick={() => setBudget(opt.value)}
                                                                className={`p-3 rounded-xl border text-sm font-medium transition-all ${budget === opt.value ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-white/5 bg-white/2 text-gray-400 hover:border-white/15'}`}
                                                            >{opt.label}</button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-400 mb-2">
                                                    {product.name?.toLowerCase().includes('web') ? 'Ceritakan Website Seperti Apa Yang Anda Inginkan' : 'Ceritakan Konsep Script Bot WA Anda'}
                                                </label>
                                                <textarea
                                                    value={conceptMsg}
                                                    onChange={(e) => setConceptMsg(e.target.value)}
                                                    placeholder={product.name?.toLowerCase().includes('web') ? 'Contoh: Saya ingin website toko online...' : 'Contoh: Saya ingin bot auto reply...'}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 h-32 resize-none transition-colors"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Order Summary */}
                                {selectedVariant?.price > 0 && (
                                    <div className="bg-white/3 border border-white/5 rounded-xl p-4 mb-5 text-sm">
                                        <div className="flex justify-between text-gray-400 mb-1">
                                            <span>{selectedVariant?.name}</span>
                                            <span>{formatRp(computedPrice)}</span>
                                        </div>
                                        <div className="flex justify-between text-white font-bold border-t border-white/10 pt-2 mt-2">
                                            <span>Total</span>
                                            <span className="text-purple-400">{formatRp(computedPrice)}<span className="text-gray-500 font-normal text-xs"> + fee QRIS</span></span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => { setStep(1); window.scrollTo({ top: 100, behavior: 'smooth' }); }}
                                        disabled={isSubmitting}
                                        className="w-1/3 bg-white/5 hover:bg-white/10 py-3.5 rounded-xl font-semibold text-white transition-colors border border-white/5 text-sm disabled:opacity-50"
                                    >Kembali</button>
                                    <button
                                        onClick={() => {
                                            if (selectedVariant?.price === 0) {
                                                handleCustomConsultation();
                                            } else {
                                                submitPayment();
                                            }
                                        }}
                                        disabled={isSubmitting}
                                        className="w-2/3 bg-purple-600 hover:bg-purple-700 py-3.5 rounded-xl font-semibold text-white transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <><Loader2 size={16} className="animate-spin" /> Memproses...</>
                                        ) : (
                                            selectedVariant?.price === 0 ? 'Kirim ke WhatsApp' : <>Lanjut Bayar <ChevronRight size={16} /></>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ════ STEP 3: PEMBAYARAN ════ */}
                        {step === 3 && (
                            <div>
                                {/* Info Tunggu */}
                                <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 mb-5">
                                    <Info size={18} className="text-blue-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-blue-300 text-sm font-semibold">Mohon Ditunggu</p>
                                        <p className="text-blue-300/70 text-xs mt-0.5">Pesanan akan diproses selama 1-5 menit dan detail akun akan dikirim ke WhatsApp Anda. Mohon tetap di halaman ini.</p>
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
                                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Pembayaran</p>
                                            <p className="text-4xl font-extrabold text-white">{formatRp(paymentResult.total || paymentResult.amount)}</p>
                                            {paymentResult.fee > 0 && (
                                                <p className="text-xs text-gray-500 mt-1">termasuk fee {formatRp(paymentResult.fee)}</p>
                                            )}
                                        </div>

                                        <div className="bg-white/3 border border-white/5 rounded-xl p-5 mb-4 text-center">
                                            {/* QRIS via FinCloud */}
                                            {paymentResult.qr_link ? (
                                                <div>
                                                    <p className="text-sm text-gray-400 mb-4">Scan QR Code untuk membayar</p>
                                                    <div className="bg-white rounded-2xl mx-auto w-52 p-2 mb-4">
                                                        <img src={paymentResult.qr_link} alt="QRIS" className="w-full h-auto rounded-xl" />
                                                    </div>
                                                    <div className="flex items-center justify-center gap-3">
                                                        <button
                                                            onClick={() => downloadQR(paymentResult.qr_link)}
                                                            className="inline-flex items-center gap-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-all"
                                                        >
                                                            <Download size={14} /> Download QR
                                                        </button>
                                                        {paymentResult.payment_link && (
                                                            <a
                                                                href={paymentResult.payment_link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-300 transition-colors bg-white/5 px-4 py-2 rounded-lg border border-white/10"
                                                            >
                                                                Lihat Invoice
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : paymentResult.payment_link ? (
                                                <div>
                                                    <p className="text-sm text-gray-400 mb-4">Klik tombol di bawah untuk melanjutkan pembayaran</p>
                                                    <a
                                                        href={paymentResult.payment_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm mt-3"
                                                    >
                                                        Lihat Invoice <ChevronRight size={16} />
                                                    </a>
                                                </div>
                                            ) : null}
                                        </div>

                                        {/* Countdown */}
                                        <div className="flex justify-center mb-4">
                                            <CountdownTimer expiredAt={paymentResult.expired_at} />
                                        </div>

                                        {/* ID Order */}
                                        <div className="bg-white/3 border border-white/5 rounded-xl p-3 text-center text-xs text-gray-500 mb-4">
                                            ID Pesanan: <span className="font-mono text-white font-semibold">{paymentResult.order_id}</span>
                                            <button onClick={() => copyToClipboard(paymentResult.order_id)} className="ml-2 text-purple-400 hover:text-purple-300">
                                                <Copy size={12} />
                                            </button>
                                        </div>

                                        <p className="text-xs text-gray-500 text-center">
                                            Setelah pembayaran berhasil, pesanan akan diproses otomatis. Detail akun dikirim ke WhatsApp Anda.
                                        </p>
                                    </div>
                                )}

                                {/* PROCESSING */}
                                {orderStatus?.status === 'PROCESSING' && (
                                    <div className="text-center py-6">
                                        <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                                            <Loader2 size={28} className="text-blue-400 animate-spin" />
                                        </div>
                                        <p className="text-white font-semibold mb-1">Pembayaran Dikonfirmasi!</p>
                                        <p className="text-sm text-gray-400">Pesanan Anda sedang diproses otomatis...</p>
                                        <p className="text-xs text-gray-500 mt-2">ID: <span className="font-mono">{paymentResult?.order_id}</span></p>
                                    </div>
                                )}

                                {/* COMPLETED */}
                                {orderStatus?.status === 'COMPLETED' && (
                                    <div className="text-center py-4">
                                        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle2 size={28} className="text-green-400" />
                                        </div>
                                        <p className="text-white font-bold text-lg mb-1">Pesanan Selesai!</p>
                                        <p className="text-sm text-gray-400 mb-5">Detail akun telah dikirim ke WhatsApp <span className="text-white font-semibold">{formData.wa_number}</span>.</p>

                                        {/* Tampilkan licenses jika ada */}
                                        {orderStatus.account_details?.licenses?.length > 0 && (
                                            <div className="bg-white/3 border border-white/5 rounded-xl p-4 mb-5 text-left">
                                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Detail Akun</p>
                                                {orderStatus.account_details.licenses.map((lic, i) => (
                                                    <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg p-3 mb-2 last:mb-0">
                                                        <span className="font-mono text-white text-sm">{lic}</span>
                                                        <button onClick={() => copyToClipboard(lic)} className="text-purple-400 hover:text-purple-300 transition-colors ml-2">
                                                            <Copy size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Testimoni */}
                                        {!testimonialSubmitted ? (
                                            <div className="bg-white/3 border border-white/5 rounded-xl p-4 text-left mb-5">
                                                <label className="block text-xs font-medium text-gray-400 mb-3">Tinggalkan Testimoni (Opsional)</label>
                                                <div className="flex gap-1 mb-3">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <button key={star} onClick={() => setRating(star)} className="focus:outline-none">
                                                            <Star size={20} className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/10'} />
                                                        </button>
                                                    ))}
                                                </div>
                                                <textarea
                                                    value={testimonialMsg}
                                                    onChange={(e) => setTestimonialMsg(e.target.value)}
                                                    placeholder="Tuliskan pengalaman Anda..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 h-20 resize-none mb-3"
                                                />
                                                <button
                                                    onClick={submitTestimonial}
                                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl text-sm font-bold transition-all"
                                                >
                                                    Kirim Testimoni
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-5 text-center">
                                                <CheckCircle2 size={20} className="text-green-400 mx-auto mb-1" />
                                                <p className="text-sm text-green-400 font-medium">Terima kasih atas testimoninya!</p>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => { sessionStorage.removeItem(storageKey); window.scrollTo(0, 0); navigate('/'); }}
                                            className="w-full bg-purple-600 hover:bg-purple-700 py-3.5 rounded-xl font-semibold text-white transition-colors text-sm"
                                        >
                                            Kembali ke Beranda
                                        </button>
                                    </div>
                                )}

                                {/* FAILED */}
                                {(orderStatus?.status === 'FAILED' || orderStatus?.status === 'CANCELLED') && (
                                    <div className="text-center py-4">
                                        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                                            <AlertCircle size={28} className="text-red-400" />
                                        </div>
                                        <p className="text-white font-bold text-lg mb-1">Pesanan Gagal</p>
                                        <p className="text-sm text-gray-400 mb-5">
                                            {orderStatus?.error_message
                                                ? `Alasan: ${orderStatus.error_message}`
                                                : 'Terjadi kesalahan dalam memproses pesanan Anda. Tim admin akan segera dihubungi.'}
                                        </p>
                                        <p className="text-xs text-gray-500 mb-5">
                                            Jika sudah membayar, hubungi admin via WhatsApp dengan menyertakan ID Pesanan:&nbsp;
                                            <span className="font-mono text-white">{paymentResult?.order_id}</span>
                                        </p>
                                        <div className="flex gap-3">
                                            <a
                                                href={`https://wa.me/6285199605580?text=Halo%20admin%2C%20pesanan%20saya%20gagal.%20ID%3A%20${paymentResult?.order_id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 bg-green-600/20 hover:bg-green-600/30 border border-green-500/20 py-3 rounded-xl font-semibold text-green-400 transition-colors text-sm text-center"
                                            >
                                                Hubungi Admin
                                            </a>
                                            <button
                                                onClick={() => { sessionStorage.removeItem(storageKey); window.scrollTo(0, 0); navigate('/'); }}
                                                className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl font-semibold text-white transition-colors border border-white/5 text-sm"
                                            >
                                                Kembali
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Trust Badge */}
                                {orderStatus?.status !== 'COMPLETED' && orderStatus?.status !== 'FAILED' && (
                                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-5">
                                        <Shield size={14} className="text-green-500" />
                                        <span>Transaksi Aman & Bergaransi oleh noxarianet</span>
                                    </div>
                                )}

                                {/* Manual refresh + Sudah Bayar */}
                                {(orderStatus?.status === 'PENDING' || orderStatus?.status === 'PROCESSING') && (
                                    <div className="flex flex-col items-center gap-3 mt-4">
                                        <button
                                            onClick={handleSudahBayar}
                                            className="inline-flex items-center gap-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl transition-all shadow-lg shadow-green-600/20"
                                        >
                                            <CheckCircle2 size={16} /> Saya Sudah Bayar
                                        </button>
                                        <button
                                            onClick={manualRefresh}
                                            disabled={isRefreshing}
                                            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
                                        >
                                            <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} /> {isRefreshing ? 'Mengecek...' : 'Refresh status'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default ProductPage;
