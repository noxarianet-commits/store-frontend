import { motion } from 'framer-motion';

const CATEGORY_TABS = [
    { id: 'all', label: 'Semua Produk' },
    { id: 'featured', label: 'Produk Pilihan' },
    { id: 'aplikasi-premium', label: 'Aplikasi Premium' },
    { id: 'game', label: 'Game' },
    { id: 'e-wallet', label: 'E-Wallet' },
];

const CategoryTabs = ({ activeTab, onTabChange, counts = {} }) => (
    <section className="catalog-tabs" aria-label="Filter katalog">
        {CATEGORY_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
                <button
                    key={tab.id}
                    type="button"
                    data-active={isActive}
                    aria-pressed={isActive}
                    onClick={() => onTabChange(tab.id)}
                >
                    {isActive && <motion.span layoutId="activeCatalogTab" className="sr-only" />}
                    {tab.label}
                    {counts[tab.id] !== undefined && <span className="catalog-count">{counts[tab.id]}</span>}
                </button>
            );
        })}
    </section>
);

export { CATEGORY_TABS };
export default CategoryTabs;
