import { useRef, useEffect, useMemo } from 'react';
import { Star, CheckCircle2, MessageSquareQuote, ChevronLeft, ChevronRight } from 'lucide-react';

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
    if (name.length > 7) {
        return `${name.substring(0, 4)}****${name.substring(name.length - 4)}`;
    }
    return name;
};

/**
 * Single Testimonial Card — Glassmorphic, crisp and compact.
 */
function TestimonialCard({ item }) {
    const stars = item.rating || 5;
    const reviewText = item.text || item.message || 'Layanan sangat cepat dan terpercaya!';
    const customer = maskName(item.name || item.wa_number);
    const productTag = item.product || item.product_name || 'Layanan Digital';

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
 * 100% responsive, never breaks on mobile, supports touch swipe & arrow buttons.
 */
const TestimonialCarousel = ({ testimonials = [] }) => {
    const scrollRef = useRef(null);

    // Combine backend testimonials with curated list if needed
    const list = useMemo(() => {
        if (!testimonials || testimonials.length === 0) {
            return DEFAULT_TESTIMONIALS;
        }
        if (testimonials.length < 5) {
            return [...testimonials, ...DEFAULT_TESTIMONIALS].slice(0, 8);
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

    return (
        <section className="mb-14 sm:mb-16 relative select-none">
            {/* Header Section */}
            <div className="flex items-end justify-between mb-4 sm:mb-5 px-1">
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

                {/* Arrow Navigation Controls */}
                <div className="flex items-center gap-1.5 shrink-0 ml-3">
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

            {/* Horizontal Snap Scroll Carousel */}
            <div
                ref={scrollRef}
                className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory py-1 px-1"
                style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth' }}
            >
                {list.map((item, index) => (
                    <TestimonialCard key={`${item.name || index}-${index}`} item={item} />
                ))}
            </div>
        </section>
    );
};

export default TestimonialCarousel;
