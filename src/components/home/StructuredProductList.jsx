import { motion } from 'framer-motion';
import { 
    Sparkles, 
    Bot, 
    Film, 
    Tv, 
    Music, 
    GraduationCap, 
    AppWindow, 
    Gamepad2, 
    Wallet, 
    Code2 
} from 'lucide-react';
import ProductCard from './ProductCard';

/**
 * Sub-category configuration for Aplikasi Premium.
 * NO EMOJIS used — strictly modern vector Lucide icons.
 */
const APP_SUB_CATEGORIES = [
    { 
        id: 'editing', 
        label: 'Video & Desain Editing', 
        Icon: Film, 
        color: 'text-purple-600', 
        bg: 'bg-purple-50 border-purple-100/80' 
    },
    { 
        id: 'ai-productivity', 
        label: 'AI & Produktivitas', 
        Icon: Bot, 
        color: 'text-indigo-600', 
        bg: 'bg-indigo-50 border-indigo-100/80' 
    },
    { 
        id: 'streaming', 
        label: 'Streaming & Film', 
        Icon: Tv, 
        color: 'text-pink-600', 
        bg: 'bg-pink-50 border-pink-100/80' 
    },
    { 
        id: 'music', 
        label: 'Musik & Audio', 
        Icon: Music, 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-50 border-emerald-100/80' 
    },
    { 
        id: 'education', 
        label: 'Edukasi & Bacaan', 
        Icon: GraduationCap, 
        color: 'text-amber-600', 
        bg: 'bg-amber-50 border-amber-100/80' 
    },
    { 
        id: 'other-apps', 
        label: 'Aplikasi Lainnya', 
        Icon: AppWindow, 
        color: 'text-blue-600', 
        bg: 'bg-blue-50 border-blue-100/80' 
    },
];

/**
 * Classifies an Aplikasi Premium item into its specific sub-category.
 */
function getAppSubCategory(product) {
    const name = (product.name || '').toLowerCase();
    
    // Video & Editing / Design (CapCut, Canva, dll. diletakkan teratas)
    if (/canva|capcut|alight|picsart|ibis|meitu|photoshop|lightroom|adobe|vsco|remini|filmora|corel|inshot|viva/.test(name)) {
        return 'editing';
    }
    // AI & Productivity
    if (/chatgpt|gpt|gemini|claude|deepseek|midjourney|copilot|perplexity|turnitin|ai\b|office|microsoft|365|gsuite|workspace|vpn|notion/.test(name)) {
        return 'ai-productivity';
    }
    // Streaming & Film
    if (/netflix|disney|hotstar|hbo|bstation|iqiyi|loklok|vidio|viu|wetv|prime|amazon|crunchyroll|cinema|catchplay|youtube premium|we tv/.test(name)) {
        return 'streaming';
    }
    // Music & Audio
    if (/spotify|apple music|music|resso|joox|deezer|tidal|soundcloud/.test(name)) {
        return 'music';
    }
    // Education & Books
    if (/duolingo|scribd|wattpad|fizzo|novel|zoom|camscanner|grammarly|quillbot|brainly|buku/.test(name)) {
        return 'education';
    }
    return 'other-apps';
}

/**
 * Section Header Component with cool Lucide Icon and gradient hairline divider.
 */
