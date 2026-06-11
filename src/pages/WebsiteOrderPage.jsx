import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Globe, Send, CheckCircle2, Code, Layout, Monitor, Server, ShoppingBag, Palette } from 'lucide-react';
import { notifySuccess, notifyWarning } from '../utils/notify';

const WA_NUMBER = '6285199605580';

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

        const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');

        setSending(false);
        notifySuccess('Pesanan dikirim ke WhatsApp!');
    };

    const SelectedTypeIcon = websiteTypes.find(t => t.value === websiteType)?.icon || Globe;

    return (
        <div className="min-h-screen font-sans text-gray-200">
            {/* HEADER */}
            <nav className="sticky top-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2.5">
                        <img src="/logo.png" alt="noxarianet" className="w-9 h-9 rounded-lg object-contain" />
                        <span className="text-xl font-bold tracking-tight text-white">noxaria<span className="text-purple-400">net</span></span>
                    </Link>
                </div>
            </nav>

            <main className="max-w-2xl mx-auto px-4 py-10">
                {/* Back */}
                <button
                    onClick={() => { window.scrollTo(0, 0); navigate('/'); }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-gray-400 hover:text-white transition-all mb-8 text-sm font-medium"
                >
                    <ArrowLeft size={16} /> Kembali
                </button>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
                            <Globe className="text-purple-400" size={24} />
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Layanan Jasa</span>
                            <h1 className="text-2xl font-extrabold text-white">Pembuatan Website</h1>
                        </div>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Isi form di bawah untuk konsultasi & order jasa pembuatan website. Pesanan akan langsung dikirim ke WhatsApp customer service kami.
                    </p>
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-5"
                >
                    {/* Budget */}
                    <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">💰 Range Budget</label>
                        <select
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all appearance-none cursor-pointer"
                        >
                            {budgetOptions.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-[#1a1a1a] text-white">
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Website Type */}
                    <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">🖥️ Jenis Website</label>
                        <select
                            value={websiteType}
                            onChange={(e) => setWebsiteType(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all appearance-none cursor-pointer"
                        >
                            {websiteTypes.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-[#1a1a1a] text-white">
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        {websiteType && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-2">
                                <SelectedTypeIcon size={14} />
                                <span>{websiteTypes.find(t => t.value === websiteType)?.desc}</span>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">📋 Kebutuhan / Flow Website</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Jelaskan kebutuhan website Anda, contoh:&#10;- Saya butuh landing page untuk bisnis kopi&#10;- Ada halaman home, about, contact&#10;- Desain modern dan responsive&#10;- Integrasi WhatsApp"
                            rows={6}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all resize-none"
                        />
                        <p className="text-[11px] text-gray-600 mt-2">Semakin detail penjelasan Anda, semakin akurat estimasi yang kami berikan.</p>
                    </div>

                    {/* Summary Preview */}
                    {(budget || websiteType || description) && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/3 border border-white/5 rounded-2xl p-5"
                        >
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3"> Ringkasan Pesanan</p>
                            <div className="space-y-2 text-sm">
                                {budget && (
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 size={14} className="text-purple-400" />
                                        <span className="text-gray-400">Budget:</span>
                                        <span className="text-white font-medium">{budget}</span>
                                    </div>
                                )}
                                {websiteType && (
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 size={14} className="text-purple-400" />
                                        <span className="text-gray-400">Jenis:</span>
                                        <span className="text-white font-medium">{websiteType}</span>
                                    </div>
                                )}
                                {description && (
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 size={14} className="text-purple-400 mt-0.5" />
                                        <div>
                                            <span className="text-gray-400">Kebutuhan:</span>
                                            <p className="text-white text-xs mt-1 whitespace-pre-wrap">{description}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Send Button */}
                    <button
                        onClick={handleSendWA}
                        disabled={sending}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-green-600/20"
                    >
                        {sending ? (
                            <>Mengirim...</>
                        ) : (
                            <><Send size={16} /> Kirim via WhatsApp</>
                        )}
                    </button>

                    <p className="text-center text-[11px] text-gray-600">
                        Pesanan akan dikirim ke WhatsApp Customer Service noxarianet.
                    </p>
                </motion.div>
            </main>
        </div>
    );
};

export default WebsiteOrderPage;
