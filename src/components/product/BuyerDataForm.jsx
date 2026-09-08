import { useEffect, useRef } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatRp } from '../../utils/currencyUtils';
import { normalizePhoneNumber } from '../../utils/phoneUtils';
import { getTargetIdentifier, getSafeAccountName } from '../../utils/accountValidationUtils';

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
    const fieldsList = Array.isArray(dynamicFields) ? dynamicFields : [];
    const isOkeconnect = vendor === 'okeconnect' || selectedVariant?.vendor === 'okeconnect';
    const isValidationAvailable = selectedVariant?.validation?.available ||
        fieldsList.some(f => f.key === 'customer_id' || f.key === 'user_id' || f.key === 'target' || f.key === 'note') ||
        isOkeconnect;
    const isEwalletProduct = product?.category?.toLowerCase().includes('wallet') ||
        /dana|ovo|gopay|gojek|shopee|linkaja|isaku|maxim/i.test(product?.name || '');
    const isNumericGame = /mobile legend|magic chess|free fire/i.test(product?.name || '');

    // ── Invalidate previous validation when User ID / Zone ID is edited ──
    const prevTargetRef = useRef('');

    useEffect(() => {
        if (!isValidationAvailable) return;

        const currentTargetKey = getTargetIdentifier(dynamicFields, fieldData, selectedVariant);

        if (!prevTargetRef.current) {
            prevTargetRef.current = currentTargetKey;
            return;
        }

        // If target ID changed, reset validation status
        if (currentTargetKey !== prevTargetRef.current) {
            prevTargetRef.current = currentTargetKey;
            if (validatedAccount && validatedAccount._lastTarget && validatedAccount._lastTarget !== currentTargetKey) {
                if (typeof setValidatedAccount === 'function') setValidatedAccount(null);
            }
            if (validationError) {
                if (typeof setValidationError === 'function') setValidationError(null);
            }
        }
    }, [fieldData, selectedVariant, isValidationAvailable, dynamicFields, validatedAccount, setValidatedAccount, setValidationError, validationError]);

    // Keep prevTargetRef aligned with validatedAccount when validation succeeds
    useEffect(() => {
        if (validatedAccount?._lastTarget) {
            prevTargetRef.current = validatedAccount._lastTarget;
        }
    }, [validatedAccount]);

    const handleFieldBlur = (fieldKey, val) => {
        if (!val) return;
        const isTargetField = fieldKey === 'customer_id' || fieldKey === 'target' || fieldKey === 'note' || fieldKey === 'user_id' || fieldKey === 'phone' || fieldKey === 'no_hp';
        if (isEwalletProduct && isTargetField) {
            const normalized = normalizePhoneNumber(val);
            if (normalized && normalized !== val) {
                setFieldData(prev => ({ ...prev, [fieldKey]: normalized }));
            }
        }
    };

    return (
        <div>
            <h2 className="text-base font-bold text-slate-900 mb-5">Informasi Pembeli</h2>
            <div className="space-y-4 mb-6">
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-2">Nomor WhatsApp (Aktif)</label>
                    <input
                        name="wa_number"
                        type="number"
                        value={formData.wa_number}
                        onChange={handleFormChange}
                        placeholder="Contoh: 08123456789"
                        className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-2">Alamat Email Gmail</label>
                    <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        placeholder="Contoh: nama@gmail.com"
                        className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-colors"
                    />
                </div>

                {/* ── Dynamic Fields from API ── */}
                {(dynamicFields || []).map((field, idx) => {
                    const rawLabel = field?.label || field?.name || field?.key || `Input ${idx + 1}`;
                    const cleanedLabel = typeof rawLabel === 'string' ? rawLabel.replace(/[:*]/g, '').trim() : String(rawLabel);
                    const isTargetField = field?.key === 'customer_id' || field?.key === 'target' || field?.key === 'note' || field?.key === 'user_id' || field?.key === 'phone' || field?.key === 'no_hp';
                    const isZoneField = field?.key === 'zone_id' || field?.key === 'server_id';
                    
                    const getPlaceholderText = () => {
                        const lowerLabel = cleanedLabel.toLowerCase();
                        
                        if (
                            lowerLabel.includes('nomor') || 
                            lowerLabel.includes('no') || 
                            lowerLabel.includes('phone') || 
                            lowerLabel.includes('gopay') || 
                            lowerLabel.includes('dana') || 
                            lowerLabel.includes('ovo') || 
                            lowerLabel.includes('linkaja') || 
                            lowerLabel.includes('shopeepay')
                        ) {
                            const targetName = cleanedLabel.replace(/^[nN]omor\s+/i, '').replace(/^[nN]o\s+/i, '');
                            return `Masukkan nomor tujuan 08... (${targetName})`;
                        }
                        
                        return `Masukkan ${cleanedLabel}`;
                    };

                    const isNumericOnly = (isEwalletProduct && isTargetField) || (isNumericGame && (isTargetField || isZoneField));

                    return (
                        <div key={`dyn-${idx}`}>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-medium text-slate-500">
                                    {cleanedLabel} {field?.required && '*'}
                                </label>
                                {isTargetField && isValidationAvailable && (
                                    <span className={`text-[11px] font-medium flex items-center gap-1 ${
                                        validatedAccount?.valid ? 'text-green-600' : 'text-purple-600'
                                    }`}>
                                        {isValidating && <Loader2 size={12} className="animate-spin text-purple-600" />}
                                        {isValidating ? 'Mengecek ID...' : validatedAccount?.valid ? '✓ ID Terverifikasi' : 'Wajib Cek ID'}
                                    </span>
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    type={field?.key === 'provider_qty' ? 'number' : isNumericOnly ? 'tel' : 'text'}
                                    inputMode={isNumericOnly ? 'numeric' : undefined}
                                    value={field?.key === 'provider_qty' ? providerQty : (fieldData[field?.key] || '')}
                                    onChange={(e) => {
                                        let val = e.target.value;
                                        if (isEwalletProduct && isTargetField) {
                                            // Prevent entering letters in e-wallet destination field
                                            val = val.replace(/[^0-9\s\-+]/g, '');
                                        } else if (isNumericGame && (isTargetField || isZoneField)) {
                                            // Prevent entering letters in game ID / Zone ID fields
                                            val = val.replace(/[^0-9]/g, '');
                                        }
                                        if (field?.key === 'provider_qty') setProviderQty(val);
                                        else setFieldData({...fieldData, [field?.key]: val});
                                    }}
                                    onBlur={(e) => handleFieldBlur(field?.key, e.target.value)}
                                    placeholder={getPlaceholderText()}
                                    className={`w-full bg-white border rounded-xl p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-colors ${
                                        validatedAccount?.valid && isTargetField
                                            ? 'border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/10'
                                            : validationError && isTargetField
                                                ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
                                                : 'border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10'
                                    }`}
                                />
                                {isValidating && isTargetField && (
                                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                                        <Loader2 size={16} className="animate-spin text-purple-500" />
                                    </div>
                                )}
                            </div>
                            {field?.key === 'provider_qty' && selectedVariant?.provider_meta && (
                                <p className="text-[10px] text-slate-400 mt-1">Min: {formatRp(selectedVariant.provider_meta.min_qty)} | Max: {formatRp(selectedVariant.provider_meta.max_qty)}</p>
                            )}
                        </div>
                    );
                })}

                {/* ── Validation Status & Manual Trigger ── */}
                {isValidationAvailable && (
                    <div className="pt-2">
                        {isValidating ? (
                            <button
                                type="button"
                                disabled
                                className="w-full bg-purple-600/70 text-white py-3.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2 cursor-wait"
                            >
                                <Loader2 size={16} className="animate-spin" />
                                Sedang Mengecek Akun...
                            </button>
                        ) : validatedAccount?.valid ? (
                            <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-semibold text-green-700 uppercase tracking-wider">Akun Terverifikasi</p>
                                        <p className="text-sm font-bold text-green-900 truncate">
                                            {getSafeAccountName(validatedAccount)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleValidateAccount({ silent: false })}
                                    className="text-xs font-semibold text-green-700 hover:text-green-800 bg-green-100 hover:bg-green-200 px-3 py-1.5 rounded-lg transition-colors shrink-0"
                                >
                                    Cek Ulang
                                </button>
                            </div>
                        ) : validationError ? (
                            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
                                <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-red-700 uppercase tracking-wider">Validasi Gagal</p>
                                    <p className="text-xs text-red-900 leading-relaxed font-medium mt-0.5">
                                        {typeof validationError === 'string'
                                            ? validationError
                                            : (validationError?.message || validationError?.error || 'Validasi gagal. Silakan periksa kembali ID.')}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleValidateAccount({ silent: false })}
                                    className="text-xs font-bold text-red-700 hover:text-red-800 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg shrink-0 transition-colors"
                                >
                                    Coba Lagi
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleValidateAccount({ silent: false })}
                                className="w-full bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white py-3.5 rounded-xl text-sm font-bold transition-all flex justify-center items-center gap-2 shadow-sm"
                            >
                                <CheckCircle2 size={16} />
                                Cek ID / Validasi Akun
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BuyerDataForm;
