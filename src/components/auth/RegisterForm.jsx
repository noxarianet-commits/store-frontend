import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, Loader2, UserPlus, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import notify from '../../utils/notify';

export default function RegisterForm({ onSwitchToLogin }) {
    const [formData, setFormData] = useState({
        display_name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const numericValue = value.replace(/\D/g, '');
            setFormData(prev => ({ ...prev, [name]: numericValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const isPasswordLengthValid = formData.password.length >= 8;
    const isPasswordMatch = formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword;
    const isPasswordMismatch = formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password.length < 8) {
            return setError('Password minimal 8 karakter');
        }

        if (formData.password !== formData.confirmPassword) {
            return setError('Password dan konfirmasi password tidak cocok');
        }

        setIsLoading(true);
        try {
            const registerData = {
                display_name: formData.display_name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                password: formData.password
            };

            await register(registerData);
            notify.success('Kode verifikasi dikirim ke email Anda');
            navigate('/auth/verify', { state: { email: formData.email.trim() } });
        } catch (err) {
            setError(err.response?.data?.error || 'Gagal mendaftar. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
                <div className="flex items-start gap-3 p-3.5 bg-red-50/90 text-red-700 rounded-xl text-xs sm:text-sm border border-red-200/80 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed flex-1">{error}</span>
                </div>
            )}
            
            {/* Nama Lengkap */}
            <div className="space-y-1">
                <label className="text-xs sm:text-sm font-semibold text-slate-700">Nama Lengkap</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-600 transition-colors">
                        <User className="w-4 h-4" />
                    </div>
                    <input
                        type="text"
                        name="display_name"
                        autoComplete="name"
                        value={formData.display_name}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        placeholder="Nama lengkap Anda"
                    />
                </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
                <label className="text-xs sm:text-sm font-semibold text-slate-700">Alamat Email</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-600 transition-colors">
                        <Mail className="w-4 h-4" />
                    </div>
                    <input
                        type="email"
                        name="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        placeholder="nama@email.com"
                    />
                </div>
            </div>
            
            {/* Nomor WhatsApp */}
            <div className="space-y-1">
                <label className="text-xs sm:text-sm font-semibold text-slate-700">Nomor WhatsApp</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-600 transition-colors">
                        <Phone className="w-4 h-4" />
                    </div>
                    <input
                        type="tel"
                        name="phone"
                        autoComplete="tel"
                        inputMode="numeric"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        placeholder="08xxxxxxxxxx"
                    />
                </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-semibold text-slate-700">Password</label>
                    {formData.password.length > 0 && (
                        <span className={`text-[11px] font-semibold flex items-center gap-1 ${isPasswordLengthValid ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {isPasswordLengthValid && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                            Min. 8 karakter
                        </span>
                    )}
                </div>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-600 transition-colors">
                        <Lock className="w-4 h-4" />
                    </div>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl pl-10 pr-11 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        placeholder="Minimal 8 karakter"
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

            {/* Konfirmasi Password */}
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-semibold text-slate-700">Konfirmasi Password</label>
                    {formData.confirmPassword.length > 0 && (
                        <span className={`text-[11px] font-semibold ${isPasswordMatch ? 'text-emerald-600' : 'text-red-500'}`}>
                            {isPasswordMatch ? 'Cocok' : 'Belum cocok'}
                        </span>
                    )}
                </div>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-600 transition-colors">
                        <Lock className="w-4 h-4" />
                    </div>
                    <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        autoComplete="new-password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className={`w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border rounded-xl pl-10 pr-11 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                            isPasswordMismatch 
                                ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                                : 'border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'
                        }`}
                        placeholder="Ketik ulang password"
                    />
                    <button
                        type="button"
                        aria-label={showConfirmPassword ? 'Sembunyikan password' : 'Lihat password'}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-purple-600 transition-colors rounded-lg"
                    >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                        <UserPlus className="w-4 h-4" />
                        <span>Daftar Akun Baru</span>
                    </>
                )}
            </button>

            {/* Switch Tab Helper */}
            {onSwitchToLogin && (
                <div className="text-center pt-2">
                    <p className="text-xs text-slate-500">
                        Sudah punya akun?{' '}
                        <button
                            type="button"
                            onClick={onSwitchToLogin}
                            className="font-bold text-purple-600 hover:text-purple-700 hover:underline transition-colors"
                        >
                            Masuk sekarang
                        </button>
                    </p>
                </div>
            )}

            {/* Security Note */}
            <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-100">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Data aman & terlindungi secara terenkripsi</span>
            </div>
        </form>
    );
}
