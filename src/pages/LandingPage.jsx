import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Megaphone, X, ChevronDown, ChevronUp, ShoppingBag, CheckCircle2, Star, Zap, ShieldCheck } from 'lucide-react';
import api from '../api';
import HeroSection from '../components/home/HeroSection';
import CategoryTabs from '../components/home/CategoryTabs';
import ProductCard from '../components/home/ProductCard';
import FeaturedSlider from '../components/home/FeaturedSlider';
import TestimonialCarousel from '../components/home/TestimonialCarousel';
import { getWaNumber, getWaUrl, formatWaDisplay, getWaGroupLink } from '../utils/waUtils';

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
        site_content: { heroTitle: 'Semua Kebutuhan Digital —', heroSubtitle: 'Beres dalam Hitungan Detik.', heroDesc: 'Top up game, e-wallet, sampai aplikasi premium. Proses otomatis 1–3 menit, bayar via QRIS tanpa ribet.' },
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
            window.location.href = getWaGroupLink(settings);
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
        <div className="w-full font-sans text-ink min-h-screen bg-surface">

            {/* ═══ MARQUEE STATUS — higher contrast, ink tint ─══ */}
            {settings.shop_status?.message && (
                <div className={`w-full border-b py-2 overflow-hidden whitespace-nowrap ${
                    settings.shop_status.isOpen === false 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-brandSoft border-brandBorder'
                }`}>
                    <div className={`animate-marquee inline-block text-[10px] font-bold uppercase tracking-[0.18em] ${
                        settings.shop_status.isOpen === false ? 'text-red-600' : 'text-brand'
                    }`}>
                        {Array(6).fill(
                            settings.shop_status.isOpen === false 
                                ? `● TOKO TUTUP — ${settings.shop_status.message}`
                                : settings.shop_status.message
                        ).join('  •  ')}
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
            <nav className="sticky top-0 z-50 bg-white/75 backdrop-blur-md border-b border-brandBorder shadow-sm">
                <div className="max-w-[1160px] mx-auto px-4 sm:px-6 py-3.5 md:py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2.5">
                        <img src="/logo.png" alt="noxarianet" className="w-9 h-9 rounded-xl object-contain border border-slate-100" />
                        <span className="text-xl font-bold tracking-tight text-ink">noxaria<span className="text-brand">net</span></span>
                    </Link>
                </div>
            </nav>

            <main className="max-w-[1160px] mx-auto px-4 sm:px-6">
                <HeroSection
                    settings={settings}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />

                {/* ── Featured: one-row slider above all products ── */}
                <FeaturedSlider
                    products={allProducts.filter(p => {
                        if (!searchQuery) return true;
                        const q = searchQuery.toLowerCase();
                        return p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q);
                    })}
                    loading={loading}
                />

                <CategoryTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    counts={counts}
                />

                {/* ═══ PRODUCT GRID ═══ */}
                <section className="mb-10">
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 md:gap-4">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="bg-white border border-brandBorder rounded-2xl p-4 flex flex-col items-start animate-pulse shadow-soft">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 mb-3" />
                                    <div className="w-10 h-2 rounded bg-slate-100 mb-2" />
                                    <div className="w-full h-3 rounded bg-slate-100 mb-1" />
                                    <div className="w-2/3 h-2.5 rounded bg-slate-100" />
                                </div>
                            ))}
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
                            <p className="text-sm font-medium text-slate-600">
                                {searchQuery
                                    ? `Tidak ada produk yang cocok dengan "${searchQuery}"`
                                    : 'Belum ada produk di kategori ini.'}
                            </p>
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="mt-3 text-xs font-semibold text-brand hover:text-brandDark">Hapus pencarian</button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 md:gap-4">
                            {filteredProducts.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.015, duration: 0.28, ease: [0.25,0.1,0.25,1] }}
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

                {/* ═══ STATS — 3 cols, tight group, generous separation from grid ─══ */}
                <section className="mb-10">
                    <div className="text-center mb-5">
                        <h3 className="text-[13px] font-extrabold text-ink tracking-[-0.02em]">Dipercaya ribuan pengguna tiap bulan</h3>
                        <p className="text-xs text-slate-500 mt-1">Transaksi real • update otomatis</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 md:gap-4">
                        <div className="bg-white border border-brandBorder rounded-2xl p-4 flex flex-col items-center justify-center shadow-soft text-center">
                            <div className="w-9 h-9 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-2.5">
                                <ShoppingBag size={16} />
                            </div>
                            <span className="text-[18px] font-extrabold text-ink leading-none tracking-[-0.02em]">10.000+</span>
                            <span className="text-[10px] font-semibold text-slate-500 mt-1">Total transaksi</span>
                        </div>
                        <div className="bg-white border border-brandBorder rounded-2xl p-4 flex flex-col items-center justify-center shadow-soft text-center">
                            <div className="w-9 h-9 bg-brandSoft border border-brandBorder rounded-xl flex items-center justify-center text-brand mb-2.5">
                                <CheckCircle2 size={16} />
                            </div>
                            <span className="text-[18px] font-extrabold text-ink leading-none tracking-[-0.02em]">10.000+</span>
                            <span className="text-[10px] font-semibold text-slate-500 mt-1">Pesanan berhasil</span>
                        </div>
                        <div className="bg-white border border-amber-100 rounded-2xl p-4 flex flex-col items-center justify-center shadow-soft text-center">
                            <div className="w-9 h-9 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-amber-600 mb-2.5">
                                <Star size={16} />
                            </div>
                            <span className="text-[18px] font-extrabold text-ink leading-none tracking-[-0.02em]">4.9/5</span>
                            <span className="text-[10px] font-semibold text-slate-500 mt-1">Rating kepuasan</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1"><Zap size={11} className="text-brand" /> Proses 1–3 menit</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="inline-flex items-center gap-1"><ShieldCheck size={11} className="text-emerald-600" /> Garansi & support</span>
                    </div>
                </section>

                <TestimonialCarousel
                    testimonials={homeData?.testimonials || []}
                />

                <FAQSection />



            </main>

            {/* ═══ FOOTER — 4 cols, generous separation, anchored close ─══ */}
            <footer className="border-t border-brandBorder bg-white">
                <div className="max-w-[1160px] mx-auto px-4 sm:px-6 py-8 md:py-10">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-6 mb-8">
                        <div className="md:col-span-5">
                            <div className="flex items-center gap-2 mb-3">
                                <img src="/logo.png" alt="noxarianet" className="w-7 h-7 rounded-lg object-contain border border-slate-100" />
                                <span className="text-lg font-bold tracking-tight text-ink">noxaria<span className="text-brand">net</span></span>
                            </div>
                            <p className="text-[11px] font-bold text-ink uppercase tracking-[0.08em] mb-2">Ekosistem layanan digital otomatis</p>
                            <p className="text-[13px] text-slate-600 leading-relaxed max-w-[42ch]">
                                Top up e-wallet, aplikasi premium, dan game — diproses otomatis 1–3 menit, bayar via QRIS tanpa konfirmasi manual.
                            </p>
                            <div className="flex items-center gap-2 mt-4">
                                <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full px-2.5 py-1 text-[11px] font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Auto</span>
                                <span className="inline-flex items-center gap-1.5 bg-brandSoft border border-brandBorder text-brand rounded-full px-2.5 py-1 text-[11px] font-semibold">QRIS </span>
                            </div>
                        </div>
                        <div className="md:col-span-3">
                            <h4 className="text-ink font-bold text-[13px] mb-4">Layanan</h4>
                            <ul className="space-y-2.5 text-[13px] text-slate-600">
                                <li><Link to="/garansi" className="hover:text-brand transition">Klaim Garansi</Link></li>
                                <li><Link to="/tos" className="hover:text-brand transition">Syarat & Ketentuan</Link></li>
                                <li><Link to="/cara" className="hover:text-brand transition">Cara Order</Link></li>
                                <li><Link to="/faq" className="hover:text-brand transition">FAQ</Link></li>
                                <li>
                                    <a 
                                        href={getWaUrl(settings, 'Halo Admin Noxarianet Store, saya tertarik untuk membuat website. Boleh minta informasi lengkap mengenai paket, harga, dan estimasi waktu pembuatannya? Terima kasih.')}
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="hover:text-brand transition font-semibold text-brand inline-flex items-center gap-1.5"
                                    >
                                        Buat Website <span className="text-[10px] bg-brandSoft text-brand px-1.5 py-0.5 rounded-full font-bold border border-brandBorder">Hot</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="md:col-span-2">
                            <h4 className="text-ink font-bold text-[13px] mb-4">Bantuan</h4>
                            <ul className="space-y-2.5 text-[13px] text-slate-600">
                                <li><a href={getWaUrl(settings)} target="_blank" rel="noreferrer" className="text-brand hover:text-brandDark font-semibold">Chat CS WhatsApp</a></li>
                                <li className="text-slate-500">Kab. Pekalongan, Jawa Tengah</li>
                                <li className="text-slate-500 text-xs">Respon 1–3 menit, 09:00–23:00 WIB</li>
                            </ul>
                        </div>
                        <div className="md:col-span-2">
                            <h4 className="text-ink font-bold text-[13px] mb-4">Pembayaran</h4>
                            <img src="/qris-logo.png" alt="QRIS" className="h-10 object-contain border border-slate-200 bg-white rounded-xl px-3 py-2 shadow-sm" />
                            <p className="text-[11px] text-slate-500 mt-2 leading-snug">Scan via e-wallet / m-banking apapun.</p>
                            <p className="text-[11px] font-semibold text-ink mt-3">{formatWaDisplay(getWaNumber(settings))}</p>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 border-t border-slate-100 pt-5">
                        <span>© {new Date().getFullYear()} Noxarianet Store. Seluruh hak cipta dilindungi.</span>
                        <span className="inline-flex items-center gap-1.5"><ShieldCheck size={12} className="text-slate-400" /> Transaksi aman & terenkripsi</span>
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
            <div className="flex items-end justify-between mb-5 gap-4">
                <div>
                    <h2 className="text-[15px] font-extrabold text-ink tracking-[-0.02em]">Pertanyaan Umum</h2>
                    <p className="text-xs text-slate-500 mt-1">Jawaban cepat seputar layanan</p>
                </div>
                <Link
                    to="/faq"
                    className="shrink-0 px-3.5 py-1.5 bg-white hover:bg-slate-50 text-ink border border-slate-200 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                    Lihat semua →
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
                                isOpen ? 'border-brandBorder shadow-soft' : 'border-slate-200 hover:border-brandBorder'
                            }`}
                        >
                            <button
                                id={`home-faq-${item.id}`}
                                onClick={() => toggle(item.id)}
                                aria-expanded={isOpen}
                                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                            >
                                <span className={`font-semibold text-[13px] leading-snug ${isOpen ? 'text-brand' : 'text-ink'}`}>
                                    {item.q}
                                </span>
                                <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors border ${
                                    isOpen ? 'bg-brandSoft text-brand border-brandBorder' : 'bg-slate-50 text-slate-400 border-slate-200'
                                }`}>
                                    {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
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

const WaSvg = () => (
    <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.591 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-5.824 4.74-10.563 10.564-10.563 5.826 0 10.564 4.738 10.564 10.562s-4.738 10.564-10.564 10.564z"/></svg>
);

/**
 * InfoModal — Reusable info popup modal.
 * Text only mode.
 */
const InfoModal = ({ show, settings, onClose, onDismiss24h, onJoinWA }) => {
    const waLink = getWaGroupLink(settings);

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-ink/55 backdrop-blur-[2px]" onClick={onClose} />
                    <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }} transition={{ type: 'spring', stiffness: 340, damping: 28 }} className="relative w-full max-w-[360px] bg-white rounded-[20px] p-6 shadow-lift border border-slate-100">
                        <button onClick={onClose} aria-label="Tutup" className="absolute top-3.5 right-3.5 w-7 h-7 grid place-items-center text-slate-400 hover:text-ink hover:bg-slate-50 rounded-full transition-colors border border-transparent hover:border-slate-200">
                            <X size={14} />
                        </button>
                        <div className="flex flex-col items-center text-center mb-4 mt-1">
                            <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center mb-3 shadow-soft">
                                <Megaphone className="text-white" size={20} />
                            </div>
                            <h2 className="text-[16px] font-extrabold text-ink tracking-[-0.02em]">Info Penting</h2>
                            <p className="text-[13px] text-slate-600 mt-2 leading-relaxed">
                                {settings?.info_modal_text || 'Bergabunglah dengan grup WhatsApp kami untuk info promo, update produk, dan penawaran eksklusif.'}
                            </p>
                        </div>
                        <div className="border-t border-slate-100 mb-4" />
                        <div className="flex flex-col gap-2.5 items-center w-full">
                            <a href={waLink} target="_blank" rel="noreferrer" onClick={onJoinWA} className="w-full h-11 px-4 rounded-xl bg-[#1d9e48] hover:bg-[#15803d] text-white font-bold active:scale-[0.99] transition-all text-[13px] flex items-center justify-center gap-2 shadow-sm">
                                <WaSvg /> Gabung Grup WhatsApp
                            </a>
                            <button onClick={onClose} className="w-full h-10 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99] transition-all text-[13px]">Tutup</button>
                            <button onClick={onDismiss24h} className="text-[11px] font-medium text-slate-500 hover:text-brand transition-colors underline underline-offset-2">
                                Jangan tampilkan lagi 24 jam
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default LandingPage;
