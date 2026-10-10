import { Headset } from 'lucide-react';

const formatTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

/**
 * Bubble percakapan tiket. Pesan pelanggan di kanan (ungu), balasan CS di kiri.
 * Dipakai di halaman detail tiket; dashboard admin punya bubble versi gelap.
 */
const TicketThread = ({ messages = [] }) => (
    <div className="space-y-4">
        {messages.map((message) => {
            const isUser = message.author === 'user';
            return (
                <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                        {!isUser && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 px-1">
                                <Headset size={12} /> CS NoxariaNet
                            </span>
                        )}
                        <div
                            className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm ${
                                isUser
                                    ? 'bg-purple-600 text-white rounded-br-sm'
                                    : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'
                            }`}
                        >
                            {message.body}
                        </div>
                        <span className="text-[11px] text-slate-400 px-1">{formatTime(message.created_at)}</span>
                    </div>
                </div>
            );
        })}
    </div>
);

export default TicketThread;
