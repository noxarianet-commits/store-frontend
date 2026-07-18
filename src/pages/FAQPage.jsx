import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ALL_FAQS = [
    {
        id: 1,
        q: 'Apa itu Noxarianet Store?',
        a: 'Noxarianet Store adalah platform layanan digital yang menyediakan transfer e-wallet, aplikasi premium, top up game, dan berbagai kebutuhan digital lainnya dengan proses cepat, aman, dan praktis.',
    },
    {
        id: 2,
        q: 'Apakah DANA yang belum Premium bisa transfer?',
        a: 'Bisa. Kamu dapat transfer ke sesama DANA maupun ke berbagai e-wallet lainnya melalui layanan Noxarianet Store tanpa perlu upgrade ke DANA Premium.',
    },
    {
        id: 3,
        q: 'Bagaimana proses transaksinya?',
        a: 'Semua transaksi diproses secara otomatis melalui sistem sehingga lebih cepat, praktis, dan meminimalkan kesalahan.',
    },
    {
        id: 4,
        q: 'Pembayarannya bagaimana?',
        a: 'Pembayaran menggunakan QRIS Otomatis (Dynamic QRIS) sehingga lebih mudah, aman, dan praktis tanpa perlu konfirmasi manual.',
    },
    {
        id: 5,
        q: 'Berapa lama proses transaksi?',
        a: 'Sebagian besar transaksi diproses dalam hitungan detik hingga beberapa menit, tergantung jenis layanan dan kondisi sistem.',
    },
    {
        id: 6,
        q: 'Apakah data transaksi aman di Noxarianet Store?',
        a: 'Ya. Data transaksi pelanggan dijaga dengan baik dan hanya digunakan untuk keperluan proses transaksi. Privasi pelanggan menjadi prioritas kami.',
    },
    {
        id: 7,
        q: 'Apakah layanan tersedia 24 jam?',
        a: 'Ya. Sistem kami beroperasi secara otomatis sehingga pelanggan dapat bertransaksi kapan saja sesuai ketersediaan layanan.',
    },
    {
        id: 8,
        q: 'Apakah tersedia produk digital lainnya?',
        a: 'Tentu. Selain transfer e-wallet, kami juga menyediakan aplikasi premium, top up game, serta berbagai produk digital lainnya dengan harga yang bersahabat.',
    },
];

const FAQItem = ({ item, isOpen, onToggle }) => (
    <div
        className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
            isOpen ? 'border-purple-300 shadow-md shadow-purple-100' : 'border-slate-200 hover:border-purple-200'
        } bg-white`}
    >
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
            id={`faq-item-${item.id}`}
            aria-expanded={isOpen}
        >
            <span className={`font-semibold text-sm leading-snug ${isOpen ? 'text-purple-700' : 'text-slate-800'}`}>
                {item.q}
            </span>
            <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                isOpen ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'
            }`}>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
        </button>
        <AnimatePresence initial={false}>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                >
                    <div className="px-6 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                        {item.a}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

const FAQPage = () => {
    const navigate = useNavigate();
    const [openId, setOpenId] = useState(null);

    const toggle = (id) => setOpenId(prev => (prev === id ? null : id));

    return (
        <div className="min-h-screen font-sans text-slate-800 p-6 md:p-12">
            <div className="max-w-3xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-purple-600 transition-all mb-8 text-sm font-medium shadow-sm"
                >
                    <ArrowLeft size={16} /> Kembali
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <HelpCircle className="text-purple-600" size={22} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900">FAQ</h1>
                </div>
                <p className="text-sm text-slate-500 mb-8 ml-[52px]">
                    Pertanyaan yang sering diajukan seputar layanan Noxarianet Store.
                </p>

                {/* FAQ List */}
                <div className="space-y-3">
                    {ALL_FAQS.map((item) => (
                        <FAQItem
                            key={item.id}
                            item={item}
                            isOpen={openId === item.id}
                            onToggle={() => toggle(item.id)}
                        />
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-10 p-6 rounded-3xl bg-gradient-to-br from-purple-50 to-white border border-purple-100 text-center">
                    <p className="text-sm text-slate-600 mb-4">
                        Masih punya pertanyaan? Hubungi kami langsung via WhatsApp.
                    </p>
                    <a
                        href="https://wa.me/6285199605580"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm px-6 py-3 rounded-full transition-colors shadow-md shadow-purple-200"
                    >
                        Chat via WhatsApp
                    </a>
                </div>

                {/* Footer link */}
                <div className="mt-6 text-center">
                    <Link to="/" className="text-xs text-slate-400 hover:text-purple-600 transition">
                        ← Kembali ke Beranda
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
