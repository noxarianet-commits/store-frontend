
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

const TOS = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen text-gray-200 p-6 md:p-12 font-sans">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-gray-400 hover:text-white transition-all mb-8 text-sm font-medium shadow-sm backdrop-blur-sm"
                >
                    <ArrowLeft size={16} /> Kembali
                </button>
                <div className="flex items-center gap-3 mb-6">
                    <FileText className="text-purple-500" size={32} />
                    <h1 className="text-3xl font-bold text-white">Syarat & Ketentuan</h1>
                </div>
                <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 text-sm text-gray-400 leading-relaxed">
                    <p>
                        Selamat datang di <strong>noxarianet</strong>. Berikut adalah syarat dan ketentuan yang berlaku untuk setiap pembelian di website kami.
                    </p>
                    
                    <div className="space-y-4">
                        <h2 className="text-white font-semibold text-base">1. Ketentuan Umum</h2>
                        <p>Noxarianet adalah platform penyedia produk digital (akun premium, tools, script bot, dll). Semua transaksi dilakukan secara digital tanpa pengiriman fisik.</p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-white font-semibold text-base">2. Kebijakan Pembayaran</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Pembayaran harus dilakukan sesuai dengan nominal yang tertera pada invoice hingga 3 digit terakhir.</li>
                            <li>Kami tidak bertanggung jawab atas kesalahan transfer ke nomor rekening/e-wallet selain yang tertera di sistem.</li>
                            <li>Pesanan akan diproses otomatis setelah pembayaran terverifikasi oleh sistem kami.</li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-white font-semibold text-base">3. Kebijakan Produk & Penggunaan</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Dilarang keras mengubah data login (Email/Password) pada akun tipe <em>Shared</em>.</li>
                            <li>Pastikan Anda memahami perbedaan akun Private dan Shared sebelum membeli.</li>
                            <li>Produk berupa Script atau Jasa Web tidak dapat direfund jika proses pengerjaan sudah dimulai atau file sudah dikirim.</li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-white font-semibold text-base">4. Pembatalan & Refund</h2>
                        <p>Dana dapat dikembalikan (Refund) secara penuh jika produk tidak tersedia atau admin tidak dapat menyelesaikan pesanan jasa web/script dalam batas waktu yang telah dijanjikan. Refund tidak berlaku untuk salah beli atau ketidakcocokan perangkat.</p>
                    </div>

                </div>
            </div>
        </div>
    );
};
export default TOS;
