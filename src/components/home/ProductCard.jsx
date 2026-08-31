import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Smartphone } from 'lucide-react';
import { iconMap, iconColorMap, badgeColorMap, isProductSoldOut } from '../../utils/iconConfig';

/**
 * ProductIcon — 56px container, image cover, fallback brand tint.
 * No geometric mask pretending organic — just rounded-2xl.
 */
const ProductIcon = ({ product, fallbackIcon: FallbackIcon }) => {
    const [imageError, setImageError] = useState(false);
    const imageUrl = product.image || product.icon;
    const iconColor = iconColorMap[product.icon] || 'bg-brandSoft text-brand border border-brandBorder';

    const isUrl = imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('/'));

    if (isUrl && !imageError) {
        return (
            <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-slate-100 bg-white flex items-center justify-center">
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    onError={() => setImageError(true)}
                />
            </div>
        );
    }

    return (
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${iconColor}`}>
            <FallbackIcon size={26} strokeWidth={1.9} />
        </div>
    );
};

/**
 * ProductCard — refined: 16px radius, 4px more breathing, solid hover (border + lift),
 * not scale-on-icon. Inline sold-out, not overlay.
 */
const ProductCard = ({ product, showPrice = false }) => {
    const IconComp = iconMap[product.icon] || Smartphone;
    const badgeStyle = badgeColorMap[product.badgeColor] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' };
    const isSoldOut = isProductSoldOut(product);

    // Determine link target
    const isWebsiteService = product.name?.toLowerCase().includes('pembuatan website') || product.name?.toLowerCase().includes('jasa website');
    let productLink;
    if (isWebsiteService) {
        productLink = '/website-order';
    } else if (product.is_service_table) {
        productLink = `/service/${product.id}`;
    } else {
        productLink = `/product/${product.id}`;
    }

    const startingPrice = showPrice && product.variants && product.variants.length > 0
        ? Math.min(...product.variants.map(v => v.price))
        : 0;

    return (
        <Link
            to={productLink}
            className={`group relative bg-white border rounded-2xl p-4 flex flex-col items-start text-left transition-all duration-300 shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 ${
                isSoldOut ? 'opacity-60 border-slate-200' : 'border-brandBorder hover:border-purple-300'
            }`}
        >
            {/* Top row: icon + badge */}
            <div className="flex items-start justify-between w-full mb-3">
                <ProductIcon product={product} fallbackIcon={IconComp} />
                <div className="flex flex-col items-end gap-1.5">
                    {isSoldOut ? (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border bg-red-50 text-red-600 border-red-100">
                            Habis
                        </span>
                    ) : product.badge ? (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                            {product.badge}
                        </span>
                    ) : null}
                </div>
            </div>

            {/* Category — 10px uppercase, muted but 4.5:1 */}
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.08em] leading-none mb-1.5">
                {product.category}
            </span>

            {/* Name — 13px, line-clamp 2, measure tight */}
            <h3 className="text-[13px] font-bold text-ink leading-[1.35] line-clamp-2 min-h-[36px] group-hover:text-brand transition-colors">
                {product.name}
            </h3>

            {/* Subtitle / price */}
            {product.subtitle && (
                <p className={`text-[11px] leading-snug line-clamp-1 mt-1 ${showPrice ? 'text-slate-500' : 'text-slate-500'}`}>
                    {product.subtitle}
                </p>
            )}
            {showPrice && (
                <p className="text-[12px] font-bold text-brand mt-1">
                    {startingPrice > 0 ? `Mulai Rp ${startingPrice.toLocaleString('id-ID')}` : 'Tanya via Chat'}
                </p>
            )}

            {/* Bottom affordance — subtle arrow on hover, not needed for sold out */}
            {!isSoldOut && (
                <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 group-hover:text-brand transition-colors">
                    Lihat detail
                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </span>
            )}
        </Link>
    );
};

export { ProductIcon };
export default ProductCard;
