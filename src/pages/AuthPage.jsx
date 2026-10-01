import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import { ChevronLeft } from 'lucide-react';
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

    if (isLoading) return null; // or a spinner

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            <AnimatedBackground />
            
            <div className="w-full max-w-md relative z-10">
                <button 
                    onClick={() => navigate('/')}
                    className="mb-6 flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors font-medium"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Kembali ke Beranda
                </button>

                <div className="bg-white rounded-2xl shadow-xl shadow-purple-500/5 overflow-hidden border border-slate-100">
                    <div className="flex border-b border-slate-100">
                        <button
                            onClick={() => setActiveTab('login')}
                            className={`flex-1 py-4 text-center font-medium transition-colors relative ${activeTab === 'login' ? 'text-purple-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Masuk
                            {activeTab === 'login' && (
                                <motion.div layoutId="authTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('register')}
                            className={`flex-1 py-4 text-center font-medium transition-colors relative ${activeTab === 'register' ? 'text-purple-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Daftar
                            {activeTab === 'register' && (
                                <motion.div layoutId="authTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
                            )}
                        </button>
                    </div>

                    <div className="p-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: activeTab === 'login' ? -20 : 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: activeTab === 'login' ? 20 : -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
