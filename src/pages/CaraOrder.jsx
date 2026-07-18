
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle } from 'lucide-react';

const CaraOrder = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen text-slate-800 p-6 md:p-12 font-sans">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-purple-600 transition-all mb-8 text-sm font-medium shadow-sm"
                >
                    <ArrowLeft size={16} /> Kembali
                </button>
                <div className="flex items-center gap-3 mb-6">
                    <HelpCircle className="text-purple-600" size={32} />
                    <h1 className="text-3xl font-extrabold text-slate-900">Cara Order</h1>
                </div>
                
                <div className="space-y-4">
                    {/* Step 1 */}
                    <div className="bg-white border border-purple-100 rounded-2xl p-6 flex gap-4 shadow-sm hover:border-purple-200 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">1</div>
                        <div>
                            <h3 className="text-slate-800 font-bold mb-2">Pilih Produk</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">Pilih produk premium atau layanan yang Anda butuhkan di halaman utama. Klik produk untuk melihat detail dan opsi durasi berlangganan.</p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-white border border-purple-100 rounded-2xl p-6 flex gap-4 shadow-sm hover:border-purple-200 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">2</div>
                        <div>
                            <h3 className="text-slate-800 font-bold mb-2">Isi Data Pesanan</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">Masukkan Nomor WhatsApp aktif dan alamat Email aktif Anda. Email ini digunakan untuk mengirimkan detail akun/lisensi dan notifikasi status pesanan secara otomatis.</p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-white border border-purple-100 rounded-2xl p-6 flex gap-4 shadow-sm hover:border-purple-200 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">3</div>
                        <div>
                            <h3 className="text-slate-800 font-bold mb-2">Pilih Metode Pembayaran</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">Kami menerima pembayaran instan via QRIS (E-Wallet, M-Banking) atau Transfer Bank/DANA manual. Silakan selesaikan pembayaran sesuai nominal yang tertera.</p>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div className="bg-white border border-purple-100 rounded-2xl p-6 flex gap-4 shadow-sm hover:border-purple-200 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-bold shrink-0">4</div>
                        <div>
                            <h3 className="text-slate-800 font-bold mb-2">Selesai! Terima Pesanan</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">Jika pembayaran otomatis (QRIS), detail akun/lisensi akan langsung muncul di layar dan dikirim secara otomatis ke Email Anda. Untuk pembayaran manual/layanan jasa, silakan chat admin menggunakan tombol konfirmasi yang disediakan.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CaraOrder;
