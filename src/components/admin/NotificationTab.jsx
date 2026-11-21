import { useState, useEffect, useCallback } from 'react';
import { Send, Smartphone, Bell, CheckCircle2, XCircle, RefreshCw, Loader2, Inbox } from 'lucide-react';
import { notifyError, notifyWarning, confirmAction, showAlert } from '../../utils/notify';
import api from '../../api';

const TITLE_MAX = 80;
const BODY_MAX = 250;

const STATUS_CONFIG = {
    sent: { label: 'Terkirim', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    failed: { label: 'Gagal', color: 'bg-rose-50 text-rose-700 border border-rose-200' },
    pending: { label: 'Menunggu', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
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
        { label: 'Perangkat Aktif', value: stats?.devices_active ?? 0, icon: Smartphone, color: 'text-purple-600 bg-purple-50 border-purple-100' },
        { label: 'Total Perangkat', value: stats?.devices_total ?? 0, icon: Bell, color: 'text-blue-600 bg-blue-50 border-blue-100' },
        { label: 'Notifikasi Terkirim', value: stats?.notifications_sent ?? 0, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
        { label: 'Notifikasi Gagal', value: stats?.notifications_failed ?? 0, icon: XCircle, color: 'text-rose-600 bg-rose-50 border-rose-100' },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Kirim Notifikasi</h2>

            {/* Form broadcast */}
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
                <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Send size={18} className="text-purple-600" />
                        Kirim Notifikasi (Broadcast)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Kirim notifikasi push ke semua perangkat pengguna yang terdaftar.</p>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Judul</label>
                        <span className={`text-[10px] font-mono ${form.title.length > TITLE_MAX ? 'text-rose-600' : 'text-slate-400'}`}>
                            {form.title.length}/{TITLE_MAX}
                        </span>
                    </div>
                    <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        maxLength={TITLE_MAX}
                        placeholder="Contoh: Promo Akhir Bulan"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-purple-500 transition-colors"
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Pesan</label>
                        <span className={`text-[10px] font-mono ${form.body.length > BODY_MAX ? 'text-rose-600' : 'text-slate-400'}`}>
                            {form.body.length}/{BODY_MAX}
                        </span>
                    </div>
                    <textarea
                        value={form.body}
                        onChange={(e) => setForm({ ...form, body: e.target.value })}
                        maxLength={BODY_MAX}
                        rows={4}
                        placeholder="Contoh: Diskon 20% untuk semua produk!"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-800 placeholder:text-slate-400 h-24 resize-none focus:outline-none focus:bg-white focus:border-purple-500 transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Tautan (Opsional)</label>
                    <input
                        type="text"
                        value={form.url}
                        onChange={(e) => setForm({ ...form, url: e.target.value })}
                        placeholder="/katalog — opsional, kosongkan jika tidak perlu"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-purple-500 transition-colors"
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                    {submitting ? 'Mengirim...' : 'Kirim Notifikasi'}
                </button>
            </form>

            {/* Statistik device */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${card.color}`}>
                                <Icon size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{card.label}</p>
                                <p className="text-xl font-black text-slate-900 font-mono">{loading ? '—' : card.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Riwayat */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900">Riwayat Broadcast</h3>
                        <p className="text-xs text-slate-500 mt-0.5">20 notifikasi terakhir yang dikirim.</p>
                    </div>
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-purple-600" /></div>
                ) : history.length === 0 ? (
                    <div className="p-12 text-center">
                        <Inbox size={40} className="text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600 font-semibold text-sm">Belum ada notifikasi terkirim.</p>
                        <p className="text-slate-400 text-xs mt-1">Notifikasi yang Anda kirim akan muncul di sini.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                    <th className="text-left px-4 py-3">Waktu</th>
                                    <th className="text-left px-4 py-3">Judul</th>
                                    <th className="text-left px-4 py-3">Pesan</th>
                                    <th className="text-center px-4 py-3">Status</th>
                                    <th className="text-right px-4 py-3">Terkirim/Gagal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {history.map((item) => {
                                    const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap font-medium">{formatWaktu(item.created_at)}</td>
                                            <td className="px-4 py-3">
                                                <p className="text-slate-900 font-semibold truncate max-w-[180px]" title={item.title}>{item.title}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-slate-500 text-xs truncate max-w-[240px]" title={item.body}>{item.body}</p>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${statusCfg.color}`}>
                                                    {statusCfg.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="text-emerald-700 font-bold font-mono">{item.sent_count ?? 0}</span>
                                                <span className="text-slate-300 mx-1">/</span>
                                                <span className="text-rose-600 font-bold font-mono">{item.failed_count ?? 0}</span>
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
