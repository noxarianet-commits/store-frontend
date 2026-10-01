import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Wallet, LogOut, ChevronDown } from 'lucide-react';
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
        notify.confirm({ title: 'Keluar', text: 'Apakah Anda yakin ingin keluar?' }).then((isConfirmed) => {
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
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            >
                <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                    {initial}
                </div>
                <div className="hidden sm:block text-left">
                    <div className="text-sm font-semibold text-slate-700 truncate max-w-[100px]">{user.display_name}</div>
                    <div className="text-xs text-purple-600 font-medium">{formatRp(user.balance || 0)}</div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 py-2 z-50"
                    >
                        <div className="px-4 py-2 border-b border-slate-100 sm:hidden">
                            <div className="text-sm font-semibold text-slate-700 truncate">{user.display_name}</div>
                            <div className="text-xs text-purple-600 font-medium mt-0.5">{formatRp(user.balance || 0)}</div>
                        </div>
                        
                        <Link
                            to="/dashboard"
                            onClick={() => setIsOpen(false)}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:text-purple-600 hover:bg-purple-50 flex items-center gap-3 transition-colors"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard Saya
                        </Link>
                        
                        <Link
                            to="/dashboard"
                            state={{ activeTab: 'saldo', openTopup: true }}
                            onClick={() => setIsOpen(false)}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:text-purple-600 hover:bg-purple-50 flex items-center gap-3 transition-colors"
                        >
                            <Wallet className="w-4 h-4" />
                            Top Up Saldo
                        </Link>
                        
                        <div className="h-px bg-slate-100 my-1 mx-3" />
                        
                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Keluar
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