const SectionHeader = ({ Icon, title, color = 'text-purple-600', bg = 'bg-purple-50 border-purple-100/80' }) => (
    <div className="flex items-center gap-2.5 mb-3.5 mt-1">
        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${bg} flex items-center justify-center ${color} shadow-xs border flex-shrink-0`}>
            <Icon size={17} className="sm:w-[18px] sm:h-[18px]" />
        </div>
        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
            {title}
        </h3>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-purple-200/80 via-slate-200/50 to-transparent ml-2" />
    </div>
);

/**
 * Sub-Category Header for Aplikasi Premium.
 * Clean, lightweight inline icon without competing boxed squircle for perfect visual hierarchy.
 */
const SubCategoryHeader = ({ Icon, label, color = 'text-purple-600' }) => (
    <div className="flex items-center gap-2 mb-2.5 mt-5 first:mt-1 pt-1">
        <Icon size={15} className={`${color} flex-shrink-0`} />
        <h4 className="text-xs sm:text-sm font-bold text-slate-700 tracking-tight">
            {label}
        </h4>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-slate-200/80 via-slate-100/40 to-transparent ml-2" />
    </div>
);

/**
 * StructuredProductList — Renders categorized products with sub-categories for Aplikasi Premium,
 * and unified groups for Game and E-Wallet.
 */
const StructuredProductList = ({ products = [], activeTab = 'all', searchQuery = '' }) => {
    // 1. Separate products by main categories
    const appProducts = (products || []).filter(p => p.category === 'Aplikasi Premium');
    const gameProducts = products.filter(p => p.category === 'Game');
    const ewalletProducts = products.filter(p => p.category === 'E-Wallet');
    const serviceProducts = products.filter(p => p.is_service_table || p.category?.toLowerCase().includes('jasa'));
    const otherProducts = products.filter(p => 
        p.category !== 'Aplikasi Premium' && 
        p.category !== 'Game' && 
        p.category !== 'E-Wallet' && 
        !p.is_service_table && 
        !p.category?.toLowerCase().includes('jasa')
    );

    // 2. Sub-group Aplikasi Premium
    const appSubGroups = APP_SUB_CATEGORIES.map(sub => {
        const items = appProducts.filter(p => getAppSubCategory(p) === sub.id);
        return { ...sub, items };
    }).filter(sub => sub.items.length > 0);

    // Render helper for product grid with responsive gaps
    const renderGrid = (items) => (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mb-4">
            {items.map((product, index) => (
                <motion.div
                    key={product.id || index}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.015, duration: 0.2 }}
                >
                    <ProductCard
                        product={product}
                        showPrice={product.is_service_table}
                    />
                </motion.div>
            ))}
        </div>
    );

    // If searching, render grouped or flat search results
    if (searchQuery) {
        return (
            <div className="space-y-8">
                {renderGrid(products)}
            </div>
        );
    }

    // Specific Tab Filters
    if (activeTab === 'aplikasi-premium') {
        return (
            <div className="space-y-6">
                <SectionHeader 
                    Icon={Sparkles} 
                    title="Aplikasi Premium" 
                    color="text-purple-600" 
                    bg="bg-purple-50 border-purple-100" 
                />
                {appSubGroups.map(sub => (
                    <div key={sub.id} className="mb-4 last:mb-0">
                        <SubCategoryHeader 
                            Icon={sub.Icon} 
                            label={sub.label} 
                            color={sub.color} 
                        />
                        {renderGrid(sub.items)}
                    </div>
                ))}
            </div>
        );
    }

    if (activeTab === 'game') {
        return (
            <div>
                <SectionHeader 
                    Icon={Gamepad2} 
                    title="Top Up Game" 
                    color="text-indigo-600" 
                    bg="bg-indigo-50 border-indigo-100" 
                />
                {renderGrid(gameProducts)}
            </div>
        );
    }

    if (activeTab === 'e-wallet') {
        return (
            <div>
                <SectionHeader 
                    Icon={Wallet} 
                    title="Top Up E-Wallet" 
                    color="text-emerald-600" 
                    bg="bg-emerald-50 border-emerald-100" 
                />
                {renderGrid(ewalletProducts)}
            </div>
        );
    }

    if (activeTab === 'featured') {
        return (
            <div>
                <SectionHeader 
                    Icon={Sparkles} 
                    title="Produk Pilihan" 
                    color="text-purple-600" 
                    bg="bg-purple-50 border-purple-100" 
                />
                {renderGrid(products)}
            </div>
        );
    }

    // Default 'all' (Semua Produk) — Seamless Open Structure
    return (
        <div className="space-y-7 sm:space-y-9">
            {/* ═══ 1. APLIKASI PREMIUM (Paling Atas dengan Sub-Kategori) ═══ */}
            {appProducts.length > 0 && (
                <section className="mb-7 sm:mb-9 last:mb-0">
                    <SectionHeader 
                        Icon={Sparkles} 
                        title="Aplikasi Premium" 
                        color="text-purple-600" 
                        bg="bg-purple-50 border-purple-100" 
                    />
                    
                    {appSubGroups.map(sub => (
                        <div key={sub.id} className="mb-4 last:mb-0">
                            <SubCategoryHeader 
                                Icon={sub.Icon} 
                                label={sub.label} 
                                color={sub.color} 
                            />
                            {renderGrid(sub.items)}
                        </div>
                    ))}
                </section>
            )}

            {/* ═══ 2. GAME (1 Kategori Utuh) ═══ */}
            {gameProducts.length > 0 && (
                <section className="mb-7 sm:mb-9 last:mb-0">
                    <SectionHeader 
                        Icon={Gamepad2} 
                        title="Top Up Game" 
                        color="text-indigo-600" 
                        bg="bg-indigo-50 border-indigo-100" 
                    />
                    {renderGrid(gameProducts)}
                </section>
            )}

            {/* ═══ 3. E-WALLET (1 Kategori Utuh) ═══ */}
            {ewalletProducts.length > 0 && (
                <section className="mb-7 sm:mb-9 last:mb-0">
                    <SectionHeader 
                        Icon={Wallet} 
                        title="Top Up E-Wallet" 
                        color="text-emerald-600" 
                        bg="bg-emerald-50 border-emerald-100" 
                    />
                    {renderGrid(ewalletProducts)}
                </section>
            )}

            {/* ═══ 4. LAYANAN JASA & BOT (Jika Ada) ═══ */}
            {serviceProducts.length > 0 && (
                <section className="mb-7 sm:mb-9 last:mb-0">
                    <SectionHeader 
                        Icon={Code2} 
                        title="Layanan Jasa & Bot" 
                        color="text-blue-600" 
                        bg="bg-blue-50 border-blue-100" 
                    />
                    {renderGrid(serviceProducts)}
                </section>
            )}

            {/* ═══ 5. PRODUK LAINNYA (Jika Ada) ═══ */}
            {otherProducts.length > 0 && (
                <section className="mb-7 sm:mb-9 last:mb-0">
                    <SectionHeader 
                        Icon={AppWindow} 
                        title="Koleksi Digital Lainnya" 
                        color="text-slate-600" 
                        bg="bg-slate-100 border-slate-200" 
                    />
                    {renderGrid(otherProducts)}
                </section>
            )}
        </div>
    );
};

export default StructuredProductList;
