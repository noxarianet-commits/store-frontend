import { useState } from 'react';
import { Save, Eye, EyeOff, MessageSquare, LogOut, Phone } from 'lucide-react';
import { getWaNumber, formatWaDisplay } from '../../utils/waUtils';

const SettingsTab = ({
    settings, setSettings, updateSetting,
    passwordForm, setPasswordForm, handleChangePassword
}) => {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showSettingsPassword, setShowSettingsPassword] = useState(false);

    const currentWa = getWaNumber(settings);

    return (
        <div className="space-y-6">
            {/* WhatsApp CS Number */}
            <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Phone size={20} className="text-green-400" />
                            Nomor WhatsApp CS (Customer Service)
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Nomor ini akan digunakan di seluruh tombol CS toko, halaman garansi, website order, dan email transaksi.
                        </p>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">
                        Nomor WA CS (Format Internasional tanpa tanda +, contoh: 6285199605580)
                    </label>
                    <div className="flex flex-col md:flex-row gap-3">
                        <input
                            type="text"
                            value={settings.whatsapp_cs !== undefined ? settings.whatsapp_cs : currentWa}
                            onChange={(e) => setSettings({ ...settings, whatsapp_cs: e.target.value })}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-purple-500/50 font-mono"
                            placeholder="6285199605580"
                        />
                        <button
                            onClick={() => updateSetting('whatsapp_cs', settings.whatsapp_cs || currentWa)}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shrink-0"
                        >
                            <Save size={18} /> Simpan Nomor CS
                        </button>
                    </div>
                    {currentWa && (
                        <p className="text-xs text-slate-400 mt-3 flex items-center gap-2">
                            <span>Tampilan di web: <strong className="text-green-400">{formatWaDisplay(settings.whatsapp_cs || currentWa)}</strong></span>
                            <span>•</span>
                            <a
                                href={`https://wa.me/${(settings.whatsapp_cs || currentWa).replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-purple-400 hover:underline"
                            >
                                Uji Link (wa.me/{ (settings.whatsapp_cs || currentWa).replace(/\D/g, '') })
                            </a>
                        </p>
                    )}
                </div>
            </div>

            {/* Shop Status */}
            <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-white">Status Toko</h3>
                        <p className="text-xs text-gray-500">Ubah status operasional toko Anda</p>
                    </div>
                    <button
                        onClick={() => updateSetting('shop_status', { ...settings.shop_status, isOpen: !settings.shop_status.isOpen })}
                        className={`relative w-14 h-7 rounded-full transition-all flex items-center px-1 ${settings.shop_status.isOpen ? 'bg-green-600' : 'bg-gray-700'}`}
                    >
                        <div className={`w-5 h-5 bg-white rounded-full transition-all transform ${settings.shop_status.isOpen ? 'translate-x-7' : 'translate-x-0'}`} />
                    </button>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">Running Text (Marquee)</label>
                    <textarea
                        value={settings.shop_status.message}
                        onChange={(e) => setSettings({ ...settings, shop_status: { ...settings.shop_status, message: e.target.value } })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white h-24 focus:outline-none focus:border-purple-500/50"
                        placeholder="Teks yang akan muncul di marquee..."
                    />
                    <button
                        onClick={() => updateSetting('shop_status', settings.shop_status)}
                        className="bg-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 mt-4"
                    >
                        <Save size={18} /> Simpan Status Toko
                    </button>
                </div>
            </div>

            {/* Info Modal Text */}
            <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <MessageSquare size={20} className="text-purple-400" />
                            Popup Info Penting
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Kelola teks popup yang muncul saat pengguna membuka halaman utama
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <button
                            onClick={() => updateSetting('info_modal_active', settings.info_modal_active === undefined ? false : !settings.info_modal_active)}
                            className={`relative w-14 h-7 rounded-full transition-all duration-300 flex items-center px-1 ${settings.info_modal_active !== false ? 'bg-green-600' : 'bg-gray-700'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 transform ${settings.info_modal_active !== false ? 'translate-x-7' : 'translate-x-0'}`} />
                        </button>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${settings.info_modal_active !== false ? 'text-green-400' : 'text-gray-500'}`}>
                            {settings.info_modal_active !== false ? 'Aktif' : 'Nonaktif'}
                        </span>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">Pesan Popup</label>
                    <textarea
                        value={settings.info_modal_text || ''}
                        onChange={(e) => setSettings({ ...settings, info_modal_text: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white h-24 focus:outline-none focus:border-purple-500/50"
                        placeholder="Masukkan teks popup di sini (misal: Bergabunglah dengan grup WhatsApp kami...)"
                    />
                    <button
                        onClick={() => updateSetting('info_modal_text', settings.info_modal_text)}
                        className="bg-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 mt-4"
                    >
                        <Save size={18} /> Simpan Teks Popup
                    </button>
                </div>
            </div>

            {/* Payment Gateway Provider */}
            <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Save size={20} className="text-emerald-400" />
                            Provider Payment Gateway
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Pilih provider gateway aktif untuk pembuatan QRIS. Pembeli tidak dapat memilih sendiri.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* FinCloud Option */}
                    <div
                        onClick={() => {
                            setSettings({ ...settings, payment_gateway: 'fincloud' });
                            updateSetting('payment_gateway', 'fincloud');
                        }}
                        className={`cursor-pointer p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                            (settings.payment_gateway || 'fincloud') === 'fincloud'
                                ? 'bg-purple-600/10 border-purple-500/50 shadow-lg shadow-purple-500/10'
                                : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                    >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                            (settings.payment_gateway || 'fincloud') === 'fincloud'
                                ? 'border-purple-500 bg-purple-500'
                                : 'border-gray-500'
                        }`}>
                            {(settings.payment_gateway || 'fincloud') === 'fincloud' && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-white">FinCloud (QRIS)</h4>
                                {(settings.payment_gateway || 'fincloud') === 'fincloud' && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                                        Aktif
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                Gateway bawaan FinCloud API. Invoice dinamis dengan fee otomatis.
                            </p>
                        </div>
                    </div>

                    {/* ORKUT Option */}
                    <div
                        onClick={() => {
                            setSettings({ ...settings, payment_gateway: 'orkut' });
                            updateSetting('payment_gateway', 'orkut');
                        }}
                        className={`cursor-pointer p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                            settings.payment_gateway === 'orkut'
                                ? 'bg-purple-600/10 border-purple-500/50 shadow-lg shadow-purple-500/10'
                                : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                    >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                            settings.payment_gateway === 'orkut'
                                ? 'border-purple-500 bg-purple-500'
                                : 'border-gray-500'
                        }`}>
                            {settings.payment_gateway === 'orkut' && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-white">ORKUT (OrderKuota)</h4>
                                {settings.payment_gateway === 'orkut' && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                                        Aktif
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                QRIS Dinamis OrderKuota + Smart Polling (Balance Delta) & Kode Unik.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ORKUT Credentials Config */}
                {settings.payment_gateway === 'orkut' && (
                    <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            ⚙️ Konfigurasi Kredensial ORKUT (OrderKuota)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Server URL Gateway</label>
                                <input
                                    type="text"
                                    value={settings.orkut_config?.base_url || 'http://panelku.fincloud.my.id:10002'}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        orkut_config: { ...settings.orkut_config, base_url: e.target.value }
                                    })}
                                    placeholder="http://panelku.fincloud.my.id:10002"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500/50 font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Merchant Code</label>
                                <input
                                    type="text"
                                    value={settings.orkut_config?.merchant_code || ''}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        orkut_config: { ...settings.orkut_config, merchant_code: e.target.value }
                                    })}
                                    placeholder="Contoh: M1A2B3C4D (atau kosongkan)"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500/50 font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">API Hash</label>
                                <input
                                    type="text"
                                    value={settings.orkut_config?.api_hash || ''}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        orkut_config: { ...settings.orkut_config, api_hash: e.target.value }
                                    })}
                                    placeholder="API Hash akun (atau kosongkan)"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500/50 font-mono"
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => updateSetting('orkut_config', settings.orkut_config || {})}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                        >
                            <Save size={16} /> Simpan Kredensial ORKUT
                        </button>
                    </div>
                )}
            </div>

            {/* Admin Security */}
            <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-6">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <LogOut size={20} className="text-red-400 rotate-180" />
                        Keamanan Admin
                    </h3>
                    <p className="text-xs text-gray-500">Ubah password login dashboard Anda. Password lama diperlukan untuk konfirmasi.</p>
                </div>
                <div className="grid grid-cols-1 gap-4 max-w-md">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">Password Saat Ini</label>
                        <div className="relative">
                            <input
                                type={showCurrentPassword ? "text" : "password"}
                                placeholder="Masukkan password saat ini"
                                value={passwordForm.current_password}
                                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pr-10 text-sm text-white focus:outline-none focus:border-purple-500/50"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">Password Baru</label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                placeholder="Minimal 8 karakter"
                                value={passwordForm.new_password}
                                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pr-10 text-sm text-white focus:outline-none focus:border-purple-500/50"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">Konfirmasi Password Baru</label>
                        <div className="relative">
                            <input
                                type={showSettingsPassword ? "text" : "password"}
                                placeholder="Ulangi password baru"
                                value={passwordForm.confirm_password}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pr-10 text-sm text-white focus:outline-none focus:border-purple-500/50"
                            />
                            <button
                                type="button"
                                onClick={() => setShowSettingsPassword(!showSettingsPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showSettingsPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleChangePassword}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 mt-6 transition-all"
                >
                    <Save size={18} /> Ubah Password
                </button>
            </div>
        </div>
    );
};

export default SettingsTab;
