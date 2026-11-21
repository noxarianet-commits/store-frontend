import { useEffect, useRef } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatRp } from '../../utils/currencyUtils';
import { normalizePhoneNumber } from '../../utils/phoneUtils';
import { getTargetIdentifier, getSafeAccountName } from '../../utils/accountValidationUtils';
import { useAuth } from '../../contexts/AuthContext';

const getEwalletBrandName = (name) => {
    if (!name) return 'E-Wallet';
    const lower = name.toLowerCase();
    if (lower.includes('dana')) return 'DANA';
    if (lower.includes('gopay') || lower.includes('gojek')) return 'GoPay';
    if (lower.includes('ovo')) return 'OVO';
    if (lower.includes('shopee')) return 'ShopeePay';
    if (lower.includes('linkaja')) return 'LinkAja';
    if (lower.includes('maxim')) return 'Maxim';
    if (lower.includes('isaku') || lower.includes('i.saku')) return 'i.saku';
    if (lower.includes('astrapay')) return 'AstraPay';
    if (lower.includes('kaspro')) return 'KasPro';
    if (lower.includes('doku')) return 'DOKU';
    return name.replace(/^top\s*up\s*/i, '').trim();
};

const BuyerDataForm = ({
    formData,
    handleFormChange,
    setFormData,
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
    validationMandatory,
    vendor,
    product,
}) => {
    const activeServer = product?.servers?.find(s => (s.vendor || '').toLowerCase() === (vendor || '').toLowerCase()) || product?.servers?.[0];
    const currentVendor = (selectedVariant?.vendor || activeServer?.vendor || vendor || product?.vendor || '').toLowerCase();
    const isOkeconnect = currentVendor === 'okeconnect';
    const isValidationAvailable = Boolean(selectedVariant?.validation?.available);
    const isValidationActive = isValidationAvailable && validationMandatory !== false;
    const isEwalletProduct = product?.category?.toLowerCase().includes('wallet') ||
        /dana|ovo|gopay|gojek|shopee|linkaja|isaku|maxim/i.test(product?.name || '');
    const isNumericGame = /mobile legend|magic chess|free fire/i.test(product?.name || '');

    const { user } = useAuth();

    // Autofill No WhatsApp & Email jika user sudah login
    useEffect(() => {
        if (!user) return;

        if (typeof setFormData === 'function') {
            setFormData(prev => {
                const updates = {};
                if (!prev.wa_number && user.phone) updates.wa_number = user.phone;
                if (!prev.email && user.email) updates.email = user.email;
                if (Object.keys(updates).length === 0) return prev;
                return { ...prev, ...updates };
            });
        } else if (typeof handleFormChange === 'function') {
            if (!formData.wa_number && user.phone) {
                handleFormChange({ target: { name: 'wa_number', value: user.phone } });
            }
            if (!formData.email && user.email) {
                handleFormChange({ target: { name: 'email', value: user.email } });
            }
        }
    }, [user, setFormData, handleFormChange, formData.wa_number, formData.email]);

    const isWaAutofilled = Boolean(user?.phone && formData.wa_number && String(formData.wa_number) === String(user.phone));
    const isEmailAutofilled = Boolean(user?.email && formData.email && formData.email.toLowerCase() === user.email.toLowerCase());

    // Invalidate previous validation when User ID / Zone ID is edited
    const prevTargetRef = useRef('');

    useEffect(() => {
        if (!isValidationAvailable) return;

        const currentTargetKey = getTargetIdentifier(dynamicFields, fieldData, selectedVariant);

        if (!prevTargetRef.current) {
            prevTargetRef.current = currentTargetKey;
            return;
        }

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

    const hasDynamicFields = Array.isArray(dynamicFields) && dynamicFields.length > 0;

    return (
        <div>
            {/* Bagian 1: Data Akun / Tujuan Pengisian (Hanya jika produk memerlukan target/ID) */}
            {hasDynamicFields && (
                <div className="mb-5 pb-5 border-b border-slate-100">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-3">Tujuan Pengisian</h2>
                    <div className="space-y-3">
                        {dynamicFields.map((field, idx) => {
                            const rawLabel = field?.label || field?.name || field?.key || `Input ${idx + 1}`;
                            let cleanedLabel = typeof rawLabel === 'string' ? rawLabel.replace(/[:*]/g, '').trim() : String(rawLabel);
                            const isTargetField = field?.key === 'customer_id' || field?.key === 'target' || field?.key === 'note' || field?.key === 'user_id' || field?.key === 'phone' || field?.key === 'no_hp';
                            const isZoneField = field?.key === 'zone_id' || field?.key === 'server_id';

                            if (isEwalletProduct && isTargetField) {
                                const ewalletName = getEwalletBrandName(product?.name);
                                cleanedLabel = `Nomor HP Tujuan ${ewalletName}`;
                            }

                            const getPlaceholderText = () => {
                                if (isEwalletProduct && isTargetField) {
                                    const ewalletName = getEwalletBrandName(product?.name);
                                    return `Contoh: 081234567890 (${ewalletName})`;
                                }
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
                                    return `Nomor tujuan 08... (${targetName})`;
                                }
                                return `Masukkan ${cleanedLabel}`;
                            };

                            const isNumericOnly = (isEwalletProduct && isTargetField) || (isNumericGame && (isTargetField || isZoneField));

                            return (
                                <div key={`dyn-${idx}`}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-xs font-semibold text-slate-700">
                                            {cleanedLabel} {field?.required && <span className="text-rose-500">*</span>}
                                        </label>
                                        {isTargetField && isValidationActive && (
                                            <span className={`text-[11px] font-semibold flex items-center gap-1 ${
                                                validatedAccount?.valid ? 'text-emerald-600' : 'text-purple-600'
                                            }`}>
                                                {isValidating && <Loader2 size={11} className="animate-spin text-purple-600" />}
                                                {isValidating ? 'Mengecek ID...' : validatedAccount?.valid ? '✓ Terverifikasi' : 'Wajib Cek ID'}
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
                                                    val = val.replace(/[^0-9\s\-+]/g, '');
                                                } else if (isNumericGame && (isTargetField || isZoneField)) {
                                                    val = val.replace(/[^0-9]/g, '');
                                                }
                                                if (field?.key === 'provider_qty') setProviderQty(val);
                                                else setFieldData({...fieldData, [field?.key]: val});
                                            }}
                                            onBlur={(e) => handleFieldBlur(field?.key, e.target.value)}
                                            placeholder={getPlaceholderText()}
                                            className={`w-full bg-white border rounded-xl p-3 sm:p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-colors ${
                                                validatedAccount?.valid && isTargetField
                                                    ? 'border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10'
                                                    : validationError && isTargetField
                                                        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                                                        : isValidationActive && isTargetField && !validatedAccount?.valid
                                                            ? 'border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10'
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

                        {/* Status Validasi & Tombol Cek ID */}
                        {isValidationActive && (
                            <div className="pt-1">
                                {isValidating ? (
                                    <div className="w-full bg-purple-50 border border-purple-200 text-purple-700 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex justify-center items-center gap-2">
                                        <Loader2 size={14} className="animate-spin text-purple-600" />
                                        <span>Sedang Mengecek ID Akun...</span>
                                    </div>
                                ) : validatedAccount?.valid ? (
                                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                                                    Akun Ditemukan
                                                </p>
                                                <p className="text-xs sm:text-sm font-extrabold text-emerald-900 truncate">
                                                    {getSafeAccountName(validatedAccount)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleValidateAccount({ silent: false })}
                                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg transition-colors shrink-0"
                                        >
                                            Cek Ulang
                                        </button>
                                    </div>
                                ) : validationError ? (
                                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-2.5">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <AlertCircle size={16} className="text-rose-600 shrink-0" />
                                            <p className="text-xs font-semibold text-rose-800 truncate">
                                                {typeof validationError === 'string'
                                                    ? validationError
                                                    : (validationError?.message || validationError?.error || 'ID tidak ditemukan atau salah')}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleValidateAccount({ silent: false })}
                                            className="text-[11px] font-bold text-rose-700 hover:text-rose-800 bg-rose-100 hover:bg-rose-200 px-2.5 py-1 rounded-lg shrink-0 transition-colors"
                                        >
                                            Coba Lagi
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleValidateAccount({ silent: false })}
                                        className="w-full bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex justify-center items-center gap-2 shadow-xs cursor-pointer"
                                    >
                                        <CheckCircle2 size={15} />
                                        <span>Cek ID Akun</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Bagian 2: Kontak Pengiriman (WhatsApp & Email) */}
            <div className="mb-5">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-3">
                    {hasDynamicFields ? 'Kontak Penerima Bukti' : 'Informasi Pembeli'}
                </h2>
                <div className="space-y-3">
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-semibold text-slate-700">
                                Nomor WhatsApp (Aktif) <span className="text-rose-500">*</span>
                            </label>
                            {isWaAutofilled && (
                                <span className="text-[10px] text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 flex items-center gap-1">
                                    <CheckCircle2 size={10} className="text-purple-600" />
                                    Terisi otomatis
                                </span>
                            )}
                        </div>
                        <input
                            name="wa_number"
                            type="tel"
                            inputMode="numeric"
                            value={formData.wa_number}
                            onChange={(e) => {
                                const cleaned = e.target.value.replace(/[^0-9]/g, '');
                                if (typeof handleFormChange === 'function') {
                                    handleFormChange({ target: { name: 'wa_number', value: cleaned } });
                                }
                            }}
                            placeholder="Contoh: 081234567890"
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 sm:p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-colors"
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-semibold text-slate-700">
                                Alamat Email <span className="text-rose-500">*</span>
                            </label>
                            {isEmailAutofilled && (
                                <span className="text-[10px] text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 flex items-center gap-1">
                                    <CheckCircle2 size={10} className="text-purple-600" />
                                    Terisi otomatis
                                </span>
                            )}
                        </div>
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleFormChange}
                            placeholder="Contoh: nama@gmail.com"
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 sm:p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-colors"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuyerDataForm;
