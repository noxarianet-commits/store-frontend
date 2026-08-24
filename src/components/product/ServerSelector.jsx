import React from 'react';
import { Server, Check } from 'lucide-react';

/**
 * ServerSelector — Dynamic toggle between multi-vendor server options (e.g. Server 1 Sekalipay vs Server 2 OkeConnect).
 * Automatically hides if the product is only available on a single server.
 */
const ServerSelector = ({ servers = [], activeVendor, onSelectServer }) => {
    if (!servers || servers.length <= 1) return null;

    return (
        <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm mb-6 relative overflow-hidden group hover:border-purple-200 transition-colors">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-fuchsia-500" />
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <Server size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Pilih Server (Vendor)</h2>
                    <p className="text-xs text-slate-500">Pilih server untuk ketersediaan dan harga terbaik</p>
                </div>
            </div>

            <div className={`grid gap-3 ${servers.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
                {servers.map((server, idx) => {
                    const isSelected = activeVendor === server.vendor;
                    const serverLabel = `Server ${idx + 1}`;
                    const vendorLabel = server.vendor === 'sekalipay'
                        ? 'Sekalipay'
                        : server.vendor === 'okeconnect'
                            ? 'OkeConnect'
                            : server.vendor === 'fincloud'
                                ? 'Fincloud'
                                : server.vendor;

                    return (
                        <button
                            key={server.vendor}
                            type="button"
                            onClick={() => onSelectServer(server.vendor)}
                            className={`py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 border flex flex-col items-center justify-center gap-0.5 relative ${
                                isSelected
                                    ? 'bg-purple-50/80 text-purple-700 border-purple-300 shadow-sm ring-2 ring-purple-500/20'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                        >
                            <div className="flex items-center gap-1.5 font-bold">
                                {serverLabel}
                                {isSelected && <Check size={14} className="text-purple-600 shrink-0" />}
                            </div>
                            <span className="text-[10px] text-slate-400 font-normal">
                                Jalur {vendorLabel} ({server.variants?.length || 0} varian)
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ServerSelector;

