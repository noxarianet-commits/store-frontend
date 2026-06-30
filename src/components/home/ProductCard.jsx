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
    const iconColor = iconColorMap[product.icon] || 'bg-purple-50 text-purple-600 border border-purple-100';

    const isUrl = imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('/'));

    if (isUrl && !imageError) {
        return (
            <div className={`w-16 h-16 rounded-2xl overflow-hidden transition-all duration-300 mb-4 mt-1 group-hover:scale-110 border border-slate-100 bg-slate-50 flex items-center justify-center ${className}`}>
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
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 mb-4 mt-1 ${iconColor} group-hover:scale-110 ${className}`}>
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
    const badgeStyle = badgeColorMap[product.badgeColor] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' };
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
            className={`group relative bg-white hover:bg-purple-50/5 border border-purple-100 hover:border-purple-300 rounded-2xl p-5 transition-all duration-300 flex flex-col items-center text-center shadow-[0_2px_8px_rgba(124,58,237,0.02)] hover:shadow-[0_8px_20px_rgba(124,58,237,0.06)] ${isSoldOut ? 'opacity-60' : ''}`}
        >
            {isSoldOut && (
                <span className="absolute top-3 left-3 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border bg-red-50 text-red-600 border-red-100 z-10">
                    Habis
                </span>
            )}
            {product.badge && !isSoldOut && (
                <span className={`absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                    {product.badge}
                </span>
            )}
            <ProductIcon product={product} fallbackIcon={IconComp} />
            <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                {product.category}
            </span>
            <h3 className="text-sm font-extrabold text-slate-800 leading-tight mb-0.5 group-hover:text-purple-600 transition-colors">
                {product.name}
            </h3>
            {product.subtitle && (
                <p className={`text-[11px] ${showPrice ? 'text-purple-600 font-semibold mb-1 px-2 text-[9px]' : 'text-slate-500'}`}>
                    {product.subtitle}
                </p>
            )}
            {showPrice && (
                <p className="text-[11px] text-purple-600 font-bold">
                    {startingPrice > 0 ? `Mulai Rp ${startingPrice.toLocaleString('id-ID')}` : 'Tanya via Chat'}
                </p>
            )}
        </Link>
    );
};

export { ProductIcon };
export default ProductCard;
