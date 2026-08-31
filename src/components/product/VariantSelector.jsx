import { formatRp } from '../../utils/currencyUtils';

const ORDER_PROCESS_CONFIG = {
    auto: { label: 'Instan', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
    h2h: { label: 'Instan', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
    manual: { label: 'Manual', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100' },
    smm: { label: 'SMM', color: 'text-sky-700', bg: 'bg-sky-50 border-sky-100' },
};

function isVariantOutOfStock(variant) {
    return variant.stock === 0 || variant.stock === null || variant.stock === undefined;
}

const VariantSelector = ({ variants, selectedVariant, setSelectedVariant, showAllVariants, setShowAllVariants }) => {
    if (!variants || variants.length === 0) return null;

    const variantsToDisplay = showAllVariants ? variants : variants.slice(0, 10);
    const shouldTruncate = variants.length > 10 && !showAllVariants;

    return (
        <div className="mb-6">
            <div className="relative">
                <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${shouldTruncate ? 'max-h-[380px] overflow-y-auto no-scrollbar pr-1' : ''}`}>
                    {variantsToDisplay.map((variant) => {
                        const isSelected = selectedVariant?.id === variant.id;
                        const outOfStock = isVariantOutOfStock(variant);
                        const processConfig = ORDER_PROCESS_CONFIG[variant.order_process?.toLowerCase()];
                        
                        return (
                            <button
                                key={variant.id}
                                onClick={() => {
                                    if (!outOfStock) setSelectedVariant(variant);
                                }}
                                disabled={outOfStock}
                                className={`flex flex-col justify-between p-3.5 rounded-xl border text-left relative transition-all duration-200 min-h-[88px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 ${
                                    outOfStock
                                        ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                                        : isSelected
                                            ? 'border-brand bg-brandSoft shadow-soft'
                                            : 'border-slate-200 bg-white hover:border-brandBorder hover:bg-brandSoft/40 hover:shadow-soft'
                                }`}
                            >
                                <div className="flex flex-col gap-1 w-full">
                                    <span className={`text-[12px] font-bold leading-snug line-clamp-2 ${outOfStock ? 'text-slate-400 line-through' : isSelected ? 'text-brand' : 'text-ink'}`}>
                                        {variant.name}
                                    </span>
                                    <span className={`text-[12px] font-extrabold ${outOfStock ? 'text-slate-400' : isSelected ? 'text-brand' : 'text-ink'}`}>
                                        {(variant.sell_price || variant.price) > 0 ? formatRp(variant.sell_price || variant.price) : 'Chat'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mt-2.5 w-full">
                                    {outOfStock ? (
                                        <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-full">Habis</span>
                                    ) : (
                                        processConfig && (
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${processConfig.bg} ${processConfig.color} inline-block`}>
                                                {processConfig.label}
                                            </span>
                                        )
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
                {shouldTruncate && (
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white via-white/85 to-transparent pointer-events-none" />
                )}
            </div>

            {variants.length > 10 && (
                <button
                    onClick={() => setShowAllVariants(!showAllVariants)}
                    className="w-full h-11 mt-4 flex items-center justify-center gap-2 text-[13px] font-semibold text-ink hover:text-brand hover:bg-brandSoft rounded-xl transition-colors border border-dashed border-slate-300 hover:border-brandBorder bg-white"
                >
                    {showAllVariants ? 'Sembunyikan' : `Lihat semua varian (${variants.length})`}
                </button>
            )}
        </div>
    );
};

export default VariantSelector;
