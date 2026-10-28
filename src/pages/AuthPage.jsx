import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import { ArrowLeft, LogIn, UserPlus } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';

export default function AuthPage() {
    const [activeTab, setActiveTab] = useState('login');
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (user && !isLoading) {
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        }
    }, [user, isLoading, navigate, location]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FAF9FF] flex items-center justify-center">
                <AnimatedBackground />
                <div className="w-10 h-10 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin relative z-10" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAF9FF] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
            <AnimatedBackground />

            <div className="w-full max-w-md relative z-10 my-auto py-6">
                {/* Back to Home Button */}
                <div className="flex justify-start mb-5">
                    <button 
                        type="button"
                        onClick={() => navigate('/')}
                        className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-purple-700 text-xs sm:text-sm font-semibold border border-purple-100 shadow-sm backdrop-blur-md transition-all duration-200"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1 text-purple-600" />
                        <span>Kembali ke Beranda</span>
                    </button>
                </div>

                {/* Main Card */}
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(124,58,237,0.08)] border border-purple-100/80 overflow-hidden">
                    {/* Brand Header */}
                    <div className="pt-7 pb-3 px-6 text-center">
                        <Link to="/" className="inline-flex items-center gap-2.5 mb-2 hover:opacity-90 transition-opacity">
                            <img src="/logo.png" alt="Noxarianet" className="w-9 h-9 rounded-xl object-contain shadow-sm shadow-purple-500/20" />
                            <span className="text-xl font-bold tracking-tight text-slate-900">
                                Noxaria<span className="text-purple-600">net</span>
                            </span>
                        </Link>
                        <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                            {activeTab === 'login' ? 'Selamat Datang' : 'Buat Akun Baru'}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            {activeTab === 'login' 
                                ? 'Masuk untuk mengelola saldo dan pesanan Anda' 
                                : 'Daftar sekarang untuk menikmati harga dan layanan terbaik'}
                        </p>
                    </div>

                    {/* Tab Navigation (Modern Pills) */}
                    <div className="px-6 pt-3 pb-1">
                        <div className="bg-slate-100/80 p-1 rounded-2xl flex gap-1 border border-slate-200/60">
                            <button
                                type="button"
                                onClick={() => setActiveTab('login')}
                                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all relative ${
                                    activeTab === 'login'
                                        ? 'text-purple-700 shadow-sm bg-white'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <LogIn className={`w-4 h-4 ${activeTab === 'login' ? 'text-purple-600' : 'text-slate-400'}`} />
                                <span>Masuk</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('register')}
                                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all relative ${
                                    activeTab === 'register'
                                        ? 'text-purple-700 shadow-sm bg-white'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <UserPlus className={`w-4 h-4 ${activeTab === 'register' ? 'text-purple-600' : 'text-slate-400'}`} />
                                <span>Daftar</span>
                            </button>
                        </div>
                    </div>

                    {/* Form Area with Smooth Transition */}
                    <div className="p-6 sm:p-7 pt-5">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'login' ? <LoginForm onSwitchToRegister={() => setActiveTab('register')} /> : <RegisterForm onSwitchToLogin={() => setActiveTab('login')} />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
