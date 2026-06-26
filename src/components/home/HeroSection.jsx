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
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6">
                <span className={`w-2 h-2 ${settings.shop_status?.isOpen ? 'bg-green-400' : 'bg-red-400'} rounded-full animate-pulse`} />
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    {settings.shop_status?.isOpen ? 'Toko Buka - Ready Order' : 'Toko Sedang Tutup'}
                </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight">
                {siteContent.heroTitle}<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a78bfa] via-[#818cf8] to-[#6366f1]">
                    {siteContent.heroSubtitle}
                </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base text-gray-400 max-w-xl mx-auto leading-relaxed mb-10">
                {siteContent.heroDesc}
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto mb-8">
                <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder={isFocused ? 'Ketik nama produk...' : typedPlaceholder || 'Cari produk...'}
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/40 focus:bg-white/8 transition-all"
                    />
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
