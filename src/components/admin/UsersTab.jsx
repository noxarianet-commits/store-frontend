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
        fetchUsers(page, search);
    }, [page, search, fetchUsers]);

    const handleSearch = () => {
        if (page === 1) {
            fetchUsers(1, search);
        } else {
            setPage(1);
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
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Manajemen User</h2>

            {/* Search */}
            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Cari nama, email, atau telepon..."
                        className="w-full bg-white border border-slate-200/80 rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-500 shadow-xs transition-colors"
                    />
                </div>
                <button
                    onClick={handleSearch}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-2xl text-xs font-bold transition-colors shadow-xs"
                >
                    Cari
                </button>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                {loading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-purple-600" /></div>
                ) : users.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 text-sm font-medium">Tidak ada user ditemukan.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                    <th className="text-left px-4 py-3">User</th>
                                    <th className="text-left px-4 py-3 hidden sm:table-cell">Telepon</th>
                                    <th className="text-right px-4 py-3">Saldo</th>
                                    <th className="text-right px-4 py-3 hidden md:table-cell">Limit</th>
                                    <th className="text-center px-4 py-3">Status</th>
                                    <th className="text-center px-4 py-3">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="px-4 py-3.5">
                                            <p className="text-slate-900 font-bold truncate max-w-[180px]">{user.display_name || '-'}</p>
                                            <p className="text-slate-400 text-xs truncate max-w-[180px]">{user.email}</p>
                                        </td>
                                        <td className="px-4 py-3.5 text-slate-600 font-mono text-xs hidden sm:table-cell">{user.phone || '-'}</td>
                                        <td className="px-4 py-3.5 text-right font-mono">
                                            <span className="text-emerald-700 font-bold">{formatRp(user.balance || 0)}</span>
                                        </td>
                                        <td className="px-4 py-3.5 text-right text-slate-500 font-mono text-xs hidden md:table-cell">{formatRp(user.balance_limit || 0)}</td>
                                        <td className="px-4 py-3.5 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${user.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                                {user.is_active ? <UserCheck size={10} /> : <UserX size={10} />}
                                                {user.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => setActionModal({ type: 'balance', user })}
                                                    title="Atur Saldo"
                                                    className="p-1.5 rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setActionModal({ type: 'limit', user })}
                                                    title="Atur Limit"
                                                    className="p-1.5 rounded-lg text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors"
                                                >
                                                    <Settings2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    title={user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                                    className={`p-1.5 rounded-lg transition-colors border ${user.is_active ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200' : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'}`}
                                                >
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
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                        <span className="text-xs text-slate-500 font-medium">{pagination.total} user total</span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 bg-white border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-xs font-bold text-slate-700 px-2">{page} / {pagination.totalPages}</span>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={page >= pagination.totalPages}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 bg-white border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
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

// Action Modal (Balance / Limit)
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
            <div className="absolute inset-0 bg-slate-900/60" onClick={onClose} />
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm relative z-10 shadow-2xl overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900">
                        {type === 'balance' ? 'Atur Saldo' : 'Atur Limit Saldo'}
                    </h3>
                    <p className="text-slate-500 text-xs mt-1">{user.display_name || user.email}</p>
                    {type === 'balance' && (
                        <p className="text-slate-600 text-xs mt-0.5">Saldo saat ini: <span className="text-emerald-700 font-bold">{formatRp(user.balance || 0)}</span></p>
                    )}
                    {type === 'limit' && (
                        <p className="text-slate-600 text-xs mt-0.5">Limit saat ini: <span className="text-sky-700 font-bold">{formatRp(user.balance_limit || 0)}</span></p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {type === 'balance' && (
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setBalanceType('credit')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all border ${balanceType === 'credit' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                            >
                                <Plus size={14} /> Tambah
                            </button>
                            <button
                                type="button"
                                onClick={() => setBalanceType('debit')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all border ${balanceType === 'debit' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                            >
                                <Minus size={14} /> Kurangi
                            </button>
                        </div>
                    )}

                    <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 block">
                            {type === 'balance' ? 'Jumlah (Rp)' : 'Limit Baru (Rp)'}
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder={type === 'limit' ? String(user.balance_limit || 1000000) : '0'}
                            min="0"
                            required
                            autoFocus
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-purple-500 font-semibold"
                        />
                    </div>

                    {type === 'balance' && (
                        <div>
                            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 block">Keterangan (opsional)</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Misal: Bonus promo, koreksi saldo..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-purple-500"
                            />
                        </div>
                    )}

                    <div className="flex gap-2.5 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
                        >
                            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
