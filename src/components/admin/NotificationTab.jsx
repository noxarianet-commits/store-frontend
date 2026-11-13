import { useState, useEffect, useCallback } from 'react';
import { Send, Smartphone, Bell, CheckCircle2, XCircle, RefreshCw, Loader2, Inbox } from 'lucide-react';
import { notifyError, notifyWarning, confirmAction, showAlert } from '../../utils/notify';
import api from '../../api';

const TITLE_MAX = 80;
const BODY_MAX = 250;

const STATUS_CONFIG = {
    sent: { label: 'Terkirim', color: 'bg-green-500/10 text-green-400' },
    failed: { label: 'Gagal', color: 'bg-red-500/10 text-red-400' },
    pending: { label: 'Menunggu', color: 'bg-amber-500/10 text-amber-400' },
};

const formatWaktu = (iso) => {
    try {
        return new Date(iso).toLocaleString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    } catch {
        return iso || '-';
    }
};

export default function NotificationTab() {
    const [form, setForm] = useState({ title: '', body: '', url: '' });
    const [submitting, setSubmitting] = useState(false);
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [statsRes, historyRes] = await Promise.all([
                api.getPushStats(),
                api.getPushHistory(20),
            ]);
            setStats(statsRes.data?.data || null);
            setHistory(historyRes.data?.data?.notifications || []);
        } catch (err) {
            notifyError(err.response?.data?.error || 'Gagal memuat data notifikasi');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData();
    }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const title = form.title.trim();
        const body = form.body.trim();
        const url = form.url.trim();

        if (!title) return notifyWarning('Judul notifikasi wajib diisi!');
        if (!body) return notifyWarning('Isi pesan notifikasi wajib diisi!');
        if (title.length > TITLE_MAX) return notifyWarning(`Judul maksimal ${TITLE_MAX} karakter!`);
        if (body.length > BODY_MAX) return notifyWarning(`Pesan maksimal ${BODY_MAX} karakter!`);

        const targetCount = stats?.devices_active ?? 0;
        const confirmed = await confirmAction({
            title: 'Kirim Notifikasi?',
            text: `Kirim ke ${targetCount} perangkat aktif?`,
            confirmText: 'Ya, Kirim',
            cancelText: 'Batal',
        });
        if (!confirmed) return;

        setSubmitting(true);
        try {
            const res = await api.broadcastPush({ title, body, ...(url ? { url } : {}) });
            const d = res.data?.data || {};
            await showAlert({
                icon: 'success',
                title: 'Notifikasi Terkirim!',
                text: `Terkirim: ${d.sent ?? 0} perangkat • Gagal: ${d.failed ?? 0}`,
                confirmText: 'OK',
            });
            setForm({ title: '', body: '', url: '' });
            fetchData();
        } catch (err) {
            notifyError(err.response?.data?.error || 'Gagal mengirim notifikasi');
        } finally {
            setSubmitting(false);
        }
    };

    const statCards = [
        { label: 'Perangkat Aktif', value: stats?.devices_active ?? 0, icon: Smartphone, color: 'text-purple-400 bg-purple-500/10' },
        { label: 'Total Perangkat', value: stats?.devices_total ?? 0, icon: Bell, color: 'text-blue-400 bg-blue-500/10' },
        { label: 'Notifikasi Terkirim', value: stats?.notifications_sent ?? 0, icon: CheckCircle2, color: 'text-green-400 bg-green-500/10' },
        { label: 'Notifikasi Gagal', value: stats?.notifications_failed ?? 0, icon: XCircle, color: 'text-red-400 bg-red-500/10' },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Kirim Notifikasi</h2>

            {/* Form broadcast */}
            <form onSubmit={handleSubmit} className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-6 space-y-4">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Send size={20} className="text-purple-400" />
                        Kirim Notifikasi (Broadcast)
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Kirim notifikasi push ke semua perangkat yang terdaftar.</p>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-medium text-gray-400">Judul</label>
                        <span className={`text-[10px] font-mono ${form.title.length > TITLE_MAX ? 'text-red-400' : 'text-gray-500'}`}>
                            {form.title.length}/{TITLE_MAX}
                        </span>
                    </div>
                    <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        maxLength={TITLE_MAX}
                        placeholder="Contoh: Promo Akhir Bulan"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-medium text-gray-400">Pesan</label>
                        <span className={`text-[10px] font-mono ${form.body.length > BODY_MAX ? 'text-red-400' : 'text-gray-500'}`}>
                            {form.body.length}/{BODY_MAX}
                        </span>
                    </div>
                    <textarea
                        value={form.body}
                        onChange={(e) => setForm({ ...form, body: e.target.value })}
                        maxLength={BODY_MAX}
                        rows={4}
                        placeholder="Contoh: Diskon 20% untuk semua produk!"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-gray-500 h-24 resize-none focus:outline-none focus:border-purple-500/50"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">Tautan (Opsional)</label>
                    <input
                        type="text"
                        value={form.url}
                        onChange={(e) => setForm({ ...form, url: e.target.value })}
                        placeholder="/katalog — opsional, kosongkan jika tidak perlu"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {submitting ? 'Mengirim...' : 'Kirim Notifikasi'}
                </button>
            </form>

            {/* Statistik device */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.color}`}>
                                <Icon size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{card.label}</p>
                                <p className="text-xl font-bold text-white">{loading ? '—' : card.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Riwayat */}
            <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <div>
                        <h3 className="text-lg font-bold text-white">Riwayat Broadcast</h3>
                        <p className="text-xs text-gray-500 mt-0.5">20 notifikasi terakhir yang dikirim.</p>
                    </div>
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-purple-500" /></div>
                ) : history.length === 0 ? (
                    <div className="p-12 text-center">
                        <Inbox size={40} className="text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400 font-medium">Belum ada notifikasi terkirim.</p>
                        <p className="text-gray-500 text-xs mt-1">Notifikasi yang Anda kirim akan muncul di sini.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/5 text-gray-400 text-xs uppercase tracking-wider">
                                    <th className="text-left px-4 py-3">Waktu</th>
                                    <th className="text-left px-4 py-3">Judul</th>
                                    <th className="text-left px-4 py-3">Pesan</th>
                                    <th className="text-center px-4 py-3">Status</th>
                                    <th className="text-right px-4 py-3">Terkirim/Gagal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {history.map((item) => {
                                    const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
                                    return (
                                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{formatWaktu(item.created_at)}</td>
                                            <td className="px-4 py-3">
                                                <p className="text-white font-medium truncate max-w-[180px]" title={item.title}>{item.title}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-gray-400 text-xs truncate max-w-[240px]" title={item.body}>{item.body}</p>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${statusCfg.color}`}>
                                                    {statusCfg.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="text-green-400 font-semibold">{item.sent_count ?? 0}</span>
                                                <span className="text-gray-500 mx-1">/</span>
                                                <span className="text-red-400 font-semibold">{item.failed_count ?? 0}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
