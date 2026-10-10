import { useRef, useState, useEffect } from 'react';
import { Send, Loader2, Paperclip } from 'lucide-react';
import { CATEGORY_LABELS } from '../../utils/ticketConfig';
import { notifyWarning } from '../../utils/notify';

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS);

/**
 * Form buat tiket. Presentasional: API call + navigasi ditangani parent.
 * @param {object} props
 * @param {object|null} props.user — user login (dari useAuth) atau null untuk tamu
 * @param {string} props.defaultOrderId — order yang mau dikaitkan (opsional)
 * @param {string} props.defaultSubject — subjek terisi otomatis (opsional)
 * @param {boolean} props.submitting
 * @param {(payload: object) => void} props.onSubmit
 */
const TicketForm = ({ user, defaultOrderId = '', defaultSubject = '', submitting = false, onSubmit }) => {
    // Diisi saat mount (bukan saat render — Date.now() tidak boleh dipanggil
    // selama render). Dipakai backend menolak submit instan dari bot.
    const openedAtRef = useRef(0);
    useEffect(() => {
        openedAtRef.current = Date.now();
    }, []);

    const [form, setForm] = useState({
        guest_name: '',
        guest_email: '',
        guest_wa: '',
        category: 'umum',
        subject: defaultSubject,
        body: '',
    });

    const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!user && !form.guest_name.trim()) {
            return notifyWarning('Nama wajib diisi!');
        }
        if (!user && !form.guest_email.trim() && !form.guest_wa.trim()) {
            return notifyWarning('Isi minimal email atau nomor WhatsApp.');
        }
        if (!form.subject.trim()) {
            return notifyWarning('Subjek wajib diisi!');
        }
        if (!form.body.trim()) {
            return notifyWarning('Ceritakan kendala Anda terlebih dahulu.');
        }

        onSubmit({
            guest_name: form.guest_name.trim(),
            guest_email: form.guest_email.trim(),
            guest_wa: form.guest_wa.trim(),
            category: form.category,
            subject: form.subject.trim(),
            body: form.body.trim(),
            order_id: defaultOrderId || undefined,
            website: form.website || undefined,
            elapsed_ms: openedAtRef.current ? Date.now() - openedAtRef.current : undefined,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {defaultOrderId && (
                <div className="flex items-center gap-2 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-100 rounded-xl px-4 py-3">
                    <Paperclip size={14} />
                    Tiket akan dikaitkan dengan pesanan <span className="font-bold">{defaultOrderId}</span>
                </div>
            )}

            {!user && (
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama</label>
                        <input
                            type="text"
                            value={form.guest_name}
                            onChange={(e) => setField('guest_name', e.target.value)}
                            maxLength={100}
                            placeholder="Nama Anda"
                            className="input-field"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                        <input
                            type="email"
                            value={form.guest_email}
                            onChange={(e) => setField('guest_email', e.target.value)}
                            placeholder="nama@email.com"
                            className="input-field"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nomor WhatsApp</label>
                        <input
                            type="tel"
                            value={form.guest_wa}
                            onChange={(e) => setField('guest_wa', e.target.value)}
                            placeholder="08xxxxxxxxxx"
                            className="input-field"
                        />
                    </div>
                    <p className="sm:col-span-2 text-[11px] text-slate-400 -mt-2">
                        Isi minimal salah satu (email atau WhatsApp) agar CS dapat menghubungi Anda.
                    </p>
                </div>
            )}

            {user && (
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">
                        {user.display_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-sm">
                        <p className="font-semibold text-slate-800">{user.display_name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                </div>
            )}

            <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Kategori</label>
                <select
                    value={form.category}
                    onChange={(e) => setField('category', e.target.value)}
                    className="input-field"
                >
                    {CATEGORY_OPTIONS.map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Subjek</label>
                <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setField('subject', e.target.value)}
                    maxLength={200}
                    placeholder="Contoh: Pesanan belum diterima"
                    className="input-field"
                />
            </div>

            <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Detail Kendala</label>
                <textarea
                    value={form.body}
                    onChange={(e) => setField('body', e.target.value)}
                    maxLength={4000}
                    rows={6}
                    placeholder="Jelaskan kendala Anda sedetail mungkin (produk, waktu kejadian, ID pesanan bila ada)..."
                    className="input-field resize-none"
                />
                <p className="text-right text-[11px] text-slate-400 mt-1">{form.body.length}/4000</p>
            </div>

            {/* Honeypot — disembunyikan dari manusia, hanya diisi bot. */}
            <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                onChange={(e) => setField('website', e.target.value)}
                className="hidden"
            />

            <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {submitting ? 'Mengirim...' : 'Kirim Tiket'}
            </button>
        </form>
    );
};

export default TicketForm;
