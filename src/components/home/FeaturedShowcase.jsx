import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, ChevronLeft, ChevronRight, Smartphone, Wallet } from 'lucide-react';
import { iconMap, iconColorMap, isProductSoldOut } from '../../utils/iconConfig';

/**
 * FeaturedProductItem — Slim, compact card with soft glass design.
 * Featherweight, GPU-composited, zero scroll lag.
 */
function FeaturedProductItem({ product }) {
    const [imageError, setImageError] = useState(false);
    const isSoldOut = isProductSoldOut(product);
    const imageUrl = product.image || product.icon;
    const isUrl = imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('/'));

    const isEwallet = product.category === 'E-Wallet' || product.category?.toLowerCase().includes('wallet') || /dana|gopay|ovo|shopee|linkaja|maxim/i.test(product.name || '');
    const fallbackKey = product.icon || (isEwallet ? 'wallet' : 'smartphone');
    const FallbackIcon = iconMap[fallbackKey] || (isEwallet ? Wallet : Smartphone);
    const iconColor = iconColorMap[fallbackKey] || (isEwallet ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-400/30' : 'bg-purple-900/40 text-purple-200 border border-purple-300/30');

    const cleanDisplayName = (product.name || '')
        .replace(/^Saldo\s+/i, '')
        .replace(/\s*\(OkeConnect\)|\s*\(Sekalipay\)|\s*\(Fincloud\)/gi, '')
        .trim();

    // Link destination
    const isWebsiteService = product.name?.toLowerCase().includes('pembuatan website') || product.name?.toLowerCase().includes('jasa website');
    let productLink;
    if (isWebsiteService) {
        productLink = '/website-order';
    } else if (product.is_service_table) {
        productLink = `/service/${product.id}`;
    } else {
        productLink = `/product/${product.id}`;
    }

    return (
        <Link
            to={productLink}
            className="w-[105px] sm:w-[122px] shrink-0 snap-start group flex flex-col items-center transition-transform duration-150"
            title={product.name}
        >
            {/* Main Icon Box — Slimmer, sleek rounded square */}
            <div className="relative w-full aspect-square rounded-xl sm:rounded-2xl overflow-hidden shadow-sm group-hover:scale-105 group-hover:-translate-y-0.5 transition-all duration-150 border border-white/25 bg-white/10 flex items-center justify-center select-none backdrop-blur-sm">
                {isUrl && !imageError ? (
                    <img
                        src={imageUrl}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover rounded-xl sm:rounded-2xl pointer-events-none"
                        referrerPolicy="no-referrer"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className={`w-full h-full flex items-center justify-center ${iconColor}`}>
                        <FallbackIcon size={28} className="text-white drop-shadow-sm" />
                    </div>
                )}

                {/* Status Pill Badge (Tersedia / Habis) */}
                <div
                    className={`absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[7.5px] sm:text-[8px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-sm backdrop-blur-md z-10 ${isSoldOut
                        ? 'bg-rose-500/90 text-white border border-rose-300/40'
                        : 'bg-emerald-500/90 text-white border border-emerald-300/40'
                        }`}
                >
                    <span className={`w-1 h-1 rounded-full ${isSoldOut ? 'bg-rose-200' : 'bg-emerald-200 animate-pulse'}`} />
                    <span>{isSoldOut ? 'Habis' : 'Tersedia'}</span>
                </div>
            </div>

            {/* Bottom Glass Name Bar — Slim docked design */}
            <div className="mt-1.5 w-full bg-white/15 group-hover:bg-white/25 backdrop-blur-md border border-white/20 rounded-lg py-1 px-1.5 text-center transition-all duration-150 shadow-xs">
                <p className="text-[10px] sm:text-[11px] font-bold text-white truncate leading-tight tracking-wide">
                    {cleanDisplayName}
                </p>
            </div>
        </Link>
    );
}

/**
 * FeaturedShowcase — Full-width edge-to-edge sleek purple strip with cyber line pattern.
 * Soft purple gradient matching text color, slim compact height, guaranteed working navigation buttons,
 * and zero scroll lag.
 */
