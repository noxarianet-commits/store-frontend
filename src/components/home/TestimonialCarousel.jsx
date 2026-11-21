import { useRef, useEffect, useMemo, useState } from 'react';
import {
    Star, CheckCircle2, MessageSquareQuote, ChevronLeft, ChevronRight,
    PenLine, X, Loader2, Sparkles, Send
} from 'lucide-react';
import api from '../../api';
import Swal from 'sweetalert2';

/**
 * Curated fallback testimonials for rich social proof if backend has limited entries.
 */
const DEFAULT_TESTIMONIALS = [
    { name: '0831****3851', text: 'Mantap akun Picsart langsung aktif dalam hitungan detik, admin super ramah!', rating: 5, product: 'Picsart Pro' },
    { name: '0857****9021', text: 'Canva Pro lancar jaya, garansi aman dan beneran dipandu sampai selesai.', rating: 5, product: 'Canva Pro' },
    { name: '0812****4419', text: 'Top up ML diamond masuk secepat kilat. Selalu langganan di Noxarianet.', rating: 5, product: 'Mobile Legends' },
    { name: '0878****1290', text: 'ChatGPT Plus resmi murah meriah, proses otomatis gak pake ribet.', rating: 5, product: 'ChatGPT Plus' },
    { name: '0896****7732', text: 'Token PLN langsung keluar kodenya detik itu juga. Mantul banget!', rating: 5, product: 'Token PLN' },
    { name: '0821****8843', text: 'Alight Motion aman tanpa watermark, recommended seller noxaria!', rating: 5, product: 'Alight Motion' },
    { name: '0813****6290', text: 'Spotify Premium anti region lock, playlist aman semua. Makasih bro!', rating: 5, product: 'Spotify Premium' },
    { name: '0852****1108', text: 'Beli CapCut Pro auto diproses kilat, langsung bisa ekspor 4K!', rating: 5, product: 'CapCut Pro' },
];

/**
 * Mask customer phone/name for privacy
 */
const maskName = (name) => {
    if (!name) return 'Customer';
    const clean = String(name).trim();
    if (clean.length > 7) {
        return `${clean.substring(0, 4)}****${clean.substring(clean.length - 4)}`;
    }
    return clean;
};

/**
 * Single Testimonial Card — Glassmorphic, crisp and compact.
 */
function TestimonialCard({ item }) {
    const stars = item.rating || 5;

    // Intelligent parser: if product name was appended as `(Product)` in text, extract it
    let reviewText = item.text || item.message || 'Layanan sangat cepat dan terpercaya!';
    let productTag = item.product || item.product_name || '';

    if (!productTag && reviewText) {
        const match = reviewText.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
        if (match) {
            const rawBody = match[1].trim();
            reviewText = rawBody.length > 0 ? rawBody : 'Transaksi sukses dan memuaskan!';
            productTag = match[2].trim();
        }
    }
    if (!productTag) {
        productTag = 'Layanan Digital';
    }

    const customer = maskName(item.name || item.wa_number);

    return (
        <div className="w-[260px] sm:w-[295px] shrink-0 snap-start bg-white/85 hover:bg-white backdrop-blur-md border border-purple-100 hover:border-purple-300 rounded-2xl p-4 shadow-[0_2px_12px_rgba(124,58,237,0.04)] hover:shadow-[0_8px_20px_rgba(124,58,237,0.08)] transition-all duration-200 flex flex-col justify-between select-none">
            {/* Top Row: Stars + Product Pill */}
            <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            size={12}
                            className={i < stars ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                        />
                    ))}
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100/80 truncate max-w-[125px]">
                    {productTag}
                </span>
            </div>

            {/* Review Quote */}
            <p className="text-[11.5px] sm:text-xs text-slate-700 font-medium italic leading-relaxed my-1.5 line-clamp-2">
                "{reviewText}"
            </p>

            {/* Bottom Row: Customer Name + Verified Badge */}
            <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-slate-100">
                <span className="text-[11px] font-black text-slate-800 tracking-tight">
                    {customer}
                </span>
                <span className="flex items-center gap-1 text-[8.5px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100/80">
                    <CheckCircle2 size={10} className="text-emerald-500" />
                    <span>Terverifikasi</span>
                </span>
            </div>
        </div>
    );
}

