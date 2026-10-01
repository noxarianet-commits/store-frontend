import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, ChevronLeft, ChevronRight, UserCheck, UserX, Plus, Minus, Settings2 } from 'lucide-react';
import { formatRp } from '../../utils/currencyUtils';
import { notifySuccess, notifyError, notifyWarning, confirmAction } from '../../utils/notify';
import api from '../../api';

export default function UsersTab() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
    const [actionModal, setActionModal] = useState(null); // { type: 'balance'|'limit', user }

    const fetchUsers = useCallback(async (pageNum = 1, searchTerm = '') => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users', { params: { page: pageNum, limit: 10, search: searchTerm } });
            setUsers(res.data.data || []);
            setPagination(res.data.pagination || { total: 0, totalPages: 1 });
        } catch (err) {
            notifyError('Gagal memuat data user');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchUsers(page, search);
    }, [page, search, fetchUsers]);

    const handleSearch = () => {
        if (page === 1) {
            fetchUsers(1, search);
        } else {
            setPage(1); // triggers useEffect
        }
    };

    const handleToggleStatus = async (user) => {
        const newStatus = !user.is_active;
        const confirmed = await confirmAction({
            title: newStatus ? 'Aktifkan User?' : 'Nonaktifkan User?',
            text: `${user.display_name || user.email} akan ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}.`,
            confirmText: newStatus ? 'Ya, Aktifkan' : 'Ya, Nonaktifkan',
            danger: !newStatus,
        });
        if (!confirmed) return;
        try {
            await api.patch(`/admin/users/${user.id}/status`, { is_active: newStatus });
            notifySuccess(`User berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
            fetchUsers(page, search);
        } catch (err) {
            notifyError(err.response?.data?.error || 'Gagal mengubah status');
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Manajemen User</h2>

            {/* Search */}
            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text" value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Cari nama, email, atau telepon..."
                        className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
                    />
                </div>
                <button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
                    Cari
                </button>
            </div>

            {/* Table */}
            <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-purple-500" /></div>
                ) : users.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">Tidak ada user ditemukan.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/5 text-gray-400 text-xs uppercase tracking-wider">
                                    <th className="text-left px-4 py-3">User</th>
                                    <th className="text-left px-4 py-3 hidden sm:table-cell">Telepon</th>
                                    <th className="text-right px-4 py-3">Saldo</th>
                                    <th className="text-right px-4 py-3 hidden md:table-cell">Limit</th>
                                    <th className="text-center px-4 py-3">Status</th>
                                    <th className="text-center px-4 py-3">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="text-white font-medium truncate max-w-[180px]">{user.display_name || '-'}</p>
                                            <p className="text-gray-500 text-xs truncate max-w-[180px]">{user.email}</p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300 hidden sm:table-cell">{user.phone || '-'}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-green-400 font-semibold">{formatRp(user.balance || 0)}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-400 hidden md:table-cell">{formatRp(user.balance_limit || 0)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${user.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                {user.is_active ? <UserCheck size={10} /> : <UserX size={10} />}
                                                {user.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={() => setActionModal({ type: 'balance', user })} title="Atur Saldo"
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors">
                                                    <Plus size={14} />
                                                </button>
                                                <button onClick={() => setActionModal({ type: 'limit', user })} title="Atur Limit"
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors">
                                                    <Settings2 size={14} />
                                                </button>
                                                <button onClick={() => handleToggleStatus(user)}
                                                    title={user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                                    className={`p-1.5 rounded-lg transition-colors ${user.is_active ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-400 hover:text-green-400 hover:bg-green-500/10'}`}>
                                                    {user.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
                        <span className="text-xs text-gray-500">{pagination.total} user total</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-xs text-gray-400">{page} / {pagination.totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Modal */}
            {actionModal && (
                <ActionModal
                    type={actionModal.type}
                    user={actionModal.user}
                    onClose={() => setActionModal(null)}
                    onSuccess={() => { setActionModal(null); fetchUsers(page, search); }}
                />
            )}
        </div>
    );
}

// ── Action Modal (Balance / Limit) ──────────────────────────────────────
function ActionModal({ type, user, onClose, onSuccess }) {
    const [amount, setAmount] = useState('');
    const [balanceType, setBalanceType] = useState('credit'); // credit | debit
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const numVal = parseInt(amount);
        if (isNaN(numVal) || numVal <= 0) {
            notifyWarning('Masukkan nilai yang valid');
            return;
        }

        setIsSubmitting(true);
        try {
            if (type === 'balance') {
                await api.patch(`/admin/users/${user.id}/balance`, {
                    amount: numVal,
                    type: balanceType,
                    description: description || undefined,
                });
                notifySuccess(`Saldo berhasil ${balanceType === 'credit' ? 'ditambahkan' : 'dikurangi'}`);
            } else {
                await api.patch(`/admin/users/${user.id}/limit`, { limit: numVal });
                notifySuccess('Limit berhasil diubah');
            }
            onSuccess();
        } catch (err) {
            notifyError(err.response?.data?.error || 'Gagal menyimpan perubahan');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-[#0E0E0E] border border-white/10 rounded-2xl w-full max-w-sm relative z-10 shadow-2xl">
                <div className="p-5 border-b border-white/5">
                    <h3 className="text-lg font-bold text-white">
                        {type === 'balance' ? 'Atur Saldo' : 'Atur Limit Saldo'}
                    </h3>
                    <p className="text-gray-500 text-xs mt-1">{user.display_name || user.email}</p>
                    {type === 'balance' && (
                        <p className="text-gray-400 text-xs mt-0.5">Saldo saat ini: <span className="text-green-400 font-semibold">{formatRp(user.balance || 0)}</span></p>
                    )}
                    {type === 'limit' && (
                        <p className="text-gray-400 text-xs mt-0.5">Limit saat ini: <span className="text-blue-400 font-semibold">{formatRp(user.balance_limit || 0)}</span></p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {type === 'balance' && (
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setBalanceType('credit')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${balanceType === 'credit' ? 'bg-green-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                <Plus size={14} /> Tambah
                            </button>
                            <button type="button" onClick={() => setBalanceType('debit')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${balanceType === 'debit' ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                <Minus size={14} /> Kurangi
                            </button>
                        </div>
                    )}

                    <div>
                        <label className="text-xs text-gray-400 mb-1.5 block">
                            {type === 'balance' ? 'Jumlah (Rp)' : 'Limit Baru (Rp)'}
                        </label>
                        <input
                            type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                            placeholder={type === 'limit' ? String(user.balance_limit || 1000000) : '0'}
                            min="0" required autoFocus
                            className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    {type === 'balance' && (
                        <div>
                            <label className="text-xs text-gray-400 mb-1.5 block">Keterangan (opsional)</label>
                            <input
                                type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                                placeholder="Misal: Bonus promo, koreksi saldo..."
                                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                            />
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-2.5 rounded-xl text-sm font-medium transition-colors">
                            Batal
                        </button>
                        <button type="submit" disabled={isSubmitting}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
