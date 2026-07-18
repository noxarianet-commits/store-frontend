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
import { normalizePhoneNumber } from '../utils/phoneUtils';
import { formatRp } from '../utils/currencyUtils';

// New Modular Components
import ServerSelector from '../components/product/ServerSelector';
import VariantSelector from '../components/product/VariantSelector';
import BuyerDataForm from '../components/product/BuyerDataForm';
import PaymentStep from '../components/product/PaymentStep';

// ══════════════════════════════════════════════════════════════════════════
// HELPER — Order Process Label & Color
// ══════════════════════════════════════════════════════════════════════════
const ORDER_PROCESS_CONFIG = {
    auto: { label: 'Instan', color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
    h2h: { label: 'Instan', color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
    manual: { label: 'Manual', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-100' },
    smm: { label: 'SMM', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
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
        <div className="flex items-center gap-1.5 text-yellow-600 text-xs font-semibold">
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
    const [settings, setSettings] = useState({
        shop_status: { isOpen: true, message: 'Selamat datang!' }
    });

    // Multi-Vendor State
    const [vendor, setVendor] = useState('sekalipay'); // 'sekalipay' | 'fincloud'
    const [fincloudVariants, setFincloudVariants] = useState([]);

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
    const [isWaConfirmed, setIsWaConfirmed] = useState(false);

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
    const [orderStatus, setOrderStatus] = useState(null);
    const [showAllVariants, setShowAllVariants] = useState(false);
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
                if (parsed.vendor) setVendor(parsed.vendor);
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
                step, vendor, selectedVariant, formData, fieldData, providerQty, validatedAccount, paymentResult, orderStatus,
                testimonialSubmitted
            }));
        } catch (e) { /* ignore */ }
    }, [step, vendor, selectedVariant, formData, fieldData, providerQty, validatedAccount, paymentResult, orderStatus, testimonialSubmitted]);

    // ── SweetAlert when COMPLETED ──────────────────────────────────────
    useEffect(() => {
        if (orderStatus?.status === 'COMPLETED' && !completedAlertShown.current) {
            completedAlertShown.current = true;
            
            const isService = product?.is_service_table || product?.category?.toLowerCase().includes('jasa');
            
            if (isService) {
                Swal.fire({
                    icon: 'success',
                    title: 'Pesanan Selesai!',
                    text: 'Pembayaran berhasil dan pesanan Anda telah diproses.',
                    background: '#ffffff',
                    color: '#1e293b',
                    confirmButtonColor: '#7c3aed',
                    confirmButtonText: 'Lanjutkan'
                });
            } else {
                let currentRating = 5;
                
                Swal.fire({
                    title: 'Pesanan Selesai!',
                    html: `
                        <div class="text-center font-sans">
                            <p class="text-sm text-slate-500 mb-5">Pembayaran berhasil dan pesanan Anda telah diproses.</p>
                            <div class="border-t border-slate-100 pt-5 mt-3">
                                <h4 class="text-sm font-bold text-slate-800 mb-3 flex items-center justify-center gap-1.5">
                                    ⭐ Beri Penilaian
                                </h4>
                                <div class="flex justify-center gap-2 mb-4" id="swal-rating-container">
                                    <button type="button" data-val="1" class="swal-star-btn text-yellow-400 text-3xl focus:outline-none transition-transform hover:scale-110">★</button>
                                    <button type="button" data-val="2" class="swal-star-btn text-yellow-400 text-3xl focus:outline-none transition-transform hover:scale-110">★</button>
                                    <button type="button" data-val="3" class="swal-star-btn text-yellow-400 text-3xl focus:outline-none transition-transform hover:scale-110">★</button>
                                    <button type="button" data-val="4" class="swal-star-btn text-yellow-400 text-3xl focus:outline-none transition-transform hover:scale-110">★</button>
                                    <button type="button" data-val="5" class="swal-star-btn text-yellow-400 text-3xl focus:outline-none transition-transform hover:scale-110">★</button>
                                </div>
                                <textarea 
                                    id="swal-testi-msg" 
                                    placeholder="Bagaimana pelayanan kami? Tulis testimoni Anda di sini..." 
                                    class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 h-24 resize-none"
                                ></textarea>
                            </div>
                        </div>
                    `,
                    background: '#ffffff',
                    color: '#1e293b',
                    confirmButtonColor: '#7c3aed',
                    confirmButtonText: 'Kirim & Lanjutkan',
                    showCancelButton: true,
                    cancelButtonText: 'Lewati',
                    cancelButtonColor: '#94a3b8',
                    didOpen: () => {
                        const stars = document.querySelectorAll('.swal-star-btn');
                        const updateStars = (val) => {
                            currentRating = val;
                            stars.forEach((star, index) => {
                                if (index < val) {
                                    star.innerHTML = '★';
                                    star.classList.add('text-yellow-400');
                                    star.classList.remove('text-slate-300');
                                } else {
                                    star.innerHTML = '☆';
                                    star.classList.remove('text-yellow-400');
                                    star.classList.add('text-slate-300');
                                }
                            });
                        };
                        
                        stars.forEach(star => {
                            star.addEventListener('click', () => {
                                const val = parseInt(star.getAttribute('data-val'));
                                updateStars(val);
                            });
                        });
                        
                        updateStars(5);
                    },
                    preConfirm: () => {
                        const text = document.getElementById('swal-testi-msg').value;
                        return { rating: currentRating, text };
                    }
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        const { rating: finalRating, text: finalTesti } = result.value || {};
                        if (finalTesti && finalTesti.trim()) {
                            try {
                                await api.post('/testimonials', {
                                    name: formData.wa_number || 'Customer',
                                    text: finalTesti,
                                    product: product?.name || '',
                                    rating: finalRating,
                                    order_id: paymentResult?.order_id || null
                                });
                                setTestimonialSubmitted(true);
                                notifySuccess('Terima kasih atas testimoninya!');
                            } catch (err) {
                                notifyError('Tidak bisa menyimpan testimoni.');
                            }
                        }
                    }
                });
            }
        }
    }, [orderStatus?.status, product, formData.wa_number, paymentResult]);

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

    // ── Download QR (fetch atau fallback ke new tab jika CORS blocked) ───────────────
    const downloadQR = async (qrUrl) => {
        try {
            // Try direct fetch (works jika server kirim CORS headers)
            const response = await fetch(qrUrl);
            if (!response.ok) throw new Error('Fetch failed');
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
            // CORS blocked atau fetch gagal: fallback ke new tab
            console.warn('Download failed (likely CORS), opening in new tab:', e);
            window.open(qrUrl, '_blank');
            notifyWarning('Download otomatis diblokir browser. QR dibuka di tab baru, klik kanan → Save Image.');
        }
    };

    // ── Cek ID / Validate Account ───────────────────────────────────────
    const handleValidateAccount = async () => {
        const sekalipayValVariant = vendor === 'fincloud' ? product?.variants?.find(v => v.validation?.available) : null;
        const activeVariant = vendor === 'fincloud' ? sekalipayValVariant : selectedVariant;

        if (!activeVariant || !activeVariant.validation?.available) return;
        
        let customerId = fieldData['customer_id'] || fieldData['note'] || fieldData['target'] || '';
        let zoneId = fieldData['zone_id'] || '';

        if (!customerId) {
            notifyWarning('Masukkan ID target (User ID) terlebih dahulu');
            return;
        }

        setIsValidating(true);
        try {
            const res = await api.post('/sekalipay/validate', {
                item_id: activeVariant.id,
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
            text: 'Pesanan Anda sedang diproses dan akan dikirimkan via Email secara otomatis setelah proses pesanan selesai.',
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

                const [sekalipayRes, dbRes, servicesRes, settingsRes] = await Promise.all([
                    !isServiceRoute ? api.get('/sekalipay/items', { params: { per_page: 200 } }).catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } }),
                    !isServiceRoute ? api.get('/products').catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
                    api.get('/services').catch(() => ({ data: [] })),
                    api.get('/settings').catch(() => ({ data: {} }))
                ]);

                if (settingsRes.data) {
                    setSettings(settingsRes.data);
                }

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
                    
                    // Normalize variant prices and sort by price low to high
                    if (foundProduct.variants) {
                        foundProduct.variants = foundProduct.variants
                            .map(v => ({
                                ...v,
                                price: v.price || v.sell_price || 0,
                                vendor: 'sekalipay'
                            }))
                            .sort((a, b) => a.price - b.price);
                    }
                    setProduct(foundProduct);
                    
                    // Fetch Fincloud matching variants if not a service route
                    if (!isServiceRoute) {
                        try {
                            const fincloudRes = await api.getFincloudProducts({ search: foundProduct.name, per_page: 200 });
                            if (fincloudRes.data?.data && fincloudRes.data.data.length > 0) {
                                const mappedFincloud = fincloudRes.data.data
                                    .map(v => ({
                                        id: v.sku, // map sku to id for frontend logic
                                        sku: v.sku,
                                        name: v.name,
                                        price: v.price,
                                        sell_price: v.price,
                                        stock: 9999, // Fincloud assumes available if returned
                                        order_process: 'auto',
                                        vendor: 'fincloud',
                                        required_fields: [{ key: 'target', label: 'Nomor Tujuan / User ID', required: true }],
                                        validation: {}
                                    }))
                                    .sort((a, b) => a.price - b.price);
                                setFincloudVariants(mappedFincloud);
                            }
                        } catch (e) {
                            console.error('Failed to load Fincloud variants', e);
                        }
                    }
                    
                    // Auto-select first in-stock variant based on current vendor state (we default to sekalipay)
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

    // Auto-select first variant on vendor switch
    useEffect(() => {
        if (!product) return;
        const currentVariants = vendor === 'fincloud' ? fincloudVariants : product.variants;
        if (currentVariants && currentVariants.length > 0) {
            const cheapestInStock = currentVariants.find(v => v.stock > 0) || currentVariants[0];
            setSelectedVariant(cheapestInStock);
        } else {
            setSelectedVariant(null);
        }
    }, [vendor, product, fincloudVariants]);

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

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            notifyWarning('Alamat email tidak valid! Harap masukkan email yang benar (contoh: nama@email.com)');
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
            let noteTarget = '';
            if (fieldData.customer_id) {
                noteTarget = fieldData.customer_id;
                if (fieldData.zone_id) {
                    noteTarget += `(${fieldData.zone_id})`;
                }
            } else {
                noteTarget = fieldData.note || fieldData.target || '';
            }
            // Normalize phone number for e-wallet products (08xxx format required by Sekalipay)
            const isEwallet = product?.category?.toLowerCase().includes('e-wallet');
            if (isEwallet) {
                noteTarget = normalizePhoneNumber(noteTarget);
            }
            const noteStr = isOpenDenom 
                ? JSON.stringify({ target: noteTarget, provider_qty: parseInt(providerQty) || 0 })
                : (selectedVariant?.order_process === 'smm' 
                    ? JSON.stringify({ target: fieldData.target || noteTarget, opt_smm: [], comment_smm: '' }) 
                    : noteTarget);

            const res = await api.post('/payments/create', {
                vendor: vendor,
                product_id: product.id?.toString(),
                variant_id: vendor === 'sekalipay' ? selectedVariant?.id : undefined,
                sku: vendor === 'fincloud' ? selectedVariant?.sku : undefined,
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

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            notifyWarning('Alamat email tidak valid! Harap masukkan email yang benar (contoh: nama@email.com)');
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
        <div className="min-h-screen font-sans text-slate-800">
            <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-purple-100/50 shadow-sm">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 animate-pulse" />
                        <div className="w-24 h-5 rounded bg-slate-100 animate-pulse" />
                    </div>
                </div>
            </nav>
            <main className="max-w-2xl mx-auto px-4 py-10">
                <div className="mb-8">
                    <div className="w-20 h-3 rounded bg-slate-100 animate-pulse mb-3" />
                    <div className="w-48 h-7 rounded bg-slate-100 animate-pulse" />
                </div>
                <div className="flex items-center gap-2 mb-8">
                    {[1, 2, 3].map((i) => (
                        <Fragment key={i}>
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-slate-100 animate-pulse" />
                                <div className="w-16 h-3 rounded bg-slate-100 animate-pulse hidden sm:block" />
                            </div>
                            {i < 3 && <div className="flex-1 h-px bg-slate-100" />}
                        </Fragment>
                    ))}
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white border border-purple-100 rounded-2xl p-5 animate-pulse shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="w-32 h-4 rounded bg-slate-100 mb-2" />
                                    <div className="w-20 h-3 rounded bg-slate-100" />
                                </div>
                                <div className="w-16 h-6 rounded bg-slate-100" />
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
                <p className="text-slate-800 text-lg font-bold mb-2">Produk tidak ditemukan.</p>
                <Link to="/" className="text-purple-600 text-sm hover:underline">Kembali ke beranda</Link>
            </div>
        </div>
    );

    const steps = ['Checkout', 'Data Pembeli', 'Pembayaran'];
    const isGameProduct = product?.category?.toLowerCase().includes('game') || product?.category?.toLowerCase().includes('top up') || product?.category?.toLowerCase().includes('topup');
    const isServiceProduct = product?.is_service_table || product?.category?.toLowerCase().includes('jasa');

    // Status badge config
    const statusConfig = {
        PENDING: { label: 'Menunggu Pembayaran', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-100', icon: <Clock size={16} className="text-yellow-600" /> },
        PROCESSING: { label: 'Sedang Diproses', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', icon: <Loader2 size={16} className="text-blue-600 animate-spin" /> },
        COMPLETED: { label: 'Selesai!', color: 'text-green-600', bg: 'bg-green-50 border-green-100', icon: <CheckCircle2 size={16} className="text-green-600" /> },
        FAILED: { label: 'Gagal', color: 'text-red-600', bg: 'bg-red-50 border-red-100', icon: <AlertCircle size={16} className="text-red-600" /> },
        CANCELLED: { label: 'Dibatalkan', color: 'text-slate-500', bg: 'bg-slate-50 border-slate-100', icon: <AlertCircle size={16} className="text-slate-500" /> },
    };
    const currentStatus = statusConfig[orderStatus?.status] || statusConfig['PENDING'];

    // ── Compute dynamic fields (merge required_fields and validation.fields) ──
    const dynamicFields = [];
    if (selectedVariant) {
        const isFincloud = vendor === 'fincloud';
        const sekalipayValVariant = isFincloud ? product?.variants?.find(v => v.validation?.available) : null;

        const reqFields = selectedVariant.required_fields || [];
        const valFields = isFincloud
            ? (sekalipayValVariant?.validation?.fields || [])
            : (selectedVariant.validation?.available ? (selectedVariant.validation.fields || []) : []);

        const hasCustomerIdInVal = valFields.some(v => v.key === 'customer_id');

        reqFields.forEach(rf => {
            // Hide generic 'note' or 'target' if validation provides 'customer_id'
            if ((rf.key === 'note' || rf.key === 'target') && hasCustomerIdInVal) return;
            // Hide required field if validation already covers this exact key
            if (valFields.some(vf => vf.key === rf.key)) return;
            dynamicFields.push(rf);
        });

        valFields.forEach(vf => {
            dynamicFields.push(vf);
        });

        // ── Fallback if dynamicFields is empty ──
        if (dynamicFields.length === 0) {
            const cat = product?.category?.toLowerCase() || '';
            if (cat.includes('e-wallet') || cat.includes('ewallet')) {
                dynamicFields.push({ key: 'note', label: 'Nomor Tujuan (HP)', required: true });
            } else if (cat.includes('game') || cat.includes('top up') || cat.includes('topup')) {
                dynamicFields.push({ key: 'customer_id', label: 'User ID', required: true });
                dynamicFields.push({ key: 'zone_id', label: 'Server ID', required: false });
            }
        }
    }

    // ── Ekstrak Data Akun untuk Ditampilkan ──
    const displayTexts = [];
    if (orderStatus?.account_details) {
        const ad = orderStatus.account_details;
        const licArr = ad.licenses || [];
        const rawArr = ad.raw_items || [];

        licArr.forEach(lic => {
            if (typeof lic === 'string') displayTexts.push(lic);
            else if (lic?.product_license) displayTexts.push(lic.product_license);
            else if (lic?.sn) displayTexts.push(lic.sn);
            else if (typeof lic === 'object') displayTexts.push(JSON.stringify(lic));
        });

        rawArr.forEach(item => {
            if (item?.h2h_results?.sn) displayTexts.push(item.h2h_results.sn);
            else if (item?.h2h_results?.ref_id) displayTexts.push("Ref ID: " + item.h2h_results.ref_id);

            const itemLic = item.licenses || [];
            itemLic.forEach(lic => {
                let text = '';
                if (typeof lic === 'string') text = lic;
                else if (lic?.product_license) text = lic.product_license;
                else if (lic?.sn) text = lic.sn;
                if (text && !displayTexts.includes(text)) displayTexts.push(text);
            });
        });
    }
    const validTexts = displayTexts.filter(t => t);

    return (
        <div className="min-h-screen font-sans text-slate-800">
            {/* HEADER */}
            <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-purple-100/50 shadow-sm">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2.5">
                        <img src="/logo.png" alt="noxarianet" className="w-9 h-9 rounded-lg object-contain" />
                        <span className="text-xl font-bold tracking-tight text-slate-900">noxaria<span className="text-purple-600">net</span></span>
                    </Link>
                </div>
            </nav>

            <main className="max-w-2xl mx-auto px-4 py-10">
                {/* Product Header */}
                <div className="mb-8">
                    <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">{product.category}</span>
                    <h1 className="text-2xl font-extrabold text-slate-900 mt-1">{product.name}</h1>
                </div>

                {/* Toko Tutup Banner */}
                {settings.shop_status?.isOpen === false && (
                    <div className="mb-6 bg-amber-50 border border-amber-100 rounded-2xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center shrink-0">
                                <AlertTriangle className="text-amber-600" size={22} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-amber-800">Toko Sedang Tutup</p>
                                <p className="text-xs text-slate-500">
                                    {settings.shop_status.message || 'Mohon maaf, toko kami sedang tutup sementara dan tidak menerima pesanan baru.'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sold Out Banner */}
                {product.status === 'sold_out' && (
                    <div className="mb-6 bg-red-50 border border-red-100 rounded-2xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                                <AlertCircle className="text-red-600" size={22} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-red-600">Stok Habis</p>
                                <p className="text-xs text-slate-500">Produk ini sedang tidak tersedia. Silakan cek kembali nanti.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step Progress */}
                <div className="flex items-center gap-2 mb-8">
                    {steps.map((s, i) => (
                        <Fragment key={i}>
                            <div className={`flex items-center gap-2 ${step > i + 1 ? 'text-purple-600' : step === i + 1 ? 'text-slate-800' : 'text-slate-400'}`}>
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                                    step > i + 1 ? 'bg-purple-600 border-purple-600 text-white' : step === i + 1 ? 'border-purple-500 text-purple-600 bg-purple-50' : 'border-slate-200 text-slate-400'
                                }`}>
                                    {step > i + 1 ? <CheckCircle2 size={14} /> : i + 1}
                                </div>
                                <span className="text-xs font-medium hidden sm:block">{s}</span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`flex-1 h-px transition-all ${step > i + 1 ? 'bg-purple-500' : 'bg-slate-200'}`} />
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
                        className="bg-white border border-purple-100 rounded-2xl p-6 shadow-sm"
                    >
                        {step === 1 && (
                            <div>
                                <ServerSelector vendor={vendor} setVendor={setVendor} hasFincloud={fincloudVariants.length > 0} />
                                <h2 className="text-base font-bold text-slate-900 mb-5">Pilih Paket</h2>
                                <VariantSelector 
                                    variants={vendor === 'fincloud' ? fincloudVariants : product.variants} 
                                    selectedVariant={selectedVariant} 
                                    setSelectedVariant={setSelectedVariant}
                                    showAllVariants={showAllVariants}
                                    setShowAllVariants={setShowAllVariants}
                                />
                                {/* Features */}
                                {product.features && product.features.length > 0 && (
                                    <div className="border-t border-slate-100 pt-5 mb-6 mt-6">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Fitur Termasuk</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {product.features.map((f, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                                                    <CheckCircle2 size={14} className="text-purple-600 shrink-0" />{f}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => { window.scrollTo(0, 0); navigate('/'); }}
                                        className="w-1/3 bg-white hover:bg-slate-50 py-3.5 rounded-xl font-semibold text-slate-700 transition-colors border border-slate-200 text-sm"
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
                                        disabled={product.status === 'sold_out' || !selectedVariant || (selectedVariant.stock === 0) || settings.shop_status?.isOpen === false}
                                        className={`w-2/3 font-semibold py-3.5 rounded-xl transition flex items-center justify-center gap-2 text-sm ${
                                            (product.status === 'sold_out' || !selectedVariant || (selectedVariant.stock === 0) || settings.shop_status?.isOpen === false)
                                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                                : 'bg-purple-600 hover:bg-purple-700 text-white'
                                        }`}
                                    >
                                        {(product.status === 'sold_out' || !selectedVariant || (selectedVariant.stock === 0)) ? 'Stok Habis' : settings.shop_status?.isOpen === false ? 'Toko Tutup' : isServiceProduct ? <>Hubungi WhatsApp <ChevronRight size={16} /></> : <>Lanjutkan <ChevronRight size={16} /></>}
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <BuyerDataForm
                                    formData={formData}
                                    handleFormChange={handleFormChange}
                                    dynamicFields={dynamicFields}
                                    fieldData={fieldData}
                                    setFieldData={setFieldData}
                                    providerQty={providerQty}
                                    setProviderQty={setProviderQty}
                                    selectedVariant={selectedVariant}
                                    handleValidateAccount={handleValidateAccount}
                                    isValidating={isValidating}
                                    validatedAccount={validatedAccount}
                                    vendor={vendor}
                                    product={product}
                                />
                                
                                {/* Order Summary */}
                                {selectedVariant?.price > 0 && (
                                    <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 mb-5 text-sm">
                                        <div className="flex justify-between text-slate-500 mb-1">
                                            <span>{selectedVariant?.name}</span>
                                            <span>{formatRp(computedPrice)}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-800 font-bold border-t border-slate-100 pt-2 mt-2">
                                            <span>Total</span>
                                            <span className="text-purple-600">{formatRp(computedPrice)}<span className="text-slate-400 font-normal text-xs"> + fee QRIS</span></span>
                                        </div>
                                    </div>
                                )}

                                {/* Peringatan Konfirmasi WA */}
                                {selectedVariant?.price > 0 && (
                                    <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-4 mb-5">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-amber-100/80 rounded-lg shrink-0 text-amber-700">
                                                <AlertTriangle size={18} className="animate-pulse" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-amber-900 font-bold text-xs uppercase tracking-wider mb-1">Peringatan Konfirmasi</h4>
                                                <p className="text-amber-800 text-xs leading-relaxed">
                                                    Harap pastikan nomor WhatsApp dan alamat Email Anda <strong>benar dan aktif</strong> karena produk dan bukti transaksi akan dikirim via WhatsApp & Email. Jika terdapat kesalahan pengisian data, hal tersebut <strong>bukan tanggung jawab kami</strong>.
                                                </p>
                                                <label className="flex items-center gap-2.5 mt-3.5 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={isWaConfirmed}
                                                        onChange={(e) => setIsWaConfirmed(e.target.checked)}
                                                        className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500 focus:ring-2 cursor-pointer transition-all"
                                                    />
                                                    <span className="text-xs text-amber-900 font-semibold select-none group-hover:text-amber-950 transition-colors">
                                                        Saya mengkonfirmasi nomor WhatsApp & alamat Email saya benar & aktif
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => { setStep(1); window.scrollTo({ top: 100, behavior: 'smooth' }); }}
                                        disabled={isSubmitting}
                                        className="w-1/3 bg-white hover:bg-slate-50 py-3.5 rounded-xl font-semibold text-slate-700 transition-colors border border-slate-200 text-sm disabled:opacity-50"
                                    >Kembali</button>
                                    <button
                                        onClick={() => {
                                            if (selectedVariant?.price === 0) {
                                                handleCustomConsultation();
                                            } else {
                                                if (!isWaConfirmed) {
                                                    notifyWarning('Harap centang konfirmasi nomor WhatsApp & alamat Email terlebih dahulu!');
                                                    return;
                                                }
                                                submitPayment();
                                            }
                                        }}
                                        disabled={isSubmitting || settings.shop_status?.isOpen === false}
                                        className={`w-2/3 py-3.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                                            (selectedVariant?.price > 0 && !isWaConfirmed) || settings.shop_status?.isOpen === false
                                                ? 'bg-purple-600/50 hover:bg-purple-600/50 text-white/80'
                                                : 'bg-purple-600 hover:bg-purple-700 text-white'
                                        }`}
                                    >
                                        {isSubmitting ? (
                                            <><Loader2 size={16} className="animate-spin" /> Memproses...</>
                                        ) : settings.shop_status?.isOpen === false ? (
                                            'Toko Tutup'
                                        ) : (
                                            selectedVariant?.price === 0 ? 'Kirim ke WhatsApp' : <>Lanjut Bayar <ChevronRight size={16} /></>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <PaymentStep
                                orderStatus={orderStatus}
                                paymentResult={paymentResult}
                                isRefreshing={isRefreshing}
                                manualRefresh={manualRefresh}
                                downloadQR={downloadQR}
                                copied={copied}
                                copyToClipboard={copyToClipboard}
                                handleSudahBayar={handleSudahBayar}
                                validTexts={validTexts}
                                setStep={setStep}
                                product={product}
                                rating={rating}
                                setRating={setRating}
                                testimonialMsg={testimonialMsg}
                                setTestimonialMsg={setTestimonialMsg}
                                isSubmitting={isSubmitting}
                                submitTestimonial={submitTestimonial}
                                testimonialSubmitted={testimonialSubmitted}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default ProductPage;
