import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Send, RotateCcw, Package, LifeBuoy, SearchX } from 'lucide-react';
import api from '../api';
import StatusBadge, { PriorityBadge } from '../components/ticket/StatusBadge';
import { CATEGORY_LABELS } from '../utils/ticketConfig';
import TicketThread from '../components/ticket/TicketThread';
import { getTicketAccessToken } from '../utils/ticketToken';
import { notifyError, notifySuccess } from '../utils/notify';
import { formatRp } from '../utils/currencyUtils';

const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const TicketDetailPage = () => {
    const { ticketNumber } = useParams();
    const navigate = useNavigate();

    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [draft, setDraft] = useState('');
    const [sending, setSending] = useState(false);
    const [reopening, setReopening] = useState(false);
    const bottomRef = useRef(null);

    const appendMessage = useCallback((message) => {
        if (!message || !message.id) return;
        setTicket((prev) => {
            if (!prev) return prev;
            if (prev.messages.some((m) => m.id === message.id)) return prev;
            return { ...prev, messages: [...prev.messages, message] };
        });
    }, []);

    // Muat detail tiket sekali.
    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setNotFound(false);
            try {
                const res = await api.getTicket(ticketNumber);
                if (!cancelled) setTicket(res.data?.data || null);
            } catch (err) {
                if (!cancelled) {
                    setNotFound(true);
                    if (err.response?.status && err.response.status >= 500) {
                        notifyError('Gagal memuat tiket. Coba lagi sebentar lagi.');
                    }
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => { cancelled = true; };
    }, [ticketNumber]);

    // SSE — pesan baru & perubahan status masuk realtime.
    // EventSource tidak bisa kirim header, jadi token/JWT lewat query string.
    useEffect(() => {
        if (!ticketNumber) return undefined;

        const base = String(api.defaults.baseURL || '').replace(/\/$/, '');
        const params = new URLSearchParams();
        const token = getTicketAccessToken(ticketNumber);
        const jwt = localStorage.getItem('userToken');
        if (token) params.set('token', token);
        else if (jwt) params.set('jwt', jwt);

        const query = params.toString();
        const source = new EventSource(`${base}/tickets/${encodeURIComponent(ticketNumber)}/stream${query ? `?${query}` : ''}`);

        const handlePayload = (event) => {
            try {
                const payload = JSON.parse(event.data);
                if (payload.message) appendMessage(payload.message);
                if (payload.ticket) {
                    setTicket((prev) => (prev ? { ...prev, ...payload.ticket, messages: prev.messages } : prev));
                }
            } catch {
                // Payload rusak — abaikan, koneksi tetap hidup.
            }
        };

        source.addEventListener('message', handlePayload);
        source.addEventListener('status', handlePayload);
        source.addEventListener('created', handlePayload);
        // EventSource reconnect otomatis; onerror cukup didiamkan.

        return () => source.close();
    }, [ticketNumber, appendMessage]);

    // Scroll ke pesan terbaru.
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [ticket?.messages?.length]);

    const handleSend = async (event) => {
        event.preventDefault();
        const body = draft.trim();
        if (!body || sending) return;

        setSending(true);
        try {
            const res = await api.addTicketMessage(ticketNumber, body);
            const message = res.data?.data?.message;
            if (message) appendMessage(message);
            setDraft('');
        } catch (err) {
            notifyError(err.response?.data?.error || 'Gagal mengirim pesan.');
        } finally {
            setSending(false);
        }
    };

    const handleReopen = async () => {
        setReopening(true);
        try {
            const res = await api.reopenTicket(ticketNumber);
            const updated = res.data?.data;
            setTicket((prev) => (prev ? { ...prev, ...(updated || {}), status: updated?.status || 'open', messages: prev.messages } : prev));
            notifySuccess('Tiket dibuka kembali.');
        } catch (err) {
            notifyError(err.response?.data?.error || 'Gagal membuka kembali tiket.');
        } finally {
            setReopening(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (notFound || !ticket) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                        <SearchX className="text-slate-400" size={30} />
                    </div>
                    <h1 className="text-xl font-bold text-slate-800 mb-2">Tiket tidak ditemukan</h1>
                    <p className="text-sm text-slate-500 mb-6">
                        Tiket ini tidak ada, atau aksesnya sudah tidak berlaku di browser ini.
                        Buat tiket baru bila masih butuh bantuan.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button onClick={() => navigate('/ticket/new')} className="btn-primary text-sm">
                            Buat Tiket Baru
                        </button>
                        <button onClick={() => navigate('/ticket')} className="btn-secondary text-sm">
                            Daftar Tiket
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const isClosed = ticket.status === 'closed';

    return (
        <div className="min-h-screen text-slate-800 p-6 md:p-12 font-sans">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate('/ticket')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-purple-600 transition-all mb-8 text-sm font-medium shadow-sm"
                >
                    <ArrowLeft size={16} /> Daftar Tiket
                </button>

                {/* Header tiket */}
                <div className="bg-white border border-purple-100 rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold text-slate-400">
                            <LifeBuoy size={12} /> {ticket.ticket_number}
                        </span>
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{ticket.subject}</h1>
                    <p className="text-xs text-slate-400 mt-2">
                        Kategori: {CATEGORY_LABELS[ticket.category] || 'Umum'} · Dibuat {formatDate(ticket.created_at)}
                    </p>

                    {ticket.order && (
                        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm">
                            <span className="inline-flex items-center gap-2 font-semibold text-slate-700">
                                <Package size={15} className="text-purple-500" /> {ticket.order.id}
                            </span>
                            <span className="text-slate-600">{ticket.order.product}{ticket.order.variant ? ` — ${ticket.order.variant}` : ''}</span>
                            <span className="font-semibold text-slate-700">{formatRp(ticket.order.price)}</span>
                            <span className="text-xs text-slate-400">Status pesanan: {ticket.order.status}</span>
                            <Link
                                to={`/checkout/success?order_id=${encodeURIComponent(ticket.order.id)}`}
                                className="text-xs font-semibold text-purple-600 hover:underline"
                            >
                                Lihat pesanan →
                            </Link>
                        </div>
                    )}
                </div>

                {/* Thread */}
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6 mb-6">
                    {ticket.messages?.length ? (
                        <TicketThread messages={ticket.messages} />
                    ) : (
                        <p className="text-center text-sm text-slate-400 py-8">Belum ada pesan.</p>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Composer */}
                {isClosed ? (
                    <div className="bg-slate-100 border border-slate-200 rounded-3xl p-6 text-center">
                        <p className="text-sm text-slate-600 mb-4">
                            Tiket ini sudah ditutup. Buka kembali bila masih butuh bantuan.
                        </p>
                        <button onClick={handleReopen} disabled={reopening} className="btn-primary text-sm mx-auto disabled:opacity-60">
                            {reopening ? <Loader2 size={18} className="animate-spin" /> : <RotateCcw size={18} />}
                            Buka Kembali
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSend} className="bg-white border border-purple-100 rounded-3xl p-4 sm:p-5 shadow-sm">
                        <textarea
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSend(e);
                            }}
                            maxLength={4000}
                            rows={3}
                            placeholder="Tulis balasan Anda... (Ctrl+Enter untuk kirim)"
                            className="input-field resize-none"
                        />
                        <div className="flex items-center justify-between mt-3">
                            <span className="text-[11px] text-slate-400">{draft.length}/4000</span>
                            <button
                                type="submit"
                                disabled={sending || !draft.trim()}
                                className="btn-primary text-sm px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                Kirim
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default TicketDetailPage;
