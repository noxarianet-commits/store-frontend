import { useState } from 'react';
import { Save, Eye, EyeOff, MessageSquare, Loader2, LogOut } from 'lucide-react';
import api from '../../api';
import { notifySuccess, notifyError } from '../../utils/notify';

const SettingsTab = ({
    settings, setSettings, updateSetting,
    passwordForm, setPasswordForm, handleChangePassword
}) => {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showSettingsPassword, setShowSettingsPassword] = useState(false);

    return (
        <div className="space-y-6">
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
