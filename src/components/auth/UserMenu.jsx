import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
    User, 
    Wallet, 
    ShoppingBag, 
    LifeBuoy, 
    QrCode, 
    LogOut, 
    ChevronDown,
    ShieldCheck
} from 'lucide-react';
import notify from '../../utils/notify';
import { formatRp } from '../../utils/currencyUtils';

export default function UserMenu() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        setIsOpen(false);
        notify.confirm({ title: 'Keluar Akun', text: 'Apakah Anda yakin ingin keluar dari akun Noxarianet?' }).then((isConfirmed) => {
            if (isConfirmed) {
                logout();
                navigate('/');
                notify.success('Berhasil keluar');
            }
        });
    };

    if (!user) return null;

    const initial = user.display_name ? user.display_name.charAt(0).toUpperCase() : 'U';

    return (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Menu Akun Pengguna"
                className="flex items-center gap-2 sm:gap-2.5 p-1 sm:p-1.5 sm:pr-3 rounded-full hover:bg-purple-50/80 transition-all border border-purple-100 bg-white/80 shadow-xs cursor-pointer select-none"
            >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs shrink-0 ring-2 ring-purple-100">
                    {initial}
                </div>
                <div className="hidden sm:block text-left">
                    <div className="text-xs sm:text-sm font-bold text-slate-800 truncate max-w-[110px]">{user.display_name}</div>
                    <div className="text-[11px] text-purple-600 font-semibold">{formatRp(user.balance || 0)}</div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-purple-900/10 border border-purple-100 py-2 z-50 overflow-hidden"
                    >
                        {/* User Profile Mini Header */}
                        <div className="px-4 py-3 border-b border-purple-50 bg-gradient-to-b from-purple-50/40 to-transparent">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                                    {initial}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm font-bold text-slate-900 truncate">{user.display_name}</div>
                                    <div className="text-xs text-slate-400 truncate">{user.email}</div>
                                </div>
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-purple-100/60 flex items-center justify-between">
                                <span className="text-[11px] font-medium text-slate-500">Saldo Akun:</span>
                                <span className="text-xs font-bold font-mono text-purple-700 bg-purple-50 border border-purple-200/60 px-2 py-0.5 rounded-lg">
                                    {formatRp(user.balance || 0)}
                                </span>
                            </div>
                        </div>
                        
                        {/* Navigation Links */}
                        <div className="py-1">
                            <Link
                                to="/dashboard"
                                state={{ activeTab: 'profil' }}
                                onClick={() => setIsOpen(false)}
                                className="w-full text-left px-4 py-2.5 text-xs sm:text-sm text-slate-700 hover:text-purple-700 hover:bg-purple-50/70 flex items-center gap-3 transition-colors font-medium group"
                            >
                                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0">
                                    <User className="w-3.5 h-3.5" />
                                </div>
                                <span>Akun & Profil Saya</span>
                            </Link>
                            
                            <Link
                                to="/dashboard"
                                state={{ activeTab: 'saldo' }}
                                onClick={() => setIsOpen(false)}
                                className="w-full text-left px-4 py-2.5 text-xs sm:text-sm text-slate-700 hover:text-purple-700 hover:bg-purple-50/70 flex items-center gap-3 transition-colors font-medium group"
                            >
                                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                                    <Wallet className="w-3.5 h-3.5" />
                                </div>
                                <span>Dompet & Saldo</span>
                            </Link>

                            <Link
                                to="/dashboard"
                                state={{ activeTab: 'pesanan' }}
                                onClick={() => setIsOpen(false)}
                                className="w-full text-left px-4 py-2.5 text-xs sm:text-sm text-slate-700 hover:text-purple-700 hover:bg-purple-50/70 flex items-center gap-3 transition-colors font-medium group"
                            >
                                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                </div>
                                <span>Riwayat Pesanan</span>
                            </Link>

                            <Link
                                to="/dashboard"
                                state={{ activeTab: 'saldo', openTopup: true }}
                                onClick={() => setIsOpen(false)}
                                className="w-full text-left px-4 py-2.5 text-xs sm:text-sm text-purple-700 hover:bg-purple-50 flex items-center gap-3 transition-colors font-bold group"
                            >
                                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0">
                                    <QrCode className="w-3.5 h-3.5" />
                                </div>
                                <span>Isi Saldo (Top Up QRIS)</span>
                            </Link>
                        </div>
                        
                        <div className="h-px bg-purple-100/60 my-1 mx-3" />
                        
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors font-semibold cursor-pointer"
                        >
                            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                <LogOut className="w-3.5 h-3.5" />
                            </div>
                            <span>Keluar dari Akun</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
