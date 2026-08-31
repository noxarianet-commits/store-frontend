import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Globe, Send, CheckCircle2, Code, Layout, Monitor, Server, ShoppingBag, Palette } from 'lucide-react';
import { notifySuccess, notifyWarning } from '../utils/notify';
import api from '../api';
import { getWaUrl } from '../utils/waUtils';

const budgetOptions = [
    { value: '', label: 'Pilih Range Budget' },
    { value: '100K - 1 Juta', label: 'Rp 100.000 - Rp 1.000.000' },
    { value: '1 Juta - 2 Juta', label: 'Rp 1.000.000 - Rp 2.000.000' },
    { value: '2 Juta - 5 Juta', label: 'Rp 2.000.000 - Rp 5.000.000' },
    { value: '5 Juta - 10 Juta', label: 'Rp 5.000.000 - Rp 10.000.000' },
];

const websiteTypes = [
    { value: '', label: 'Pilih Jenis Website' },
    { value: 'Website Statis', label: 'Website Statis', icon: Layout, desc: 'Halaman informasi sederhana' },
    { value: 'Landing Page', label: 'Landing Page', icon: Monitor, desc: 'Halaman promosi / penjualan' },
    { value: 'Company Profile', label: 'Company Profile', icon: Globe, desc: 'Profil perusahaan profesional' },
    { value: 'Toko Online', label: 'Toko Online', icon: ShoppingBag, desc: 'E-commerce dengan katalog produk' },
    { value: 'Web App', label: 'Web App', icon: Code, desc: 'Aplikasi web interaktif' },
    { value: 'Dashboard Admin', label: 'Dashboard Admin', icon: Server, desc: 'Panel admin / manajemen data' },
    { value: 'Custom / Lainnya', label: 'Custom / Lainnya', icon: Palette, desc: 'Kebutuhan khusus' },
];

