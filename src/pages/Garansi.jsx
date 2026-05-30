
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const Garansi = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-gray-200 p-6 md:p-12 font-sans">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-gray-400 hover:text-white transition-all mb-8 text-sm font-medium shadow-sm backdrop-blur-sm"
                >
                    <ArrowLeft size={16} /> Kembali
                </button>
                <div className="flex items-center gap-3 mb-6">
                    <Shield className="text-purple-500" size={32} />
                    <h1 className="text-3xl font-bold text-white">Klaim Garansi</h1>
                </div>
                <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 text-sm text-gray-400 leading-relaxed">
                    <p>
                        Seluruh produk digital premium yang dijual di <strong>noxarianet</strong> bergaransi sesuai dengan durasi yang dibeli, kecuali dinyatakan lain pada deskripsi produk.
                    </p>
                    <div className="space-y-4">
                        <h2 className="text-white font-semibold text-base">Cara Melakukan Klaim Garansi:</h2>
                        <ul className="list-decimal pl-5 space-y-3">
                            <li>Pastikan Anda masih menyimpan <strong>Nomor Pesanan / Invoice</strong> yang diberikan saat pertama kali transaksi berhasil.</li>
                            <li>Hubungi Admin melalui WhatsApp ke nomor <span className="text-white font-medium">+62 851-9960-5580</span>.</li>
                            <li>Sertakan Invoice pembelian dan jelaskan kendala yang dialami (misal: akun terkena screen limit, password salah, dsb).</li>
                            <li>Tunggu admin melakukan pengecekan. Jika terbukti bermasalah dan bukan karena pelanggaran aturan, admin akan memberikan akun pengganti atau memperbaiki akun Anda dalam waktu maksimal 1x24 jam.</li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-white font-semibold text-base">Garansi Hangus Jika:</h2>
                        <ul className="list-disc pl-5 space-y-3">
                            <li>Mencoba mengganti email, password, atau detail profil utama yang dilarang.</li>
                            <li>Berbagi akun (sharing) ke perangkat yang melebihi batas maksimal ketentuan produk.</li>
                            <li>Menggunakan VPN atau tools ilegal yang menyebabkan akun diblokir oleh pihak aplikasi (misal Netflix, Spotify).</li>
                        </ul>
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/5 text-xs">
                        <p>Dengan membeli di noxarianet, Anda dianggap menyetujui seluruh aturan garansi ini.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Garansi;
