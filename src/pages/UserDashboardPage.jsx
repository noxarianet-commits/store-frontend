import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, 
    Wallet, 
    History, 
    ShoppingBag, 
    ChevronLeft, 
    ChevronRight, 
    Loader2, 
    QrCode, 
    Mail, 
    Phone, 
    Lock, 
    KeyRound, 
    Eye, 
    EyeOff, 
    ShieldCheck, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    Copy, 
    Check, 
    Sparkles, 
    ArrowLeft,
    AlertCircle,
    LifeBuoy,
    LogOut,
    Star
} from 'lucide-react';
import Swal from 'sweetalert2';
import AnimatedBackground from '../components/AnimatedBackground';
import BalanceCard from '../components/balance/BalanceCard';
import TopUpModal from '../components/balance/TopUpModal';
import TransactionHistory from '../components/balance/TransactionHistory';
import StatusBadge from '../components/ticket/StatusBadge';
import api from '../api';
import notify from '../utils/notify';
import { formatRp } from '../utils/currencyUtils';

// ══════════════════════════════════════════════════════════════════════════
// SUBCOMPONENT: ProfileTab
// ══════════════════════════════════════════════════════════════════════════
const ProfileTab = ({ user, refreshProfile, onSwitchTab, onLogout }) => {
    const [formData, setFormData] = useState({
        display_name: user?.display_name || '',
        phone: user?.phone || ''
    });
    const [passData, setPassData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingPass, setIsSavingPass] = useState(false);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setIsSavingProfile(true);
        try {
            await api.authUpdateProfile({
                display_name: formData.display_name.trim(),
                phone: formData.phone.trim()
            });
            await refreshProfile();
            notify.success('Profil berhasil diperbarui');
        } catch (err) {
            notify.error(err.response?.data?.error || 'Gagal memperbarui profil');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handlePassSubmit = async (e) => {
        e.preventDefault();
        if (passData.new_password.length < 8) {
            return notify.error('Password baru minimal 8 karakter');
        }
        if (passData.new_password !== passData.confirm_password) {
            return notify.error('Password baru dan konfirmasi tidak cocok');
        }
        setIsSavingPass(true);
        try {
            await api.authChangePassword({
                current_password: passData.current_password,
                new_password: passData.new_password
            });
            notify.success('Password berhasil diubah');
            setPassData({ current_password: '', new_password: '', confirm_password: '' });
        } catch (err) {
            notify.error(err.response?.data?.error || 'Gagal mengubah password');
        } finally {
            setIsSavingPass(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: Data Profil */}
            <div className="bg-white/95 backdrop-blur-md p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-100/90 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-800">Informasi Pribadi</h3>
                            <p className="text-xs text-slate-500">Perbarui informasi kontak dan nama akun Anda</p>
                        </div>
                    </div>

                    <form id="profile-form" onSubmit={handleProfileSubmit} className="space-y-4">
                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">Email Akun</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input 
                                    type="email" 
                                    value={user?.email || ''} 
                                    disabled 
                                    className="w-full bg-slate-50/80 border border-slate-200/80 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-500 cursor-not-allowed font-medium select-all" 
                                />
                            </div>
                        </div>

                        {/* Nama Lengkap */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">Nama Lengkap</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-600 transition-colors">
                                    <User className="w-4 h-4" />
                                </div>
                                <input 
                                    type="text" 
                                    value={formData.display_name} 
                                    onChange={e => setFormData({...formData, display_name: e.target.value})} 
                                    className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm font-medium text-slate-800 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all" 
                                    required 
                                    placeholder="Masukkan nama lengkap"
                                />
                            </div>
                        </div>

                        {/* Nomor WhatsApp */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">Nomor WhatsApp</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-600 transition-colors">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <input 
                                    type="tel" 
                                    value={formData.phone} 
                                    onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} 
                                    className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm font-medium text-slate-800 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all" 
                                    required 
                                    placeholder="08xxxxxxxxxx"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100 flex justify-end">
                    <button 
                        type="submit" 
                        form="profile-form"
                        disabled={isSavingProfile} 
                        className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.99] text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-purple-600/20 hover:shadow-purple-600/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSavingProfile ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Menyimpan...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                <span>Simpan Perubahan</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Card 2: Ubah Password */}
            <div className="bg-white/95 backdrop-blur-md p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-100/90 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <KeyRound className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-800">Keamanan & Password</h3>
                            <p className="text-xs text-slate-500">Perbarui kata sandi akun Anda secara berkala</p>
                        </div>
                    </div>

                    <form id="pass-form" onSubmit={handlePassSubmit} className="space-y-4">
                        {/* Password Lama */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">Password Saat Ini</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-600 transition-colors">
                                    <KeyRound className="w-4 h-4" />
                                </div>
                                <input 
                                    type={showCurrentPass ? 'text' : 'password'} 
                                    value={passData.current_password} 
                                    onChange={e => setPassData({...passData, current_password: e.target.value})} 
                                    className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl pl-10 pr-11 py-3 text-xs sm:text-sm font-medium text-slate-800 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all" 
                                    required 
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-purple-600 transition-colors rounded-lg"
                                >
                                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Password Baru */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-slate-700">Password Baru</label>
                                <span className="text-[11px] text-slate-400">Min. 8 karakter</span>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-600 transition-colors">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input 
                                    type={showNewPass ? 'text' : 'password'} 
                                    value={passData.new_password} 
                                    onChange={e => setPassData({...passData, new_password: e.target.value})} 
                                    className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl pl-10 pr-11 py-3 text-xs sm:text-sm font-medium text-slate-800 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all" 
                                    required 
                                    minLength={8}
                                    placeholder="Minimal 8 karakter"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPass(!showNewPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-purple-600 transition-colors rounded-lg"
                                >
                                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Konfirmasi Password Baru */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">Konfirmasi Password Baru</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-600 transition-colors">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input 
                                    type={showConfirmPass ? 'text' : 'password'} 
                                    value={passData.confirm_password} 
                                    onChange={e => setPassData({...passData, confirm_password: e.target.value})} 
                                    className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl pl-10 pr-11 py-3 text-xs sm:text-sm font-medium text-slate-800 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all" 
                                    required 
                                    minLength={8}
                                    placeholder="Ulangi password baru"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-purple-600 transition-colors rounded-lg"
                                >
                                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100 flex justify-end">
                    <button 
                        type="submit" 
                        form="pass-form"
                        disabled={isSavingPass} 
                        className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 active:scale-[0.99] text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-slate-800/10 hover:shadow-slate-800/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSavingPass ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Mengubah...</span>
                            </>
                        ) : (
                            <>
                                <ShieldCheck className="w-4 h-4" />
                                <span>Perbarui Password</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Card 3: Ringkasan Saldo Akun */}
            <div className="lg:col-span-2 bg-white/95 backdrop-blur-md p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-slate-500">Saldo Noxarianet Anda</div>
                        <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                            {formatRp(user?.balance || 0)}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={() => onSwitchTab && onSwitchTab('saldo')}
                        className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                    >
                        Top Up Saldo
                    </button>
                    <button
                        type="button"
                        onClick={onLogout}
                        className="px-3.5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════
// SUBCOMPONENT: OrdersTab
// ══════════════════════════════════════════════════════════════════════════
const OrdersTab = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
    const [copiedId, setCopiedId] = useState(null);

    const fetchOrders = useCallback(async (pageNum) => {
        try {
            setIsLoading(true);
            const res = await api.getUserOrders({ page: pageNum, limit: 10 });
            setOrders(res.data?.data || []);
            if (res.data?.pagination) {
                setPagination(res.data.pagination);
            }
        } catch (err) {
            console.error('Failed to fetch user orders', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders(page);
    }, [page, fetchOrders]);

    const handleCopyId = (id) => {
        if (!id) return;
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        notify.success('ID pesanan disalin ke clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleReviewOrder = (ord) => {
        let currentRating = 5;
        Swal.fire({
            title: 'Beri Ulasan Pesanan',
            html: `
                <div class="text-left font-sans">
                    <p class="text-xs text-slate-500 mb-3">Pesanan: <strong>${ord.product || 'Produk'}</strong> ${ord.variant ? `(${ord.variant})` : ''}</p>
                    <label class="block text-xs font-bold text-slate-700 mb-1.5">Penilaian</label>
                    <div class="flex justify-center gap-2 mb-4" id="swal-rating-container">
                        <button type="button" data-val="1" class="swal-star-btn text-yellow-400 text-3xl focus:outline-none transition-transform hover:scale-110">★</button>
                        <button type="button" data-val="2" class="swal-star-btn text-yellow-400 text-3xl focus:outline-none transition-transform hover:scale-110">★</button>
                        <button type="button" data-val="3" class="swal-star-btn text-yellow-400 text-3xl focus:outline-none transition-transform hover:scale-110">★</button>
                        <button type="button" data-val="4" class="swal-star-btn text-yellow-400 text-3xl focus:outline-none transition-transform hover:scale-110">★</button>
                        <button type="button" data-val="5" class="swal-star-btn text-yellow-400 text-3xl focus:outline-none transition-transform hover:scale-110">★</button>
                    </div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Pesan Ulasan</label>
                    <textarea 
                        id="swal-testi-msg" 
                        placeholder="Ceritakan pengalaman Anda bertransaksi di Noxarianet..." 
                        class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 h-24 resize-none"
                    ></textarea>
                </div>
            `,
            background: '#ffffff',
            color: '#1e293b',
            confirmButtonColor: '#7c3aed',
            confirmButtonText: 'Kirim Ulasan',
            showCancelButton: true,
            cancelButtonText: 'Batal',
            cancelButtonColor: '#94a3b8',
            didOpen: () => {
                const stars = document.querySelectorAll('.swal-star-btn');
                const updateStars = (val) => {
                    currentRating = val;
                    stars.forEach((star, index) => {
                        if (index < val) {
                            star.innerHTML = '★';
                            star.classList.add('text-yellow-400');
                            star.classList.remove('text-slate-300');
                        } else {
                            star.innerHTML = '☆';
                            star.classList.remove('text-yellow-400');
                            star.classList.add('text-slate-300');
                        }
                    });
                };
                stars.forEach(star => {
                    star.addEventListener('click', () => {
                        const val = parseInt(star.getAttribute('data-val'), 10);
                        updateStars(val);
                    });
                });
                updateStars(5);
            },
            preConfirm: () => {
                const text = document.getElementById('swal-testi-msg')?.value;
                if (!text || !text.trim()) {
                    Swal.showValidationMessage('Pesan ulasan wajib diisi');
                    return false;
                }
                return { rating: currentRating, text: text.trim() };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                const { rating: finalRating, text: finalTesti } = result.value || {};
                try {
                    const payload = {
                        name: user?.phone || user?.name || user?.email || 'Customer',
                        text: finalTesti,
                        product: ord.product || '',
                        rating: finalRating,
                        order_id: ord.id
                    };
                    const res = await api.createTestimonial(payload);
                    const savedData = res.data?.data || payload;

                    try {
                        const existing = JSON.parse(localStorage.getItem('nox_recent_testimonials') || '[]');
                        const updated = [savedData, ...existing.filter(x => x.text !== savedData.text)].slice(0, 5);
                        localStorage.setItem('nox_recent_testimonials', JSON.stringify(updated));
                        window.dispatchEvent(new CustomEvent('testimonial:submitted', { detail: savedData }));
                    } catch { /* ignore */ }

                    notify.success('Terima kasih atas ulasan Anda! Ulasan langsung tampil di halaman utama.');
                } catch {
                    notify.error('Gagal mengirim ulasan');
                }
            }
        });
    };

    const getStatusBadge = (status) => {
        const s = (status || '').toUpperCase();
        switch (s) {
            case 'COMPLETED':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        SELESAI
                    </span>
                );
            case 'PROCESSING':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                        <Clock className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                        DIPROSES
                    </span>
                );
            case 'PENDING':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        MENUNGGU
                    </span>
                );
            case 'CANCELLED':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80">
                        <XCircle className="w-3.5 h-3.5 text-slate-500" />
                        DIBATALKAN
                    </span>
                );
            case 'REFUNDED':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                        <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                        DIKEMBALIKAN
                    </span>
                );
            case 'REFUND_PENDING':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200/80">
                        <Clock className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
                        REFUND DIPROSES
                    </span>
                );
            case 'FAILED':
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-50 text-red-700 border border-red-200/80">
                        <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                        {s || 'GAGAL'}
                    </span>
                );
        }
    };

    return (
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-sm border border-slate-100/90 overflow-hidden">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-800">Riwayat Pesanan</h3>
                        <p className="text-xs text-slate-500">Semua pesanan produk & layanan yang pernah Anda buat</p>
                    </div>
                </div>

                {!isLoading && pagination.total > 0 && (
                    <div className="self-start sm:self-auto px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200/60 text-xs font-semibold text-slate-600">
                        Total {pagination.total} Pesanan
                    </div>
                )}
            </div>

            {/* List Content */}
            <div className="p-0">
                {isLoading ? (
                    <div className="p-16 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-7 h-7 animate-spin text-purple-600" />
                        <span className="text-xs font-medium text-slate-500">Memuat riwayat pesanan...</span>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="p-14 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
                            <ShoppingBag className="w-7 h-7" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 mb-1">Belum Ada Pesanan</h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
                            Anda belum pernah melakukan pembelian produk atau layanan digital.
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all"
                        >
                            <span>Mulai Belanja</span>
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100/80">
                        {orders.map((ord) => (
                            <div 
                                key={ord.id} 
                                className="p-4 sm:p-6 hover:bg-purple-50/20 transition-all flex flex-col gap-3.5"
                            >
                                {/* Top Line: Product Name + Price */}
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                                                {ord.product}
                                            </h4>
                                            {ord.variant && (
                                                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                                                    {ord.variant}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <span className="font-bold font-mono text-sm sm:text-base text-slate-900">
                                            {formatRp(ord.price || 0)}
                                        </span>
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                                            {ord.payment_method || ord.payment_type || 'SALDO / PG'}
                                        </p>
                                    </div>
                                </div>

                                {/* Bottom Line: Meta info (Order ID, Date, Status Badge) */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 text-xs text-slate-500">
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                        {/* Order ID with Copy Button */}
                                        <button
                                            type="button"
                                            onClick={() => handleCopyId(ord.id)}
                                            className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-600 font-mono text-[11px] transition-colors border border-slate-200/60"
                                            title="Klik untuk menyalin ID pesanan"
                                        >
                                            {copiedId === ord.id ? (
                                                <Check className="w-3 h-3 text-emerald-600" />
                                            ) : (
                                                <Copy className="w-3 h-3 text-slate-400 group-hover:text-purple-600 transition-colors" />
                                            )}
                                            <span>{ord.id}</span>
                                        </button>

                                        {/* Timestamp */}
                                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                                            <Clock className="w-3 h-3" />
                                            {ord.timestamp 
                                                ? new Date(ord.timestamp).toLocaleDateString('id-ID', { 
                                                    day: 'numeric', 
                                                    month: 'short', 
                                                    year: 'numeric', 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                }) 
                                                : '-'}
                                        </span>
                                    </div>

                                    {/* Status Badge & Actions */}
                                    <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                                        {ord.status === 'COMPLETED' && (
                                            <button
                                                type="button"
                                                onClick={() => handleReviewOrder(ord)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[11px] border border-purple-200/80 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                                                title="Beri ulasan pesanan ini"
                                            >
                                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                <span>Beri Ulasan</span>
                                            </button>
                                        )}
                                        {getStatusBadge(ord.status)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Pagination Controls ── */}
                {!isLoading && pagination.total > 0 && (
                    <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50/60">
                        <span className="text-slate-500 font-medium">
                            Menampilkan <strong className="text-slate-700 font-semibold">{(page - 1) * 10 + 1}</strong>–<strong className="text-slate-700 font-semibold">{Math.min(page * 10, pagination.total)}</strong> dari <strong className="text-slate-700 font-semibold">{pagination.total}</strong> pesanan
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-white hover:text-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold bg-white shadow-xs"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" /> Sebelumnya
                            </button>
                            <span className="text-purple-700 font-bold px-3 py-1 rounded-xl bg-purple-50 border border-purple-100">
                                {page} / {pagination.totalPages || 1}
                            </span>
                            <button
                                type="button"
                                onClick={() => setPage(p => Math.min(pagination.totalPages || 1, p + 1))}
                                disabled={page >= (pagination.totalPages || 1)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-white hover:text-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold bg-white shadow-xs"
                            >
                                Berikutnya <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════
// MAIN EXPORT: UserDashboardPage
// ══════════════════════════════════════════════════════════════════════════
const HelpTab = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const res = await api.getMyTickets({ limit: 5 });
                if (!cancelled) setTickets(res.data?.data || []);
            } catch {
                if (!cancelled) setTickets([]);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold text-slate-800">Bantuan CS</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Tiket bantuan yang pernah Anda buat</p>
                </div>
                <button
                    onClick={() => navigate('/ticket/new')}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0"
                >
                    + Buat Tiket
                </button>
            </div>

            {isLoading ? (
                <div className="p-12 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                    <span className="text-xs text-slate-400">Memuat tiket...</span>
                </div>
            ) : tickets.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-sm">
                    <LifeBuoy className="w-10 h-10 text-slate-300 mx-auto mb-2 opacity-60" />
                    Belum ada tiket bantuan.
                </div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {tickets.map((ticket) => (
                        <button
                            key={ticket.id}
                            onClick={() => navigate(`/ticket/${ticket.ticket_number}`)}
                            className="w-full text-left p-4 sm:p-5 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <span className="text-[11px] font-mono font-semibold text-slate-400">{ticket.ticket_number}</span>
                                <StatusBadge status={ticket.status} />
                            </div>
                            <p className="font-semibold text-slate-800 text-sm truncate">{ticket.subject}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {ticket.last_message_at
                                    ? new Date(ticket.last_message_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                    : '-'}
                            </p>
                        </button>
                    ))}
                </div>
            )}

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-right">
                <button onClick={() => navigate('/ticket')} className="text-xs font-bold text-purple-600 hover:text-purple-700">
                    Lihat semua tiket →
                </button>
            </div>
        </div>
    );
};

export default function UserDashboardPage() {
    const { user, isLoading, refreshProfile, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Default to 'profil' (Akun) so clicking account always shows profile/account details
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'profil');
    const [isTopupOpen, setIsTopupOpen] = useState(location.state?.openTopup || false);
    const [pendingTopup, setPendingTopup] = useState(null);
    const [selectedTopup, setSelectedTopup] = useState(null);

    const handleLogout = () => {
        notify.confirm({ title: 'Keluar Akun', text: 'Apakah Anda yakin ingin keluar dari akun Noxarianet?' }).then((isConfirmed) => {
            if (isConfirmed) {
                logout();
                navigate('/');
                notify.success('Berhasil keluar');
            }
        });
    };

    const fetchPendingTopup = async () => {
        try {
            const res = await api.getPendingTopup();
            setPendingTopup(res.data?.data || null);
        } catch {
            // Ignore
        }
    };

    // Sync active tab when route state changes (e.g. from UserMenu navigation)
    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
        if (location.state?.openTopup) {
            setIsTopupOpen(true);
        }
    }, [location.state]);

    useEffect(() => {
        if (!isLoading && !user) {
            navigate('/auth', { replace: true, state: { from: location } });
        }
    }, [user, isLoading, navigate, location]);

    useEffect(() => {
        if (user) {
            refreshProfile();
            fetchPendingTopup();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-[#FAF9FF] flex items-center justify-center">
                <AnimatedBackground />
                <div className="w-10 h-10 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin relative z-10" />
            </div>
        );
    }

    const tabs = [
        { id: 'saldo', label: 'Saldo & Mutasi', shortLabel: 'Saldo', icon: Wallet },
        { id: 'pesanan', label: 'Riwayat Pesanan', shortLabel: 'Pesanan', icon: ShoppingBag },
        { id: 'bantuan', label: 'Bantuan CS', shortLabel: 'Bantuan', icon: LifeBuoy },
        { id: 'profil', label: 'Profil Saya', shortLabel: 'Akun', icon: User },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'saldo': 
                return (
                    <div className="space-y-6">
                        {pendingTopup && (
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-900 shadow-sm">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/20">
                                        <QrCode className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-800">Menunggu Pembayaran Top Up</p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Tagihan sebesar <span className="font-bold text-purple-600">{formatRp(pendingTopup.total || pendingTopup.pg_total || pendingTopup.amount)}</span> siap dibayar via QRIS.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setSelectedTopup(pendingTopup); setIsTopupOpen(true); }}
                                    className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm shrink-0"
                                >
                                    <QrCode className="w-4 h-4" />
                                    Lihat QRIS
                                </button>
                            </div>
                        )}
                        <BalanceCard 
                            balance={user.balance} 
                            balanceLimit={user.balance_limit} 
                            onTopup={() => { setSelectedTopup(null); setIsTopupOpen(true); }} 
                        />
                        <TransactionHistory onViewQr={(trx) => { setSelectedTopup(trx); setIsTopupOpen(true); }} />
                    </div>
                );
            case 'pesanan': 
                return <OrdersTab />;
            case 'bantuan':
                return <HelpTab />;
            case 'profil': 
            default: 
                return <ProfileTab user={user} refreshProfile={refreshProfile} onSwitchTab={setActiveTab} onLogout={handleLogout} />;
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF9FF] relative pb-28 lg:pb-16">
            <AnimatedBackground />
            
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 relative z-10">
                {/* Top Bar: Back to Home + Logout */}
                <div className="flex justify-between items-center mb-6">
                    <button 
                        type="button"
                        onClick={() => navigate('/')} 
                        className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-purple-700 text-xs sm:text-sm font-semibold border border-purple-100 shadow-sm backdrop-blur-md transition-all duration-200 cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1 text-purple-600" />
                        <span>Kembali ke Beranda</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold border border-red-100 transition-colors cursor-pointer"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Keluar Akun</span>
                    </button>
                </div>

                {/* User Welcome Banner Card */}
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-6 shadow-xs border border-purple-100/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-purple-500 to-indigo-600 text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-md shadow-purple-600/20 ring-4 ring-purple-50 shrink-0">
                        {user.display_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight truncate">
                            Halo, {user.display_name}!
                        </h1>
                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium mt-1 flex-wrap">
                            <div className="flex items-center gap-1.5 text-slate-500 min-w-0">
                                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200/70 px-2 py-0.5 rounded-full shrink-0 shadow-2xs">
                                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" aria-hidden="true">
                                    <path 
                                        fill="#0095F6" 
                                        d="M12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.548 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.548 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307A4.49 4.49 0 0112 2.25z" 
                                    />
                                    <path 
                                        fill="#FFFFFF" 
                                        d="M15.61 10.186a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" 
                                    />
                                </svg>
                                <span>Terverifikasi</span>
                            </span>
                        </div>
                    </div>

                    {/* Quick Tab Switcher on Banner */}
                    <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <button
                            type="button"
                            onClick={() => setActiveTab('profil')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                activeTab === 'profil'
                                    ? 'bg-purple-600 text-white shadow-xs'
                                    : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/60'
                            }`}
                        >
                            <User className="w-3.5 h-3.5" />
                            <span>Profil Saya</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('saldo')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                activeTab === 'saldo'
                                    ? 'bg-purple-600 text-white shadow-xs'
                                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60'
                            }`}
                        >
                            <Wallet className="w-3.5 h-3.5" />
                            <span>Saldo ({formatRp(user.balance || 0)})</span>
                        </button>
                    </div>
                </div>

                {/* Dashboard Layout: Sidebar + Content */}
                <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
                    {/* Desktop Sidebar Tabs (Hidden on mobile) */}
                    <div className="hidden lg:block lg:w-64 shrink-0">
                        <div className="flex flex-col gap-1.5 bg-white/80 backdrop-blur-xl p-2 rounded-3xl border border-purple-100/70 shadow-xs sticky top-6">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-xs font-bold w-full cursor-pointer ${
                                            isActive 
                                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20' 
                                                : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50/50'
                                        }`}
                                    >
                                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {renderTabContent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Top Up Modal Component */}
            <TopUpModal 
                isOpen={isTopupOpen} 
                initialTopup={selectedTopup}
                onClose={() => {
                    setIsTopupOpen(false);
                    setSelectedTopup(null);
                    fetchPendingTopup();
                }}
                balanceLimit={user.balance_limit}
                currentBalance={user.balance}
                onSuccess={() => {
                    setIsTopupOpen(false);
                    setSelectedTopup(null);
                    refreshProfile();
                    fetchPendingTopup();
                    setActiveTab('saldo');
                }}
            />

            {/* ═══ MOBILE BOTTOM APP BAR (Native App Dock Experience) ═══ */}
            <nav 
                aria-label="Navigasi Bawah Dashboard"
                className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-2xl border-t border-purple-100/90 shadow-[0_-8px_30px_rgba(124,58,237,0.1)] px-2 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))]"
            >
                <div className="grid grid-cols-4 items-center max-w-md mx-auto">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer select-none active:scale-95 ${
                                    isActive ? 'text-purple-600' : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                <div className={`relative p-1.5 rounded-xl transition-all ${isActive ? 'bg-purple-100 text-purple-700 scale-110 shadow-xs' : 'hover:bg-slate-50'}`}>
                                    <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-purple-700 stroke-[2.3]' : 'text-slate-400 stroke-[1.8]'}`} />
                                </div>
                                <span className={`text-[10px] tracking-tight mt-0.5 leading-none transition-all ${
                                    isActive ? 'font-black text-purple-700 scale-105' : 'font-semibold text-slate-500'
                                }`}>
                                    {tab.shortLabel}
                                </span>
                                {isActive && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1 shadow-xs shadow-purple-500/50" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
