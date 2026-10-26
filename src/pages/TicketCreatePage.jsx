import { useState } from 'react';
import { useNavigate, useSearchParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, LifeBuoy } from 'lucide-react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import TicketForm from '../components/ticket/TicketForm';
import { saveTicketAccess } from '../utils/ticketToken';
import { notifySuccess, notifyError } from '../utils/notify';

const TicketCreatePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const [submitting, setSubmitting] = useState(false);

    const orderId = searchParams.get('order') || location.state?.orderId || '';
    const presetSubject = searchParams.get('subject') || '';

    const handleSubmit = async (payload) => {
        setSubmitting(true);
        try {
            const res = await api.createTicket(payload);
            const ticket = res.data?.data;

            if (ticket?.ticket_number && ticket?.access_token) {
                saveTicketAccess(ticket.ticket_number, ticket.access_token, {
                    subject: ticket.subject,
                    createdAt: ticket.created_at,
                });
            }

            notifySuccess('Tiket berhasil dibuat!');
            navigate(`/ticket/${ticket.ticket_number}`, { replace: true });
        } catch (err) {
            notifyError(err.response?.data?.error || 'Gagal membuat tiket. Silakan coba lagi.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen text-slate-800 p-6 md:p-12 font-sans">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => navigate('/ticket')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-purple-600 transition-all mb-8 text-sm font-medium shadow-sm"
                >
                    <ArrowLeft size={16} /> Kembali
                </button>

                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <LifeBuoy className="text-purple-600" size={22} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900">Buat Tiket Bantuan</h1>
                </div>
                <p className="text-sm text-slate-500 mb-8 ml-[52px]">
                    Jelaskan kendala Anda. Tim CS akan membalas melalui halaman ini.
                </p>

                <div className="bg-white border border-purple-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                    <TicketForm
                        user={user}
                        defaultOrderId={orderId}
                        defaultSubject={presetSubject}
                        submitting={submitting}
                        onSubmit={handleSubmit}
                    />
                </div>

                <p className="text-center text-xs text-slate-400 mt-6">
                    Butuh respons lebih cepat?{' '}
                    <Link to="/faq" className="text-purple-600 hover:underline">Lihat FAQ</Link>{' '}
                    atau hubungi CS via WhatsApp dari tombol di halaman utama.
                </p>
            </div>
        </div>
    );
};

export default TicketCreatePage;