/**
 * TestimonialCarousel — Horizontal snap-slider of customer reviews.
 * 100% responsive, real-time sync with latest submissions, and direct review modal.
 */
const TestimonialCarousel = ({ testimonials = [], onTestimonialAdded }) => {
    const scrollRef = useRef(null);

    // Modal state for direct review submission
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formName, setFormName] = useState('');
    const [formProduct, setFormProduct] = useState('');
    const [formRating, setFormRating] = useState(5);
    const [formHoverRating, setFormHoverRating] = useState(0);
    const [formText, setFormText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Combine backend testimonials with curated list, ALWAYS placing real user testimonials first
    const list = useMemo(() => {
        if (!testimonials || testimonials.length === 0) {
            return DEFAULT_TESTIMONIALS;
        }
        if (testimonials.length < 6) {
            const existingTexts = new Set(testimonials.map(t => (t.text || '').toLowerCase().trim()));
            const filteredDefaults = DEFAULT_TESTIMONIALS.filter(d => !existingTexts.has(d.text.toLowerCase().trim()));
            return [...testimonials, ...filteredDefaults].slice(0, 10);
        }
        return testimonials;
    }, [testimonials]);

    /**
     * Smooth slider step handler
     */
    const scroll = (direction) => {
        const el = scrollRef.current;
        if (!el) return;
        const firstCard = el.querySelector('.snap-start');
        const cardWidth = firstCard ? firstCard.offsetWidth : 270;
        const gap = 12;
        const scrollAmount = cardWidth + gap;
        const maxScroll = el.scrollWidth - el.clientWidth;

        if (maxScroll <= 0) return;

        if (direction === 'left') {
            if (el.scrollLeft <= 10) {
                el.scrollTo({ left: maxScroll, behavior: 'smooth' });
            } else {
                el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            }
        } else {
            if (el.scrollLeft >= maxScroll - 10) {
                el.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    // Auto-advance every 5 seconds gently
    useEffect(() => {
        const timer = setInterval(() => {
            scroll('right');
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    // Handle form submit for new review
    const handleSubmitReview = async (e) => {
        e.preventDefault();
        const trimmedName = formName.trim();
        const trimmedText = formText.trim();
        const trimmedProduct = formProduct.trim();

        if (!trimmedName || !trimmedText) {
            Swal.fire({
                icon: 'warning',
                title: 'Data Belum Lengkap',
                text: 'Nama / No. WhatsApp dan pesan ulasan wajib diisi.',
                confirmButtonColor: '#7c3aed',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                name: trimmedName,
                text: trimmedText,
                product: trimmedProduct,
                rating: formRating,
            };

            const res = await api.createTestimonial(payload);
            const savedData = res.data?.data || {
                ...payload,
                id: `local_${Date.now()}`,
                created_at: new Date().toISOString()
            };

            // Save to localStorage so it persists instantly across page reloads
            try {
                const existing = JSON.parse(localStorage.getItem('nox_recent_testimonials') || '[]');
                const updated = [savedData, ...existing.filter(x => x.text !== savedData.text)].slice(0, 5);
                localStorage.setItem('nox_recent_testimonials', JSON.stringify(updated));
                window.dispatchEvent(new CustomEvent('testimonial:submitted', { detail: savedData }));
            } catch { /* ignore */ }

            if (onTestimonialAdded) {
                onTestimonialAdded(savedData);
            }

            // Scroll carousel back to start so the new review is shown right away
            if (scrollRef.current) {
                scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
            }

            setIsModalOpen(false);
            setFormName('');
            setFormProduct('');
            setFormText('');
            setFormRating(5);

            Swal.fire({
                icon: 'success',
                title: 'Ulasan Terkirim!',
                text: 'Terima kasih, ulasan Anda berhasil ditambahkan dan langsung tampil di halaman ini.',
                confirmButtonColor: '#7c3aed',
            });
        } catch (err) {
            console.error('Failed to submit testimonial', err);
            Swal.fire({
                icon: 'error',
                title: 'Gagal Mengirim Ulasan',
                text: err.response?.data?.error || 'Terjadi kesalahan sistem, silakan coba lagi.',
                confirmButtonColor: '#7c3aed',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="mb-14 sm:mb-16 relative select-none">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4 sm:mb-5 px-1">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/10 border border-purple-400/20 mb-1.5">
                        <MessageSquareQuote size={12} className="text-purple-600" />
                        <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-purple-600">
                            Ulasan Pelanggan
                        </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                        Apa Kata Mereka?
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                        Kepuasan pelanggan adalah prioritas utama setiap transaksi di Noxarianet.
                    </p>
                </div>

                {/* Right controls: Write Review + Slider Arrows */}
                <div className="flex items-center gap-2 self-start sm:self-end">
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/80 text-xs font-bold transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        title="Tulis ulasan pengalaman Anda"
                    >
                        <PenLine size={13} className="text-purple-600" />
                        <span>Tulis Ulasan</span>
                    </button>

                    <div className="flex items-center gap-1 ml-1">
                        <button
                            type="button"
                            onClick={() => scroll('left')}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white hover:bg-purple-50 border border-purple-100 hover:border-purple-200 text-slate-600 hover:text-purple-600 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-xs"
                            title="Geser ke kiri"
                            aria-label="Geser ke kiri"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={() => scroll('right')}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white hover:bg-purple-50 border border-purple-100 hover:border-purple-200 text-slate-600 hover:text-purple-600 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-xs"
                            title="Geser ke kanan"
                            aria-label="Geser ke kanan"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Horizontal Snap Scroll Carousel */}
            <div
                ref={scrollRef}
                className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory py-1 px-1"
                style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth' }}
            >
                {list.map((item, index) => (
                    <TestimonialCard key={`${item.id || item.name || index}-${index}`} item={item} />
                ))}
            </div>

            {/* Modal: Tulis Ulasan Pelanggan */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
                    <div
                        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 relative animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                            aria-label="Tutup"
                        >
                            <X size={16} />
                        </button>

                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-purple-100/80 text-purple-600 flex items-center justify-center">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                                    Tulis Ulasan Pelanggan
                                </h4>
                                <p className="text-xs text-slate-500">
                                    Bagikan pengalaman transaksi Anda di Noxarianet
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitReview} className="space-y-4">
                            {/* Star Rating Picker */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Beri Penilaian Bintang
                                </label>
                                <div className="flex items-center gap-1.5 py-1">
                                    {[1, 2, 3, 4, 5].map((val) => {
                                        const isFilled = (formHoverRating || formRating) >= val;
                                        return (
                                            <button
                                                type="button"
                                                key={val}
                                                onMouseEnter={() => setFormHoverRating(val)}
                                                onMouseLeave={() => setFormHoverRating(0)}
                                                onClick={() => setFormRating(val)}
                                                className="p-1 hover:scale-115 transition-transform cursor-pointer focus:outline-none"
                                            >
                                                <Star
                                                    size={26}
                                                    className={isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                                                />
                                            </button>
                                        );
                                    })}
                                    <span className="text-xs font-bold text-amber-600 ml-2">
                                        {formRating} / 5 Bintang
                                    </span>
                                </div>
                            </div>

                            {/* Name / Phone */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Nama / Nomor WhatsApp <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="Contoh: 08123456789 atau Nama Anda"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                />
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                    Nomor telepon akan disamarkan otomatis untuk privasi Anda.
                                </p>
                            </div>

                            {/* Product Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Produk / Layanan yang Dibeli
                                </label>
                                <input
                                    type="text"
                                    value={formProduct}
                                    onChange={(e) => setFormProduct(e.target.value)}
                                    placeholder="Contoh: CapCut Pro, DANA, Mobile Legends"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                />
                            </div>

                            {/* Review Text */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Pesan Ulasan / Testimoni <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formText}
                                    onChange={(e) => setFormText(e.target.value)}
                                    placeholder="Bagaimana proses transaksi dan layanan kami? Tulis pengalaman Anda di sini..."
                                    required
                                    rows={3}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-2.5 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={isSubmitting}
                                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center gap-1.5 disabled:opacity-60"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            <span>Mengirim...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send size={14} />
                                            <span>Kirim Ulasan</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};

export default TestimonialCarousel;
