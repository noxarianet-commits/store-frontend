import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, LifeBuoy, ChevronRight } from 'lucide-react';
import api from '../api';
import { getWaUrl, formatWaDisplay, getWaNumber } from '../utils/waUtils';

const CSContactPage = () => {
    const navigate = useNavigate();
    const [settings, setSettings] = useState({});

    useEffect(() => {
        api.get('/settings').then(res => setSettings(res.data || {})).catch(() => {});
    }, []);

    const waNum = getWaNumber(settings);

    return (
        <div className="min-h-screen text-slate-800 p-6 md:p-12 font-sans">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-purple-600 transition-all mb-8 text-sm font-medium shadow-sm"
                >
                    <ArrowLeft size={16} /> Kembali
                </button>

                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-green-500 bg-white shadow-sm">
                        <img src="/logocs.png" alt="CS Support" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900">Bantuan CS</h1>
                </div>
                <p className="text-sm text-slate-500 mb-8 ml-[60px]">
                    Pilih cara menghubungi tim Customer Service Noxarianet Store.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                    <a
                        href={getWaUrl(settings, 'Halo CS noxarianet, saya butuh bantuan.')}
                        target="_blank"
                        rel="noreferrer"
                        className="group bg-white border border-green-200 hover:border-green-400 hover:shadow-lg rounded-3xl p-6 transition-all hover:-translate-y-0.5"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center mb-4 group-hover:bg-green-500 transition-colors">
                            <MessageCircle className="text-green-600 group-hover:text-white transition-colors" size={24} />
                        </div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <h2 className="font-bold text-slate-900">Chat via WhatsApp</h2>
                            <ChevronRight size={18} className="text-slate-300 group-hover:text-green-500 transition-colors" />
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Respons cepat untuk pertanyaan umum. Hubungi {formatWaDisplay(waNum)}.
                        </p>
                    </a>

                    <Link
                        to="/ticket/new"
                        className="group bg-white border border-purple-200 hover:border-purple-400 hover:shadow-lg rounded-3xl p-6 transition-all hover:-translate-y-0.5"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
                            <LifeBuoy className="text-purple-600 group-hover:text-white transition-colors" size={24} />
                        </div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <h2 className="font-bold text-slate-900">Buat Tiket</h2>
                            <ChevronRight size={18} className="text-slate-300 group-hover:text-purple-500 transition-colors" />
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Kendala tercatat dan diproses tim CS. Cocok untuk masalah pesanan atau garansi.
                        </p>
                    </Link>
                </div>

                <div className="mt-6 text-center">
                    <Link to="/ticket" className="text-xs font-semibold text-slate-400 hover:text-purple-600 transition">
                        Lihat tiket saya →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CSContactPage;
