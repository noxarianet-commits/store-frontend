import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, LayoutDashboard, Boxes, PlugZap, Star, Wallet, Package, ClipboardList, Settings } from 'lucide-react';

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { id: 'sekalipay', label: 'Sekalipay', Icon: Boxes },
    { id: 'okeconnect', label: 'OkeConnect', Icon: PlugZap },
    { id: 'featured', label: 'Produk Unggulan', Icon: Star },
    { id: 'revenue', label: 'Pendapatan', Icon: Wallet },
    { id: 'products', label: 'Produk', Icon: Package },
    { id: 'orders', label: 'Pesanan', Icon: ClipboardList },
    { id: 'settings', label: 'Pengaturan', Icon: Settings },
];

const AdminSidebar = ({ activeTab, setActiveTab, handleLogout, isMobileMenuOpen, setIsMobileMenuOpen }) => {
    return (
        <>
            {/* Mobile Navbar */}
            <div className="md:hidden sticky top-0 z-[60] bg-[#0E0E0E]/95 backdrop-blur-md border-b border-white/5 p-4 flex justify-between items-center relative">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" className="w-8 h-8 rounded-xl border border-white/10 object-cover" alt="" />
                    <span className="text-[18px] font-bold tracking-tight text-white">noxaria<span className="text-brand">net</span></span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Menu" className="w-9 h-9 grid place-items-center text-white bg-white/5 border border-white/10 rounded-xl">
                    {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>

                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 right-0 bg-[#0E0E0E] border-b border-white/5 shadow-2xl flex flex-col p-3 z-[60]"
                        >
                            {menuItems.map(item => {
                                const Icon = item.Icon;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-[13px] font-semibold transition-colors mb-1 ${activeTab === item.id
                                                ? 'bg-brand text-white'
                                                : 'text-white/60 hover:bg-white/[0.06] hover:text-white'
                                            }`}
                                    >
                                        <Icon size={16} />
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                            <button onClick={handleLogout} className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[13px] font-semibold text-red-400 hover:bg-red-500/10 transition-colors mt-3">
                                <LogOut size={16} /> Logout
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-[264px] shrink-0 bg-[#0E0E0E] border-r border-white/5 p-6 flex-col">
                <div className="flex items-center gap-3 mb-8 px-1">
                    <img src="/logo.png" className="w-8 h-8 rounded-xl border border-white/10 object-cover" alt="" />
                    <span className="text-[18px] font-bold tracking-tight text-white">noxaria<span className="text-brand">net</span></span>
                </div>

                <nav className="flex-1 space-y-1">
                    {menuItems.map(item => {
                        const Icon = item.Icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${isActive
                                        ? 'bg-brand text-white shadow-soft'
                                        : 'text-white/55 hover:bg-white/[0.06] hover:text-white'
                                    }`}
                            >
                                <Icon size={16} className={isActive ? 'text-white' : 'text-white/40'} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="border-t border-white/5 pt-4 mt-6">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <LogOut size={16} /> Logout
                    </button>
                    <p className="text-[11px] text-white/30 mt-3 px-1">Admin • Noxarianet Store</p>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
