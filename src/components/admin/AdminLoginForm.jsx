import { motion } from 'framer-motion';
import { Store, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const AdminLoginForm = ({ loginData, setLoginData, showLoginPassword, setShowLoginPassword, handleLogin }) => (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 font-sans">
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-7 sm:p-8 shadow-xl shadow-slate-200/60"
        >
            <div className="flex flex-col items-center mb-7">
                <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-3 border border-purple-100 shadow-xs">
                    <Store size={28} />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Panel Admin</h1>
                <p className="text-slate-500 text-xs mt-0.5">Sistem Manajemen Noxarianet Store</p>
                <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-2">
                    <ShieldCheck size={11} className="text-emerald-600" />
                    <span>Akses Terproteksi</span>
                </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Nama Pengguna
                    </label>
                    <input
                        type="text"
                        value={loginData.username}
                        onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-500/20 transition-all"
                        placeholder="Masukkan username admin"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Kata Sandi
                    </label>
                    <div className="relative">
                        <input
                            type={showLoginPassword ? "text" : "password"}
                            value={loginData.password}
                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-12 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-500/20 transition-all"
                            placeholder="••••••••"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                            aria-label={showLoginPassword ? "Sembunyikan password" : "Tampilkan password"}
                        >
                            {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white font-bold py-3.5 rounded-xl shadow-md shadow-purple-600/25 transition-all text-xs sm:text-sm cursor-pointer mt-2"
                >
                    Masuk ke Panel Dashboard
                </button>
            </form>
        </motion.div>
    </div>
);

export default AdminLoginForm;
