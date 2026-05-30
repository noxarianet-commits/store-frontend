
import { Save, Eye, EyeOff, ImageIcon, Upload, Loader2, LogOut } from 'lucide-react';
import api from '../../api';
import Swal from 'sweetalert2';

const SettingsTab = ({
    settings, setSettings, updateSetting,
    passwordForm, setPasswordForm, handleChangePassword,
    uploadingBanner, setUploadingBanner,
    showCurrentPassword, setShowCurrentPassword,
    showNewPassword, setShowNewPassword,
    showSettingsPassword, setShowSettingsPassword
}) => {
    const handleInfoImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('banner', file);

        setUploadingBanner(true);
        try {
            const res = await api.post('/banners', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const newUrl = res.data.url;
            await updateSetting('info_modal_image', newUrl);
            Swal.fire({ icon: 'success', title: 'Gambar Terupdate!', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, background: '#0E0E0E', color: '#fff' });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Gagal Upload!', text: err.message, background: '#0E0E0E', color: '#fff' });
        } finally {
            setUploadingBanner(false);
        }
    };

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

            {/* Info Modal Image */}
            <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-6">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <ImageIcon size={20} className="text-purple-400" />
                        Gambar Popup (Info Penting)
                    </h3>
                    <p className="text-xs text-gray-500">Rekomendasi rasio 3:4 (Contoh: 600x800px atau 720x960px)</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-full md:w-1/3 aspect-[3/4] bg-white/5 rounded-2xl overflow-hidden border border-white/10 relative group">
                        <img
                            src={settings.info_modal_image}
                            alt="Info Modal"
                            className="w-full h-full object-contain"
                        />
                        {uploadingBanner && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <Loader2 size={32} className="text-purple-500 animate-spin" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                            <p className="text-xs text-purple-300 leading-relaxed">
                                Disarankan menggunakan gambar dengan rasio 3:4 atau sejenisnya. Gambar akan otomatis terupdate di halaman depan setelah diupload.
                            </p>
                        </div>

                        <input type="file" accept="image/*" id="infoModalInput" className="hidden" onChange={handleInfoImageUpload} />

                        <button
                            onClick={() => document.getElementById('infoModalInput').click()}
                            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-600/10 transition-all flex items-center justify-center gap-2"
                        >
                            <Upload size={18} /> Ganti Gambar Popup
                        </button>
                    </div>
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
