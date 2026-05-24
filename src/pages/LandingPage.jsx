import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Server, Code, Smartphone, ChevronRight, User, Clock, AlertCircle, Scissors, Music, Film, Palette, Brain, PlayCircle, Tv, Clapperboard, Play, Sparkles, BookOpen, Search, LogIn, Tag, Megaphone, Headphones, AlertTriangle, X, Star, Gamepad2, Swords, Trophy, Joystick, Target, Monitor, CreditCard, ShoppingCart, Zap, Heart, Gift } from 'lucide-react';
import api from '../api';

// Icon mapping for products
const iconMap = {
  scissors: Scissors,
  music: Music,
  film: Film,
  palette: Palette,
  brain: Brain,
  youtube: PlayCircle,
  tv: Tv,
  clapperboard: Clapperboard,
  play: Play,
  sparkles: Sparkles,
  book: BookOpen,
  gamepad: Gamepad2,
  swords: Swords,
  trophy: Trophy,
  joystick: Joystick,
  target: Target,
  monitor: Monitor,
  card: CreditCard,
  cart: ShoppingCart,
  zap: Zap,
  heart: Heart,
  gift: Gift,
};

// Icon color mapping (Premium Modern Style)
const iconColorMap = {
  scissors: 'bg-gradient-to-b from-gray-100/10 to-transparent border border-white/10 text-gray-200', // Capcut
  music: 'bg-gradient-to-b from-[#1DB954]/15 to-transparent border border-[#1DB954]/20 text-[#1DB954]', // Spotify
  film: 'bg-gradient-to-b from-[#E50914]/15 to-transparent border border-[#E50914]/20 text-[#E50914]', // Netflix
  palette: 'bg-gradient-to-b from-[#00C4CC]/15 to-[#7D2AE8]/15 border border-[#7D2AE8]/20 text-cyan-300', // Canva
  brain: 'bg-gradient-to-b from-teal-500/15 to-transparent border border-teal-500/20 text-teal-300', // AI
  youtube: 'bg-gradient-to-b from-red-500/15 to-transparent border border-red-500/20 text-red-400', // Youtube
  tv: 'bg-gradient-to-b from-blue-500/15 to-transparent border border-blue-500/20 text-blue-300', // Vidio
  clapperboard: 'bg-gradient-to-b from-purple-500/15 to-transparent border border-purple-500/20 text-purple-300', // Wink
  play: 'bg-gradient-to-b from-orange-500/15 to-transparent border border-orange-500/20 text-orange-300',
  sparkles: 'bg-gradient-to-b from-pink-500/15 to-transparent border border-pink-500/20 text-pink-300', // Alight Motion
  book: 'bg-gradient-to-b from-emerald-500/15 to-transparent border border-emerald-500/20 text-emerald-300',
  gamepad: 'bg-gradient-to-b from-yellow-500/15 to-transparent border border-yellow-500/20 text-yellow-300', // Game
  swords: 'bg-gradient-to-b from-rose-500/15 to-transparent border border-rose-500/20 text-rose-300', // ML/FF
  trophy: 'bg-gradient-to-b from-amber-500/15 to-transparent border border-amber-500/20 text-amber-300',
  joystick: 'bg-gradient-to-b from-indigo-500/15 to-transparent border border-indigo-500/20 text-indigo-300',
  target: 'bg-gradient-to-b from-red-600/15 to-transparent border border-red-600/20 text-red-400',
  monitor: 'bg-gradient-to-b from-blue-600/15 to-transparent border border-blue-600/20 text-blue-300',
};

