
import { Calendar, User, Mail, Edit, Trash2, ExternalLink } from 'lucide-react';

const OrdersTab = ({ orders, loading, openOrderModal, deleteOrder }) => {
    if (loading) {
        return (
            <div className="py-20 flex justify-center">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-10 text-center text-gray-500">
                Belum ada pesanan masuk.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {orders.map(order => (
                <div key={order.id} className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-1 rounded">{order.id}</span>
                                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                    <Calendar size={12} /> {new Date(order.timestamp).toLocaleString('id-ID')}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">{order.product}</h3>
                                <p className="text-sm text-gray-400">{order.variant} • Rp {order.price?.toLocaleString('id-ID')}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center"><User size={14} /></div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase">WhatsApp</p>
                                        <p>{order.wa_number}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center"><Mail size={14} /></div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase">Email</p>
                                        <p>{order.email}</p>
                                    </div>
                                </div>
                            </div>
                            {order.testimonial && order.testimonial !== '-' && (
                                <div className="bg-white/3 p-3 rounded-xl border border-white/5 italic text-sm text-gray-400">
                                    "{order.testimonial}"
                                </div>
                            )}
                        </div>
                        <div className="w-full md:w-48 flex flex-col gap-3">
                            {order.proof_image ? (
                                <a href={order.proof_image} target="_blank" rel="noreferrer" className="relative block aspect-[3/4] rounded-xl overflow-hidden border border-white/10 group/img shadow-lg shadow-black/40">
                                    <img src={order.proof_image} className="w-full h-full object-cover transition-transform group-hover/img:scale-110" alt="Bukti Transfer" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all">
                                        <ExternalLink className="text-white" size={20} />
                                    </div>
                                </a>
                            ) : (
                                <div className="aspect-[3/4] rounded-xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center text-[10px] text-gray-500">Tanpa Bukti</div>
                            )}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openOrderModal(order)}
                                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all text-xs font-bold flex items-center justify-center gap-2"
                                >
                                    <Edit size={14} /> Edit
                                </button>
                                <button
                                    onClick={() => deleteOrder(order.id)}
                                    className="flex-1 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all text-xs font-bold flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={14} /> Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default OrdersTab;
