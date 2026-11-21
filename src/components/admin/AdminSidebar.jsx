import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    TrendingUp,
    Wallet,
    Server,
    Star,
    Package,
    ShoppingBag,
    Receipt,
    LifeBuoy,
    Bell,
    Users,
    Settings,
    Menu,
    X,
    LogOut,
    ShieldCheck
} from 'lucide-react';

const menuGroups = [
    {
        title: 'Ringkasan',
        items: [
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'revenue', label: 'Pendapatan', icon: TrendingUp },
        ]
    },
    {
        title: 'Katalog & Vendor',
        items: [
            { id: 'sekalipay', label: 'Sekalipay', icon: Wallet },
            { id: 'okeconnect', label: 'OkeConnect', icon: Server },
            { id: 'featured', label: 'Best Seller', icon: Star },
            { id: 'products', label: 'Layanan Jasa', icon: Package },
        ]
    },
    {
        title: 'Operasional',
        items: [
            { id: 'orders', label: 'Pesanan', icon: ShoppingBag },
            { id: 'transactions', label: 'Transaksi Saldo', icon: Receipt },
            { id: 'tickets', label: 'Bantuan CS', icon: LifeBuoy },
            { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
        ]
    },
    {
        title: 'Sistem',
        items: [
            { id: 'users', label: 'Manajemen User', icon: Users },
            { id: 'settings', label: 'Pengaturan Toko', icon: Settings },
        ]
    }
];

const AdminSidebar = ({ activeTab, setActiveTab, handleLogout, isMobileMenuOpen, setIsMobileMenuOpen }) => {
    return (
        <>
            {/* Mobile Navbar */}
            <div className="md:hidden sticky top-0 z-[60] bg-white/95 backdrop-blur-md border-b border-slate-200/80 p-4 flex justify-between items-center relative shadow-xs">
                <div className="flex items-center gap-2.5">
                    <img src="/logo.png" className="w-8 h-8 rounded-lg object-contain" alt="Noxarianet" />
                    <div>
                        <span className="text-lg font-black text-slate-900 tracking-tight">
                            Noxaria<span className="text-purple-600">net</span>
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded ml-1.5 border border-purple-100">
                            Admin
                        </span>
                    </div>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="text-slate-700 hover:text-purple-600 p-2 rounded-xl hover:bg-slate-100 transition-colors"
                    aria-label="Toggle Menu"
                >
                    {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>

                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-xl flex flex-col p-4 z-[60] max-h-[80vh] overflow-y-auto"
                        >
                            {menuGroups.map((group, gIdx) => (
                                <div key={gIdx} className="mb-3">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 mb-1">
                                        {group.title}
                                    </p>
                                    <div className="space-y-1">
                                        {group.items.map((item) => {
                                            const Icon = item.icon;
                                            const isActive = activeTab === item.id;
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                                                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                                        isActive
                                                            ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/20'
                                                            : 'text-slate-600 hover:bg-purple-50/60 hover:text-purple-700'
                                                    }`}
                                                >
                                                    <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                                                    <span>{item.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            <div className="pt-2 border-t border-slate-100 mt-2">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                                >
                                    <LogOut size={16} />
                                    <span>Keluar Akun Admin</span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 bg-white border-r border-slate-200/80 p-5 flex-col justify-between shrink-0 shadow-xs select-none">
                <div>
                    {/* Brand Logo */}
                    <div className="flex items-center gap-2.5 px-2 mb-6">
                        <img src="/logo.png" className="w-8 h-8 rounded-lg object-contain shadow-xs" alt="Noxarianet" />
                        <div>
                            <span className="text-lg font-black text-slate-900 tracking-tight">
                                Noxaria<span className="text-purple-600">net</span>
                            </span>
                            <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                <ShieldCheck size={11} className="text-purple-600" />
                                <span>Control Panel</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Menu Groups */}
                    <nav className="space-y-4">
                        {menuGroups.map((group, gIdx) => (
                            <div key={gIdx}>
                                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 mb-1.5">
                                    {group.title}
                                </p>
                                <div className="space-y-1">
                                    {group.items.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = activeTab === item.id;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => setActiveTab(item.id)}
                                                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                    isActive
                                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20 translate-x-0.5'
                                                        : 'text-slate-600 hover:bg-purple-50/70 hover:text-purple-700'
                                                }`}
                                            >
                                                <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                                                <span>{item.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Logout Button */}
                <div className="pt-4 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100 cursor-pointer"
                    >
                        <LogOut size={16} />
                        <span>Keluar Akun Admin</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
