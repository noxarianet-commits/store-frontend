import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { MailCheck, Loader2, ArrowLeft, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import OtpInput from '../components/auth/OtpInput';
import { OTP_LENGTH, sanitizeOtp } from '../utils/otpUtils';
import api from '../api';
import notify from '../utils/notify';
import AnimatedBackground from '../components/AnimatedBackground';

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmailPage() {
    const { verifyRegistration, user, isLoading: isAuthLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Email datang lewat state dari RegisterForm. Kalau tidak ada — user me-refresh
    // halaman atau membuka URL-nya langsung — state hilang, jadi halaman harus
    // bisa dibangun ulang dari input email, bukan buntu.
    const [email, setEmail] = useState(location.state?.email || '');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [countdown, setCountdown] = useState(RESEND_COOLDOWN_SECONDS);

    const isComplete = otp.length === OTP_LENGTH;
    const needsEmailInput = !email;

    // Sudah login? Tidak ada yang perlu diverifikasi di halaman ini.
    useEffect(() => {
        if (!isAuthLoading && user) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, isAuthLoading, navigate]);

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

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        const target = email.trim();

        if (!target) {
            return setError('Email wajib diisi.');
        }

        setError('');
        setIsResending(true);

        try {
            const response = await api.authResendRegistration(target);
            setEmail(response.data.email || target);
            setCountdown(response.data.resend_available_in || RESEND_COOLDOWN_SECONDS);
            notify.success('Kode verifikasi baru telah dikirim');
        } catch (err) {
            setError(err.response?.data?.error || 'Gagal mengirim kode verifikasi.');
        } finally {
            setIsResending(false);
        }
    };

    const handleResend = async () => {
        setError('');
        setIsResending(true);

        try {
            const response = await api.authResendRegistration(email);
            setCountdown(response.data.resend_available_in || RESEND_COOLDOWN_SECONDS);
            // Reset isian supaya kode lama yang mungkin masih ada di layar tidak
            // terkirim mistaken dan menghasilkan "kode salah".
            setOtp('');
            notify.success('Kode verifikasi baru telah dikirim');
        } catch (err) {
            setError(err.response?.data?.error || 'Gagal mengirim ulang kode verifikasi.');
        } finally {
            setIsResending(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();

        if (!isComplete) {
            return setError(`Masukkan ${OTP_LENGTH} digit kode verifikasi.`);
        }

        setError('');
        setIsLoading(true);

        try {
            await verifyRegistration(email, otp);
            notify.success('Email berhasil diverifikasi');
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError(err.response?.data?.error || 'Kode verifikasi salah. Silakan coba lagi.');
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
                    Kembali
                </button>

                <div className="bg-white rounded-2xl shadow-xl shadow-purple-500/5 overflow-hidden border border-slate-100">
                    <div className="p-6">
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center mb-6"
                        >
                            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <MailCheck className="w-7 h-7 text-purple-600" />
                            </div>
                            <h1 className="text-xl font-bold text-slate-800">Verifikasi Email</h1>
                            <p className="text-sm text-slate-500 mt-2">
                                {needsEmailInput ? (
                                    'Masukkan email yang kamu gunakan saat mendaftar.'
                                ) : (
                                    <>
                                        Kami kirim kode 6 digit ke{' '}
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

                        {needsEmailInput ? (
                            <form onSubmit={handleEmailSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <label htmlFor="verify-email" className="text-sm font-medium text-slate-700">
                                        Email
                                    </label>
                                    <input
                                        id="verify-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                        className="w-full bg-white border border-slate-200 rounded-xl p-3.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 outline-none transition-all"
                                        placeholder="nama@email.com"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isResending}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isResending ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Mengirim...</>
                                    ) : (
                                        'Kirim kode verifikasi'
                                    )}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerify} className="space-y-5">
                                <OtpInput
                                    value={otp}
                                    onChange={(next) => {
                                        setOtp(sanitizeOtp(next));
                                        if (error) setError('');
                                    }}
                                    disabled={isLoading}
                                    invalid={Boolean(error)}
                                />

                                <button
                                    type="submit"
                                    disabled={isLoading || !isComplete}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Memverifikasi...</>
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-5 h-5" />
                                            Verifikasi
                                        </>
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
                                            disabled={isResending}
                                            className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors disabled:opacity-50"
                                        >
                                            {isResending ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <RefreshCw className="w-4 h-4" />
                                            )}
                                            Kirim ulang kode
                                        </button>
                                    )}
                                </div>

                                <p className="text-center text-xs text-slate-400">
                                    Kode berlaku 30 menit. Jangan bagikan kode ini kepada siapa pun.
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}