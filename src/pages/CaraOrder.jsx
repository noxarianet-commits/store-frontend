import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle } from 'lucide-react';

const CaraOrder = () => {
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
                    <HelpCircle className="text-purple-500" size={32} />
                    <h1 className="text-3xl font-bold text-white">Cara Order</h1>
                </div>
                
                <div className="space-y-4">
                    {/* Step 1 */}
                    <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-6 flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold shrink-0">1</div>
                        <div>
                            <h3 className="text-white font-semibold mb-2">Pilih Produk</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">Pilih produk premium atau layanan yang Anda butuhkan di halaman utama. Klik produk untuk melihat detail dan opsi durasi berlangganan.</p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-6 flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold shrink-0">2</div>
                        <div>
                            <h3 className="text-white font-semibold mb-2">Isi Data Pesanan</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">Pilih durasi paket (misal: 1 Bulan, 3 Bulan) dan masukkan Nomor WhatsApp aktif Anda. Nomor ini digunakan untuk mengirim detail akun atau notifikasi pesanan.</p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-6 flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold shrink-0">3</div>
                        <div>
                            <h3 className="text-white font-semibold mb-2">Pilih Metode Pembayaran</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">Kami menerima pembayaran instan via QRIS (E-Wallet, M-Banking) atau Transfer Bank/DANA manual. Silakan selesaikan pembayaran sesuai nominal yang tertera.</p>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-6 flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold shrink-0">4</div>
                        <div>
                            <h3 className="text-white font-semibold mb-2">Selesai! Terima Pesanan</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">Jika pembayaran otomatis (QRIS), akun akan langsung muncul di layar dan dikirim ke WhatsApp Anda. Untuk pembayaran manual/layanan jasa, silakan chat admin menggunakan tombol konfirmasi yang disediakan.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CaraOrder;