const WebsiteOrderPage = () => {
    const navigate = useNavigate();
    const [budget, setBudget] = useState('');
    const [websiteType, setWebsiteType] = useState('');
    const [description, setDescription] = useState('');
    const [sending, setSending] = useState(false);
    const [settings, setSettings] = useState({});

    useEffect(() => {
        api.get('/settings').then(res => setSettings(res.data || {})).catch(() => {});
    }, []);

    const handleSendWA = () => {
        if (!budget) { notifyWarning('Pilih range budget terlebih dahulu!'); return; }
        if (!websiteType) { notifyWarning('Pilih jenis website terlebih dahulu!'); return; }
        if (!description.trim()) { notifyWarning('Jelaskan kebutuhan website Anda!'); return; }

        setSending(true);
        const message = [
            '🌐 *ORDER JASA PEMBUATAN WEBSITE*',
            '',
            `💰 *Budget:* ${budget}`,
            `🖥️ *Jenis Website:* ${websiteType}`,
            '',
            '📋 *Kebutuhan / Flow Website:*',
            description,
            '',
            'Mohon info lebih lanjut. Terima kasih!',
        ].join('\n');
        window.open(getWaUrl(settings, message), '_blank');
        setSending(false);
        notifySuccess('Pesanan dikirim ke WhatsApp!');
    };

    const SelectedTypeIcon = websiteTypes.find(t => t.value === websiteType)?.icon || Globe;

    return (
        <div className="min-h-screen font-sans text-ink bg-surface">
            <nav className="sticky top-0 z-50 bg-white/75 backdrop-blur-md border-b border-brandBorder shadow-sm">
                <div className="max-w-[1160px] mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2.5">
                        <img src="/logo.png" alt="noxarianet" className="w-9 h-9 rounded-xl object-contain border border-slate-100" />
                        <span className="text-xl font-bold tracking-tight text-ink">noxaria<span className="text-brand">net</span></span>
                    </Link>
                </div>
            </nav>

            <main className="max-w-[640px] mx-auto px-4 py-8 md:py-10">
                <button
                    onClick={() => { window.scrollTo(0, 0); navigate('/'); }}
                    className="inline-flex items-center gap-2 px-4 h-9 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-brand transition-colors mb-6 text-[13px] font-semibold shadow-sm"
                >
                    <ArrowLeft size={14} /> Kembali
                </button>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-brandSoft border border-brandBorder flex items-center justify-center">
                            <Globe className="text-brand" size={20} />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold text-brand uppercase tracking-[0.08em]">Layanan Jasa</span>
                            <h1 className="text-[22px] font-extrabold text-ink tracking-[-0.02em] leading-none mt-1">Pembuatan Website</h1>
                        </div>
                    </div>
                    <p className="text-[13px] text-slate-600 leading-relaxed">
                        Isi form untuk konsultasi & order. Pesanan langsung dikirim ke WhatsApp CS kami — respon 1–3 menit.
                    </p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="space-y-4">
                    <div className="bg-white border border-brandBorder rounded-2xl p-5 shadow-soft">
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-[0.06em] mb-3 block">Range Budget</label>
                        <select
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl h-[48px] px-4 text-[14px] text-ink focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all cursor-pointer"
                        >
                            {budgetOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-white border border-brandBorder rounded-2xl p-5 shadow-soft">
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-[0.06em] mb-3 block">Jenis Website</label>
                        <select
                            value={websiteType}
                            onChange={(e) => setWebsiteType(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl h-[48px] px-4 text-[14px] text-ink focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all cursor-pointer"
                        >
                            {websiteTypes.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        {websiteType && (
                            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-brand bg-brandSoft border border-brandBorder rounded-xl px-3 py-2.5">
                                <SelectedTypeIcon size={14} />
                                <span>{websiteTypes.find(t => t.value === websiteType)?.desc}</span>
                            </div>
                        )}
                    </div>

                    <div className="bg-white border border-brandBorder rounded-2xl p-5 shadow-soft">
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-[0.06em] mb-3 block">Kebutuhan / Flow Website</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Jelaskan kebutuhan Anda, contoh:
- Landing page untuk bisnis kopi
- Halaman home, about, contact
- Desain modern responsive
- Integrasi WhatsApp"
                            rows={6}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[14px] text-ink placeholder:text-slate-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all resize-none"
                        />
                        <p className="text-[11px] text-slate-400 mt-2">Semakin detail, semakin akurat estimasinya.</p>
                    </div>

                    {(budget || websiteType || description) && (
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="bg-brandSoft border border-brandBorder rounded-2xl p-5">
                            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-[0.06em] mb-3">Ringkasan</p>
                            <div className="space-y-2 text-[13px]">
                                {budget && <div className="flex items-center gap-2"><CheckCircle2 size={13} className="text-brand shrink-0" /><span className="text-slate-500">Budget:</span><span className="text-ink font-semibold">{budget}</span></div>}
                                {websiteType && <div className="flex items-center gap-2"><CheckCircle2 size={13} className="text-brand shrink-0" /><span className="text-slate-500">Jenis:</span><span className="text-ink font-semibold">{websiteType}</span></div>}
                                {description && <div className="flex items-start gap-2"><CheckCircle2 size={13} className="text-brand mt-0.5 shrink-0" /><div><span className="text-slate-500">Kebutuhan:</span><p className="text-ink text-xs mt-1 whitespace-pre-wrap leading-relaxed">{description}</p></div></div>}
                            </div>
                        </motion.div>
                    )}

                    <button onClick={handleSendWA} disabled={sending} className="w-full h-12 bg-[#1d9e48] hover:bg-[#15803d] disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-[13px] shadow-sm">
                        {sending ? 'Mengirim...' : <><Send size={15} /> Kirim via WhatsApp</>}
                    </button>
                    <p className="text-center text-[11px] text-slate-400">Pesanan dikirim ke WhatsApp Customer Service.</p>
                </motion.div>
            </main>
        </div>
    );
};

export default WebsiteOrderPage;
