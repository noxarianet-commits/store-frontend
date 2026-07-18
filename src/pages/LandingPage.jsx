import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Megaphone, X, Loader2, ChevronDown, ChevronUp, ShoppingBag, CheckCircle2 } from 'lucide-react';
import api from '../api';
import HeroSection from '../components/home/HeroSection';
import CategoryTabs from '../components/home/CategoryTabs';
import ProductCard from '../components/home/ProductCard';
import TestimonialCarousel from '../components/home/TestimonialCarousel';

/**
 * Filter products by active tab and search query.
 * @param {Array} products - All products
 * @param {string} activeTab - Active category tab ID
 * @param {string} searchQuery - Search query string
 * @returns {Array} Filtered products
 */
function filterProducts(products, activeTab, searchQuery) {
    let filtered = products;

    // Filter by category tab
    switch (activeTab) {
        case 'featured':
            filtered = filtered.filter(p => p.is_featured);
            break;
        case 'aplikasi-premium':
            filtered = filtered.filter(p => p.category === 'Aplikasi Premium');
            break;
        case 'game':
            filtered = filtered.filter(p => p.category === 'Game');
            break;
        case 'e-wallet':
            filtered = filtered.filter(p => p.category === 'E-Wallet');
            break;
        case 'all':
        default:
            break;
    }

    // Filter by search query
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(p =>
            p.name?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q)
        );
    }

    return filtered;
}

/**
 * Compute product counts per tab for badge display.
 * @param {Array} products - All products
 * @returns {object} Counts keyed by tab ID
 */
function computeCounts(products) {
    return {
        all: products.length,
        featured: products.filter(p => p.is_featured).length,
        'aplikasi-premium': products.filter(p => p.category === 'Aplikasi Premium').length,
        game: products.filter(p => p.category === 'Game').length,
        'e-wallet': products.filter(p => p.category === 'E-Wallet').length,
    };
}

