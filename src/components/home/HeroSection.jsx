import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

/**
 * HeroSection — Compact, simple. Tight vertical rhythm, single focus: search.
 * No gradient text, no extra pill rows. Mobile-first.
 */
const HeroSection = ({ settings, searchQuery, onSearchChange }) => {
    const [typedPlaceholder, setTypedPlaceholder] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (isFocused || searchQuery) return;
        const phrases = ['CapCut Premium','Mobile Legends','Spotify Premium','Free Fire','Canva Pro','Netflix','PUBG UC'];
        let phraseIdx = 0, charIdx = 0, isDeleting = false, timeout;
        const tick = () => {
            const cur = phrases[phraseIdx];
            if (!isDeleting) {
                setTypedPlaceholder(cur.substring(0, charIdx + 1));
                charIdx++;
                if (charIdx === cur.length) { isDeleting = true; timeout = setTimeout(tick, 1400); return; }
                timeout = setTimeout(tick, 85);
            } else {
                setTypedPlaceholder(cur.substring(0, charIdx - 1));
                charIdx--;
                if (charIdx === 0) { isDeleting = false; phraseIdx = (phraseIdx + 1) % phrases.length; timeout = setTimeout(tick, 400); return; }
                timeout = setTimeout(tick, 40);
            }
        };
        timeout = setTimeout(tick, 500);
        return () => clearTimeout(timeout);
    }, [isFocused, searchQuery]);

    const siteContent = settings.site_content || {
        heroTitle: 'Semua Kebutuhan Digital —',
        heroSubtitle: 'Beres dalam Hitungan Detik.',
        heroDesc: 'Top up game, e-wallet, sampai aplikasi premium. Proses otomatis, bayar via QRIS.',
    };

    return (
        <section className="text-center pt-6 md:pt-8 pb-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white border border-brandBorder rounded-full px-3.5 py-1.5 mb-4 shadow-sm">
                <span className="relative flex h-2 w-2">
                    <span className={`absolute inline-flex h-full w-full rounded-full ${settings.shop_status?.isOpen ? 'bg-emerald-400' : 'bg-red-400'} opacity-30 animate-ping`} />
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${settings.shop_status?.isOpen ? 'bg-emerald-500' : 'bg-red-500'}`} />
                </span>
                <span className="text-[11px] font-bold text-ink tracking-wide">
                    {settings.shop_status?.isOpen ? 'Toko Buka • Ready Order' : 'Toko Tutup Sementara'}
                </span>
            </div>

            {/* Heading — compact */}
            <h1 className="font-display font-extrabold text-ink leading-[0.98] tracking-[-0.025em] max-w-[640px] mx-auto text-[26px] leading-[1.05] sm:text-[30px] md:text-[36px]">
                <span className="block">{siteContent.heroTitle}</span>
                <span className="block text-brand">{siteContent.heroSubtitle}</span>
            </h1>

            <p className="text-[13px] md:text-[13.5px] leading-relaxed text-slate-600 max-w-[48ch] mx-auto mt-3">
                {siteContent.heroDesc}
            </p>

            {/* Search — 44-48px, restrained */}
            <div className="max-w-[520px] mx-auto mt-5">
                <div className="relative group">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors" />
                    <input
                        type="text"
                        placeholder={isFocused ? 'Ketik nama produk...' : (typedPlaceholder ? `Cari ${typedPlaceholder}...` : 'Cari produk...')}
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className="w-full bg-white border border-slate-200 rounded-full h-[44px] md:h-[46px] pl-10 pr-4 text-[13px] text-ink placeholder:text-slate-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 shadow-soft transition-all"
                    />
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
