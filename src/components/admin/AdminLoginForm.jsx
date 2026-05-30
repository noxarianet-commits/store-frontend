import { motion } from 'framer-motion';
import { Store, Eye, EyeOff } from 'lucide-react';

const AdminLoginForm = ({ loginData, setLoginData, showLoginPassword, setShowLoginPassword, handleLogin }) => (
    <div className="min-h-screen flex items-center justify-center bg-[#0A031A] px-4">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-[#0E0E0E] border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
            <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4 border border-purple-500/20">
                    <Store className="text-purple-500" size={32} />
                </div>
                <h1 className="text-2xl font-bold text-white">Panel Admin</h1>
                <p className="text-gray-500 text-sm">Sistem Manajemen noxarianet</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-widest">Nama Pengguna</label>
                    <input
                        type="text"
                        value={loginData.username}
                        onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500/50 transition-all"
                        placeholder="Masukkan username"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-widest">Kata Sandi</label>
                    <div className="relative">
                        <input
                            type={showLoginPassword ? "text" : "password"}
                            value={loginData.password}
                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pr-12 text-white focus:outline-none focus:border-purple-500/50 transition-all"
                            placeholder="••••••••"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                            {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                    Masuk Panel Dashboard
                </button>
            </form>
        </motion.div>
    </div>
);

export default AdminLoginForm;