const LandingPage = () => {
    const [homeData, setHomeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    // Info Modal state
    const [showInfoModal, setShowInfoModal] = useState(false);

    const settings = homeData?.settings || {
        shop_status: { isOpen: true, message: '' },
        site_content: { heroTitle: 'Solusi Digital Cerdas,', heroSubtitle: 'Untuk Kebutuhan Tanpa Batas.', heroDesc: 'Tingkatkan produktivitas dan hiburanmu dengan layanan premium terjangkau.' },
        info_modal_text: '',
        info_modal_active: true,
    };

    const handleCloseInfoModal = () => {
        setShowInfoModal(false);
    };

    const handleDismiss24h = () => {
        const expiryTime = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem('info_modal_dismissed_until', expiryTime.toString());
        setShowInfoModal(false);
    };

    const handleJoinWA = (e) => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
            e.preventDefault();
            window.location.href = 'https://chat.whatsapp.com/CbKJDpk99Hm0ItiWhDY7Kb?s=cl&p=a&ilr=4&amv=3';
        }
    };

    // Single API call to fetch all home data
    useEffect(() => {
        const fetchHomeData = async () => {
            setLoading(true);
            try {
                const res = await api.get('/home');
                setHomeData(res.data);

                // Cek apakah user memilih untuk dismiss selama 24 jam
                const dismissedUntil = localStorage.getItem('info_modal_dismissed_until');
                const now = Date.now();
                if (!dismissedUntil || now > parseInt(dismissedUntil, 10)) {
                    setShowInfoModal(true);
                }
            } catch (err) {
                console.error('Failed to fetch home data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHomeData();
    }, []);

    // All products from home data
    const allProducts = homeData?.all_products || [];
    const filteredProducts = filterProducts(allProducts, activeTab, searchQuery);
    const counts = computeCounts(allProducts);

    return (
        <div className="w-full font-sans text-gray-200 min-h-screen bg-grid-pattern">

            {/* ═══ MARQUEE STATUS ═══ */}
            {settings.shop_status?.message && (
                <div className={`w-full border-b py-2 overflow-hidden whitespace-nowrap ${
                    settings.shop_status.isOpen === false 
                        ? 'bg-red-600/10 border-red-500/10' 
                        : 'bg-purple-600/10 border-purple-500/10'
                }`}>
                    <div className={`animate-marquee inline-block text-[10px] font-bold uppercase tracking-[0.2em] ${
                        settings.shop_status.isOpen === false ? 'text-red-400' : 'text-purple-400'
                    }`}>
                        {Array(6).fill(
                            settings.shop_status.isOpen === false 
                                ? `🔴 TOKO SEDANG TUTUP — ${settings.shop_status.message}`
                                : settings.shop_status.message
                        ).join(' \u00A0•\u00A0 ')}
                    </div>
                </div>
            )}

            {/* ═══ INFO MODAL ═══ */}
            <InfoModal
                show={showInfoModal && settings.info_modal_active !== false}
                settings={settings}
                onClose={handleCloseInfoModal}
                onDismiss24h={handleDismiss24h}
                onJoinWA={handleJoinWA}
            />

            {/* ═══ HEADER ═══ */}
            <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-purple-100/50 shadow-sm shadow-purple-600/[0.01]">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2.5">
                        <img src="/logo.png" alt="noxarianet" className="w-9 h-9 rounded-lg object-contain" />
                        <span className="text-xl font-bold tracking-tight text-slate-900">noxaria<span className="text-purple-600">net</span></span>
                    </Link>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6">
                <HeroSection
                    settings={settings}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />

                <CategoryTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    counts={counts}
                />

                {/* ═══ PRODUCT GRID ═══ */}
                <section className="mb-12">
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="bg-white border border-purple-100 rounded-2xl p-5 flex flex-col items-center text-center animate-pulse shadow-sm">
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 mb-3" />
                                    <div className="w-10 h-2.5 rounded bg-slate-100 mb-2" />
                                    <div className="w-16 h-3.5 rounded bg-slate-100 mb-1" />
                                    <div className="w-12 h-2 rounded bg-slate-100" />
                                </div>
                            ))}
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-sm text-gray-500">
                                {searchQuery
                                    ? `Tidak ada produk yang cocok dengan "${searchQuery}"`
                                    : 'Belum ada produk di kategori ini.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredProducts.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.02, duration: 0.25 }}
                                >
                                    <ProductCard
                                        product={product}
                                        showPrice={product.is_service_table}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>

                {/* ═══ STATS SECTION ═══ */}
                <section className="mb-10 max-w-sm mx-auto text-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-600">Statistik Terpercaya</span>
                    <h3 className="text-sm font-extrabold text-slate-900 mt-1 mb-4">Dipercaya Ribuan Pengguna</h3>
                    <div className="grid grid-cols-2 gap-3.5">
                        <div className="bg-white border border-slate-100 rounded-2xl p-3.5 flex flex-col items-center justify-center shadow-[0_2px_10px_-4px_rgba(124,58,237,0.08)]">
                            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-2">
                                <ShoppingBag size={18} />
                            </div>
                            <span className="text-base font-black text-emerald-600 leading-none">10.000+</span>
                            <span className="text-[10px] font-semibold text-slate-400 mt-1.5">Total Transaksi</span>
                        </div>
                        <div className="bg-white border border-slate-100 rounded-2xl p-3.5 flex flex-col items-center justify-center shadow-[0_2px_10px_-4px_rgba(124,58,237,0.08)]">
                            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-2">
                                <CheckCircle2 size={18} />
                            </div>
                            <span className="text-base font-black text-purple-600 leading-none">10.000+</span>
                            <span className="text-[10px] font-semibold text-slate-400 mt-1.5">Pesanan Berhasil</span>
                        </div>
                    </div>
                </section>

                <TestimonialCarousel
                    testimonials={homeData?.testimonials || []}
                />

                <FAQSection />



            </main>

            {/* ═══ FOOTER ═══ */}
            <footer className="border-t border-purple-100 bg-white/80 backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-6 py-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <img src="/logo.png" alt="noxarianet" className="w-7 h-7 rounded object-contain" />
                                <span className="text-lg font-bold text-slate-900">noxaria<span className="text-purple-600">net</span></span>
                            </div>
                            <p className="text-[10px] font-extrabold text-slate-800 uppercase tracking-widest mb-1.5">Ekosistem Layanan Digital Otomatis</p>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Noxarianet Store menyediakan layanan top up e-wallet, aplikasi premium, dan kebutuhan digital lainnya yang diproses secara otomatis, cepat, dan aman dalam satu platform.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-slate-900 font-bold text-sm mb-4">Layanan</h4>
                            <ul className="space-y-2.5 text-xs text-slate-500">
                                <li><Link to="/garansi" className="hover:text-purple-600 transition">Klaim Garansi</Link></li>
                                <li><Link to="/tos" className="hover:text-purple-600 transition">Syarat & Ketentuan</Link></li>
                                <li><Link to="/cara" className="hover:text-purple-600 transition">Cara Order</Link></li>
                                <li><Link to="/faq" className="hover:text-purple-600 transition">FAQ</Link></li>
                                <li>
                                    <a 
                                        href="https://wa.me/6285199605580?text=Halo%20Admin%20Noxarianet%20Store%2C%20saya%20tertarik%20untuk%20membuat%20website.%20Boleh%20minta%20informasi%20lengkap%20mengenai%20paket%2C%20harga%2C%20dan%20estimasi%20waktu%20pembuatannya%3F%20Terima%20kasih." 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="hover:text-purple-600 transition font-medium text-purple-600 flex items-center gap-1"
                                    >
                                        Buat Website <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-md font-bold border border-purple-100">Hot</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-slate-900 font-bold text-sm mb-4">Hubungi Kami</h4>
                            <ul className="space-y-2.5 text-xs text-slate-500">
                                <li>Kab. Pekalongan, Jawa Tengah, Indonesia.</li>
                                <li>
                                    <a href="https://wa.me/6285199605580" target="_blank" rel="noreferrer" className="text-purple-600 hover:text-purple-700 transition font-medium">
                                        +62 851-9960-5580
                                    </a>
                                </li>
                            </ul>
                            <div className="mt-5">
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Metode Pembayaran</p>
                                <img src="/qris-logo.png" alt="QRIS" className="h-10 object-contain border border-slate-100 bg-white rounded-lg px-2 py-1" />
                            </div>
                        </div>
                    </div>
                    <div className="text-center text-[11px] text-slate-400 border-t border-slate-100 pt-6">
                        © {new Date().getFullYear()} Noxarianet Store. Seluruh hak cipta dilindungi undang-undang.
                    </div>
                </div>
            </footer>
        </div>
    );
};

