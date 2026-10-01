import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Wallet, History, ShoppingBag, ChevronLeft, ChevronRight, Loader2, QrCode } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import BalanceCard from '../components/balance/BalanceCard';
import TopUpModal from '../components/balance/TopUpModal';
import TransactionHistory from '../components/balance/TransactionHistory';
import api from '../api';
import notify from '../utils/notify';
import { formatRp } from '../utils/currencyUtils';

// Subcomponents for tabs
const ProfileTab = ({ user, refreshProfile }) => {
    const [formData, setFormData] = useState({
        display_name: user?.display_name || '',
        phone: user?.phone || ''
    });
    const [passData, setPassData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.authUpdateProfile(formData);
            await refreshProfile();
            notify.success('Profil berhasil diperbarui');
        } catch (err) {
            notify.error(err.response?.data?.error || 'Gagal memperbarui profil');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePassSubmit = async (e) => {
        e.preventDefault();
        if (passData.new_password !== passData.confirm_password) {
            return notify.error('Password baru tidak cocok');
        }
        setIsLoading(true);
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
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Informasi Profil</h3>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Email (Tidak dapat diubah)</label>
                        <input type="email" value={user?.email || ''} disabled className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-500 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Nama Lengkap</label>
                        <input type="text" value={formData.display_name} onChange={e => setFormData({...formData, display_name: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 outline-none" required />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Nomor WhatsApp</label>
                        <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 outline-none" required />
                    </div>
                    <button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors">
                        Simpan Perubahan
                    </button>
                </form>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Ubah Password</h3>
                <form onSubmit={handlePassSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Password Saat Ini</label>
                        <input type="password" value={passData.current_password} onChange={e => setPassData({...passData, current_password: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 outline-none" required />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Password Baru</label>
                        <input type="password" value={passData.new_password} onChange={e => setPassData({...passData, new_password: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 outline-none" required minLength="6" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Konfirmasi Password Baru</label>
                        <input type="password" value={passData.confirm_password} onChange={e => setPassData({...passData, confirm_password: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 outline-none" required minLength="6" />
                    </div>
                    <button type="submit" disabled={isLoading} className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold transition-colors">
                        Ubah Password
                    </button>
                </form>
            </div>
        </div>
    );
};

const OrdersTab = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });

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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchOrders(page);
    }, [page, fetchOrders]);

    const getStatusBadge = (status) => {
        const s = (status || '').toUpperCase();
        switch (s) {
            case 'COMPLETED':
                return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-700">SELESAI</span>;
            case 'PROCESSING':
                return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700">DIPROSES</span>;
            case 'PENDING':
                return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-yellow-100 text-yellow-700">MENUNGGU</span>;
            case 'CANCELLED':
                return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">DIBATALKAN</span>;
            case 'FAILED':
            default:
                return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-700">{s || 'GAGAL'}</span>;
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">Riwayat Pesanan</h3>
                <p className="text-xs text-slate-500 mt-0.5">Daftar pesanan produk dan layanan yang pernah Anda buat</p>
            </div>

            <div className="p-0">
                {isLoading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                        <span className="text-xs text-slate-400">Memuat riwayat pesanan...</span>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 text-sm">
                        <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2 opacity-60" />
                        Belum ada pesanan yang tercatat.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {orders.map((ord) => (
                            <div key={ord.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="font-bold text-slate-800 text-sm truncate">{ord.product}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{ord.variant || '-'}</p>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                                        <span className="font-mono text-[11px] text-slate-500">{ord.id}</span>
                                        <span>•</span>
                                        <span>{ord.timestamp ? new Date(ord.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                                        <span>•</span>
                                        {getStatusBadge(ord.status)}
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="font-bold font-mono text-sm text-slate-800">{formatRp(ord.price || 0)}</span>
                                    <p className="text-[10px] text-slate-400 uppercase mt-0.5">{ord.payment_method || ord.payment_type || 'PG'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Pagination Controls ── */}
                {!isLoading && pagination.total > 0 && (
                    <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50/50">
                        <span className="text-slate-500">
                            Menampilkan {(page - 1) * 10 + 1}–{Math.min(page * 10, pagination.total)} dari {pagination.total} pesanan
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium bg-white"
                            >
                                <ChevronLeft size={14} /> Sebelumnya
                            </button>
                            <span className="text-slate-700 font-semibold px-2.5 py-1 rounded-md bg-white border border-slate-200">
                                Halaman {page} dari {pagination.totalPages || 1}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.totalPages || 1, p + 1))}
                                disabled={page >= (pagination.totalPages || 1)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium bg-white"
                            >
                                Berikutnya <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function UserDashboardPage() {
    const { user, isLoading, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'profil');
    const [isTopupOpen, setIsTopupOpen] = useState(location.state?.openTopup || false);
    const [pendingTopup, setPendingTopup] = useState(null);
    const [selectedTopup, setSelectedTopup] = useState(null);

    const fetchPendingTopup = async () => {
        try {
            const res = await api.getPendingTopup();
            setPendingTopup(res.data?.data || null);
        } catch {
            // Ignore
        }
    };

    useEffect(() => {
        if (!isLoading && !user) {
            navigate('/auth', { replace: true, state: { from: location } });
        }
    }, [user, isLoading, navigate, location]);

    useEffect(() => {
        if (user) {
            refreshProfile();
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchPendingTopup();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (isLoading || !user) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>;
    }

    const tabs = [
        { id: 'profil', label: 'Profil Saya', icon: User },
        { id: 'saldo', label: 'Saldo & Top Up', icon: Wallet },
        { id: 'transaksi', label: 'Riwayat Transaksi', icon: History },
        { id: 'pesanan', label: 'Riwayat Pesanan', icon: ShoppingBag },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profil': return <ProfileTab user={user} refreshProfile={refreshProfile} />;
            case 'saldo': return (
                <div className="space-y-6">
                    {pendingTopup && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-900 shadow-sm">
                            <div className="flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-600">
                                    <QrCode className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-800">Transaksi Top-Up Belum Selesai</p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Tagihan sebesar <span className="font-bold text-purple-600">{formatRp(pendingTopup.total || pendingTopup.pg_total || pendingTopup.amount)}</span> sedang menunggu pembayaran Anda.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setSelectedTopup(pendingTopup); setIsTopupOpen(true); }}
                                className="w-full sm:w-auto px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm shrink-0"
                            >
                                <QrCode className="w-4 h-4" />
                                Lihat QRIS
                            </button>
                        </div>
                    )}
                    <BalanceCard balance={user.balance} balanceLimit={user.balance_limit} onTopup={() => { setSelectedTopup(null); setIsTopupOpen(true); }} />
                    <TransactionHistory onViewQr={(trx) => { setSelectedTopup(trx); setIsTopupOpen(true); }} />
                </div>
            );
            case 'transaksi': return <TransactionHistory onViewQr={(trx) => { setSelectedTopup(trx); setIsTopupOpen(true); }} />;
            case 'pesanan': return <OrdersTab />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 relative pb-20">
            <AnimatedBackground />
            
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 relative z-10">
                <button onClick={() => navigate('/')} className="mb-6 flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors font-medium">
                    <ChevronLeft className="w-5 h-5" />
                    Kembali ke Beranda
                </button>

                <div className="mb-8 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-2xl">
                        {user.display_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Halo, {user.display_name}!</h1>
                        <p className="text-slate-500">{user.email}</p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Tabs */}
                    <div className="lg:w-64 shrink-0 space-y-1">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left font-medium ${
                                        isActive ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'text-slate-600 hover:bg-white hover:text-purple-600'
                                    }`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
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
                    setActiveTab('transaksi');
                }}
            />
        </div>
    );
}
