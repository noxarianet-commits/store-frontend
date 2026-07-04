import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertOctagon, RefreshCw, ServerCrash, ZapOff } from 'lucide-react';

const ErrorPage = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'unknown';

  let icon = <ServerCrash size={64} className="text-red-500 mb-6 mx-auto" />;
  let title = 'Oops! Terjadi Kesalahan';
  let message = 'Sistem sedang mengalami gangguan. Silakan coba beberapa saat lagi.';

  if (type === 'ratelimit') {
    icon = <ZapOff size={64} className="text-yellow-500 mb-6 mx-auto" />;
    title = 'Terlalu Banyak Permintaan';
    message = 'Anda telah melakukan terlalu banyak aksi dalam waktu singkat. Mohon tunggu beberapa saat sebelum mencoba lagi.';
  } else if (type === 'network') {
    icon = <AlertOctagon size={64} className="text-orange-500 mb-6 mx-auto" />;
    title = 'Koneksi Terputus';
    message = 'Gagal terhubung ke server. Pastikan koneksi internet Anda stabil atau server mungkin sedang down.';
  } else if (type === 'server') {
    icon = <ServerCrash size={64} className="text-red-500 mb-6 mx-auto" />;
    title = 'Server Sedang Dalam Perbaikan';
    message = 'Sedang terjadi kendala pada server kami. Tim teknis sedang memperbaikinya. Silakan coba lagi nanti.';
  }

  return (
    <div className="min-h-screen bg-[#0A031A] flex flex-col items-center justify-center px-6 overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-[#0E0E0E]/80 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-3xl text-center max-w-lg w-full shadow-2xl"
      >
        {icon}
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-4">{title}</h1>
        <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-8">{message}</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => window.location.href = '/'}
            className="flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-[0_10px_30px_-10px_rgba(147,51,234,0.5)]"
          >
            <RefreshCw size={18} />
            Muat Ulang Halaman
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ErrorPage;
