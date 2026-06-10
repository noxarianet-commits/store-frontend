import { useState } from 'react';
import { Calendar, User, Mail, Edit, Trash2, CreditCard, Search } from 'lucide-react';

const STATUS_CONFIG = {
    PENDING: { label: 'Menunggu', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-400' },
    PROCESSING: { label: 'Diproses', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30', dot: 'bg-blue-400' },
    COMPLETED: { label: 'Selesai', color: 'bg-green-500/15 text-green-400 border-green-500/30', dot: 'bg-green-400' },
    FAILED: { label: 'Gagal', color: 'bg-red-500/15 text-red-400 border-red-500/30', dot: 'bg-red-400' },
    CANCELLED: { label: 'Dibatalkan', color: 'bg-gray-500/15 text-gray-400 border-gray-500/30', dot: 'bg-gray-400' },
};

const OrdersTab = ({ orders = [], openOrderModal, deleteOrder }) => {
    const [searchId, setSearchId] = useState('');
    const [searchResult, setSearchResult] = useState(null);

    const handleSearch = () => {
        if (!searchId.trim()) {
            setSearchResult(null);
            return;
        }
        const q = searchId.trim().toLowerCase();
        const found = orders.filter(o => o?.id?.toLowerCase().includes(q));
        setSearchResult(found.length > 0 ? found : 'notfound');
    };

    const handleClearSearch = () => {
        setSearchId('');
        setSearchResult(null);
    };

    const displayOrders = searchResult === 'notfound' ? [] : (searchResult || orders);

    if (orders.length === 0) {
        return (
            <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-10 text-center text-gray-500">
                Belum ada pesanan masuk.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Cari ID Order..."
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSearch}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                        >
                            <Search size={14} /> Cari
                        </button>
                        {searchResult && (
                            <button
                                onClick={handleClearSearch}
                                className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>
                {searchResult === 'notfound' && (
                    <p className="text-red-400 text-xs mt-2">Order dengan ID "{searchId}" tidak ditemukan.</p>
                )}
                {searchResult && searchResult !== 'notfound' && (
                    <p className="text-purple-400 text-xs mt-2">Ditemukan {searchResult.length} order.</p>
                )}
            </div>

            {displayOrders.map(order => {
                const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                return (
                    <div key={order.id} className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-4 sm:p-6 hover:border-white/10 transition-all group">
                        <div className="flex flex-col lg:flex-row justify-between gap-4 lg:gap-6">
                            <div className="flex-1 space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-1 rounded">{order.id}</span>
                                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.color}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                                        {statusCfg.label}
                                    </span>
                                    <span className="text-[10px] text-gray-500 flex items-center gap-1 ml-auto sm:ml-0">
                                        <Calendar size={12} /> {new Date(order.timestamp).toLocaleString('id-ID')}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold text-white">{order.product}</h3>
                                    <p className="text-sm text-gray-400">{order.variant} • Rp {order.price?.toLocaleString('id-ID')}</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/5 rounded-lg flex items-center justify-center"><User size={14} /></div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase">WhatsApp</p>
                                            <p className="text-xs sm:text-sm">{order.wa_number}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/5 rounded-lg flex items-center justify-center"><Mail size={14} /></div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase">Email</p>
                                            <p className="text-xs sm:text-sm">{order.email}</p>
                                        </div>
                                    </div>
                                </div>
                                {order.payment_method && (
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/5 rounded-lg flex items-center justify-center"><CreditCard size={14} /></div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase">Pembayaran</p>
                                            <p className="text-xs sm:text-sm">{order.payment_method}</p>
                                        </div>
                                    </div>
                                )}
                                {order.testimonial && order.testimonial !== '-' && (
                                    <div className="bg-white/3 p-3 rounded-xl border border-white/5 italic text-sm text-gray-400">
                                        "{order.testimonial}"
                                    </div>
                                )}
                            </div>
                            <div className="w-full lg:w-48 flex flex-col gap-3">
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
                );
            })}
        </div>
    );
};

export default OrdersTab;