/** Five FAQs shown on the home page with accordion interaction. */
const HOME_FAQS = [
    { id: 1, q: 'Apa itu Noxarianet Store?', a: 'Noxarianet Store adalah platform layanan digital yang menyediakan transfer e-wallet, aplikasi premium, top up game, dan berbagai kebutuhan digital lainnya dengan proses cepat, aman, dan praktis.' },
    { id: 2, q: 'Apakah DANA yang belum Premium bisa transfer?', a: 'Bisa. Kamu dapat transfer ke sesama DANA maupun ke berbagai e-wallet lainnya melalui layanan Noxarianet Store tanpa perlu upgrade ke DANA Premium.' },
    { id: 3, q: 'Bagaimana proses transaksinya?', a: 'Semua transaksi diproses secara otomatis melalui sistem sehingga lebih cepat, praktis, dan meminimalkan kesalahan.' },
    { id: 4, q: 'Pembayarannya bagaimana?', a: 'Pembayaran menggunakan QRIS Otomatis (Dynamic QRIS) sehingga lebih mudah, aman, dan praktis tanpa perlu konfirmasi manual.' },
    { id: 5, q: 'Berapa lama proses transaksi?', a: 'Sebagian besar transaksi diproses dalam hitungan detik hingga beberapa menit, tergantung jenis layanan dan kondisi sistem.' },
];

