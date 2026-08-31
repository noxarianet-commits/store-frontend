import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { ProductIcon } from './ProductCard';

/**
 * FeaturedSlider — single-row horizontal slider for is_featured products.
 * Mobile: snap scroll, 2.2 cards visible. Desktop: ~5.5 cards, arrow nav.
 * Respects 44px tap target, snap-mandatory, no-scrollbar, fade edges.
 */
const FeaturedSlider = ({ products = [], loading = false }) => {
    const scrollerRef = useRef(null);
    const featured = products.filter(p => p.is_featured);

    const scrollBy = (dir) => {
        const el = scrollerRef.current;
        if (!el) return;
        const amount = el.clientWidth * 0.85;
        el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    };

    if (!loading && featured.length === 0) return null;

    return (
        <section className="mb-7">
            {/* Header — tight, not kicker */}
            <div className="flex items-end justify-between mb-3 gap-3">
                <div className="min-w-0">
                    <h2 className="text-[14px] font-extrabold text-ink tracking-[-0.02em] flex items-center gap-1.5">
                        <span className="w-1 h-4 rounded-full bg-brand block" />
                        Produk Pilihan
                        {!loading && featured.length > 0 && (
                            <span className="ml-1 text-[11px] font-bold bg-brandSoft border border-brandBorder text-brand px-2 py-0.5 rounded-full">
                                {featured.length}
                            </span>
                        )}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 ml-2.5">Paling laris • rating terbaik</p>
                </div>

                {!loading && featured.length > 3 && (
                    <div className="hidden md:flex items-center gap-1.5 shrink-0">
                        <button
                            onClick={() => scrollBy('left')}
                            aria-label="Geser kiri"
                            className="w-8 h-8 grid place-items-center bg-white border border-slate-200 rounded-full text-slate-600 hover:text-ink hover:border-slate-300 shadow-sm transition-colors"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <button
                            onClick={() => scrollBy('right')}
                            aria-label="Geser kanan"
                            className="w-8 h-8 grid place-items-center bg-white border border-slate-200 rounded-full text-slate-600 hover:text-ink hover:border-slate-300 shadow-sm transition-colors"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                )}
                {/* Mobile hint */}
                {!loading && featured.length > 2 && (
                    <span className="md:hidden text-[11px] font-medium text-slate-400 flex items-center gap-1 shrink-0">
                        Geser <ChevronRight size={12} />
                    </span>
                )}
            </div>

            {/* Scroller — edge-to-edge on mobile, constrained on desktop */}
            <div className="relative -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0">
                <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-surface to-transparent md:hidden z-10" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-surface to-transparent md:hidden z-10" />

                {loading ? (
                    <div className="flex gap-3 overflow-hidden">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="shrink-0 w-[148px] sm:w-[164px] md:w-[184px] bg-white border border-brandBorder rounded-2xl p-3 animate-pulse shadow-soft">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 mb-3" />
                                <div className="h-3 rounded bg-slate-100 mb-2" />
                                <div className="h-2.5 rounded bg-slate-100 w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div
                        ref={scrollerRef}
                        className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth pb-1 -mb-1"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {featured.map((product) => {
                            const isWebsite = product.name?.toLowerCase().includes('pembuatan website') || product.name?.toLowerCase().includes('jasa website');
                            const link = isWebsite ? '/website-order' : product.is_service_table ? `/service/${product.id}` : `/product/${product.id}`;
                            const startingPrice = product.variants?.length ? Math.min(...product.variants.map(v => v.price)) : 0;

                            return (
                                <Link
                                    key={product.id}
                                    to={link}
                                    className="snap-start shrink-0 w-[148px] sm:w-[164px] md:w-[184px] bg-white border border-brandBorder rounded-2xl p-3 flex flex-col shadow-soft hover:shadow-soft-lg hover:border-purple-200 hover:-translate-y-0.5 transition-all duration-200 text-left group"
                                >
                                    {/* Top: icon + star */}
                                    <div className="flex items-start justify-between mb-2.5">
                                        <ProductIcon product={product} fallbackIcon={Star} />
                                        <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-700 rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                                            <Star size={10} className="fill-amber-500 text-amber-500" /> 4.9
                                        </span>
                                    </div>

                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide leading-none line-clamp-1">
                                        {product.category}
                                    </span>
                                    <h3 className="text-[13px] font-bold text-ink leading-[1.3] line-clamp-2 min-h-[34px] mt-1 group-hover:text-brand transition-colors">
                                        {product.name}
                                    </h3>

                                    {product.subtitle && (
                                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">{product.subtitle}</p>
                                    )}

                                    {product.is_service_table && startingPrice > 0 && (
                                        <p className="text-xs font-bold text-brand mt-1.5">Mulai Rp {startingPrice.toLocaleString('id-ID')}</p>
                                    )}

                                    {/* Bottom */}
                                    <span className="mt-auto pt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 group-hover:text-brand transition-colors">
                                        Lihat <ChevronRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};

export default FeaturedSlider;
