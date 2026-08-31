import { motion } from 'framer-motion';

/**
 * Category tabs — pill controls, 40px height, solid active state (no gradient),
 * counts in muted pill. Horizontal scroll with snap.
 */
const CATEGORY_TABS = [
    { id: 'all', label: 'Semua Produk' },
    { id: 'featured', label: 'Pilihan' },
    { id: 'aplikasi-premium', label: 'Aplikasi Premium' },
    { id: 'game', label: 'Game' },
    { id: 'e-wallet', label: 'E-Wallet' },
];

const CategoryTabs = ({ activeTab, onTabChange, counts = {} }) => {
    return (
        <section className="mb-7">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1 snap-x snap-mandatory">
                {CATEGORY_TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const count = counts[tab.id];

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`relative whitespace-nowrap h-10 px-4 md:px-5 rounded-full text-[13px] md:text-[13px] font-semibold transition-all duration-200 border snap-start shrink-0 ${
                                isActive
                                    ? 'text-white border-brand bg-brand shadow-[0_2px_10px_rgba(124,58,237,0.22)]'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-ink hover:border-slate-300 shadow-sm'
                            }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTabBg"
                                    className="absolute inset-0 bg-brand rounded-full"
                                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-1.5">
                                {tab.label}
                                {count !== undefined && (
                                    <span
                                        className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                                            isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
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
