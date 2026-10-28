import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';

/**
 * HeroSection — Hero banner with status badge, heading, and typewriter search bar.
 */
const HeroSection = ({ settings, searchQuery, onSearchChange }) => {
    const [typedPlaceholder, setTypedPlaceholder] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    // Typewriter Effect for Search Placeholder
    useEffect(() => {
        if (isFocused || searchQuery) return;

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
                    timeout = setTimeout(tick, 1500);
                    return;
                }
                timeout = setTimeout(tick, 80);
            } else {
                setTypedPlaceholder(currentPhrase.substring(0, charIdx - 1));
                charIdx--;
                if (charIdx === 0) {
                    isDeleting = false;
                    phraseIdx = (phraseIdx + 1) % phrases.length;
                    timeout = setTimeout(tick, 400);
                    return;
                }
                timeout = setTimeout(tick, 40);
            }
        };

        timeout = setTimeout(tick, 500);
        return () => clearTimeout(timeout);
    }, [isFocused, searchQuery]);

    const siteContent = settings.site_content || {
        heroTitle: 'Solusi Digital Cerdas,',
        heroSubtitle: 'Untuk Kebutuhan Tanpa Batas.',
        heroDesc: 'Tingkatkan produktivitas dan hiburanmu dengan layanan premium terjangkau.',
    };

    return (
        <section className="text-center pt-16 pb-10">
            {/* Badge Status */}
            <div className="inline-flex items-center gap-2.5 bg-white/80 hover:bg-white backdrop-blur-md border border-purple-100/80 hover:border-purple-200 rounded-full pl-3 pr-3.5 py-1.5 mb-6 shadow-[0_2px_12px_rgba(124,58,237,0.06)] hover:shadow-[0_4px_16px_rgba(124,58,237,0.1)] transition-all duration-300 group cursor-default">
                <span className="relative flex h-2.5 w-2.5">
                    {settings.shop_status?.isOpen ? (
                        <>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                        </>
                    ) : (
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.5)]"></span>
                    )}
                </span>
                <span className="text-xs font-semibold text-slate-800 tracking-tight">
                    {settings.shop_status?.isOpen ? 'Layanan Online' : 'Toko Sedang Tutup'}
                </span>
                {settings.shop_status?.isOpen && (
                    <>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="text-[11px] font-bold text-purple-600 bg-purple-50/80 border border-purple-100 px-2 py-0.5 rounded-full tracking-wide">
                            Ready Order 24/7
                        </span>
                    </>
                )}
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-black tracking-[-0.035em] text-slate-950 mb-5 leading-[1.12]">
                {siteContent.heroTitle}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-violet-500 to-pink-500 drop-shadow-[0_10px_20px_rgba(147,51,234,0.15)] inline-block">
                    {siteContent.heroSubtitle}
                </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-slate-500 max-w-xl mx-auto leading-relaxed mb-10 font-normal">
                {siteContent.heroDesc}
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto mb-8">
                <div className="relative">
                    <Search 
                        size={19} 
                        className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                            isFocused ? 'text-purple-600' : 'text-slate-600'
                        }`} 
                    />
                    <input
                        type="text"
                        placeholder={isFocused ? 'Ketik nama produk...' : typedPlaceholder || 'Cari produk...'}
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className="w-full bg-white border-2 border-slate-300 hover:border-slate-400 focus:border-purple-600 rounded-2xl py-4 pl-12 pr-11 text-sm font-medium text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-purple-600/15 shadow-md shadow-slate-200/60 transition-all duration-200"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => onSearchChange('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                            title="Hapus pencarian"
                            aria-label="Hapus pencarian"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
