import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut } from 'lucide-react';

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: null },
    { id: 'sekalipay', label: 'Sekalipay', icon: null },
    { id: 'featured', label: 'Produk Unggulan', icon: null },
    { id: 'revenue', label: 'Pendapatan', icon: null },
    { id: 'products', label: 'Produk', icon: null },
    { id: 'orders', label: 'Pesanan', icon: null },
    { id: 'settings', label: 'Pengaturan Toko', icon: null },
];

const AdminSidebar = ({ activeTab, setActiveTab, handleLogout, isMobileMenuOpen, setIsMobileMenuOpen }) => {

    return (
        <>
            {/* Mobile Navbar */}
            <div className="md:hidden sticky top-0 z-[60] bg-[#0E0E0E]/95 backdrop-blur-md border-b border-white/5 p-4 flex justify-between items-center relative">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" className="w-8 h-8 rounded-lg" alt="" />
                    <span className="text-xl font-bold text-white">noxaria<span className="text-purple-400">net</span></span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2">
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 bg-[#0E0E0E] border-b border-white/5 shadow-2xl flex flex-col p-4 z-[60]"
                        >
                            {menuItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all mb-2 ${activeTab === item.id
                                            ? 'bg-purple-600 text-white'
                                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <span>{item.label}</span>
                                </button>
                            ))}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all mt-4"
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 bg-[#0E0E0E] border-r border-white/5 p-6 flex-col">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <img src="/logo.png" className="w-8 h-8 rounded-lg" alt="" />
                    <span className="text-xl font-bold text-white">noxaria<span className="text-purple-400">net</span></span>
                </div>

                <nav className="flex-1 space-y-2">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.id
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/10'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all mt-10"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </aside>
        </>
    );
};

export default AdminSidebar;
