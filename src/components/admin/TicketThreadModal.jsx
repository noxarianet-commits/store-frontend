import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, Send, Package, Mail, Phone, Calendar, AlertTriangle, ExternalLink, User } from 'lucide-react';
import api from '../../api';
import { notifyError, notifySuccess } from '../../utils/notify';

const STATUS_OPTIONS = [
    { value: 'open', label: 'Terbuka' },
    { value: 'pending', label: 'Menunggu' },
    { value: 'closed', label: 'Selesai' },
];

const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Rendah' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'Tinggi' },
    { value: 'urgent', label: 'Mendesak' },
];

const CATEGORY_LABELS = {
    umum: 'Umum',
    pesanan: 'Pesanan',
    pembayaran: 'Pembayaran',
    produk: 'Produk',
    akun: 'Akun',
    lainnya: 'Lainnya',
};

const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const normalizeWaLink = (wa) => {
    if (!wa) return null;
    const digits = String(wa).replace(/\D/g, '');
    if (!digits) return null;
    if (digits.startsWith('0')) return `62${digits.slice(1)}`;
    return digits;
};

/**
 * Modal thread tiket untuk admin: percakapan, balas, ubah status/prioritas,
 * dan panel ringkasan pesanan terkait (tanpa account_details).
 *
 * @param {object} props
 * @param {string} props.ticketNumber
 * @param {Function} props.onClose
 * @param {Function} props.onUpdated — dipanggil setelah balas/ubah agar list refresh
 * @param {number} props.refreshKey — naikkan untuk memicu muat ulang dari parent (SSE)
 */
