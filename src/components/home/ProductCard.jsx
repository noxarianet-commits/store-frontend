import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Smartphone } from 'lucide-react';
import { iconMap, iconColorMap, badgeColorMap, isProductSoldOut } from '../../utils/iconConfig';

const ProductIcon = ({ product, fallbackIcon: FallbackIcon, className = '' }) => {
    const [imageError, setImageError] = useState(false);
    const imageUrl = product.image || product.icon;
    const iconColor = iconColorMap[product.icon] || 'bg-[#e4f1ed] text-[#247d78]';
    const isUrl = imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('/'));

    if (isUrl && !imageError) {
        return (
            <div className={`catalog-card-icon ${className}`}>
                <img src={imageUrl} alt={product.name} referrerPolicy="no-referrer" onError={() => setImageError(true)} />
            </div>
        );
    }
    return <div className={`catalog-card-icon ${iconColor} ${className}`}><FallbackIcon size={25} strokeWidth={1.8} /></div>;
};

const ProductCard = ({ product, showPrice = false }) => {
    const IconComp = iconMap[product.icon] || Smartphone;
    const badgeStyle = badgeColorMap[product.badgeColor] || {};
    const isSoldOut = isProductSoldOut(product);
    const isWebsiteService = product.name?.toLowerCase().includes('pembuatan website') || product.name?.toLowerCase().includes('jasa website');
    const productLink = isWebsiteService ? '/website-order' : product.is_service_table ? `/service/${product.id}` : `/product/${product.id}`;
    const startingPrice = showPrice && product.variants?.length > 0 ? Math.min(...product.variants.map(v => v.price)) : 0;

    return (
        <Link to={productLink} className={`catalog-card group relative block ${isSoldOut ? 'opacity-60' : ''}`}>
            {isSoldOut && <span className="catalog-card-sold">Habis</span>}
            {product.badge && !isSoldOut && <span className={`catalog-card-badge ${badgeStyle.text || ''}`}>{product.badge}</span>}
            <ProductIcon product={product} fallbackIcon={IconComp} />
            <span className="catalog-card-category">{product.category}</span>
            <h3>{product.name}</h3>
            {product.subtitle && <p className="catalog-card-subtitle">{product.subtitle}</p>}
            {showPrice && <p className="catalog-card-price">{startingPrice > 0 ? `Mulai Rp ${startingPrice.toLocaleString('id-ID')}` : 'Tanya via Chat'}</p>}
        </Link>
    );
};

export { ProductIcon };
export default ProductCard;
