import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import api from '../api';
import { getWaNumber, getWaUrl, formatWaDisplay } from '../utils/waUtils';

const Garansi = () => {
    const navigate = useNavigate();
    const [settings, setSettings] = useState({});

    useEffect(() => {
        api.get('/settings').then(res => setSettings(res.data || {})).catch(() => {});
    }, []);

    const waNum = getWaNumber(settings);

    return (
        <div className="min-h-screen text-ink p-6 md:p-12 font-sans">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-brand transition-all mb-8 text-sm font-medium shadow-sm"
                >
                    <ArrowLeft size={16} /> Kembali
                </button>
                <div className="flex items-center gap-3 mb-6">
                    <Shield className="text-brand" size={32} />
                    <h1 className="text-3xl font-extrabold text-ink">Klaim Garansi</h1>
                </div>
                <div className="bg-white border border-brandBorder rounded-3xl p-6 md:p-8 space-y-6 text-sm text-slate-600 leading-relaxed shadow-sm hover:border-brandBorder transition-colors">
                    <p>
                        Seluruh produk digital premium yang dijual di <strong>Noxarianet Store</strong> bergaransi sesuai dengan durasi yang dibeli, kecuali dinyatakan lain pada deskripsi produk.
                    </p>
                    <div className="space-y-4">
                        <h2 className="text-ink font-bold text-base">Cara Melakukan Klaim Garansi:</h2>
                        <ul className="list-decimal pl-5 space-y-3">
                            <li>Pastikan Anda masih menyimpan <strong>Nomor Pesanan / Invoice</strong> yang diberikan saat pertama kali transaksi berhasil.</li>
                            <li>
                                Hubungi Admin melalui WhatsApp ke nomor{' '}
                                <a
                                    href={getWaUrl(settings, 'Halo Admin, saya mau klaim garansi.')}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-brand font-semibold hover:underline"
                                >
                                    {formatWaDisplay(waNum)}
                                </a>.
                            </li>
                            <li>Sertakan Invoice pembelian dan jelaskan kendala yang dialami (misal: akun terkena screen limit, password salah, dsb).</li>
                            <li>Tunggu admin melakukan pengecekan. Jika terbukti bermasalah dan bukan karena pelanggaran aturan, admin akan memberikan akun pengganti atau memperbaiki akun Anda dalam waktu maksimal 1x24 jam.</li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-ink font-bold text-base">Garansi Hangus Jika:</h2>
                        <ul className="list-disc pl-5 space-y-3">
                            <li>Mencoba mengganti email, password, atau detail profil utama yang dilarang.</li>
                            <li>Berbagi akun (sharing) ke perangkat yang melebihi batas maksimal ketentuan produk.</li>
                            <li>Menggunakan VPN atau tools ilegal yang menyebabkan akun diblokir oleh pihak aplikasi (misal Netflix, Spotify).</li>
                        </ul>
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-100 text-xs">
                        <p>Dengan membeli di Noxarianet Store, Anda dianggap menyetujui seluruh aturan garansi ini.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Garansi;
