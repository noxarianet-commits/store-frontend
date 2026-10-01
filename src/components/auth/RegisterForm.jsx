import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import notify from '../../utils/notify';

export default function RegisterForm() {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password.length < 6) {
            return setError('Password minimal 6 karakter');
        }

        if (formData.password !== formData.confirmPassword) {
            return setError('Password tidak cocok');
        }

        setIsLoading(true);
        try {
            const registerData = {
                display_name: formData.display_name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            };
            await register(registerData);
            notify.success('Berhasil mendaftar');
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError(err.response?.data?.error || 'Gagal mendaftar. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                    {error}
                </div>
            )}
            
            <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Nama Lengkap</label>
                <input
                    type="text"
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleChange}
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl p-3.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 outline-none transition-all"
                    placeholder="Nama Anda"
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl p-3.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 outline-none transition-all"
                    placeholder="nama@email.com"
                />
            </div>
            
            <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Nomor WhatsApp</label>
                <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl p-3.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 outline-none transition-all"
                    placeholder="08xxxxxxxxxx"
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full bg-white border border-slate-200 rounded-xl p-3.5 pr-12 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 outline-none transition-all"
                        placeholder="••••••••"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Konfirmasi Password</label>
                <div className="relative">
                    <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full bg-white border border-slate-200 rounded-xl p-3.5 pr-12 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 outline-none transition-all"
                        placeholder="••••••••"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
                {isLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</>
                ) : (
                    'Daftar'
                )}
            </button>
        </form>
    );
}
