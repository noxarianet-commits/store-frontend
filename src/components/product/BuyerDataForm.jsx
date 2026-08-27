import React, { useEffect, useRef } from 'react';
import { Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
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

    // ── Invalidate previous validation when User ID / Zone ID is edited ──
    const prevTargetRef = useRef('');

    useEffect(() => {
        if (!isValidationAvailable) return;

        const customerId = fieldData['customer_id'] || fieldData['target'] || (dynamicFields.length === 1 ? fieldData[dynamicFields[0].key] : '');
        const zoneId = fieldData['zone_id'] || '';
        const currentTargetKey = `${customerId || ''}_${zoneId || ''}_${selectedVariant?.id || ''}`;

        // If target ID changed, reset validation status
        if (currentTargetKey !== prevTargetRef.current) {
            prevTargetRef.current = currentTargetKey;
            if (validatedAccount && validatedAccount._lastTarget !== currentTargetKey) {
                if (typeof setValidatedAccount === 'function') setValidatedAccount(null);
            }
            if (validationError) {
                if (typeof setValidationError === 'function') setValidationError(null);
            }
        }
    }, [fieldData, selectedVariant?.id, isValidationAvailable]);

    const handleFieldBlur = (fieldKey, val) => {
        if (!val) return;
        const isTargetField = fieldKey === 'customer_id' || fieldKey === 'target' || fieldKey === 'note';
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
                {dynamicFields.map((field, idx) => {
                    const cleanedLabel = field.label.replace(/[:*]/g, '').trim();
                    
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

                    return (
                        <div key={`dyn-${idx}`}>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-medium text-slate-500">
                                    {cleanedLabel} {field.required && '*'}
                                </label>
                                {field.key === 'customer_id' && isValidationAvailable && (
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
                                    type={field.key === 'provider_qty' ? 'number' : 'text'}
                                    value={field.key === 'provider_qty' ? providerQty : (fieldData[field.key] || '')}
                                    onChange={(e) => {
                                        if (field.key === 'provider_qty') setProviderQty(e.target.value);
                                        else setFieldData({...fieldData, [field.key]: e.target.value});
                                    }}
                                    onBlur={(e) => handleFieldBlur(field.key, e.target.value)}
                                    placeholder={getPlaceholderText()}
                                    className={`w-full bg-white border rounded-xl p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-colors ${
                                        validatedAccount?.valid && (field.key === 'customer_id' || field.key === 'target')
                                            ? 'border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/10'
                                            : validationError && (field.key === 'customer_id' || field.key === 'target')
                                                ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
                                                : 'border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10'
                                    }`}
                                />
                                {isValidating && (field.key === 'customer_id' || field.key === 'target') && (
                                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                                        <Loader2 size={16} className="animate-spin text-purple-500" />
                                    </div>
                                )}
                            </div>
                            {field.key === 'provider_qty' && selectedVariant?.provider_meta && (
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
                                            {validatedAccount.account_name || validatedAccount.display_name || 'Valid'}
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
                                        {validationError}
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
