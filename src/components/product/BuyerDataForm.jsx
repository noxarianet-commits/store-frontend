import { useEffect, useRef } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatRp } from '../../utils/currencyUtils';
import { normalizePhoneNumber } from '../../utils/phoneUtils';

const BuyerDataForm = ({
    formData,
    handleFormChange,
    dynamicFields,
    fieldData,
    setFieldData,
    providerQty,
    setProviderQty,
    selectedVariant,
    handleValidateAccount,
    isValidating,
    validatedAccount,
    validationError,
    setValidatedAccount,
    setValidationError,
    vendor,
    product,
}) => {
    const isOkeconnect = vendor === 'okeconnect' || selectedVariant?.vendor === 'okeconnect';
    const isValidationAvailable = selectedVariant?.validation?.available || dynamicFields.some(f => f.key === 'customer_id') || isOkeconnect;
    const isEwalletProduct = product?.category?.toLowerCase().includes('wallet') ||
        /dana|ovo|gopay|gojek|shopee|linkaja|isaku|maxim/i.test(product?.name || '');
    const isNumericGame = /mobile legend|magic chess|free fire/i.test(product?.name || '');

    const prevTargetRef = useRef('');

    useEffect(() => {
        if (!isValidationAvailable) return;
        const customerId = fieldData['customer_id'] || fieldData['target'] || (dynamicFields.length === 1 ? fieldData[dynamicFields[0].key] : '');
        const zoneId = fieldData['zone_id'] || '';
        const currentTargetKey = `${customerId || ''}_${zoneId || ''}_${selectedVariant?.id || ''}`;
        if (currentTargetKey !== prevTargetRef.current) {
            prevTargetRef.current = currentTargetKey;
            if (validatedAccount && validatedAccount._lastTarget !== currentTargetKey) {
                if (typeof setValidatedAccount === 'function') setValidatedAccount(null);
            }
            if (validationError && typeof setValidationError === 'function') setValidationError(null);
        }
    }, [fieldData, selectedVariant?.id, isValidationAvailable]);

    const handleFieldBlur = (fieldKey, val) => {
        if (!val) return;
        const isTargetField = fieldKey === 'customer_id' || fieldKey === 'target' || fieldKey === 'note' || fieldKey === 'user_id';
        if (isEwalletProduct && isTargetField) {
            const normalized = normalizePhoneNumber(val);
            if (normalized && normalized !== val) setFieldData(prev => ({ ...prev, [fieldKey]: normalized }));
        }
    };

    return (
        <div>
            <h2 className="text-[14px] font-extrabold text-ink tracking-[-0.02em] mb-1">Informasi Pembeli</h2>
            <p className="text-xs text-slate-500 mb-5">Data ini dipakai untuk pengiriman & notifikasi pesanan.</p>

            <div className="space-y-4 mb-6">
                <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-[0.06em] mb-2">Nomor WhatsApp Aktif <span className="text-red-500">*</span></label>
                    <input
                        name="wa_number"
                        type="tel"
                        inputMode="numeric"
                        value={formData.wa_number}
                        onChange={handleFormChange}
                        placeholder="08xxxxxxxxxx"
                        className="w-full bg-white border border-slate-200 rounded-xl h-[48px] px-4 text-[14px] text-ink placeholder:text-slate-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-[0.06em] mb-2">Email <span className="text-red-500">*</span></label>
                    <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        placeholder="nama@gmail.com"
                        className="w-full bg-white border border-slate-200 rounded-xl h-[48px] px-4 text-[14px] text-ink placeholder:text-slate-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-colors"
                    />
                    <p className="text-[11px] text-slate-400 mt-1.5">Detail pesanan otomatis dikirim ke email ini.</p>
                </div>

                {dynamicFields.map((field, idx) => {
                    const cleanedLabel = field.label.replace(/[:*]/g, '').trim();
                    const isTargetField = field.key === 'customer_id' || field.key === 'target' || field.key === 'note' || field.key === 'user_id';
                    const isZoneField = field.key === 'zone_id';
                    const getPlaceholderText = () => {
                        const lowerLabel = cleanedLabel.toLowerCase();
                        if (lowerLabel.includes('nomor') || lowerLabel.includes('no ') || lowerLabel.includes('phone') || lowerLabel.includes('dana') || lowerLabel.includes('ovo') || lowerLabel.includes('gopay') || lowerLabel.includes('linkaja') || lowerLabel.includes('shopeepay')) {
                            const targetName = cleanedLabel.replace(/^[nN]omor\s+/i, '').replace(/^[nN]o\s+/i, '');
                            return `08xxxxxxxxxx (${targetName})`;
                        }
                        return `Masukkan ${cleanedLabel}`;
                    };
                    const isNumericOnly = (isEwalletProduct && isTargetField) || (isNumericGame && (isTargetField || isZoneField));

                    return (
                        <div key={`dyn-${idx}`}>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-[0.06em]">
                                    {cleanedLabel} {field.required && <span className="text-red-500">*</span>}
                                </label>
                                {field.key === 'customer_id' && isValidationAvailable && (
                                    <span className={`text-[11px] font-semibold flex items-center gap-1 ${validatedAccount?.valid ? 'text-emerald-600' : 'text-brand'}`}>
                                        {isValidating && <Loader2 size={11} className="animate-spin" />}
                                        {isValidating ? 'Mengecek...' : validatedAccount?.valid ? 'Terverifikasi' : 'Wajib cek ID'}
                                    </span>
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    type={field.key === 'provider_qty' ? 'number' : isNumericOnly ? 'tel' : 'text'}
                                    inputMode={isNumericOnly ? 'numeric' : undefined}
                                    value={field.key === 'provider_qty' ? providerQty : (fieldData[field.key] || '')}
                                    onChange={(e) => {
                                        let val = e.target.value;
                                        if (isEwalletProduct && isTargetField) val = val.replace(/[^0-9\s\-+]/g, '');
                                        else if (isNumericGame && (isTargetField || isZoneField)) val = val.replace(/[^0-9]/g, '');
                                        if (field.key === 'provider_qty') setProviderQty(val);
                                        else setFieldData({ ...fieldData, [field.key]: val });
                                    }}
                                    onBlur={(e) => handleFieldBlur(field.key, e.target.value)}
                                    placeholder={getPlaceholderText()}
                                    className={`w-full bg-white border rounded-xl h-[48px] px-4 text-[14px] text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                                        validatedAccount?.valid && (field.key === 'customer_id' || field.key === 'target')
                                            ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-500/10'
                                            : validationError && (field.key === 'customer_id' || field.key === 'target')
                                                ? 'border-red-300 focus:border-red-400 focus:ring-red-500/10'
                                                : 'border-slate-200 focus:border-brand focus:ring-brand/10'
                                    }`}
                                />
                                {isValidating && (field.key === 'customer_id' || field.key === 'target') && (
                                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                                        <Loader2 size={16} className="animate-spin text-brand" />
                                    </div>
                                )}
                            </div>
                            {field.key === 'provider_qty' && selectedVariant?.provider_meta && (
                                <p className="text-[11px] text-slate-500 mt-1.5">Min {formatRp(selectedVariant.provider_meta.min_qty)} • Maks {formatRp(selectedVariant.provider_meta.max_qty)}</p>
                            )}
                        </div>
                    );
                })}

                {isValidationAvailable && (
                    <div className="pt-1">
                        {isValidating ? (
                            <button type="button" disabled className="w-full bg-ink/80 text-white h-12 rounded-xl text-[13px] font-bold flex justify-center items-center gap-2 cursor-wait">
                                <Loader2 size={16} className="animate-spin" /> Mengecek akun...
                            </button>
                        ) : validatedAccount?.valid ? (
                            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-[0.06em]">Terverifikasi</p>
                                        <p className="text-[13px] font-bold text-emerald-900 truncate">{validatedAccount.account_name || validatedAccount.display_name || 'Valid'}</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => handleValidateAccount({ silent: false })} className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-white border border-emerald-200 hover:bg-emerald-50 px-3 py-1.5 rounded-full transition-colors shrink-0">
                                    Cek ulang
                                </button>
                            </div>
                        ) : validationError ? (
                            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
                                <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-bold text-red-700 uppercase tracking-[0.06em]">Validasi gagal</p>
                                    <p className="text-xs text-red-800 leading-relaxed font-medium mt-0.5">{validationError}</p>
                                </div>
                                <button type="button" onClick={() => handleValidateAccount({ silent: false })} className="text-xs font-bold text-red-700 bg-white border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-full shrink-0 transition-colors">
                                    Coba lagi
                                </button>
                            </div>
                        ) : (
                            <button type="button" onClick={() => handleValidateAccount({ silent: false })} className="w-full bg-brand hover:bg-brandDark text-white h-12 rounded-xl text-[13px] font-bold transition-colors flex justify-center items-center gap-2 shadow-sm">
                                <CheckCircle2 size={16} /> Cek ID / Validasi Akun
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BuyerDataForm;
