import React from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { formatRp } from '../../utils/currencyUtils';

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
    vendor
}) => {
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
                {dynamicFields.map((field, idx) => (
                    <div key={`dyn-${idx}`}>
                        <label className="block text-xs font-medium text-slate-500 mb-2">{field.label} {field.required && '*'}</label>
                        <input
                            type={field.key === 'provider_qty' ? 'number' : 'text'}
                            value={field.key === 'provider_qty' ? providerQty : (fieldData[field.key] || '')}
                            onChange={(e) => {
                                if (field.key === 'provider_qty') setProviderQty(e.target.value);
                                else setFieldData({...fieldData, [field.key]: e.target.value});
                            }}
                            placeholder={`Masukkan ${field.label}`}
                            className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-colors"
                        />
                        {field.key === 'provider_qty' && selectedVariant?.provider_meta && (
                            <p className="text-[10px] text-slate-400 mt-1">Min: {formatRp(selectedVariant.provider_meta.min_qty)} | Max: {formatRp(selectedVariant.provider_meta.max_qty)}</p>
                        )}
                    </div>
                ))}

                {selectedVariant?.validation?.available && vendor === 'sekalipay' && (
                    <div className="pt-2">
                        <button
                            onClick={handleValidateAccount}
                            disabled={isValidating}
                            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 py-3 rounded-xl text-sm font-bold transition flex justify-center items-center gap-2"
                        >
                            {isValidating ? <Loader2 size={16} className="animate-spin" /> : 'Cek ID / Validasi Akun'}
                        </button>
                        {validatedAccount && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-xl flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-green-600" />
                                <span className="text-sm font-bold text-green-600">Tujuan: {validatedAccount.account_name || validatedAccount.display_name}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BuyerDataForm;
