import { motion } from 'framer-motion';

/**
 * Category tab definitions with labels and filter logic.
 */
const CATEGORY_TABS = [
    { id: 'all', label: 'Semua Produk' },
    { id: 'featured', label: 'Produk Pilihan' },
    { id: 'aplikasi-premium', label: 'Aplikasi Premium' },
    { id: 'game', label: 'Game' },
    { id: 'e-wallet', label: 'E-Wallet' },
];

/**
 * CategoryTabs — Horizontal scrollable category filter tabs.
 * @param {object} props
 * @param {string} props.activeTab - Currently active tab ID
 * @param {function} props.onTabChange - Callback when tab is clicked
 * @param {object} props.counts - Optional product counts per tab { all: N, featured: N, ... }
 */
const CategoryTabs = ({ activeTab, onTabChange, counts = {} }) => {
    return (
        <section className="mb-8">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {CATEGORY_TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const count = counts[tab.id];

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`relative whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 border ${
                                isActive
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500/50 shadow-lg shadow-purple-600/20'
                                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
                            }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTabBg"
                                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full -z-10"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-1.5">
                                {tab.label}
                                {count !== undefined && (
                                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                                        isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-500'
                                    }`}>
                                        {count}
                                    </span>
                                )}
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
};

export { CATEGORY_TABS };
export default CategoryTabs;
