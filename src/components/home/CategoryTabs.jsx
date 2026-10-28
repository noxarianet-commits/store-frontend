import { motion } from 'framer-motion';
import { 
    Layers, 
    Sparkles, 
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
    { id: 'featured', label: 'Produk Pilihan', Icon: Sparkles },
    { id: 'aplikasi-premium', label: 'Aplikasi Premium', Icon: Smartphone },
    { id: 'game', label: 'Game', Icon: Gamepad2 },
    { id: 'e-wallet', label: 'E-Wallet', Icon: Wallet },
];

/**
 * CategoryTabs — Horizontal scrollable category filter tabs with luminous pills.
 * @param {object} props
 * @param {string} props.activeTab - Currently active tab ID
 * @param {function} props.onTabChange - Callback when tab is clicked
 * @param {object} props.counts - Optional product counts per tab { all: N, featured: N, ... }
 */
const CategoryTabs = ({ activeTab, onTabChange, counts = {} }) => {
    return (
        <section className="mb-6">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1">
                {CATEGORY_TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const count = counts[tab.id];
                    const TabIcon = tab.Icon;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`relative whitespace-nowrap px-4 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all duration-300 border flex-shrink-0 group ${
                                isActive
                                    ? 'text-white border-transparent shadow-[0_4px_20px_rgba(124,58,237,0.32)] ring-1 ring-white/20'
                                    : 'bg-white/90 hover:bg-white text-slate-700 hover:text-purple-700 border-slate-200/90 hover:border-purple-300 shadow-sm hover:shadow transition-all'
                            }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTabBg"
                                    className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-700 rounded-full"
                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                <TabIcon 
                                    size={15} 
                                    className={`transition-colors flex-shrink-0 ${
                                        isActive 
                                            ? 'text-white' 
                                            : 'text-slate-400 group-hover:text-purple-600'
                                    }`} 
                                />
                                <span className="tracking-tight">{tab.label}</span>
                                {count !== undefined && (
                                    <span 
                                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full transition-colors ${
                                            isActive 
                                                ? 'bg-white/25 text-white backdrop-blur-sm' 
                                                : 'bg-slate-100 text-slate-600 group-hover:bg-purple-50 group-hover:text-purple-700'
                                        }`}
                                    >
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

