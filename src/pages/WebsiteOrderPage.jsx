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
        <div className="min-h-screen font-sans text-slate-800">
            {/* HEADER */}
            <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-purple-100/50 shadow-sm shadow-purple-600/[0.01]">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2.5">
                        <img src="/logo.png" alt="noxarianet" className="w-9 h-9 rounded-lg object-contain" />
                        <span className="text-xl font-bold tracking-tight text-slate-900">noxaria<span className="text-purple-600">net</span></span>
                    </Link>
                </div>
            </nav>

            <main className="max-w-2xl mx-auto px-4 py-10">
                {/* Back */}
                <button
                    onClick={() => { window.scrollTo(0, 0); navigate('/'); }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-purple-600 transition-all mb-8 text-sm font-medium shadow-sm"
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
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center">
                            <Globe className="text-purple-600" size={24} />
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Layanan Jasa</span>
                            <h1 className="text-2xl font-extrabold text-slate-900">Pembuatan Website</h1>
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">
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
                    <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">💰 Range Budget</label>
                        <select
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 transition-all appearance-none cursor-pointer shadow-sm"
                        >
                            {budgetOptions.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-white text-slate-800">
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Website Type */}
                    <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">🖥️ Jenis Website</label>
                        <select
                            value={websiteType}
                            onChange={(e) => setWebsiteType(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 transition-all appearance-none cursor-pointer shadow-sm"
                        >
                            {websiteTypes.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-white text-slate-800">
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        {websiteType && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-purple-700 bg-purple-50 border border-purple-100 rounded-lg px-3 py-2">
                                <SelectedTypeIcon size={14} />
                                <span>{websiteTypes.find(t => t.value === websiteType)?.desc}</span>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">📋 Kebutuhan / Flow Website</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Jelaskan kebutuhan website Anda, contoh:&#10;- Saya butuh landing page untuk bisnis kopi&#10;- Ada halaman home, about, contact&#10;- Desain modern dan responsive&#10;- Integrasi WhatsApp"
                            rows={6}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 transition-all resize-none shadow-sm"
                        />
                        <p className="text-[11px] text-slate-400 mt-2">Semakin detail penjelasan Anda, semakin akurat estimasi yang kami berikan.</p>
                    </div>

                    {/* Summary Preview */}
                    {(budget || websiteType || description) && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-purple-50/50 border border-purple-100 rounded-2xl p-5"
                        >
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Ringkasan Pesanan</p>
                            <div className="space-y-2 text-sm">
                                {budget && (
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 size={14} className="text-purple-600" />
                                        <span className="text-slate-500">Budget:</span>
                                        <span className="text-slate-800 font-semibold">{budget}</span>
                                    </div>
                                )}
                                {websiteType && (
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 size={14} className="text-purple-600" />
                                        <span className="text-slate-500">Jenis:</span>
                                        <span className="text-slate-800 font-semibold">{websiteType}</span>
                                    </div>
                                )}
                                {description && (
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 size={14} className="text-purple-600 mt-0.5" />
                                        <div>
                                            <span className="text-slate-500">Kebutuhan:</span>
                                            <p className="text-slate-800 text-xs mt-1 whitespace-pre-wrap">{description}</p>
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
                        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md shadow-green-600/10 active:scale-[0.98]"
                    >
                        {sending ? (
                            <>Mengirim...</>
                        ) : (
                            <><Send size={16} /> Kirim via WhatsApp</>
                        )}
                    </button>

                    <p className="text-center text-[11px] text-slate-400">
                        Pesanan akan dikirim ke WhatsApp Customer Service noxarianet.
                    </p>
                </motion.div>
            </main>
        </div>
    );
};

export default WebsiteOrderPage;