export default function FeaturedShowcase({ products = [] }) {
    const scrollRef = useRef(null);

    if (!products || products.length === 0) return null;

    /**
     * Smooth scroll handler:
     * - Dynamically calculates card widths and step offsets.
     * - Implements smooth wraparound at edges so clicking always works.
     * - Hardware accelerated, zero re-render overhead.
     */
    const scroll = (direction) => {
        const el = scrollRef.current;
        if (!el) return;

        const firstCard = el.querySelector('.snap-start');
        const cardWidth = firstCard ? firstCard.offsetWidth : 122;
        const gap = 14;
        const scrollDistance = (cardWidth + gap) * (el.clientWidth < 640 ? 2 : 3);
        const maxScroll = el.scrollWidth - el.clientWidth;

        if (maxScroll <= 0) return;

        let targetLeft;
        if (direction === 'left') {
            // Wrap to end if already near start
            if (el.scrollLeft <= 15) {
                targetLeft = maxScroll;
            } else {
                targetLeft = Math.max(0, el.scrollLeft - scrollDistance);
            }
        } else {
            // Wrap to start if already near end
            if (el.scrollLeft >= maxScroll - 15) {
                targetLeft = 0;
            } else {
                targetLeft = Math.min(maxScroll, el.scrollLeft + scrollDistance);
            }
        }

        el.scrollTo({
            left: targetLeft,
            behavior: 'smooth',
        });
    };

    return (
        <section
            className="w-full my-5 sm:my-7 relative overflow-hidden select-none"
            style={{ contain: 'content' }}
        >
            {/* ═══ FULL WIDTH STRIP CONTAINER ═══ */}
            <div className="relative w-full py-2.5 sm:py-3.5 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 border-y border-purple-400/35 shadow-[0_8px_25px_-5px_rgba(124,58,237,0.22)]">

                {/* ═══ BACKGROUND PATTERN: CYBER SPEED LINES (PURE CSS, ZERO LAG) ═══ */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                        backgroundImage: `repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 0px, rgba(255, 255, 255, 0.15) 1.5px, transparent 1.5px, transparent 14px)`,
                    }}
                />

                {/* ═══ BACKGROUND ACCENT: TECH CYBER SLASHES (LEFT & RIGHT SVG) ═══ */}
                <div className="absolute left-0 top-0 bottom-0 w-36 pointer-events-none overflow-hidden opacity-30 hidden sm:block">
                    <svg viewBox="0 0 144 100" fill="none" className="w-full h-full text-white/30" preserveAspectRatio="none">
                        <line x1="20" y1="0" x2="60" y2="100" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" />
                        <line x1="40" y1="0" x2="80" y2="100" stroke="currentColor" strokeWidth="3" />
                        <line x1="60" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="1.5" />
                        <line x1="80" y1="0" x2="120" y2="100" stroke="currentColor" strokeWidth="4" />
                    </svg>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-36 pointer-events-none overflow-hidden opacity-30 hidden sm:block">
                    <svg viewBox="0 0 144 100" fill="none" className="w-full h-full text-white/30" preserveAspectRatio="none">
                        <line x1="124" y1="0" x2="84" y2="100" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" />
                        <line x1="104" y1="0" x2="64" y2="100" stroke="currentColor" strokeWidth="3" />
                        <line x1="84" y1="0" x2="44" y2="100" stroke="currentColor" strokeWidth="1.5" />
                        <line x1="64" y1="0" x2="24" y2="100" stroke="currentColor" strokeWidth="4" />
                    </svg>
                </div>

                {/* ═══ SOFT AMBIENT LIGHTING OVERLAYS ═══ */}
                <div className="absolute top-0 left-1/4 w-96 h-full bg-white/10 blur-xl pointer-events-none -skew-x-12" />
                <div className="absolute bottom-0 right-1/4 w-80 h-full bg-pink-400/10 blur-xl pointer-events-none" />

                {/* ═══ INNER CONTAINER (CENTERED WITH EDGE PADDING) ═══ */}
                <div className="max-w-[1400px] mx-auto px-3.5 sm:px-6 lg:px-8 relative z-10">

                    {/* Header Row — Slim, compact height */}
                    <div className="flex items-center justify-between mb-2 sm:mb-2.5">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300 shadow-xs shrink-0">
                                <Crown size={13} className="text-amber-300 fill-amber-300/40" />
                            </div>
                            <h2 className="text-xs sm:text-sm font-extrabold text-white tracking-wide flex items-center gap-2">
                                Best Seller
                                <span className="inline-block text-[8.5px] font-bold uppercase bg-white/15 text-purple-100 border border-white/20 px-2 py-0.5 rounded-full">
                                    Top Choice
                                </span>
                            </h2>
                        </div>

                        {/* Navigation Arrows — Guaranteed functional, responsive, high-contrast & sleek */}
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => scroll('left')}
                                className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 border border-white/30 text-white flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-sm"
                                title="Geser ke kiri"
                                aria-label="Geser ke kiri"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                type="button"
                                onClick={() => scroll('right')}
                                className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 border border-white/30 text-white flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-sm"
                                title="Geser ke kanan"
                                aria-label="Geser ke kanan"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Horizontal Scroll Cards Row — Pure hardware accelerated, snap scrolling */}
                    <div
                        ref={scrollRef}
                        className="flex items-center gap-2.5 sm:gap-3.5 overflow-x-auto no-scrollbar py-1 snap-x snap-mandatory"
                        style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth' }}
                    >
                        {products.map((product) => (
                            <FeaturedProductItem key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
