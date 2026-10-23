import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, LogIn, AlertCircle, ShieldCheck } from 'lucide-react';
import notify from '../../utils/notify';

export default function LoginForm({ onSwitchToRegister }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email.trim(), password);
            notify.success('Berhasil login');
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.response?.data?.error || 'Gagal login. Silakan periksa kredensial Anda.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="flex items-start gap-3 p-3.5 bg-red-50/90 text-red-700 rounded-xl text-xs sm:text-sm border border-red-200/80 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed flex-1">{error}</span>
                </div>
            )}
            
            {/* Email Field */}
            <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <span>Alamat Email</span>
                </label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-600 transition-colors">
                        <Mail className="w-4 h-4" />
                    </div>
                    <input
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        placeholder="nama@email.com"
                    />
                </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        <span>Password</span>
                    </label>
                    <Link
                        to="/auth/lupa-password"
                        className="text-xs font-semibold text-purple-600 hover:text-purple-700 hover:underline transition-colors"
                    >
                        Lupa password?
                    </Link>
                </div>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-600 transition-colors">
                        <Lock className="w-4 h-4" />
                    </div>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl pl-10 pr-11 py-3 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        placeholder="••••••••"
                    />
                    <button
                        type="button"
                        aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-purple-600 transition-colors rounded-lg"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.99] text-white py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Memproses...</span>
                    </>
                ) : (
                    <>
                        <LogIn className="w-4 h-4" />
                        <span>Masuk ke Akun</span>
                    </>
                )}
            </button>

            {/* Switch Tab Helper */}
            {onSwitchToRegister && (
                <div className="text-center pt-2">
                    <p className="text-xs text-slate-500">
                        Belum punya akun?{' '}
                        <button
                            type="button"
                            onClick={onSwitchToRegister}
                            className="font-bold text-purple-600 hover:text-purple-700 hover:underline transition-colors"
                        >
                            Daftar sekarang
                        </button>
                    </p>
                </div>
            )}

            {/* Security Note */}
            <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-100">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Koneksi aman & data terenkripsi</span>
            </div>
        </form>
    );
}
