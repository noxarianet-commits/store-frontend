import { Server, Check } from 'lucide-react';

const ServerSelector = ({ servers = [], activeVendor, onSelectServer }) => {
    if (!servers || servers.length <= 1) return null;
    return (
        <div className="mb-6 border-b border-[var(--line)] pb-5">
            <div className="mb-3 flex items-center gap-2 text-[var(--ink)]"><Server size={16} className="text-[var(--coral)]" /><h2 className="text-sm font-extrabold">Pilih server</h2></div>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[.08em] text-[var(--muted)]">Ketersediaan dan harga dapat berbeda</p>
            <div className="grid grid-cols-2 gap-2">
                {servers.map((server, idx) => {
                    const isSelected = activeVendor === server.vendor;
                    return <button key={server.vendor} type="button" onClick={() => onSelectServer(server.vendor)} className={`flex items-center justify-between border px-3 py-3 text-left text-xs font-bold transition-all ${isSelected ? 'border-[var(--coral)] bg-[#fff7f1] text-[var(--coral-dark)]' : 'border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--line-strong)]'}`}><span>Server {idx + 1}<small className="mt-1 block font-mono text-[9px] font-normal uppercase tracking-[.06em]">{server.vendor}</small></span>{isSelected && <Check size={15} />}</button>;
                })}
            </div>
        </div>
    );
};

export default ServerSelector;