// Badge color mapping
const badgeColorMap = {
  blue: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/20' },
  green: { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/20' },
  red: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/20' },
  purple: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/20' },
  emerald: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  yellow: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  cyan: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  orange: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/20' },
};

// Category filter options
const categories = [
  { label: 'Semua Produk', value: 'all' },
  { label: 'Layanan Jasa', value: 'jasa' },
];

const LandingPage = () => {
  const [products, setProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [settings, setSettings] = useState({
    shop_status: { isOpen: true, message: '' },
    banners: [],
    site_content: { heroTitle: 'Solusi Digital Cerdas,', heroSubtitle: 'Untuk Kebutuhan Tanpa Batas.', heroDesc: 'Tingkatkan produktivitas dan hiburanmu dengan layanan premium terjangkau.' },
    info_modal_image: '/info.jpeg'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [typedPlaceholder, setTypedPlaceholder] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const [currentBanner, setCurrentBanner] = useState(0);
  const [currentTestiIdx, setCurrentTestiIdx] = useState(0);

  // Modal Info
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const hidden = localStorage.getItem('hideInfoModal');
    if (hidden !== 'true') {
      setShowInfoModal(true);
    }
  }, []);

  const handleCloseInfoModal = () => {
    if (dontShowAgain) {
      localStorage.setItem('hideInfoModal', 'true');
    }
    setShowInfoModal(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await api.get('/products');
        if (Array.isArray(prodRes.data)) {
          setProducts(prodRes.data);
        } else {
          console.error('Products response is not an array:', prodRes.data);
        }
        
        const testRes = await api.get('/testimonials');
        if (Array.isArray(testRes.data)) {
          setTestimonials(testRes.data);
        } else {
          console.error('Testimonials response is not an array:', testRes.data);
        }

        const settingsRes = await api.get('/settings');
        console.log('Settings received from server:', settingsRes.data);
        
        if (settingsRes.data) {
          const fetchedBanners = settingsRes.data.banners || [];
          console.log('Banners found:', fetchedBanners);
          
          setSettings({
            shop_status: settingsRes.data.shop_status || { isOpen: true, message: '' },
            banners: Array.isArray(fetchedBanners) ? fetchedBanners : [],
            site_content: settingsRes.data.site_content || { heroTitle: 'Solusi Digital Cerdas,', heroSubtitle: 'Untuk Kebutuhan Tanpa Batas.', heroDesc: 'Tingkatkan produktivitas and hiburanmu dengan layanan premium terjangkau.' },
            info_modal_image: settingsRes.data.info_modal_image || '/info.jpeg'
          });
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    };
    fetchData();
  }, []);

  // Banner & Testimonial Slider
  useEffect(() => {
    const bannerTimer = setInterval(() => {
      if (settings.banners.length > 0) {
        setCurrentBanner((prev) => (prev + 1) % settings.banners.length);
      }
    }, 5000);

    const testiTimer = setInterval(() => {
      if (testimonials.length > 0) {
        setCurrentTestiIdx((prev) => (prev + 1) % testimonials.length);
      }
    }, 5000);

    return () => {
      clearInterval(bannerTimer);
      clearInterval(testiTimer);
    };
  }, [settings.banners.length, testimonials.length]);

  // Typewriter Effect for Search Placeholder
  useEffect(() => {
    if (isFocused || searchQuery) return; // Stop animation when user is typing

    const phrases = [
      'CapCut Premium',
      'Mobile Legends',
      'Jasa Pembuatan Website',
      'Free Fire',
      'Script Bot WhatsApp',
      'Spotify Premium',
      'Netflix Premium',
      'PUBG Mobile',
      'Canva Pro',
      'ChatGPT Plus',
    ];

    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let timeout;

    const tick = () => {
      const currentPhrase = phrases[phraseIdx];

      if (!isDeleting) {
        setTypedPlaceholder(currentPhrase.substring(0, charIdx + 1));
        charIdx++;
        if (charIdx === currentPhrase.length) {
          isDeleting = true;
          timeout = setTimeout(tick, 1500); // Pause before deleting
          return;
        }
        timeout = setTimeout(tick, 80);
      } else {
        setTypedPlaceholder(currentPhrase.substring(0, charIdx - 1));
        charIdx--;
        if (charIdx === 0) {
          isDeleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          timeout = setTimeout(tick, 400); // Pause before next word
          return;
        }
        timeout = setTimeout(tick, 40);
      }
    };

    timeout = setTimeout(tick, 500);
    return () => clearTimeout(timeout);
  }, [isFocused, searchQuery]);

  // Separate app products, game products, and service products
  const serviceIds = ['jasa-web', 'script-bot', 'vps-bot'];
  const isGameProduct = (p) => p.category && (p.category.toLowerCase().includes('game') || p.category.toLowerCase().includes('top up') || p.category.toLowerCase().includes('topup'));
  
  const rawServiceProducts = products.filter(p => serviceIds.includes(p.id));
  const rawGameProducts = products.filter(p => isGameProduct(p));
  const rawAppProducts = products.filter(p => !serviceIds.includes(p.id) && !isGameProduct(p));

  const appProducts = searchQuery
    ? rawAppProducts.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : rawAppProducts;

  const serviceProducts = searchQuery
    ? rawServiceProducts.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : rawServiceProducts;

  const gameProducts = searchQuery
    ? rawGameProducts.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : rawGameProducts;

  return (
    <div className="w-full font-sans text-gray-200 min-h-screen">

      {/* ═══ ANIMATED BACKGROUND BLOBS ═══ */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* ═══ MARQUEE STATUS ═══ */}
      {settings.shop_status.message && (
        <div className="w-full bg-purple-600/10 border-b border-purple-500/10 py-2 overflow-hidden whitespace-nowrap">
          <div className="animate-marquee inline-block text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em]">
            {settings.shop_status.message} &nbsp; • &nbsp; {settings.shop_status.message} &nbsp; • &nbsp; {settings.shop_status.message} &nbsp; • &nbsp; {settings.shop_status.message} &nbsp; • &nbsp; {settings.shop_status.message} &nbsp; • &nbsp; {settings.shop_status.message}
          </div>
        </div>
      )}

      {/* ═══ INFO MODAL ═══ */}
      <AnimatePresence>
        {showInfoModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80"
              onClick={handleCloseInfoModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-[340px] bg-white rounded-[24px] p-5 shadow-2xl overflow-hidden"
            >
              {/* Close button */}
              <button
                onClick={handleCloseInfoModal}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center mb-4 mt-2">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-3 shadow-sm border border-purple-100">
                  <Megaphone className="text-purple-600" size={24} />
                </div>
                <h2 className="text-xl font-extrabold text-gray-900 text-center flex items-center gap-2">
                  Info Penting! ✨
                </h2>
              </div>

              <div className="mb-5 overflow-y-auto max-h-[55vh] rounded-xl border border-gray-100 bg-gray-50/50 no-scrollbar">
                <img src={settings.info_modal_image} alt="Info Penting" className="w-full object-contain block" />
              </div>

              <div className="flex items-center gap-2 mb-6 px-1">
                <input
                  type="checkbox"
                  id="dontshow"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-600 cursor-pointer"
                />
                <label htmlFor="dontshow" className="text-sm text-gray-500 cursor-pointer select-none">
                  Jangan tampilkan lagi
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCloseInfoModal}
                  className="w-full py-3.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors text-sm"
                >
                  Tutup
                </button>
                <a
                  href="https://chat.whatsapp.com/Ea2f1OiVk4m3d0B8Wt85oB"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-[#00E676] text-white font-bold hover:bg-[#00C853] transition-colors text-sm flex items-center justify-center gap-2 shadow-sm shadow-[#00E676]/30"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-5.824 4.74-10.563 10.564-10.563 5.826 0 10.564 4.738 10.564 10.562s-4.738 10.564-10.564 10.564z"/></svg>
                  Join Grup WA
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

        {/* ═══ HERO ═══ */}
        <section className="text-center pt-16 pb-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6">
            <span className={`w-2 h-2 ${settings.shop_status.isOpen ? 'bg-green-400' : 'bg-red-400'} rounded-full animate-pulse`}></span>
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              {settings.shop_status.isOpen ? 'Toko Buka - Ready Order' : 'Toko Sedang Tutup'}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight">
            {settings.site_content.heroTitle}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a78bfa] via-[#818cf8] to-[#6366f1]">
              {settings.site_content.heroSubtitle}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base text-gray-400 max-w-xl mx-auto leading-relaxed mb-10">
            {settings.site_content.heroDesc}
          </p>

          {/* Search Bar with Typewriter */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder={isFocused ? 'Ketik nama produk...' : typedPlaceholder || 'Cari produk...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/40 focus:bg-white/8 transition-all"
              />
            </div>
          </div>
        </section>

        {/* ═══ BANNER SLIDER ═══ */}
        {settings.banners.length > 0 && (
          <section className="mb-12">
            <div className="relative w-full overflow-hidden rounded-3xl group bg-[#0E0E0E] border border-white/5">
              <div className="aspect-[16/9] md:aspect-[21/9] lg:aspect-[24/7] relative bg-white/5">
                <div className="absolute inset-0 flex">
                  <AnimatePresence initial={false} custom={currentBanner}>
                    <motion.div
                      key={currentBanner}
                      custom={currentBanner}
                      initial={{ x: '100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '-100%' }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className="absolute inset-0 w-full h-full"
                    >
                      <img
                        src={settings.banners[currentBanner]}
                        className="w-full h-full object-cover"
                        alt="Promo Banner"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-60 pointer-events-none"></div>

                {/* Navigation Arrows */}
                <button 
                  onClick={() => setCurrentBanner(prev => (prev === 0 ? settings.banners.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all z-10 border border-white/5"
                >
                  <ChevronRight className="rotate-180" size={20} />
                </button>
                <button 
                  onClick={() => setCurrentBanner(prev => (prev === settings.banners.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all z-10 border border-white/5"
                >
                  <ChevronRight size={20} />
                </button>

                {/* Slider Indicators */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
                  {settings.banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentBanner(idx)}
                      className={`transition-all duration-300 rounded-full ${currentBanner === idx ? 'w-8 h-1.5 bg-purple-500' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/50'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}



        {/* ═══ APP PREMIUM SECTION ═══ */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Smartphone size={20} className="text-[#818cf8]" />
              App Premium
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {appProducts.map((product) => {
              const IconComp = iconMap[product.icon] || Smartphone;
              const badgeStyle = badgeColorMap[product.badgeColor] || { bg: 'bg-gray-500/15', text: 'text-gray-400', border: 'border-gray-500/20' };
              const iconColor = iconColorMap[product.icon] || 'bg-white/5 text-gray-400';

              return (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group relative bg-[#0E0E0E] hover:bg-[#151515] border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all duration-200 flex flex-col items-center text-center"
                >
                  {product.badge && (
                    <span className={`absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                      {product.badge}
                    </span>
                  )}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 mb-4 mt-1 ${iconColor} group-hover:scale-110 group-hover:brightness-125`}>
                    <IconComp size={30} />
                  </div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{product.category}</span>
                  <h3 className="text-sm font-bold text-white leading-tight mb-0.5">{product.name}</h3>
                  {product.subtitle && (
                    <p className="text-[11px] text-gray-500">{product.subtitle}</p>
                  )}
                </Link>
              );
            })}
          </div>
        </section>

        {/* ═══ TOP UP GAME SECTION ═══ */}
        {gameProducts.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Gamepad2 size={20} className="text-violet-500" />
                Top Up Game
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {gameProducts.map((product) => {
                const IconComp = iconMap[product.icon] || Gamepad2;
                const badgeStyle = badgeColorMap[product.badgeColor] || { bg: 'bg-gray-500/15', text: 'text-gray-400', border: 'border-gray-500/20' };
                const iconColor = iconColorMap[product.icon] || 'bg-white/5 text-gray-400';

                return (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="group relative bg-[#0E0E0E] hover:bg-[#151515] border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all duration-200 flex flex-col items-center text-center"
                  >
                    {product.badge && (
                      <span className={`absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                        {product.badge}
                      </span>
                    )}
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 mb-4 mt-1 ${iconColor} group-hover:scale-110 group-hover:brightness-125`}>
                      <IconComp size={30} />
                    </div>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{product.category}</span>
                    <h3 className="text-sm font-bold text-white leading-tight mb-0.5">{product.name}</h3>
                    {product.subtitle && (
                      <p className="text-[11px] text-gray-500">{product.subtitle}</p>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ═══ LAYANAN JASA SECTION ═══ */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Globe size={20} className="text-[#818cf8]" />
            <h2 className="text-xl font-bold text-white">Layanan Jasa & Bot</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {serviceProducts.map((product) => {
              const iconMapService = { 'jasa-web': Globe, 'script-bot': Code, 'vps-bot': Server };
              const badgeMapService = {
                'jasa-web': { text: 'Hot', class: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
                'script-bot': { text: 'Auto', class: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
                'vps-bot': { text: 'Server', class: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
              };
              const ServiceIcon = iconMapService[product.id] || Globe;
              const serviceBadge = badgeMapService[product.id];
              
              const isConsultation = false; // Disable direct landing page consultation redirect for now to use product page form
              
              const href = isConsultation
                ? `https://wa.me/6285199605580?text=Halo%20noxarianet%2C%20saya%20ingin%20konsultasi%20mengenai%20${encodeURIComponent(product.name)}.`
                : null;
              
              const CardEl = href ? 'a' : Link;
              const cardProps = href
                ? { href, target: '_blank', rel: 'noreferrer' }
                : { to: `/product/${product.id}` };
              
              return (
                <CardEl
                  key={product.id}
                  {...cardProps}
                  className="group relative bg-[#0E0E0E] hover:bg-[#151515] border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all flex flex-col items-center text-center"
                >
                  {serviceBadge && (
                    <span className={`absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${serviceBadge.class}`}>{serviceBadge.text}</span>
                  )}
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-white transition-colors mb-4 mt-1">
                    <ServiceIcon size={30} />
                  </div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{product.category}</span>
                  <h3 className="text-sm font-bold text-white leading-tight mb-0.5">{product.name}</h3>
                  {product.subtitle && (
                    <p className="text-[9px] text-purple-400/90 italic mb-1 px-2">{product.subtitle}</p>
                  )}
                  {isConsultation ? (
                    <p className="text-[11px] text-green-400 font-medium">Chat Admin via WhatsApp</p>
                  ) : (
                    <p className="text-[11px] text-gray-500">Mulai Rp {product.price.toLocaleString('id-ID')}</p>
                  )}
                </CardEl>
              );
            })}
          </div>
        </section>

        {/* ═══ TESTIMONIAL SLIDER ═══ */}
        {testimonials.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold text-white text-center mb-6">Apa Kata Mereka?</h2>
            <div className="relative max-w-lg mx-auto overflow-hidden bg-[#0E0E0E] border border-white/5 rounded-3xl p-6 shadow-lg group">
              {/* Navigation Arrows */}
              <button 
                onClick={() => setCurrentTestiIdx(prev => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all z-10 border border-white/5"
              >
                <ChevronRight className="rotate-180" size={16} />
              </button>
              <button 
                onClick={() => setCurrentTestiIdx(prev => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all z-10 border border-white/5"
              >
                <ChevronRight size={16} />
              </button>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestiIdx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center text-center px-8"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < (testimonials[currentTestiIdx]?.rating || 5) ? "fill-yellow-400 text-yellow-400" : "text-white/10"}
                      />
                    ))}
                  </div>
                  {(testimonials[currentTestiIdx]?.text || testimonials[currentTestiIdx]?.message) && (
                    <p className="text-sm text-gray-300 italic mb-4">
                      "{testimonials[currentTestiIdx]?.text || testimonials[currentTestiIdx]?.message}"
                    </p>
                  )}
                  <p className="text-xs font-bold text-purple-400">
                    {(() => {
                      const num = testimonials[currentTestiIdx]?.name || testimonials[currentTestiIdx]?.wa_number || 'Customer';
                      if (num.length > 7) {
                        return `${num.substring(0, 4)}****${num.substring(num.length - 4)}`;
                      }
                      return num;
                    })()}
                  </p>
                </motion.div>
              </AnimatePresence>
              
              {/* Controls */}
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentTestiIdx(idx)}
                    className={`transition-all rounded-full ${currentTestiIdx === idx ? 'w-6 h-1.5 bg-purple-500' : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'}`}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══ DESCRIPTION ═══ */}
        <div className="mb-12 text-center">
          <p className="text-xs text-gray-500 leading-relaxed max-w-lg mx-auto">
            Platform digital andalan untuk upgrade produktivitas dan hiburanmu tanpa bikin dompet boncos. Nikmati pengalaman belanja akun premium yang 100% aman, diproses otomatis secara instan, dengan penawaran harga spesial.
          </p>
        </div>

      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-white/5 bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="noxarianet" className="w-7 h-7 rounded object-contain" />
                <span className="text-lg font-bold text-white">noxaria<span className="text-purple-400">net</span></span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Platform digital andalan untuk upgrade produktivitas dan hiburanmu tanpa bikin dompet boncos.
              </p>
            </div>
            {/* Links */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Layanan</h4>
              <ul className="space-y-2.5 text-xs text-gray-400">
                <li><Link to="/garansi" className="hover:text-white transition">Klaim Garansi</Link></li>
                <li><Link to="/tos" className="hover:text-white transition">Syarat & Ketentuan</Link></li>
                <li><Link to="/cara" className="hover:text-white transition">Cara Order</Link></li>
              </ul>
            </div>
            {/* Contact */}
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

export default LandingPage;
