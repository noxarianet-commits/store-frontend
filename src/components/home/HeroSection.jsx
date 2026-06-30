import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

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
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-full px-4 py-1.5 mb-6 shadow-sm">
                <span className={`w-2.5 h-2.5 ${settings.shop_status?.isOpen ? 'bg-green-500' : 'bg-red-500'} rounded-full animate-pulse`} />
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                    {settings.shop_status?.isOpen ? 'Toko Buka - Ready Order' : 'Toko Sedang Tutup'}
                </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-5 leading-tight tracking-tight">
                {siteContent.heroTitle}<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-700">
                    {siteContent.heroSubtitle}
                </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base text-slate-500 max-w-xl mx-auto leading-relaxed mb-10">
                {siteContent.heroDesc}
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto mb-8">
                <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder={isFocused ? 'Ketik nama produk...' : typedPlaceholder || 'Cari produk...'}
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className="w-full bg-white border border-slate-200/80 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-600/10 focus:border-purple-600 shadow-sm transition-all duration-200"
                    />
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