const TicketThreadModal = ({ ticketNumber, onClose, onUpdated, refreshKey = 0 }) => {
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [draft, setDraft] = useState('');
    const [sending, setSending] = useState(false);
    const [updating, setUpdating] = useState(false);
    const bottomRef = useRef(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.getAdminTicket(ticketNumber);
            setTicket(res.data?.data || null);
            setLoadError(false);
        } catch {
            setLoadError(true);
        } finally {
            setLoading(false);
        }
    }, [ticketNumber]);

    // setTimeout 0 mengikuti pola AdminDashboard: hindari setState langsung di body effect.
    useEffect(() => {
        const timer = setTimeout(() => load(), 0);
        return () => clearTimeout(timer);
    }, [load, refreshKey]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [ticket?.messages?.length]);

    const handleReply = async (event) => {
        event.preventDefault();
        const body = draft.trim();
        if (!body || sending) return;

        setSending(true);
        try {
            const res = await api.replyAdminTicket(ticketNumber, body);
            const { message, ticket: updatedTicket } = res.data?.data || {};
            setTicket((prev) => (prev ? {
                ...prev,
                ...(updatedTicket || {}),
                messages: message ? [...prev.messages, message] : prev.messages,
            } : prev));
            setDraft('');
            notifySuccess('Balasan terkirim.');
            onUpdated?.();
        } catch (err) {
            notifyError(err.response?.data?.error || 'Gagal mengirim balasan.');
        } finally {
            setSending(false);
        }
    };

    const handleUpdate = async (patch) => {
        if (updating) return;
        setUpdating(true);
        try {
            const res = await api.updateAdminTicket(ticketNumber, patch);
            setTicket((prev) => (prev ? { ...prev, ...(res.data?.data || {}) } : prev));
            notifySuccess('Tiket diperbarui.');
            onUpdated?.();
        } catch (err) {
            notifyError(err.response?.data?.error || 'Gagal memperbarui tiket.');
        } finally {
            setUpdating(false);
        }
    };

    const order = ticket?.order;
    const waLink = normalizeWaLink(ticket?.guest_wa);

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80"
                onClick={onClose}
            />
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-5xl max-h-[92vh] bg-[#0E0E0E] border border-white/10 rounded-3xl overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="p-5 border-b border-white/5 flex items-start justify-between gap-4 shrink-0">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-1 rounded">{ticketNumber}</span>
                            <span className="text-[10px] text-gray-500">{ticket ? CATEGORY_LABELS[ticket.category] || 'Umum' : ''}</span>
                        </div>
                        <h2 className="text-lg font-bold text-white truncate">{ticket?.subject || (loading ? 'Memuat...' : 'Tiket')}</h2>
                        {ticket && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-3 flex-wrap">
                                <span className="inline-flex items-center gap-1"><User size={12} /> {ticket.guest_name || 'Tanpa nama'}</span>
                                {ticket.guest_email && <span className="inline-flex items-center gap-1"><Mail size={12} /> {ticket.guest_email}</span>}
                                {ticket.guest_wa && (
                                    waLink ? (
                                        <a href={`https://wa.me/${waLink}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-green-400 hover:underline">
                                            <Phone size={12} /> {ticket.guest_wa} <ExternalLink size={10} />
                                        </a>
                                    ) : (
                                        <span className="inline-flex items-center gap-1"><Phone size={12} /> {ticket.guest_wa}</span>
                                    )
                                )}
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white shrink-0">
                        <X size={20} />
                    </button>
                </div>

                {/* Kontrol status & prioritas */}
                {ticket && (
                    <div className="px-5 py-3 border-b border-white/5 flex flex-wrap items-center gap-3 shrink-0">
                        <label className="flex items-center gap-2 text-[11px] text-gray-500 uppercase font-bold">
                            Status
                            <select
                                value={ticket.status}
                                disabled={updating}
                                onChange={(e) => handleUpdate({ status: e.target.value })}
                                className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/50 cursor-pointer disabled:opacity-50"
                            >
                                {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </label>
                        <label className="flex items-center gap-2 text-[11px] text-gray-500 uppercase font-bold">
                            Prioritas
                            <select
                                value={ticket.priority}
                                disabled={updating}
                                onChange={(e) => handleUpdate({ priority: e.target.value })}
                                className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/50 cursor-pointer disabled:opacity-50"
                            >
                                {PRIORITY_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </label>
                        <span className="text-[11px] text-gray-600 ml-auto inline-flex items-center gap-1">
                            <Calendar size={11} /> Aktivitas {formatDate(ticket.last_message_at)}
                        </span>
                    </div>
                )}

                {/* Body: thread + panel order */}
                <div className="flex-1 overflow-hidden grid lg:grid-cols-[1fr_280px]">
                    <div className="flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 size={26} className="animate-spin text-purple-500" />
                                </div>
                            ) : loadError ? (
                                <div className="text-center py-12 text-gray-500 text-sm">
                                    <AlertTriangle size={24} className="mx-auto mb-3 text-red-400" />
                                    Gagal memuat tiket ini.
                                </div>
                            ) : ticket?.messages?.length ? (
                                ticket.messages.map((message) => {
                                    const isAdmin = message.author === 'admin';
                                    return (
                                        <div key={message.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                            <div className="max-w-[85%] flex flex-col gap-1">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-1 ${isAdmin ? 'text-right text-purple-400' : 'text-gray-500'}`}>
                                                    {isAdmin ? 'CS / Admin' : (ticket.guest_name || 'Pelanggan')}
                                                </span>
                                                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                                                    isAdmin
                                                        ? 'bg-purple-600 text-white rounded-br-sm'
                                                        : 'bg-white/5 border border-white/10 text-gray-300 rounded-bl-sm'
                                                }`}>
                                                    {message.body}
                                                </div>
                                                <span className={`text-[10px] text-gray-600 px-1 ${isAdmin ? 'text-right' : ''}`}>
                                                    {formatDate(message.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-center text-sm text-gray-500 py-12">Belum ada pesan.</p>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Composer */}
                        <form onSubmit={handleReply} className="p-4 border-t border-white/5 shrink-0">
                            <textarea
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleReply(e);
                                }}
                                maxLength={4000}
                                rows={3}
                                placeholder="Tulis balasan untuk pelanggan... (Ctrl+Enter untuk kirim)"
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none"
                            />
                            <div className="flex items-center justify-between mt-3">
                                <span className="text-[10px] text-gray-600">{draft.length}/4000</span>
                                <button
                                    type="submit"
                                    disabled={sending || !draft.trim()}
                                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                                >
                                    {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                    Kirim Balasan
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Panel order */}
                    <div className="hidden lg:block border-l border-white/5 p-5 overflow-y-auto bg-black/20">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-3">Pesanan Terkait</p>
                        {order ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Package size={14} className="text-purple-400" />
                                    <span className="text-xs font-mono text-purple-300">{order.id}</span>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
                                    <p className="text-sm font-bold text-white">{order.product}</p>
                                    {order.variant && <p className="text-xs text-gray-400">{order.variant}</p>}
                                    <p className="text-xs text-gray-400">Rp {Number(order.price || 0).toLocaleString('id-ID')}</p>
                                </div>
                                <div className="text-xs text-gray-400 space-y-1.5">
                                    <p className="flex justify-between"><span className="text-gray-600">Status</span> <span className="text-white font-semibold">{order.status}</span></p>
                                    {order.vendor_status && <p className="flex justify-between"><span className="text-gray-600">Vendor</span> <span>{order.vendor_status}</span></p>}
                                    {order.pg_provider && <p className="flex justify-between"><span className="text-gray-600">Pembayaran</span> <span>{order.pg_provider}</span></p>}
                                    <p className="flex justify-between"><span className="text-gray-600">Tanggal</span> <span>{formatDate(order.timestamp)}</span></p>
                                </div>
                                {order.error_message && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                                        <p className="text-[10px] text-red-400 font-bold uppercase mb-1">Error</p>
                                        <p className="text-xs text-red-300 break-words">{order.error_message}</p>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => { navigator.clipboard?.writeText(order.id); notifySuccess('ID pesanan disalin.'); }}
                                    className="w-full text-center text-xs font-bold text-purple-400 hover:text-purple-300 bg-purple-500/10 border border-purple-500/20 rounded-xl px-3 py-2.5 transition-colors"
                                >
                                    Salin ID Pesanan
                                </button>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-600">Tiket ini tidak dikaitkan dengan pesanan.</p>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default TicketThreadModal;
