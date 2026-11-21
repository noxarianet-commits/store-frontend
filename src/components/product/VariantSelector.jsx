import { Check, FileText } from 'lucide-react';
import { formatRp } from '../../utils/currencyUtils';

function isVariantOutOfStock(variant) {
    return variant.stock === 0 || variant.stock === null || variant.stock === undefined;
}

const VariantSelector = ({ variants, selectedVariant, setSelectedVariant, showAllVariants, setShowAllVariants }) => {
    if (!variants || variants.length === 0) return null;

    const variantsToDisplay = showAllVariants ? variants : variants.slice(0, 10);
    const shouldTruncate = variants.length > 10 && !showAllVariants;

    return (
        <div className="mb-4">
            <div className="relative">
                <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 p-0.5 ${shouldTruncate ? 'max-h-[340px] overflow-y-auto no-scrollbar' : ''}`}>
                    {variantsToDisplay.map((variant) => {
                        const isSelected = selectedVariant?.id === variant.id;
                        const outOfStock = isVariantOutOfStock(variant);
                        const isManual = variant.order_process?.toLowerCase() === 'manual';
                        const price = variant.sell_price || variant.price;

                        return (
                            <button
                                key={variant.id}
                                type="button"
                                onClick={() => {
                                    if (!outOfStock) setSelectedVariant(variant);
                                }}
                                disabled={outOfStock}
                                className={`p-2.5 sm:p-3 rounded-xl border-2 transition-all duration-150 text-left relative cursor-pointer flex flex-col justify-between min-h-[64px] sm:min-h-[68px] ${
                                    outOfStock
                                        ? 'border-slate-100 bg-slate-50/60 opacity-50 cursor-not-allowed'
                                        : isSelected
                                            ? 'border-purple-600 bg-purple-50/70 shadow-xs ring-1 ring-purple-600/30'
                                            : 'border-slate-200/90 bg-white hover:border-purple-300 hover:bg-slate-50/40'
                                }`}
                            >
                                {/* Baris 1: Nama Paket & Centang saat terpilih */}
                                <div className="flex items-start justify-between gap-1.5 w-full">
                                    <span className={`text-xs sm:text-[13px] font-bold leading-tight line-clamp-2 ${
                                        outOfStock
                                            ? 'text-slate-400 line-through'
                                            : isSelected
                                                ? 'text-purple-950 font-extrabold'
                                                : 'text-slate-800'
                                    }`}>
                                        {variant.name}
                                    </span>

                                    {/* Centang hanya muncul jika kartu terpilih */}
                                    {isSelected && (
                                        <div className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                                            <Check size={10} strokeWidth={3} />
                                        </div>
                                    )}
                                </div>

                                {/* Baris 2: Harga & Badge Status (Kompak & Simpel) */}
                                <div className="mt-1.5 flex items-baseline justify-between gap-1 w-full">
                                    <span className={`text-xs sm:text-sm font-extrabold font-mono tracking-tight ${
                                        outOfStock
                                            ? 'text-slate-400 line-through'
                                            : isSelected
                                                ? 'text-purple-700'
                                                : 'text-slate-900'
                                    }`}>
                                        {price > 0 ? formatRp(price) : 'Hubungi Admin'}
                                    </span>

                                    <div className="flex items-center gap-1">
                                        {outOfStock && (
                                            <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 leading-none">
                                                Habis
                                            </span>
                                        )}
                                        {isManual && !outOfStock && (
                                            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 leading-none">
                                                Manual
                                            </span>
                                        )}
                                        {variant.note && !outOfStock && (
                                            <span className="text-[8.5px] font-semibold text-purple-700 bg-purple-100/70 px-1 py-0.5 rounded border border-purple-200/60 inline-flex items-center gap-0.5 leading-none" title="Ada catatan paket">
                                                <FileText size={8.5} className="text-purple-600" />
                                                <span>Catatan</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
                {shouldTruncate && (
                    <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-10" />
                )}
            </div>

            {variants.length > 10 && (
                <button
                    type="button"
                    onClick={() => setShowAllVariants(!showAllVariants)}
                    className="w-full py-2.5 mt-2 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-colors border border-purple-200/80 cursor-pointer"
                >
                    {showAllVariants ? 'Sembunyikan Sebagian' : `Lihat Semua Pilihan Paket (${variants.length})`}
                </button>
            )}
        </div>
    );
};

export default VariantSelector;
