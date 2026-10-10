import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, LifeBuoy, Plus, Loader2, MessageSquare, ChevronRight } from 'lucide-react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge, { PriorityBadge } from '../components/ticket/StatusBadge';
import { CATEGORY_LABELS } from '../utils/ticketConfig';
import { listGuestTickets } from '../utils/ticketToken';

const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const TicketListPage = () => {
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    // Tiket tamu dibaca sekali dari localStorage saat mount.
    const [guestTickets] = useState(() => listGuestTickets());

    useEffect(() => {
        if (authLoading || !user) return;

        let cancelled = false;
        const fetchTickets = async () => {
            setLoading(true);
            try {
                const res = await api.getMyTickets({ limit: 50 });
                if (!cancelled) setTickets(res.data?.data || []);
            } catch {
                // Interceptor sudah menangani redirect; cukup tampilkan daftar kosong.
                if (!cancelled) setTickets([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchTickets();
        return () => { cancelled = true; };
    }, [user, authLoading]);

    // Tiket tamu yang dibuat sebelum login tetap bisa dibuka dari browser ini.
    const serverNumbers = new Set(tickets.map((t) => t.ticket_number));
    const localOnly = guestTickets.filter((t) => !serverNumbers.has(t.ticket_number));

    const renderServerTicket = (ticket) => (
        <button
            key={ticket.ticket_number}
            onClick={() => navigate(`/ticket/${ticket.ticket_number}`)}
            className="w-full text-left bg-white border border-slate-200 hover:border-purple-300 hover:shadow-md rounded-2xl p-5 transition-all group"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-mono font-semibold text-slate-400">{ticket.ticket_number}</span>
                        <StatusBadge status={ticket.status} />
                        {(ticket.priority === 'high' || ticket.priority === 'urgent') && (
                            <PriorityBadge priority={ticket.priority} />
                        )}
                    </div>
                    <p className="font-semibold text-slate-800 truncate">{ticket.subject}</p>
                    <p className="text-xs text-slate-400 mt-1">
                        {CATEGORY_LABELS[ticket.category] || 'Umum'} · Aktivitas terakhir {formatDate(ticket.last_message_at)}
                    </p>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-purple-500 shrink-0 mt-1 transition-colors" />
            </div>
        </button>
    );

    const renderGuestTicket = (ticket) => (
        <button
            key={ticket.ticket_number}
            onClick={() => navigate(`/ticket/${ticket.ticket_number}`)}
            className="w-full text-left bg-white border border-dashed border-slate-300 hover:border-purple-300 hover:shadow-md rounded-2xl p-5 transition-all group"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <span className="text-[11px] font-mono font-semibold text-slate-400">{ticket.ticket_number}</span>
                    <p className="font-semibold text-slate-800 truncate mt-1">{ticket.subject || 'Tiket bantuan'}</p>
                    <p className="text-xs text-slate-400 mt-1">Dibuat {formatDate(ticket.created_at)}</p>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-purple-500 shrink-0 mt-1 transition-colors" />
            </div>
        </button>
    );

    return (
        <div className="min-h-screen text-slate-800 p-6 md:p-12 font-sans">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-purple-600 transition-all mb-8 text-sm font-medium shadow-sm"
                >
                    <ArrowLeft size={16} /> Kembali
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                <LifeBuoy className="text-purple-600" size={22} />
                            </div>
                            <h1 className="text-3xl font-extrabold text-slate-900">Bantuan CS</h1>
                        </div>
                        <p className="text-sm text-slate-500 ml-[52px]">
                            {user ? 'Daftar tiket yang pernah Anda buat.' : 'Buat tiket untuk menghubungi tim CS.'}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/ticket/new')}
                        className="btn-primary text-sm whitespace-nowrap"
                    >
                        <Plus size={18} /> Buat Tiket Baru
                    </button>
                </div>

                {authLoading || loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tickets.map(renderServerTicket)}

                        {localOnly.length > 0 && (
                            <div className="pt-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                                    Tiket tamu di browser ini
                                </p>
                                <div className="space-y-3">
                                    {localOnly.map(renderGuestTicket)}
                                </div>
                            </div>
                        )}

                        {tickets.length === 0 && localOnly.length === 0 && (
                            <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl">
                                <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                                    <MessageSquare className="text-slate-400" size={26} />
                                </div>
                                <p className="font-semibold text-slate-700 mb-1">Belum ada tiket</p>
                                <p className="text-sm text-slate-400 mb-6">
                                    {user ? 'Semua tiket Anda akan muncul di sini.' : 'Tiket yang Anda buat akan tersimpan di browser ini.'}
                                </p>
                                <button onClick={() => navigate('/ticket/new')} className="btn-primary text-sm mx-auto">
                                    <Plus size={18} /> Buat Tiket Pertama
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <p className="text-center text-xs text-slate-400 mt-8">
                    Untuk respons cepat, Anda juga bisa{' '}
                    <Link to="/faq" className="text-purple-600 hover:underline">membaca FAQ</Link>{' '}
                    atau chat CS via WhatsApp dari halaman utama.
                </p>
            </div>
        </div>
    );
};

export default TicketListPage;
