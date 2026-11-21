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
                className="absolute inset-0 bg-slate-900/60"
                onClick={onClose}
            />
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-5xl max-h-[92vh] bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            >
                {/* Header */}
                <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4 shrink-0 bg-slate-50/50">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-lg">{ticketNumber}</span>
                            <span className="text-[11px] text-slate-500 font-semibold">{ticket ? CATEGORY_LABELS[ticket.category] || 'Umum' : ''}</span>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 truncate">{ticket?.subject || (loading ? 'Memuat...' : 'Tiket')}</h2>
                        {ticket && (
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap font-medium">
                                <span className="inline-flex items-center gap-1 text-slate-700"><User size={12} className="text-slate-400" /> {ticket.guest_name || 'Tanpa nama'}</span>
                                {ticket.guest_email && <span className="inline-flex items-center gap-1"><Mail size={12} className="text-slate-400" /> {ticket.guest_email}</span>}
                                {ticket.guest_wa && (
                                    waLink ? (
                                        <a href={`https://wa.me/${waLink}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-emerald-600 hover:underline font-semibold">
                                            <Phone size={12} /> {ticket.guest_wa} <ExternalLink size={10} />
                                        </a>
                                    ) : (
                                        <span className="inline-flex items-center gap-1"><Phone size={12} className="text-slate-400" /> {ticket.guest_wa}</span>
                                    )
                                )}
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors shrink-0">
                        <X size={20} />
                    </button>
                </div>

                {/* Kontrol status & prioritas */}
                {ticket && (
                    <div className="px-5 py-2.5 border-b border-slate-100 bg-slate-50/30 flex flex-wrap items-center gap-3 shrink-0">
                        <label className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                            Status
                            <select
                                value={ticket.status}
                                disabled={updating}
                                onChange={(e) => handleUpdate({ status: e.target.value })}
                                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-500 cursor-pointer disabled:opacity-50"
                            >
                                {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </label>
                        <label className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                            Prioritas
                            <select
                                value={ticket.priority}
                                disabled={updating}
                                onChange={(e) => handleUpdate({ priority: e.target.value })}
                                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-500 cursor-pointer disabled:opacity-50"
                            >
                                {PRIORITY_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </label>
                        <span className="text-[11px] text-slate-400 ml-auto inline-flex items-center gap-1 font-medium">
                            <Calendar size={11} /> Aktivitas {formatDate(ticket.last_message_at)}
                        </span>
                    </div>
                )}

                {/* Body: thread + panel order */}
                <div className="flex-1 overflow-hidden grid lg:grid-cols-[1fr_280px]">
                    <div className="flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30">
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 size={26} className="animate-spin text-purple-600" />
                                </div>
                            ) : loadError ? (
                                <div className="text-center py-12 text-slate-500 text-sm font-medium">
                                    <AlertTriangle size={24} className="mx-auto mb-3 text-rose-500" />
                                    Gagal memuat tiket ini.
                                </div>
                            ) : ticket?.messages?.length ? (
                                ticket.messages.map((message) => {
                                    const isAdmin = message.author === 'admin';
                                    return (
                                        <div key={message.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                            <div className="max-w-[85%] flex flex-col gap-1">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-1 ${isAdmin ? 'text-right text-purple-700' : 'text-slate-500'}`}>
                                                    {isAdmin ? 'CS / Admin' : (ticket.guest_name || 'Pelanggan')}
                                                </span>
                                                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words shadow-xs ${
                                                    isAdmin
                                                        ? 'bg-purple-600 text-white rounded-br-sm'
                                                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                                                }`}>
                                                    {message.body}
                                                </div>
                                                <span className={`text-[10px] text-slate-400 px-1 font-medium ${isAdmin ? 'text-right' : ''}`}>
                                                    {formatDate(message.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-center text-sm text-slate-400 py-12">Belum ada pesan.</p>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Composer */}
                        <form onSubmit={handleReply} className="p-4 border-t border-slate-100 bg-white shrink-0">
                            <textarea
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleReply(e);
                                }}
                                maxLength={4000}
                                rows={3}
                                placeholder="Tulis balasan untuk pelanggan... (Ctrl+Enter untuk kirim)"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-500 resize-none transition-colors"
                            />
                            <div className="flex items-center justify-between mt-3">
                                <span className="text-[10px] text-slate-400 font-mono">{draft.length}/4000</span>
                                <button
                                    type="submit"
                                    disabled={sending || !draft.trim()}
                                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
                                >
                                    {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                    Kirim Balasan
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Panel order */}
                    <div className="hidden lg:block border-l border-slate-100 p-5 overflow-y-auto bg-slate-50/50">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">Pesanan Terkait</p>
                        {order ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Package size={14} className="text-purple-600" />
                                    <span className="text-xs font-mono font-bold text-purple-700">{order.id}</span>
                                </div>
                                <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1 shadow-xs">
                                    <p className="text-sm font-bold text-slate-900">{order.product}</p>
                                    {order.variant && <p className="text-xs text-slate-500">{order.variant}</p>}
                                    <p className="text-xs font-bold text-purple-700">Rp {Number(order.price || 0).toLocaleString('id-ID')}</p>
                                </div>
                                <div className="text-xs text-slate-600 space-y-1.5 font-medium">
                                    <p className="flex justify-between"><span className="text-slate-400">Status</span> <span className="text-slate-900 font-bold">{order.status}</span></p>
                                    {order.vendor_status && <p className="flex justify-between"><span className="text-slate-400">Vendor</span> <span>{order.vendor_status}</span></p>}
                                    {order.pg_provider && <p className="flex justify-between"><span className="text-slate-400">Pembayaran</span> <span>{order.pg_provider}</span></p>}
                                    <p className="flex justify-between"><span className="text-slate-400">Tanggal</span> <span>{formatDate(order.timestamp)}</span></p>
                                </div>
                                {order.error_message && (
                                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                                        <p className="text-[10px] text-rose-700 font-bold uppercase mb-1">Error</p>
                                        <p className="text-xs text-rose-800 break-words">{order.error_message}</p>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => { navigator.clipboard?.writeText(order.id); notifySuccess('ID pesanan disalin.'); }}
                                    className="w-full text-center text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 border border-purple-200 rounded-xl px-3 py-2 transition-colors shadow-xs"
                                >
                                    Salin ID Pesanan
                                </button>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 font-medium">Tiket ini tidak dikaitkan dengan pesanan.</p>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default TicketThreadModal;