const FAQSection = () => {
    const [openId, setOpenId] = useState(null);
    const toggle = (id) => setOpenId(prev => (prev === id ? null : id));

    return (
        <section className="mb-14">
            {/* Section header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-lg font-extrabold text-slate-900">Pertanyaan Umum</h2>
                    <p className="text-xs text-slate-500 mt-0.5">FAQ seputar layanan kami</p>
                </div>
                <Link
                    to="/faq"
                    className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-100 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-purple-100/50 hover:scale-[1.02] active:scale-[0.98]"
                >
                    Lihat Semua →
                </Link>
            </div>

            {/* Accordion items */}
            <div className="space-y-2.5">
                {HOME_FAQS.slice(0, 3).map((item) => {
                    const isOpen = openId === item.id;
                    return (
                        <div
                            key={item.id}
                            className={`border rounded-2xl overflow-hidden transition-all duration-200 bg-white ${
                                isOpen ? 'border-purple-300 shadow-sm shadow-purple-100' : 'border-slate-200 hover:border-purple-200'
                            }`}
                        >
                            <button
                                id={`home-faq-${item.id}`}
                                onClick={() => toggle(item.id)}
                                aria-expanded={isOpen}
                                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                            >
                                <span className={`font-semibold text-sm leading-snug ${isOpen ? 'text-purple-700' : 'text-slate-800'}`}>
                                    {item.q}
                                </span>
                                <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                    isOpen ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'
                                }`}>
                                    {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </span>
                            </button>
                            <AnimatePresence initial={false}>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                                    >
                                        <div className="px-5 pb-4 pt-3 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                                            {item.a}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

/**
 * InfoModal — Reusable info popup modal.
 * Text only mode.
 */
const InfoModal = ({ show, settings, onClose, onDismiss24h, onJoinWA }) => {
    const waLink = 'https://chat.whatsapp.com/CbKJDpk99Hm0ItiWhDY7Kb?s=cl&p=a&ilr=4&amv=3';
    const WaSvg = () => (
        <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.591 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-5.824 4.74-10.563 10.564-10.563 5.826 0 10.564 4.738 10.564 10.562s-4.738 10.564-10.564 10.564z"/></svg>
    );

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ type: 'spring', stiffness: 320, damping: 26 }} className="relative w-full max-w-[290px] bg-white rounded-3xl p-5 shadow-2xl">
                        <button onClick={onClose} className="absolute top-3.5 right-3.5 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                            <X size={16} />
                        </button>
                        <div className="flex flex-col items-center text-center mb-4 mt-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mb-3 shadow-md shadow-purple-500/20">
                                <Megaphone className="text-white" size={22} />
                            </div>
                            <h2 className="text-lg font-extrabold text-gray-900">Info Penting! 📢</h2>
                            <p className="text-xs text-gray-600 mt-2 leading-relaxed px-1">
                                {settings?.info_modal_text || 'Bergabunglah dengan grup WhatsApp kami untuk mendapatkan info promo, update produk, dan penawaran eksklusif terbaru!'}
                            </p>
                        </div>
                        <div className="border-t border-gray-100 mb-4" />
                        <div className="flex flex-col gap-2.5 items-center w-full">
                            <a href={waLink} target="_blank" rel="noreferrer" onClick={onJoinWA} className="w-full py-3 px-4 rounded-xl bg-[#25D366] text-white font-bold hover:bg-[#1da851] active:scale-95 transition-all text-xs flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/20">
                                <WaSvg /> Gabung Grup WhatsApp
                            </a>
                            <button onClick={onClose} className="w-full py-2.5 px-4 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 hover:border-gray-300 active:scale-95 transition-all text-xs">Tutup</button>
                            <button onClick={onDismiss24h} className="text-[11px] text-gray-400 hover:text-purple-600 transition-colors underline mt-0.5">
                                Jangan tampilkan lagi selama 24 jam
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default LandingPage;
