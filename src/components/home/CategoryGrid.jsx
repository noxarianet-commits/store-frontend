import { motion } from 'framer-motion';
import { Smartphone, Gamepad2, Wallet, Globe, Package } from 'lucide-react';

/**
 * Default icon mapping for category slugs.
 */
const categoryDefaultIcons = {
    'aplikasi-premium': Smartphone,
    'top-up-game': Gamepad2,
    'transfer-e-wallet': Wallet,
    'layanan-jasa-bot': Globe,
};

/**
 * Gradient styles for category cards by slug.
 */
const categoryGradients = {
    'aplikasi-premium': 'from-indigo-500/20 to-purple-600/10 border-indigo-500/30 hover:border-indigo-400/50',
    'top-up-game': 'from-yellow-500/20 to-orange-600/10 border-yellow-500/30 hover:border-yellow-400/50',
    'transfer-e-wallet': 'from-emerald-500/20 to-teal-600/10 border-emerald-500/30 hover:border-emerald-400/50',
    'layanan-jasa-bot': 'from-blue-500/20 to-cyan-600/10 border-blue-500/30 hover:border-blue-400/50',
};

const categoryIconColors = {
    'aplikasi-premium': 'text-indigo-400',
    'top-up-game': 'text-yellow-400',
    'transfer-e-wallet': 'text-emerald-400',
    'layanan-jasa-bot': 'text-blue-400',
};

/**
 * CategoryGrid — Grid of clickable category cards.
 * @param {object} props
 * @param {Array} props.categories - Array of category objects
 * @param {string|null} props.activeCategory - Currently selected category slug
 * @param {function} props.onCategoryClick - Callback when category is clicked
 */
const CategoryGrid = ({ categories, activeCategory, onCategoryClick }) => {
    if (!categories || categories.length === 0) return null;

    return (
        <section className="mb-10">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <Package size={20} className="text-purple-400" />
                Kategori Produk
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {categories.map((category, index) => {
                    const IconComp = categoryDefaultIcons[category.slug] || Package;
                    const gradient = categoryGradients[category.slug] || 'from-gray-500/20 to-gray-600/10 border-gray-500/30 hover:border-gray-400/50';
                    const iconColor = categoryIconColors[category.slug] || 'text-gray-400';
                    const isActive = activeCategory === category.slug;

                    return (
                        <motion.button
                            key={category.slug}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                            onClick={() => onCategoryClick(category.slug)}
                            className={`relative bg-gradient-to-br ${gradient} rounded-2xl p-4 sm:p-5 border transition-all duration-200 text-left group cursor-pointer ${
                                isActive ? 'ring-2 ring-purple-500/50 scale-[0.97]' : 'hover:scale-[1.02]'
                            }`}
                        >
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-black/20 flex items-center justify-center mb-3 ${iconColor} group-hover:scale-110 transition-transform`}>
                                <IconComp size={22} />
                            </div>
                            <h3 className="text-sm font-bold text-white leading-tight mb-1">
                                {category.name}
                            </h3>
                            <p className="text-[11px] text-gray-400">
                                {category.product_count} produk
                            </p>
                            {isActive && (
                                <motion.div
                                    layoutId="activeCategoryIndicator"
                                    className="absolute bottom-2 right-3 w-2 h-2 bg-purple-400 rounded-full"
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </section>
    );
};

export default CategoryGrid;
