import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Loader2, ArrowLeft, RefreshCw, Mail, Eye, EyeOff } from 'lucide-react';
import OtpInput from '../components/auth/OtpInput';
import { OTP_LENGTH, sanitizeOtp } from '../utils/otpUtils';
import api from '../api';
import notify from '../utils/notify';
import AnimatedBackground from '../components/AnimatedBackground';

const RESEND_COOLDOWN_SECONDS = 60;
const PASSWORD_MIN_LENGTH = 8;

export default function ForgotPasswordPage() {
    const navigate = useNavigate();

    // Satu halaman, dua langkah: email → OTP + password baru. Memisahkannya jadi
    // route terpisah hanya menambah History API entry yang tidak dilihat user.
    const [step, setStep] = useState('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(RESEND_COOLDOWN_SECONDS);

    const isOtpComplete = otp.length === OTP_LENGTH;

    useEffect(() => {
        if (countdown <= 0) return undefined;

        const timer = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown]);

    const maskedEmail = useMemo(() => {
        const at = email.indexOf('@');
        if (at <= 0) return email;

        const local = email.slice(0, at);
        return `${local[0]}${'*'.repeat(Math.max(3, local.length - 1))}${email.slice(at)}`;
    }, [email]);

    const handleRequestOtp = async (e) => {
        e.preventDefault();

        const target = email.trim();
        if (!target) {
            return setError('Email wajib diisi.');
        }

        setError('');
        setIsLoading(true);

        try {
            const response = await api.authForgotPassword(target);

            // Backend selalu balas sukses, entah emailnya terdaftar atau tidak —
            // jadi jangan pernah menampilkan "email tidak ditemukan" ke user.
            setStep('reset');
            setCountdown(response.data.resend_available_in || RESEND_COOLDOWN_SECONDS);
            notify.success('Jika email terdaftar, kode verifikasi telah dikirim');
        } catch (err) {
            setError(err.response?.data?.error || 'Gagal mengirim kode verifikasi.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setError('');
        setIsLoading(true);

        try {
            const response = await api.authResendResetPassword(email);
            setCountdown(response.data.resend_available_in || RESEND_COOLDOWN_SECONDS);
            setOtp('');
            notify.success('Kode verifikasi baru telah dikirim');
        } catch (err) {
            setError(err.response?.data?.error || 'Gagal mengirim ulang kode verifikasi.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();

        if (!isOtpComplete) {
            return setError(`Masukkan ${OTP_LENGTH} digit kode verifikasi.`);
        }

        if (passwords.new.length < PASSWORD_MIN_LENGTH) {
            return setError(`Password baru minimal ${PASSWORD_MIN_LENGTH} karakter.`);
        }

        if (passwords.new !== passwords.confirm) {
            return setError('Konfirmasi password tidak cocok.');
        }

        setError('');
        setIsLoading(true);

        try {
            await api.authVerifyResetPassword({
                email,
                code: otp,
                new_password: passwords.new,
            });

            notify.success('Password berhasil diubah. Silakan masuk.');
            navigate('/auth', { replace: true });
        } catch (err) {
            setError(err.response?.data?.error || 'Gagal mengubah password. Silakan coba lagi.');
            setOtp('');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            <AnimatedBackground />

            <div className="w-full max-w-md relative z-10">
                <button
                    onClick={() => navigate('/auth')}
                    className="mb-6 flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors font-medium"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Kembali ke masuk
                </button>

                <div className="bg-white rounded-2xl shadow-xl shadow-purple-500/5 overflow-hidden border border-slate-100">
                    <div className="p-6">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center mb-6"
                        >
                            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                {step === 'email' ? (
                                    <Mail className="w-7 h-7 text-purple-600" />
                                ) : (
                                    <KeyRound className="w-7 h-7 text-purple-600" />
                                )}
                            </div>
                            <h1 className="text-xl font-bold text-slate-800">
                                {step === 'email' ? 'Lupa Password' : 'Buat Password Baru'}
                            </h1>
                            <p className="text-sm text-slate-500 mt-2">
                                {step === 'email' ? (
                                    'Masukkan email akunmu dan kami akan mengirim kode verifikasi.'
                                ) : (
                                    <>
                                        Kode dikirim ke{' '}
                                        <span className="font-semibold text-slate-700">{maskedEmail}</span>
                                    </>
                                )}
                            </p>
                        </motion.div>

                        {error && (
                            <div className="p-3 mb-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                                {error}
                            </div>
                        )}

                        {step === 'email' ? (
                            <form onSubmit={handleRequestOtp} className="space-y-4">
                                <div className="space-y-1">
                                    <label htmlFor="forgot-email" className="text-sm font-medium text-slate-700">
                                        Email
                                    </label>
                                    <input
                                        id="forgot-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                        autoFocus
                                        className="w-full bg-white border border-slate-200 rounded-xl p-3.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 outline-none transition-all"
                                        placeholder="nama@email.com"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Mengirim...</>
                                    ) : (
                                        'Kirim kode verifikasi'
                                    )}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleReset} className="space-y-5">
                                <OtpInput
                                    value={otp}
                                    onChange={(next) => {
                                        setOtp(sanitizeOtp(next));
                                        if (error) setError('');
                                    }}
                                    disabled={isLoading}
                                    invalid={Boolean(error)}
                                />

                                <div className="space-y-1">
                                    <label htmlFor="new-password" className="text-sm font-medium text-slate-700">
                                        Password Baru
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="new-password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={passwords.new}
                                            onChange={(e) => setPasswords((p) => ({ ...p, new: e.target.value }))}
                                            required
                                            autoComplete="new-password"
                                            placeholder="••••••••"
                                            className="w-full bg-white border border-slate-200 rounded-xl p-3.5 pr-12 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 outline-none transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((v) => !v)}
                                            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-400">
                                        Minimal {PASSWORD_MIN_LENGTH} karakter.
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="confirm-password" className="text-sm font-medium text-slate-700">
                                        Konfirmasi Password Baru
                                    </label>
                                    <input
                                        id="confirm-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={passwords.confirm}
                                        onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                                        required
                                        autoComplete="new-password"
                                        placeholder="••••••••"
                                        className="w-full bg-white border border-slate-200 rounded-xl p-3.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 outline-none transition-all"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || !isOtpComplete}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...</>
                                    ) : (
                                        'Simpan password baru'
                                    )}
                                </button>

                                <div className="text-center">
                                    {countdown > 0 ? (
                                        <p className="text-xs text-slate-400">
                                            Belum menerima kode? Kirim ulang dalam{' '}
                                            <span className="font-semibold text-slate-600">{countdown} detik</span>
                                        </p>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleResend}
                                            disabled={isLoading}
                                            className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors disabled:opacity-50"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <RefreshCw className="w-4 h-4" />
                                            )}
                                            Kirim ulang kode
                                        </button>
                                    )}
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}