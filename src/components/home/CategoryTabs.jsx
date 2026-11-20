import { motion } from 'framer-motion';
import { 
    Layers, 
    Smartphone, 
    Gamepad2, 
    Wallet 
} from 'lucide-react';

/**
 * Category tab definitions with modern Lucide icons.
 * Strictly NO EMOJIS used.
 */
const CATEGORY_TABS = [
    { id: 'all', label: 'Semua Produk', Icon: Layers },
    { id: 'aplikasi-premium', label: 'Aplikasi Premium', Icon: Smartphone },
    { id: 'game', label: 'Game', Icon: Gamepad2 },
    { id: 'e-wallet', label: 'E-Wallet', Icon: Wallet },
];

/**
 * CategoryTabs — Compact, frosted glass category tabs.
 * Modern glassmorphism, padat, without product count badges.
 */
const CategoryTabs = ({ activeTab, onTabChange }) => {
    return (
        <section className="mb-5 sm:mb-6 select-none">
            {/* Frosted Glass Tabs Row */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1 px-0.5">
                {CATEGORY_TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const TabIcon = tab.Icon;

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onTabChange(tab.id)}
                            className={`relative whitespace-nowrap px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-bold transition-all duration-200 border flex-shrink-0 cursor-pointer group active:scale-95 ${
                                isActive
                                    ? 'text-white border-purple-400/50 shadow-[0_4px_16px_rgba(124,58,237,0.28)] ring-1 ring-white/30'
                                    : 'bg-white/60 hover:bg-white/90 backdrop-blur-md text-slate-700 hover:text-purple-700 border-purple-100/70 hover:border-purple-300/80 shadow-xs hover:shadow-sm'
                            }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeCategoryGlass"
                                    className="absolute inset-0 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 rounded-xl sm:rounded-2xl shadow-inner"
                                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                                >
                                    {/* Glossy Top Glass Highlight */}
                                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent rounded-t-xl sm:rounded-t-2xl pointer-events-none" />
                                </motion.div>
                            )}

                            <span className="relative z-10 flex items-center gap-1.5">
                                <TabIcon 
                                    size={14} 
                                    className={`transition-colors flex-shrink-0 ${
                                        isActive 
                                            ? 'text-white' 
                                            : 'text-purple-500/70 group-hover:text-purple-600'
                                    }`} 
                                />
                                <span className="tracking-tight">{tab.label}</span>
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
