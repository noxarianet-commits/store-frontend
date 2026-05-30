import { useEffect, useState, Fragment } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Copy, Upload, Star, ChevronRight, Shield, Download, AlertTriangle, AlertCircle } from 'lucide-react';
import api from '../api';
import Swal from 'sweetalert2';

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
        payment_method: 'QRIS',
        wa_number: '',
        email: '',
    });

    const [proofImage, setProofImage] = useState(null);
    const [proofPreview, setProofPreview] = useState('');
    const [testimonialMsg, setTestimonialMsg] = useState('');
    const [conceptMsg, setConceptMsg] = useState('');
    const [budget, setBudget] = useState('500k-1jt');
    const [rating, setRating] = useState(5);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [uniquePrice, setUniquePrice] = useState(0);

    useEffect(() => {
        if (selectedVariant) {
            const timer = setTimeout(() => {
                if (selectedVariant.price > 0) {
                    const rand = Math.floor(Math.random() * 50) + 1;
                    setUniquePrice(selectedVariant.price + rand);
                } else {
                    setUniquePrice(0);
                }
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [selectedVariant]);

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
                    if (foundProduct) {
                        foundProduct.is_service_table = true;
                    }
                }
                
                if (foundProduct) {
                    // Map is_active to status for backward compatibility
                    if (foundProduct.is_active === false) {
                        foundProduct.status = 'sold_out';
                    } else if (foundProduct.is_active === true) {
                        foundProduct.status = 'available';
                    }
                    setProduct(foundProduct);
                    setSelectedVariant(foundProduct.variants?.[0] || null);
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProofImage(file);
            setProofPreview(URL.createObjectURL(file));
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const calculateTotal = () => {
        return uniquePrice;
    };

    const submitOrder = async () => {
        if (!formData.wa_number || !formData.email) {
            Swal.fire({
                icon: 'warning',
                title: 'Upss...',
                text: 'Nomor WA dan Email wajib diisi!',
                background: '#0E0E0E',
                color: '#fff',
                confirmButtonColor: '#9333ea'
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const orderId = `NX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            const formDataObj = new FormData();
            formDataObj.append('id', orderId);
            formDataObj.append('product', product.name);
            formDataObj.append('variant', selectedVariant.name);
            formDataObj.append('price', uniquePrice);
            formDataObj.append('payment_method', formData.payment_method);
            formDataObj.append('wa_number', formData.wa_number);
            formDataObj.append('email', formData.email);
            formDataObj.append('testimonial', testimonialMsg);

            if (proofImage) {
                formDataObj.append('proof_image', proofImage);
            }

            const res = await api.post('/order', formDataObj);

            if (res.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    html: `
                        <div className="text-sm text-gray-300">
                            <p className="mb-4">Pesanan Anda telah diterima. Produk akan dikirim lewat WhatsApp dalam 1-5 menit.</p>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center gap-3">
                                <span className="text-xs text-gray-400 uppercase tracking-wider">ID Pesanan Anda</span>
                                <span className="text-2xl font-mono font-bold text-purple-400 tracking-wider">${orderId}</span>
                                <button 
                                    id="copy-order-id"
                                    class="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg text-xs font-bold hover:bg-purple-600/30 transition-all border border-purple-600/30"
                                >
                                    Salin ID Pesanan
                                </button>
                            </div>
                        </div>
                    `,
                    background: '#0E0E0E',
                    color: '#fff',
                    confirmButtonColor: '#9333ea',
                    didOpen: () => {
                        const copyBtn = document.getElementById('copy-order-id');
                        copyBtn.addEventListener('click', () => {
                            navigator.clipboard.writeText(orderId);
                            copyBtn.innerText = '✓ Berhasil Disalin';
                            copyBtn.classList.add('text-green-400', 'border-green-400/30', 'bg-green-600/20');
                        });
                    }
                }).then(() => {
                    navigate('/');
                });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'Kesalahan',
                text: err.response?.data?.error || 'Gagal mengirim pesanan. Silakan coba lagi.',
                background: '#0E0E0E',
                color: '#fff',
                confirmButtonColor: '#9333ea'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCustomConsultation = () => {
        if (!formData.wa_number || !formData.email || !conceptMsg) {
            Swal.fire({
                icon: 'warning',
                title: 'Upss...',
                text: 'Mohon lengkapi WA, Email, dan Konsep Script Anda!',
                background: '#0E0E0E',
                color: '#fff',
                confirmButtonColor: '#9333ea'
            });
            return;
        }

        const isWebProduct = product.name?.toLowerCase().includes('web') || product.category?.toLowerCase().includes('jasa');
        const message = isWebProduct
            ? `Halo noxarianet! Saya ingin order Jasa Pembuatan Website.%0A%0A*Informasi Pembeli*%0A- Nomor WA: ${formData.wa_number}%0A- Email: ${formData.email}%0A%0A*Detail Pesanan*%0A- Paket: ${selectedVariant?.name}%0A- Estimasi Budget: ${budget}%0A- Konsep/Fitur: ${conceptMsg}%0A%0AMohon bantuannya untuk detail lebih lanjut.`
            : `Halo noxarianet! Saya ingin request script bot WA.%0A%0A*Informasi Pembeli*%0A- Nomor WA: ${formData.wa_number}%0A- Email: ${formData.email}%0A%0A*Konsep Script*%0A${conceptMsg}%0A%0AMohon bantuannya untuk estimasi harga dan pengerjaan.`;
        
        window.open(`https://wa.me/6285199605580?text=${message}`, '_blank');
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400 text-sm">Memuat produk...</p>
            </div>
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

    const totalToPay = calculateTotal();
    const steps = ['Pilih Varian', 'Data Pembeli', 'Pembayaran'];
    const isGameProduct = product?.category?.toLowerCase().includes('game') || product?.category?.toLowerCase().includes('top up') || product?.category?.toLowerCase().includes('topup');
    const isServiceProduct = product?.is_service_table || product?.category?.toLowerCase().includes('jasa');

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
                {/* Back Button */}
                <button
                    onClick={() => {
                        window.scrollTo(0, 0);
                        navigate('/');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-gray-400 hover:text-white transition-all mb-8 text-sm font-medium shadow-sm backdrop-blur-sm"
                >
                    <ArrowLeft size={16} /> Kembali ke Beranda
                </button>

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
                                <p className="text-xs text-gray-400">Produk ini sedang tidak tersedia untuk saat ini. Silakan cek kembali nanti.</p>
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
                                    step > i + 1
                                        ? 'bg-purple-600 border-purple-600 text-white'
                                        : step === i + 1
                                            ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                                            : 'border-white/10 text-gray-600'
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
                                    {product.variants.map((variant, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedVariant(variant)}
                                            className={`w-full flex justify-between items-center p-4 rounded-xl border text-left transition-all ${
                                                selectedVariant?.name === variant.name
                                                    ? 'border-purple-500 bg-purple-500/10'
                                                    : 'border-white/5 hover:border-white/15 bg-white/2'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                                    selectedVariant?.name === variant.name ? 'border-purple-500' : 'border-white/20'
                                                }`}>
                                                    {selectedVariant?.name === variant.name && (
                                                        <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium text-white">{variant.name}</span>
                                            </div>
                                            <span className="text-sm font-bold text-purple-400">
                                                {variant.price > 0 ? `Rp ${variant.price.toLocaleString('id-ID')}` : 'Tanya via Chat'}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {/* Features */}
                                {product.features && product.features.length > 0 && (
                                    <div className="border-t border-white/5 pt-5 mb-6">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Fitur Termasuk</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {product.features.map((f, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                                    <CheckCircle2 size={14} className="text-purple-400 shrink-0" />
                                                    {f}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            window.scrollTo(0, 0);
                                            navigate('/');
                                        }}
                                        className="w-1/3 bg-white/5 hover:bg-white/10 py-3.5 rounded-xl font-semibold text-white transition-colors border border-white/5 text-sm"
                                    >
                                        Kembali
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (isServiceProduct) {
                                                const waText = `Halo noxarianet, saya ingin memesan ${product.name} - Varian: ${selectedVariant?.name || '-'}${selectedVariant?.price ? ` dengan harga Rp ${selectedVariant.price.toLocaleString('id-ID')}` : ''}.`;
                                                const waUrl = `https://wa.me/6285199605580?text=${encodeURIComponent(waText)}`;
                                                window.open(waUrl, '_blank');
                                            } else {
                                                setStep(2);
                                                window.scrollTo({ top: 100, behavior: 'smooth' });
                                            }
                                        }}
                                        disabled={product.status === 'sold_out'}
                                        className={`w-2/3 font-semibold py-3.5 rounded-xl transition flex items-center justify-center gap-2 text-sm ${
                                            product.status === 'sold_out'
                                                ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                                                : 'bg-purple-600 hover:bg-purple-700 text-white'
                                        }`}
                                    >
                                        {product.status === 'sold_out' ? 'Stok Habis' : isServiceProduct ? <>Hubungi WhatsApp <ChevronRight size={16} /></> : <>Lanjutkan <ChevronRight size={16} /></>}
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
                                        <label className="block text-xs font-medium text-gray-400 mb-2">
                                            {isGameProduct ? 'ID Game & Server ID' : 'Alamat Email Gmail'}
                                        </label>
                                        <input
                                            name="email"
                                            type={isGameProduct ? "text" : "email"}
                                            value={formData.email}
                                            onChange={handleFormChange}
                                            placeholder={isGameProduct ? "Contoh: 12345678 (2012)" : "Contoh: nama@gmail.com"}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                                        />
                                        {isGameProduct && (
                                            <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
                                                <AlertTriangle size={12} className="text-yellow-500" />
                                                Pastikan ID & Server sudah benar. Proses top up 1-5 menit.
                                            </p>
                                        )}
                                    </div>
                                    {selectedVariant?.price === 0 ? (
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
                                                        ].map((opt) => (
                                                            <button
                                                                key={opt.value}
                                                                type="button"
                                                                onClick={() => setBudget(opt.value)}
                                                                className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                                                                    budget === opt.value
                                                                        ? 'border-purple-500 bg-purple-500/10 text-white shadow-[0_0_15px_rgba(147,51,234,0.1)]'
                                                                        : 'border-white/5 bg-white/2 text-gray-400 hover:border-white/15'
                                                                }`}
                                                            >
                                                                {opt.label}
                                                            </button>
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
                                                    placeholder={product.name?.toLowerCase().includes('web') ? "Contoh: Saya ingin website toko online yang ada fitur keranjang dan bayar otomatis..." : "Contoh: Saya ingin bot yang bisa auto reply, fitur download tiktok, dan integrasi payment..."}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 h-32 resize-none transition-colors"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-2">Metode Pembayaran</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { label: 'QRIS', sub: 'Manual', value: 'QRIS' },
                                                    { label: 'DANA', sub: 'Manual', value: 'DANA' }
                                                ].map(pm => (
                                                    <button
                                                        key={pm.value}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, payment_method: pm.value })}
                                                        className={`p-3.5 rounded-xl border text-center transition-all ${
                                                            formData.payment_method === pm.value
                                                                ? 'border-purple-500 bg-purple-500/10'
                                                                : 'border-white/10 hover:border-white/20'
                                                        }`}
                                                    >
                                                        <span className="block font-bold text-white text-sm">{pm.label}</span>
                                                        <span className="text-[11px] text-gray-400">{pm.sub}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Summary */}
                                <div className="bg-white/3 border border-white/5 rounded-xl p-4 mb-5 text-sm">
                                    <div className="flex justify-between text-gray-400 mb-1">
                                        <span>{selectedVariant?.name}</span>
                                        <span>{selectedVariant?.price > 0 ? `Rp ${selectedVariant.price.toLocaleString('id-ID')}` : 'Tanya via Chat'}</span>
                                    </div>
                                    {selectedVariant?.price > 0 && (
                                        <div className="flex justify-between text-white font-bold border-t border-white/10 pt-2 mt-2">
                                            <span>Total</span>
                                            <span className="text-purple-400">{totalToPay > 0 ? `Rp ${totalToPay.toLocaleString('id-ID')}` : 'Tanya via Chat'}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setStep(1);
                                            window.scrollTo({ top: 100, behavior: 'smooth' });
                                        }}
                                        className="w-1/3 bg-white/5 hover:bg-white/10 py-3.5 rounded-xl font-semibold text-white transition-colors border border-white/5 text-sm"
                                    >
                                        Kembali
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (selectedVariant?.price === 0) {
                                                handleCustomConsultation();
                                            } else {
                                                if (formData.wa_number && formData.email) {
                                                    setStep(3);
                                                    window.scrollTo({ top: 100, behavior: 'smooth' });
                                                }
                                                else Swal.fire({
                                                    icon: 'warning',
                                                    title: 'Upss...',
                                                    text: 'Mohon lengkapi WA dan Email',
                                                    background: '#0E0E0E',
                                                    color: '#fff',
                                                    confirmButtonColor: '#9333ea'
                                                });
                                            }
                                        }}
                                        className="w-2/3 bg-purple-600 hover:bg-purple-700 py-3.5 rounded-xl font-semibold text-white transition-colors flex items-center justify-center gap-2 text-sm"
                                    >
                                        {selectedVariant?.price === 0 ? 'Kirim ke WhatsApp' : `Bayar Rp ${totalToPay.toLocaleString('id-ID')}`} <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ════ STEP 3: PAYMENT ════ */}
                        {step === 3 && (
                            <div>
                                <div className="text-center mb-6">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Pembayaran</p>
                                    <p className="text-4xl font-extrabold text-white">{totalToPay > 0 ? `Rp ${totalToPay.toLocaleString('id-ID')}` : 'Chat Admin'}</p>
                                </div>

                                {/* Payment method detail */}
                                <div className="bg-white/3 border border-white/5 rounded-xl p-5 mb-5 text-center">
                                    {formData.payment_method === 'QRIS' ? (
                                        <div>
                                            <p className="text-sm text-gray-400 mb-4">Scan QR Code di bawah ini</p>
                                            <div className="bg-white rounded-2xl mx-auto w-52 p-2 mb-4">
                                                <img src="/qris.jpeg" alt="QRIS" className="w-full h-auto rounded-xl" />
                                            </div>
                                            
                                            <a 
                                                href="/qris.jpeg" 
                                                download="QRIS_noxarianet.jpeg"
                                                className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors mb-5 bg-purple-500/10 px-4 py-2 rounded-lg border border-purple-500/20"
                                            >
                                                <Download size={14} /> Simpan QR Code
                                            </a>

                                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4 text-left">
                                                <div className="flex gap-3 items-start">
                                                    <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
                                                    <div>
                                                        <p className="text-[11px] font-bold text-red-500 uppercase tracking-wider mb-1">Peringatan Keras! ⚠</p>
                                                        <p className="text-[11px] text-gray-300 leading-relaxed">
                                                            Pastikan nominal transfer **SAMA PERSIS** hingga digit terakhir: <span className="text-white font-bold underline">Rp {totalToPay.toLocaleString('id-ID')}</span>. 
                                                            Jika tidak sesuai, pesanan **TIDAK AKAN DIPROSES** dan dana dianggap hangus.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-sm text-gray-400 mb-4">Transfer DANA ke nomor berikut:</p>
                                            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-3 mb-4">
                                                <span className="text-xl font-mono font-bold text-white tracking-widest">085885084941</span>
                                                <button
                                                    onClick={() => copyToClipboard('085885084941')}
                                                    className={`p-1.5 rounded-lg transition-colors ${copied ? 'text-green-400 bg-green-500/10' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                                                    title="Salin nomor"
                                                >
                                                    <Copy size={16} />
                                                </button>
                                            </div>
                                            {copied && <p className="text-green-400 text-xs">✓ Nomor disalin!</p>}
                                        </div>
                                    )}
                                </div>

                                {/* Upload & Testimonial */}
                                <div className="space-y-4 mb-5">
                                    <div className="bg-white/3 border border-white/5 rounded-xl p-4">
                                        <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-3">
                                            <Upload size={14} className="text-purple-400" />
                                            Upload Bukti Transfer
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-600/20 file:text-purple-400 hover:file:bg-purple-600/30 transition-colors cursor-pointer"
                                        />
                                        {proofPreview && (
                                            <div className="mt-3 rounded-xl overflow-hidden border border-white/10 w-fit">
                                                <img src={proofPreview} alt="Preview" className="h-32 object-cover" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-white/3 border border-white/5 rounded-xl p-4">
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
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 h-20 resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Trust Badge */}
                                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-5">
                                    <Shield size={14} className="text-green-500" />
                                    <span>Transaksi Aman &amp; Bergaransi oleh noxarianet</span>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setStep(2);
                                            window.scrollTo({ top: 100, behavior: 'smooth' });
                                        }}
                                        className="w-1/3 bg-white/5 hover:bg-white/10 py-3.5 rounded-xl font-semibold text-white transition-colors border border-white/5 text-sm"
                                    >
                                        Kembali
                                    </button>
                                    <button
                                        onClick={submitOrder}
                                        disabled={isSubmitting || !proofImage}
                                        className={`w-2/3 py-3.5 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 ${
                                            isSubmitting || !proofImage
                                                ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                                                : 'bg-green-600 hover:bg-green-700 text-white'
                                        }`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Mengirim...
                                            </>
                                        ) : (
                                            <>✓ Konfirmasi</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default ProductPage;
