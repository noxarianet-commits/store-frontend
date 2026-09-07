import { Check, CircleAlert } from 'lucide-react';
import { formatRp } from '../../utils/currencyUtils';

const ORDER_PROCESS_CONFIG = {
    auto: { label: 'Instan', color: 'text-[var(--teal)]', bg: 'bg-[var(--teal-soft)]' },
    h2h: { label: 'Instan', color: 'text-[var(--teal)]', bg: 'bg-[var(--teal-soft)]' },
    manual: { label: 'Manual', color: 'text-[var(--gold)]', bg: 'bg-[#f7eedb]' },
    smm: { label: 'SMM', color: 'text-[var(--coral-dark)]', bg: 'bg-[#fae7df]' },
};

const isVariantOutOfStock = (variant) => variant.stock === 0 || variant.stock === null || variant.stock === undefined;

const VariantSelector = ({ variants, selectedVariant, setSelectedVariant, showAllVariants, setShowAllVariants }) => {
    if (!variants?.length) return null;
    const variantsToDisplay = showAllVariants ? variants : variants.slice(0, 10);
    const shouldTruncate = variants.length > 10 && !showAllVariants;

    return (
        <div className="mb-6">
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 ${shouldTruncate ? 'max-h-[380px] overflow-y-auto pr-1' : ''}`}>
                {variantsToDisplay.map((variant) => {
                    const isSelected = selectedVariant?.id === variant.id;
                    const outOfStock = isVariantOutOfStock(variant);
                    const processConfig = ORDER_PROCESS_CONFIG[variant.order_process?.toLowerCase()];
                    return (
                        <button key={variant.id} type="button" onClick={() => !outOfStock && setSelectedVariant(variant)} disabled={outOfStock} className={`flex min-h-[82px] items-center justify-between gap-3 p-3 text-left transition-all ${outOfStock ? 'border border-[var(--line)] bg-[#eeeae2] opacity-60 cursor-not-allowed' : isSelected ? 'border-2 border-[var(--coral)] bg-[#fff7f1]' : 'border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-strong)]'}`}>
                            <span className="min-w-0">
                                <span className={`block text-xs font-bold leading-snug ${outOfStock ? 'text-[var(--muted)] line-through' : 'text-[var(--ink)]'}`}>{variant.name}</span>
                                {processConfig && <span className={`mt-2 inline-block px-1.5 py-0.5 font-mono text-[9px] uppercase ${processConfig.bg} ${processConfig.color}`}>{processConfig.label}</span>}
                            </span>
                            <span className="shrink-0 text-right">
                                <span className={`block font-mono text-xs font-medium ${outOfStock ? 'text-[var(--muted)]' : 'text-[var(--teal)]'}`}>{(variant.sell_price || variant.price) > 0 ? formatRp(variant.sell_price || variant.price) : 'Chat'}</span>
                                {outOfStock ? <CircleAlert size={14} className="ml-auto mt-2 text-[var(--danger)]" /> : isSelected ? <Check size={15} className="ml-auto mt-2 text-[var(--coral)]" /> : null}
                            </span>
                        </button>
                    );
                })}
            </div>
            {variants.length > 10 && <button type="button" onClick={() => setShowAllVariants(!showAllVariants)} className="mt-3 w-full border-b border-[var(--line-strong)] py-2 text-left font-mono text-[10px] uppercase tracking-[.08em] text-[var(--coral-dark)]">{showAllVariants ? 'Sembunyikan varian' : `Lihat semua varian (${variants.length})`}</button>}
        </div>
    );
};

export default VariantSelector;
