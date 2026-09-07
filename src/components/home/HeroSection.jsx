import { useEffect, useState } from 'react';
import { Search, ArrowDownRight } from 'lucide-react';

const HeroSection = ({ settings, searchQuery, onSearchChange }) => {
    const [typedPlaceholder, setTypedPlaceholder] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (isFocused || searchQuery) return;
        const phrases = ['CapCut Premium', 'Mobile Legends', 'Jasa Pembuatan Website', 'Free Fire', 'Spotify Premium', 'Canva Pro'];
        let phraseIdx = 0;
        let charIdx = 0;
        let isDeleting = false;
        let timeout;
        const tick = () => {
            const phrase = phrases[phraseIdx];
            if (!isDeleting) {
                setTypedPlaceholder(phrase.substring(0, charIdx + 1));
                charIdx += 1;
                if (charIdx === phrase.length) {
                    isDeleting = true;
                    timeout = setTimeout(tick, 1300);
                    return;
                }
                timeout = setTimeout(tick, 70);
            } else {
                setTypedPlaceholder(phrase.substring(0, charIdx - 1));
                charIdx -= 1;
                if (charIdx === 0) {
                    isDeleting = false;
                    phraseIdx = (phraseIdx + 1) % phrases.length;
                    timeout = setTimeout(tick, 300);
                    return;
                }
                timeout = setTimeout(tick, 35);
            }
        };
        timeout = setTimeout(tick, 400);
        return () => clearTimeout(timeout);
    }, [isFocused, searchQuery]);

    const siteContent = settings.site_content || {
        heroTitle: 'Solusi Digital Cerdas,',
        heroSubtitle: 'Untuk Kebutuhan Tanpa Batas.',
        heroDesc: 'Tingkatkan produktivitas dan hiburanmu dengan layanan premium terjangkau.',
    };

    return (
        <section className="catalog-hero">
            <div>
                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.1em] text-[var(--teal)]">
                    <span className={`h-2 w-2 rounded-full ${settings.shop_status?.isOpen ? 'bg-[var(--teal)]' : 'bg-[var(--danger)]'}`} />
                    {settings.shop_status?.isOpen ? 'Katalog aktif / siap order' : 'Toko sedang tutup'}
                </div>
                <h1 className="mt-6">{siteContent.heroTitle} <strong>{siteContent.heroSubtitle}</strong></h1>
                <p className="catalog-hero-copy">{siteContent.heroDesc}</p>
                <div className="catalog-hero-actions">
                    <a href="#catalog" className="btn-primary">Lihat katalog <ArrowDownRight size={16} /></a>
                    <a href="#trust" className="btn-secondary">Cara kerja</a>
                </div>
                <div className="catalog-search">
                    <label htmlFor="catalog-search">Cari di katalog</label>
                    <Search size={18} className="absolute right-4 top-[42px]" />
                    <input
                        id="catalog-search"
                        type="search"
                        placeholder={isFocused ? 'Ketik nama produk...' : typedPlaceholder || 'Cari produk...'}
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                    />
                </div>
            </div>
            <aside className="catalog-index" aria-label="Ringkasan katalog">
                <div className="catalog-index-row"><span>01 / Katalog</span><span>Layanan digital</span></div>
                <div className="catalog-index-row"><span>02 / Pembayaran</span><span>QRIS otomatis</span></div>
                <div className="catalog-index-row"><span>03 / Pengiriman</span><span>Email & WhatsApp</span></div>
                <p className="catalog-index-note">Pilih kebutuhanmu, tentukan varian, lalu selesaikan dalam satu alur checkout yang jelas.</p>
            </aside>
        </section>
    );
};

export default HeroSection;
