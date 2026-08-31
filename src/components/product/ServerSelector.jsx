import { Server, Check } from 'lucide-react';

/**
 * ServerSelector — Dynamic toggle between multi-vendor server options (e.g. Server 1 Sekalipay vs Server 2 OkeConnect).
 * Automatically hides if the product is only available on a single server.
 */
const ServerSelector = ({ servers = [], activeVendor, onSelectServer }) => {
    if (!servers || servers.length <= 1) return null;

    return (
        <div className="bg-white border border-brandBorder rounded-2xl p-5 shadow-soft mb-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brandSoft border border-brandBorder flex items-center justify-center text-brand">
                    <Server size={18} />
                </div>
                <div>
                    <h2 className="text-[14px] font-extrabold text-ink tracking-[-0.02em]">Pilih Server</h2>
                    <p className="text-xs text-slate-500">Harga & stok bisa berbeda tiap server</p>
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
                            : server.vendor;

                    return (
                        <button
                            key={server.vendor}
                            type="button"
                            onClick={() => onSelectServer(server.vendor)}
                            className={`h-11 px-4 rounded-xl font-semibold text-[13px] transition-all duration-200 border flex items-center justify-center gap-1.5 ${
                                isSelected
                                    ? 'bg-brand text-white border-brand shadow-sm'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-ink'
                            }`}
                        >
                            {serverLabel}
                            {isSelected && <Check size={14} className="shrink-0" />}
                            <span className={`text-[11px] font-medium ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>• {vendorLabel}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ServerSelector;

