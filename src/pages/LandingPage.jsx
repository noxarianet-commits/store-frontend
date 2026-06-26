import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Megaphone, X } from 'lucide-react';
import api from '../api';
import HeroSection from '../components/home/HeroSection';
import CategoryGrid from '../components/home/CategoryGrid';
import FeaturedProducts from '../components/home/FeaturedProducts';
import CategoryProducts from '../components/home/CategoryProducts';
import TestimonialCarousel from '../components/home/TestimonialCarousel';

const LandingPage = () => {
    const [homeData, setHomeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState(null);

    // Info Modal state
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    const settings = homeData?.settings || {
        shop_status: { isOpen: true, message: '' },
        site_content: { heroTitle: 'Solusi Digital Cerdas,', heroSubtitle: 'Untuk Kebutuhan Tanpa Batas.', heroDesc: 'Tingkatkan produktivitas dan hiburanmu dengan layanan premium terjangkau.' },
        info_modal_image: '',
        info_modal_active: true,
    };

    const handleCloseInfoModal = () => {
        if (dontShowAgain) {
            localStorage.setItem('hideInfoModal', 'true');
        }
        setShowInfoModal(false);
    };

    const handleJoinWA = (e) => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
            e.preventDefault();
            window.location.href = 'https://chat.whatsapp.com/Ea2f1OiVk4m3d0B8Wt85oB';
        }
    };

    // Single API call to fetch all home data
    useEffect(() => {
        const fetchHomeData = async () => {
            setLoading(true);
            try {
                const res = await api.get('/home');
                setHomeData(res.data);

                // Show info modal if not hidden by user
                const hidden = localStorage.getItem('hideInfoModal');
                if (hidden !== 'true') {
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

    // Handle category click (Opsi A: scroll to section)
    const handleCategoryClick = (slug) => {
        setActiveCategory(prev => (prev === slug ? null : slug));
    };

    // Filter featured products by search query
    const filteredFeatured = searchQuery && homeData?.featured_products
        ? homeData.featured_products.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        : homeData?.featured_products || [];

    return (
        <div className="w-full font-sans text-gray-200 min-h-screen">

            {/* ═══ MARQUEE STATUS ═══ */}
            {settings.shop_status?.message && (
                <div className="w-full bg-purple-600/10 border-b border-purple-500/10 py-2 overflow-hidden whitespace-nowrap">
                    <div className="animate-marquee inline-block text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em]">
                        {Array(6).fill(settings.shop_status.message).join(' \u00A0•\u00A0 ')}
                    </div>
                </div>
            )}

            {/* ═══ INFO MODAL (with image — active from admin) ═══ */}
            <InfoModal
                show={showInfoModal && settings.info_modal_active !== false}
                settings={settings}
                dontShowAgain={dontShowAgain}
                setDontShowAgain={setDontShowAgain}
                onClose={handleCloseInfoModal}
                onJoinWA={handleJoinWA}
                variant="image"
            />

            {/* ═══ INFO MODAL SIMPLE (no image — inactive from admin) ═══ */}
            <InfoModal
                show={showInfoModal && settings.info_modal_active === false}
                settings={settings}
                dontShowAgain={dontShowAgain}
                setDontShowAgain={setDontShowAgain}
                onClose={handleCloseInfoModal}
                onJoinWA={handleJoinWA}
                variant="simple"
            />

            {/* ═══ HEADER ═══ */}
            <nav className="sticky top-0 z-50 bg-[#0A0A0A]/70 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2.5">
                        <img src="/logo.png" alt="noxarianet" className="w-9 h-9 rounded-lg object-contain" />
                        <span className="text-xl font-bold tracking-tight text-white">noxaria<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a78bfa] to-[#818cf8]">net</span></span>
                    </Link>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6">
                <HeroSection
                    settings={settings}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />

                <CategoryGrid
                    categories={homeData?.categories || []}
                    activeCategory={activeCategory}
                    onCategoryClick={handleCategoryClick}
                />

                <CategoryProducts
                    categorySlug={activeCategory}
                    onClose={() => setActiveCategory(null)}
                />

                <FeaturedProducts
                    products={filteredFeatured}
                    loading={loading}
                />

                <TestimonialCarousel
                    testimonials={homeData?.testimonials || []}
                />

                {/* ═══ DESCRIPTION ═══ */}
                <div className="mb-12 text-center">
                    <p className="text-xs text-gray-500 leading-relaxed max-w-lg mx-auto">
                        Platform digital andalan untuk upgrade produktivitas dan hiburanmu tanpa bikin dompet boncos. Nikmati pengalaman belanja akun premium yang 100% aman, diproses otomatis secara instan, dengan penawaran harga spesial.
                    </p>
                </div>
            </main>

            {/* ═══ FOOTER ═══ */}
            <footer className="border-t border-white/5 bg-[#0A0A0A]/80 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-6 py-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <img src="/logo.png" alt="noxarianet" className="w-7 h-7 rounded object-contain" />
                                <span className="text-lg font-bold text-white">noxaria<span className="text-purple-400">net</span></span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Platform digital andalan untuk upgrade produktivitas dan hiburanmu tanpa bikin dompet boncos.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-sm mb-4">Layanan</h4>
                            <ul className="space-y-2.5 text-xs text-gray-400">
                                <li><Link to="/garansi" className="hover:text-white transition">Klaim Garansi</Link></li>
                                <li><Link to="/tos" className="hover:text-white transition">Syarat & Ketentuan</Link></li>
                                <li><Link to="/cara" className="hover:text-white transition">Cara Order</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-sm mb-4">Hubungi Kami</h4>
                            <ul className="space-y-2.5 text-xs text-gray-400">
                                <li>Kab. Pekalongan, Jawa Tengah, Indonesia.</li>
                                <li>
                                    <a href="https://wa.me/6285199605580" target="_blank" rel="noreferrer" className="text-purple-400 hover:text-purple-300 transition font-medium">
                                        +62 851-9960-5580
                                    </a>
                                </li>
                            </ul>
                            <div className="mt-5">
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Metode Pembayaran</p>
                                <img src="/qris-logo.png" alt="QRIS" className="h-10 object-contain bg-white rounded px-2 py-1" />
                            </div>
                        </div>
                    </div>
                    <div className="text-center text-[11px] text-gray-600 border-t border-white/5 pt-6">
                        © {new Date().getFullYear()} noxarianet Store. All rights reserved.<br />
                        Made with ❤ by noxarianet.
                    </div>
                </div>
            </footer>
        </div>
    );
};

/**
 * InfoModal — Reusable info popup modal.
 * Supports two variants: 'image' (with admin image) and 'simple' (text only).
 */
const InfoModal = ({ show, settings, dontShowAgain, setDontShowAgain, onClose, onJoinWA, variant }) => {
    if (!show) return null;

    const waLink = 'https://chat.whatsapp.com/Ea2f1OiVk4m3d0B8Wt85oB';
    const WaSvg = () => (
        <svg className="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-5.824 4.74-10.563 10.564-10.563 5.826 0 10.564 4.738 10.564 10.562s-4.738 10.564-10.564 10.564z"/></svg>
    );

    if (variant === 'image') {
        return (
            <AnimatePresence>
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80" onClick={onClose} />
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-[340px] bg-white rounded-[24px] p-5 shadow-2xl overflow-hidden">
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={20} />
                        </button>
                        <div className="flex flex-col items-center mb-4 mt-2">
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-3 shadow-sm border border-purple-100">
                                <Megaphone className="text-purple-600" size={24} />
                            </div>
                            <h2 className="text-xl font-extrabold text-gray-900 text-center flex items-center gap-2">Info Penting! ✨</h2>
                        </div>
                        {settings.info_modal_image && (
                            <div className="mb-5 overflow-y-auto max-h-[55vh] rounded-xl border border-gray-100 bg-gray-50/50 no-scrollbar">
                                <img src={settings.info_modal_image} alt="Info Penting" className="w-full object-contain block" />
                            </div>
                        )}
                        <div className="flex items-center gap-2 mb-6 px-1">
                            <input type="checkbox" id="dontshow" checked={dontShowAgain} onChange={(e) => setDontShowAgain(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-600 cursor-pointer" />
                            <label htmlFor="dontshow" className="text-sm text-gray-500 cursor-pointer select-none">Jangan tampilkan lagi</label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={onClose} className="w-full py-3.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors text-sm">Tutup</button>
                            <a href={waLink} target="_blank" rel="noreferrer" onClick={onJoinWA} className="w-full py-3.5 px-4 rounded-xl bg-[#00E676] text-white font-bold hover:bg-[#00C853] transition-colors text-sm flex items-center justify-center gap-2 shadow-sm shadow-[#00E676]/30">
                                <WaSvg /> Join Grup WA
                            </a>
                        </div>
                    </motion.div>
                </div>
            </AnimatePresence>
        );
    }

    // variant === 'simple'
    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
                <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="relative w-full max-w-[320px] bg-white rounded-[28px] p-6 shadow-2xl">
                    <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                        <X size={18} />
                    </button>
                    <div className="flex flex-col items-center text-center mb-6 mt-1">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
                            <Megaphone className="text-white" size={28} />
                        </div>
                        <h2 className="text-xl font-extrabold text-gray-900">Info Penting! 📢</h2>
                        <p className="text-sm text-gray-500 mt-1.5 leading-relaxed px-2">
                            Bergabunglah dengan grup WhatsApp kami untuk mendapatkan info promo, update produk, dan penawaran eksklusif terbaru!
                        </p>
                    </div>
                    <div className="border-t border-gray-100 mb-5" />
                    <div className="flex flex-col gap-3">
                        <a href={waLink} target="_blank" rel="noreferrer" onClick={onJoinWA} className="w-full py-4 px-4 rounded-2xl bg-[#25D366] text-white font-bold hover:bg-[#1da851] active:scale-95 transition-all text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-[#25D366]/30">
                            <WaSvg /> Gabung Grup WhatsApp
                        </a>
                        <button onClick={onClose} className="w-full py-3.5 px-4 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 hover:border-gray-300 active:scale-95 transition-all text-sm">Tutup</button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default LandingPage;
