import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import ProductCard from './ProductCard';

/**
 * FeaturedProducts — Horizontal scrollable / grid of featured products.
 * @param {object} props
 * @param {Array} props.products - Featured products array
 * @param {boolean} props.loading - Loading state
 */
const FeaturedProducts = ({ products, loading }) => {
    if (loading) {
        return (
            <section className="mb-12">
                <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                    <Sparkles size={20} className="text-yellow-400" />
                    Produk Unggulan
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="bg-[#0E0E0E] border border-purple-500/25 rounded-2xl p-5 flex flex-col items-center text-center animate-pulse">
                            <div className="w-12 h-12 rounded-xl bg-white/5 mb-3" />
                            <div className="w-10 h-2.5 rounded bg-white/5 mb-2" />
                            <div className="w-16 h-3.5 rounded bg-white/5 mb-1" />
                            <div className="w-12 h-2 rounded bg-white/5" />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (!products || products.length === 0) return null;

    return (
        <section className="mb-12">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <Sparkles size={20} className="text-yellow-400" />
                Produk Unggulan
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {products.map((product, index) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03, duration: 0.3 }}
                    >
                        <ProductCard
                            product={product}
                            showPrice={product.is_service_table}
                        />
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default FeaturedProducts;
