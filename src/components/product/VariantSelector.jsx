import React from 'react';
import { formatRp } from '../../utils/currencyUtils';

const ORDER_PROCESS_CONFIG = {
    auto: { label: 'Instan', color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
    h2h: { label: 'Instan', color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
    manual: { label: 'Manual', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-100' },
    smm: { label: 'SMM', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
};

function isVariantOutOfStock(variant) {
    return variant.stock === 0 || variant.stock === null || variant.stock === undefined;
}

const VariantSelector = ({ variants, selectedVariant, setSelectedVariant, showAllVariants, setShowAllVariants }) => {
    if (!variants || variants.length === 0) return null;

    const variantsToDisplay = showAllVariants ? variants : variants.slice(0, 10);

    return (
        <div>
            <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 ${!showAllVariants ? 'max-h-[360px] overflow-hidden relative' : ''}`}>
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
                            className={`flex flex-col p-3.5 rounded-xl border-2 transition-all duration-300 text-left relative overflow-hidden group ${
                                outOfStock
                                    ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                                    : isSelected
                                        ? 'border-purple-500 bg-purple-50 shadow-sm shadow-purple-100'
                                        : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/30'
                            }`}
                        >
                            <span className={`text-xs font-bold leading-snug mb-1 ${outOfStock ? 'text-slate-400 line-through' : isSelected ? 'text-purple-700' : 'text-slate-700'}`}>
                                {variant.name}
                            </span>
                            <span className={`text-xs font-extrabold ${outOfStock ? 'text-slate-400' : isSelected ? 'text-purple-600' : 'text-slate-600'}`}>
                                {(variant.sell_price || variant.price) > 0 ? formatRp(variant.sell_price || variant.price) : 'Chat'}
                            </span>
                            {outOfStock && <span className="text-[9px] text-red-500 font-semibold mt-0.5">Habis</span>}
                            {processConfig && !outOfStock && (
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border mt-1 ${processConfig.bg} ${processConfig.color} inline-block w-max`}>
                                    {processConfig.label}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {variants.length > 10 && (
                <button
                    onClick={() => setShowAllVariants(!showAllVariants)}
                    className="w-full py-3 mb-6 mt-3 flex items-center justify-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-colors border border-purple-200"
                >
                    {showAllVariants ? 'Sembunyikan' : `Lihat Semua Varian (${variants.length})`}
                </button>
            )}
        </div>
    );
};

export default VariantSelector;
