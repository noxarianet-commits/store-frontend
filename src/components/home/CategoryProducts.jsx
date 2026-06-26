import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, Loader2 } from 'lucide-react';
import api from '../../api';
import ProductCard from './ProductCard';

/**
 * CategoryProducts — Lazy-loaded product grid for a selected category.
 * Fetches products via GET /api/home/category/:slug when visible.
 * @param {object} props
 * @param {string|null} props.categorySlug - Active category slug
 * @param {function} props.onClose - Callback to deselect category
 */
const CategoryProducts = ({ categorySlug, onClose }) => {
    const [products, setProducts] = useState([]);
    const [categoryInfo, setCategoryInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const sectionRef = useRef(null);

    useEffect(() => {
        if (!categorySlug) {
            setProducts([]);
            setCategoryInfo(null);
            return;
        }

        const fetchCategoryProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await api.get(`/home/category/${categorySlug}`);
                setProducts(res.data.products || []);
                setCategoryInfo(res.data.category || null);
            } catch (err) {
                console.error('[CategoryProducts] fetch error:', err.message);
                setError('Gagal memuat produk kategori ini.');
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryProducts();
    }, [categorySlug]);

    // Scroll into view when category is selected
    useEffect(() => {
        if (categorySlug && sectionRef.current) {
            setTimeout(() => {
                sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [categorySlug]);

    if (!categorySlug) return null;

    const isService = categoryInfo?.type === 'service';

    return (
        <AnimatePresence>
            <motion.section
                ref={sectionRef}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-12 scroll-mt-24"
            >
                {/* Section Header */}
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-white">
                        {categoryInfo?.name || 'Memuat...'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1.5"
                    >
                        <ChevronUp size={14} />
                        Tutup
                    </button>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-16">
                        <Loader2 size={28} className="text-purple-400 animate-spin" />
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-10">
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                {/* Products Grid */}
                {!loading && !error && (
                    <div className={`grid gap-4 ${
                        isService
                            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
                            : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                    }`}>
                        {products.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.02, duration: 0.25 }}
                            >
                                <ProductCard
                                    product={product}
                                    showPrice={isService}
                                />
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && products.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-sm text-gray-500">Belum ada produk di kategori ini.</p>
                    </div>
                )}
            </motion.section>
        </AnimatePresence>
    );
};

export default CategoryProducts;
