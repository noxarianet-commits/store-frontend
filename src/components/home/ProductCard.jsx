import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Smartphone } from 'lucide-react';
import { iconMap, iconColorMap, badgeColorMap, isProductSoldOut } from '../../utils/iconConfig';

/**
 * ProductIcon — Renders product image or fallback Lucide icon.
 */
const ProductIcon = ({ product, fallbackIcon: FallbackIcon, className = '' }) => {
    const [imageError, setImageError] = useState(false);
    const imageUrl = product.image || product.icon;
    const iconColor = iconColorMap[product.icon] || 'bg-white/5 text-gray-400';

    const isUrl = imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('/'));

    if (isUrl && !imageError) {
        return (
            <div className={`w-16 h-16 rounded-2xl overflow-hidden transition-all duration-300 mb-4 mt-1 group-hover:scale-110 group-hover:brightness-125 border border-white/5 bg-white/5 flex items-center justify-center ${className}`}>
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-2xl"
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                />
            </div>
        );
    }

    return (
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 mb-4 mt-1 ${iconColor} group-hover:scale-110 group-hover:brightness-125 ${className}`}>
            <FallbackIcon size={30} />
        </div>
    );
};

/**
 * ProductCard — Reusable card for products and services.
 * @param {object} props
 * @param {object} props.product - Product data
 * @param {boolean} [props.showPrice] - Whether to show starting price (for services)
 */
const ProductCard = ({ product, showPrice = false }) => {
    const IconComp = iconMap[product.icon] || Smartphone;
    const badgeStyle = badgeColorMap[product.badgeColor] || { bg: 'bg-gray-500/15', text: 'text-gray-400', border: 'border-gray-500/20' };
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

    // Starting price for services
    const startingPrice = showPrice && product.variants && product.variants.length > 0
        ? Math.min(...product.variants.map(v => v.price))
        : 0;

    return (
        <Link
            to={productLink}
            className={`group relative bg-[#0E0E0E] hover:bg-[#151515] border border-purple-500/25 hover:border-purple-400/50 rounded-2xl p-5 transition-all duration-200 flex flex-col items-center text-center ${isSoldOut ? 'opacity-60' : ''}`}
        >
            {isSoldOut && (
                <span className="absolute top-3 left-3 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border bg-red-500/20 text-red-400 border-red-500/30 z-10">
                    Habis
                </span>
            )}
            {product.badge && !isSoldOut && (
                <span className={`absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                    {product.badge}
                </span>
            )}
            <ProductIcon product={product} fallbackIcon={IconComp} />
            <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-medium">
                {product.category}
            </span>
            <h3 className="text-sm font-extrabold text-white leading-tight mb-0.5">
                {product.name}
            </h3>
            {product.subtitle && (
                <p className={`text-[11px] ${showPrice ? 'text-purple-400/90 italic mb-1 px-2 text-[9px]' : 'text-gray-400'}`}>
                    {product.subtitle}
                </p>
            )}
            {showPrice && (
                <p className="text-[11px] text-purple-400 font-medium">
                    {startingPrice > 0 ? `Mulai Rp ${startingPrice.toLocaleString('id-ID')}` : 'Tanya via Chat'}
                </p>
            )}
        </Link>
    );
};

export { ProductIcon };
export default ProductCard;
