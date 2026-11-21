import { useState } from 'react';
import { Save, Eye, EyeOff, MessageSquare, LogOut, Phone, Users, ShieldCheck, Globe, Smartphone, Download, AlertTriangle } from 'lucide-react';
import { getWaNumber, formatWaDisplay, getWaGroupLink } from '../../utils/waUtils';
import { parseBoolSetting, isMandatoryValidationForChannel, CHANNEL_VALIDATION_KEYS } from '../../utils/validationFlags';
import { confirmAction, notifyWarning } from '../../utils/notify';

const APP_VERSION_PATTERN = /^\d{1,4}(?:\.\d{1,4}){0,3}$/;
const MAX_RELEASE_NOTES_LENGTH = 2000;

function readMobileAppConfig(settings) {
    const raw = settings?.mobile_app_config;
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
        } catch {
            // Abaikan JSON rusak; form memakai default di bawah.
        }
    }
    return {};
}

function buildMobileAppConfig(settings) {
    const stored = readMobileAppConfig(settings);
    return {
        ...stored,
        min_version: stored.min_version === undefined || stored.min_version === null || stored.min_version === ''
            ? '1.0.0'
            : String(stored.min_version),
        latest_version: stored.latest_version === undefined || stored.latest_version === null || stored.latest_version === ''
            ? '1.0.0'
            : String(stored.latest_version),
        download_url: typeof stored.download_url === 'string' ? stored.download_url : '',
        release_notes: typeof stored.release_notes === 'string' ? stored.release_notes : '',
        maintenance: stored.maintenance === true,
    };
}

function compareVersions(a, b) {
    const parse = (value) =>
        String(value)
            .split('.')
            .map((part) => parseInt(part.replace(/\D.*$/, ''), 10) || 0);

    const left = parse(a);
    const right = parse(b);
    const length = Math.max(left.length, right.length);

    for (let i = 0; i < length; i += 1) {
        const l = left[i] || 0;
        const r = right[i] || 0;
        if (l > r) return 1;
        if (l < r) return -1;
    }
    return 0;
}

const VALIDATION_CHANNEL_OPTIONS = [
    { id: 'inherit', label: 'Ikuti Master' },
    { id: 'on', label: 'Aktif' },
    { id: 'off', label: 'Nonaktif' },
];

const VALIDATION_CHANNEL_ROWS = [
    {
        key: CHANNEL_VALIDATION_KEYS.web,
        label: 'Website',
        icon: <Globe size={14} className="text-purple-400" />,
        desc: 'Toko web (desktop & mobile browser). Cek ID dilewati saat Nonaktif.',
    },
    {
        key: CHANNEL_VALIDATION_KEYS.app,
        label: 'Aplikasi Android',
        icon: <Smartphone size={14} className="text-cyan-400" />,
        desc: 'Aplikasi Android. Cek ID dilewati saat Nonaktif.',
    },
];

/**
 * Mode override per channel: 'inherit' (belum ada override), 'on', 'off'.
 */
function channelMode(settings, key) {
    const value = parseBoolSetting(settings?.[key]);
    if (value === null) return 'inherit';
    return value ? 'on' : 'off';
}

const SettingsTab = ({
    settings, setSettings, updateSetting,
    passwordForm, setPasswordForm, handleChangePassword
}) => {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showSettingsPassword, setShowSettingsPassword] = useState(false);
    const [savingAppConfig, setSavingAppConfig] = useState(false);

    const currentWa = getWaNumber(settings);
    const currentWaGroupLink = getWaGroupLink(settings);
    const appConfig = buildMobileAppConfig(settings);

    const setAppConfig = (patch) => {
        setSettings((prev) => ({
            ...prev,
            mobile_app_config: {
                ...buildMobileAppConfig(prev),
                ...patch,
            },
        }));
    };

    const handleSaveAppConfig = async () => {
        if (savingAppConfig) return;

        const minVersion = String(appConfig.min_version || '').trim();
        const latestVersion = String(appConfig.latest_version || '').trim();
        const downloadUrl = String(appConfig.download_url || '').trim();
        const releaseNotes = String(appConfig.release_notes || '').trim();

        if (!APP_VERSION_PATTERN.test(minVersion)) {
            notifyWarning('Versi minimum tidak valid. Gunakan format seperti 1.0.0.');
            return;
        }
        if (!APP_VERSION_PATTERN.test(latestVersion)) {
            notifyWarning('Versi terbaru tidak valid. Gunakan format seperti 1.0.1.');
            return;
        }
        if (compareVersions(minVersion, latestVersion) > 0) {
            notifyWarning('Versi minimum tidak boleh lebih tinggi dari versi terbaru.');
            return;
        }
        if (downloadUrl) {
            try {
                const parsed = new URL(downloadUrl);
                if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
                    throw new Error('Protokol tidak didukung');
                }
            } catch {
                notifyWarning('Link unduhan harus berupa URL http:// atau https:// yang valid.');
                return;
            }
        }
        if (releaseNotes.length > MAX_RELEASE_NOTES_LENGTH) {
            notifyWarning(`Catatan rilis maksimal ${MAX_RELEASE_NOTES_LENGTH} karakter.`);
            return;
        }

        const wasMaintenance = readMobileAppConfig(settings).maintenance === true;
        if (!wasMaintenance && appConfig.maintenance === true) {
            const confirmed = await confirmAction({
                title: 'Aktifkan maintenance aplikasi?',
                text: 'Semua pengguna aplikasi Android akan melihat layar maintenance sampai mode ini dimatikan. Website tidak terpengaruh.',
                confirmText: 'Ya, aktifkan',
                cancelText: 'Batal',
                danger: true,
            });
            if (!confirmed) {
                setAppConfig({ maintenance: wasMaintenance });
                return;
            }
        }

        setSavingAppConfig(true);
        await updateSetting('mobile_app_config', {
            ...appConfig,
            min_version: minVersion,
            latest_version: latestVersion,
            download_url: downloadUrl,
            release_notes: releaseNotes,
            maintenance: appConfig.maintenance === true,
        });
        setSavingAppConfig(false);
    };

    return (
        <div className="space-y-6">
            {/* WhatsApp CS Number */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Phone size={20} className="text-emerald-600" />
                            Nomor WhatsApp CS (Customer Service)
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Nomor ini akan digunakan di seluruh tombol CS toko, halaman garansi, website order, dan email transaksi.
                        </p>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                        Nomor WA CS (Format Internasional tanpa tanda +, contoh: 6285199605580)
                    </label>
                    <div className="flex flex-col md:flex-row gap-3">
                        <input
                            type="text"
                            value={settings.whatsapp_cs !== undefined ? settings.whatsapp_cs : currentWa}
                            onChange={(e) => setSettings({ ...settings, whatsapp_cs: e.target.value })}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-purple-500 font-mono transition-colors"
                            placeholder="6285199605580"
                        />
                        <button
                            onClick={() => updateSetting('whatsapp_cs', settings.whatsapp_cs || currentWa)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs shrink-0"
                        >
                            <Save size={16} /> Simpan Nomor CS
                        </button>
                    </div>
                    {currentWa && (
                        <p className="text-xs text-slate-500 mt-3 flex items-center gap-2">
                            <span>Tampilan di web: <strong className="text-emerald-600 font-semibold">{formatWaDisplay(settings.whatsapp_cs || currentWa)}</strong></span>
                            <span>•</span>
                            <a
                                href={`https://wa.me/${(settings.whatsapp_cs || currentWa).replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-purple-600 hover:underline font-medium"
                            >
                                Uji Link (wa.me/{ (settings.whatsapp_cs || currentWa).replace(/\D/g, '') })
                            </a>
                        </p>
                    )}
                </div>
            </div>

            {/* WhatsApp Group Link */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Users size={20} className="text-emerald-600" />
                            Link Group WhatsApp
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Link grup ini akan digunakan pada popup Info Penting dan tombol gabung grup WA di halaman utama.
                        </p>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                        URL Join Group WhatsApp (contoh: https://chat.whatsapp.com/...)
                    </label>
                    <div className="flex flex-col md:flex-row gap-3">
                        <input
                            type="text"
                            value={settings.wa_group_link !== undefined ? settings.wa_group_link : currentWaGroupLink}
                            onChange={(e) => setSettings({ ...settings, wa_group_link: e.target.value })}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-purple-500 font-mono transition-colors"
                            placeholder="https://chat.whatsapp.com/..."
                        />
                        <button
                            onClick={() => updateSetting('wa_group_link', settings.wa_group_link || currentWaGroupLink)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs shrink-0"
                        >
                            <Save size={16} /> Simpan Link Group WA
                        </button>
                    </div>
                    {currentWaGroupLink && (
                        <p className="text-xs text-slate-500 mt-3 flex items-center gap-2">
                            <span>Link aktif: <strong className="text-emerald-600 truncate max-w-xs inline-block align-bottom font-semibold">{settings.wa_group_link || currentWaGroupLink}</strong></span>
                            <span>•</span>
                            <a
                                href={settings.wa_group_link || currentWaGroupLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-purple-600 hover:underline font-medium shrink-0"
                            >
                                Uji Link Group WA
                            </a>
                        </p>
                    )}
                </div>
            </div>

            {/* Shop Status */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Status Toko</h3>
                        <p className="text-xs text-slate-500">Ubah status operasional toko Anda</p>
                    </div>
                    {(() => {
                        const raw = settings?.shop_status;
                        const isShopOpen = raw === undefined || raw === null
                            ? true
                            : typeof raw === 'object'
                                ? raw.isOpen !== false
                                : typeof raw === 'boolean'
                                    ? raw
                                    : typeof raw === 'string'
                                        ? raw.trim().toUpperCase() === 'OPEN' || raw.trim().toUpperCase() === 'TRUE' || raw.trim() === '1'
                                        : true;

                        return (
                            <div className="flex flex-col items-end gap-1">
                                <button
                                    onClick={() => {
                                        const currentObj = typeof settings?.shop_status === 'object' && settings?.shop_status !== null
                                            ? settings.shop_status
                                            : { message: '' };
                                        updateSetting('shop_status', { ...currentObj, isOpen: !isShopOpen });
                                    }}
                                    className={`relative w-14 h-7 rounded-full transition-all flex items-center px-1 ${
                                        isShopOpen ? 'bg-emerald-600' : 'bg-rose-500'
                                    }`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full transition-all transform ${isShopOpen ? 'translate-x-7' : 'translate-x-0'} shadow-xs`} />
                                </button>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isShopOpen ? 'text-emerald-700' : 'text-rose-600'}`}>
                                    {isShopOpen ? 'Toko Buka' : 'Toko Tutup'}
                                </span>
                            </div>
                        );
                    })()}
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Running Text (Marquee)</label>
                    <textarea
                        value={(typeof settings.shop_status === 'object' && settings.shop_status?.message) ? settings.shop_status.message : ''}
                        onChange={(e) => {
                            const currentObj = typeof settings?.shop_status === 'object' && settings?.shop_status !== null
                                ? settings.shop_status
                                : { isOpen: true };
                            setSettings({ ...settings, shop_status: { ...currentObj, message: e.target.value } });
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 h-24 focus:outline-none focus:bg-white focus:border-purple-500 transition-colors"
                        placeholder="Teks yang akan muncul di marquee..."
                    />
                    <button
                        onClick={() => updateSetting('shop_status', settings.shop_status)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 mt-4 shadow-xs transition-all"
                    >
                        <Save size={16} /> Simpan Status Toko
                    </button>
                </div>
            </div>

            {/* Android App Version & Download */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Smartphone size={20} className="text-sky-600" />
                            Aplikasi Android
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Atur versi minimum, versi terbaru, link APK, dan mode maintenance aplikasi.
                            Perubahan berlaku setelah tombol simpan ditekan.
                        </p>
                    </div>
                    <a
                        href="/download"
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 inline-flex items-center gap-2 text-xs font-bold text-sky-700 hover:text-sky-800 border border-sky-200 bg-sky-50 px-3.5 py-2 rounded-xl transition-all shadow-xs"
                    >
                        <Download size={14} /> Halaman Download
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                            Versi Minimum yang Masih Didukung
                        </label>
                        <input
                            type="text"
                            value={appConfig.min_version}
                            onChange={(e) => setAppConfig({ min_version: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500 font-mono transition-colors"
                            placeholder="1.0.0"
                        />
                        <p className="text-[11px] text-slate-500 mt-1 font-medium">
                            Versi terpasang di bawah angka ini akan terkunci di layar “Versi sudah kadaluarsa”.
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                            Versi Terbaru
                        </label>
                        <input
                            type="text"
                            value={appConfig.latest_version}
                            onChange={(e) => setAppConfig({ latest_version: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500 font-mono transition-colors"
                            placeholder="1.0.1"
                        />
                        <p className="text-[11px] text-slate-500 mt-1 font-medium">
                            Ditampilkan di halaman download dan dipakai banner “update tersedia”.
                        </p>
                    </div>
                </div>

                <div className="mt-4">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                        Link Unduhan APK (URL Langsung)
                    </label>
                    <input
                        type="url"
                        value={appConfig.download_url}
                        onChange={(e) => setAppConfig({ download_url: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500 font-mono transition-colors"
                        placeholder="https://cdn.noxarianet.web.id/app/noxarianet-1.0.1.apk"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                        Tempel URL file APK langsung (Supabase Storage, GitHub Releases, CDN/VPS). Jangan isi URL
                        halaman <code className="text-purple-700 font-mono">/download</code> agar tombol tidak berputar ke halaman yang sama.
                    </p>
                </div>

                <div className="mt-4">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                        Catatan Rilis (Opsional)
                    </label>
                    <textarea
                        value={appConfig.release_notes}
                        onChange={(e) => setAppConfig({ release_notes: e.target.value })}
                        maxLength={MAX_RELEASE_NOTES_LENGTH}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 h-24 focus:outline-none focus:bg-white focus:border-purple-500 transition-colors"
                        placeholder="Contoh: Perbaikan bug checkout dan peningkatan performa aplikasi."
                    />
                    <p className="text-[11px] text-slate-400 mt-1 font-mono">
                        {String(appConfig.release_notes || '').length}/{MAX_RELEASE_NOTES_LENGTH} karakter.
                    </p>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <p className="text-sm font-bold text-slate-900">Mode Maintenance Aplikasi</p>
                        <p className="text-[11px] text-slate-500 mt-1">
                            Saat aktif, seluruh pengguna aplikasi Android melihat layar maintenance.
                            Pesan yang tampil diambil dari Running Text pada Status Toko. Website tidak terpengaruh.
                        </p>
                        {appConfig.maintenance === true && (
                            <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mt-2 flex items-start gap-2 font-medium">
                                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                                Aplikasi akan masuk mode maintenance setelah pengaturan ini disimpan.
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => setAppConfig({ maintenance: !appConfig.maintenance })}
                        className={`relative w-14 h-7 rounded-full transition-all flex items-center px-1 shrink-0 ${appConfig.maintenance ? 'bg-amber-500' : 'bg-slate-300'}`}
                        aria-pressed={appConfig.maintenance === true}
                        aria-label="Mode maintenance aplikasi"
                    >
                        <div className={`w-5 h-5 bg-white rounded-full transition-all transform ${appConfig.maintenance ? 'translate-x-7' : 'translate-x-0'} shadow-xs`} />
                    </button>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
                    <button
                        onClick={handleSaveAppConfig}
                        disabled={savingAppConfig}
                        className="bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
                    >
                        <Save size={16} /> {savingAppConfig ? 'Menyimpan…' : 'Simpan Pengaturan Aplikasi'}
                    </button>
                    <p className="text-[11px] text-slate-500 font-medium">
                        Naikkan versi minimum hanya setelah link APK benar-benar bisa diunduh.
                    </p>
                </div>
            </div>

            {/* Info Modal Text */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <MessageSquare size={20} className="text-purple-600" />
                            Popup Info Penting
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Kelola teks popup yang muncul saat pengguna membuka halaman utama
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <button
                            onClick={() => updateSetting('info_modal_active', settings.info_modal_active === undefined ? false : !settings.info_modal_active)}
                            className={`relative w-14 h-7 rounded-full transition-all duration-300 flex items-center px-1 ${settings.info_modal_active !== false ? 'bg-emerald-600' : 'bg-slate-300'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 transform ${settings.info_modal_active !== false ? 'translate-x-7' : 'translate-x-0'} shadow-xs`} />
                        </button>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${settings.info_modal_active !== false ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {settings.info_modal_active !== false ? 'Aktif' : 'Nonaktif'}
                        </span>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Pesan Popup</label>
                    <textarea
                        value={settings.info_modal_text || ''}
                        onChange={(e) => setSettings({ ...settings, info_modal_text: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 h-24 focus:outline-none focus:bg-white focus:border-purple-500 transition-colors"
                        placeholder="Masukkan teks popup di sini (misal: Bergabunglah dengan grup WhatsApp kami...)"
                    />
                    <button
                        onClick={() => updateSetting('info_modal_text', settings.info_modal_text)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 mt-4 shadow-xs transition-all"
                    >
                        <Save size={16} /> Simpan Teks Popup
                    </button>
                </div>
            </div>

            {/* Wajib Validasi Akun */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <ShieldCheck size={20} className="text-purple-600" />
                            Wajib Validasi Akun
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Saat aktif, pembeli wajib lolos cek ID ke penyedia sebelum checkout untuk produk yang memerlukan validasi.
                            Nonaktifkan sementara jika endpoint validasi provider sedang gangguan agar transaksi tetap berjalan.
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <button
                            onClick={() => updateSetting('mandatory_validation', settings.mandatory_validation === false)}
                            className={`relative w-14 h-7 rounded-full transition-all duration-300 flex items-center px-1 ${settings.mandatory_validation !== false ? 'bg-emerald-600' : 'bg-slate-300'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 transform ${settings.mandatory_validation !== false ? 'translate-x-7' : 'translate-x-0'} shadow-xs`} />
                        </button>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${settings.mandatory_validation !== false ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {settings.mandatory_validation !== false ? 'Aktif' : 'Nonaktif'}
                        </span>
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Semua channel</span>
                    </div>
                </div>

                {/* Override per channel */}
                <div className="space-y-3 border-t border-slate-100 pt-5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Per Channel</p>
                    {VALIDATION_CHANNEL_ROWS.map((row) => {
                        const mode = channelMode(settings, row.key);
                        return (
                            <div key={row.key} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        {row.icon}
                                        {row.label}
                                    </p>
                                    <p className="text-[11px] text-slate-500 mt-0.5">{row.desc}</p>
                                </div>
                                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shrink-0 shadow-xs">
                                    {VALIDATION_CHANNEL_OPTIONS.map((opt) => {
                                        const active = mode === opt.id;
                                        return (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => updateSetting(row.key, opt.id === 'inherit' ? 'inherit' : opt.id === 'on')}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                                                    active
                                                        ? opt.id === 'off'
                                                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                                            : 'bg-purple-600 text-white'
                                                        : 'text-slate-500 hover:text-slate-800'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {settings.mandatory_validation === false && (
                    <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3 mt-4 font-medium">
                        Validasi akun sedang dilewati di semua channel: pesanan produk dengan cek ID akan langsung diproses tanpa verifikasi ke penyedia. Aktifkan kembali setelah endpoint validasi provider pulih.
                    </p>
                )}
                {settings.mandatory_validation !== false && !isMandatoryValidationForChannel(settings, 'web') && (
                    <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3 mt-4 font-medium">
                        Validasi akun sedang dilewati di website: pembeli web tidak perlu cek ID sebelum checkout, sementara aplikasi Android tetap mewajibkan cek ID.
                    </p>
                )}
            </div>

            {/* Payment Gateway Provider */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Save size={20} className="text-emerald-600" />
                            Provider Payment Gateway
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Pilih provider gateway aktif untuk pembuatan QRIS. Pembeli tidak dapat memilih sendiri.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* FinCloud Option */}
                    <div
                        onClick={() => {
                            setSettings({ ...settings, payment_gateway: 'fincloud' });
                            updateSetting('payment_gateway', 'fincloud');
                        }}
                        className={`cursor-pointer p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                            (settings.payment_gateway || 'fincloud') === 'fincloud'
                                ? 'bg-purple-50 border-purple-300 shadow-xs'
                                : 'bg-slate-50 border-slate-200 hover:border-purple-200'
                        }`}
                    >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                            (settings.payment_gateway || 'fincloud') === 'fincloud'
                                ? 'border-purple-600 bg-purple-600'
                                : 'border-slate-400 bg-white'
                        }`}>
                            {(settings.payment_gateway || 'fincloud') === 'fincloud' && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900">FinCloud (QRIS)</h4>
                                {(settings.payment_gateway || 'fincloud') === 'fincloud' && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-700 rounded-full border border-purple-200">
                                        Aktif
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Gateway bawaan FinCloud API. Invoice dinamis dengan fee otomatis.
                            </p>
                        </div>
                    </div>

                    {/* Sekalipay Gateway Option */}
                    <div
                        onClick={() => {
                            setSettings({ ...settings, payment_gateway: 'sekalipay' });
                            updateSetting('payment_gateway', 'sekalipay');
                        }}
                        className={`cursor-pointer p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                            settings.payment_gateway === 'sekalipay'
                                ? 'bg-purple-50 border-purple-300 shadow-xs'
                                : 'bg-slate-50 border-slate-200 hover:border-purple-200'
                        }`}
                    >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                            settings.payment_gateway === 'sekalipay'
                                ? 'border-purple-600 bg-purple-600'
                                : 'border-slate-400 bg-white'
                        }`}>
                            {settings.payment_gateway === 'sekalipay' && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900">Sekalipay (QRIS)</h4>
                                {settings.payment_gateway === 'sekalipay' && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-700 rounded-full border border-purple-200">
                                        Aktif
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Payment Gateway QRIS resmi Sekalipay dengan settlement otomatis H+0 & webhook instant.
                            </p>
                        </div>
                    </div>

                    {/* Dyqris Option */}
                    <div
                        onClick={() => {
                            setSettings({ ...settings, payment_gateway: 'dyqris' });
                            updateSetting('payment_gateway', 'dyqris');
                        }}
                        className={`cursor-pointer p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                            settings.payment_gateway === 'dyqris'
                                ? 'bg-purple-50 border-purple-300 shadow-xs'
                                : 'bg-slate-50 border-slate-200 hover:border-purple-200'
                        }`}
                    >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                            settings.payment_gateway === 'dyqris'
                                ? 'border-purple-600 bg-purple-600'
                                : 'border-slate-400 bg-white'
                        }`}>
                            {settings.payment_gateway === 'dyqris' && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900">Dyqris (Mini QRIS)</h4>
                                {settings.payment_gateway === 'dyqris' && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-700 rounded-full border border-purple-200">
                                        Aktif
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Mini QRIS Payment Gateway dengan nominal unik real-time dan notifikasi PayHook.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Dyqris Info Card */}
                {settings.payment_gateway === 'dyqris' && (
                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex items-start gap-3 text-xs text-purple-900">
                            <span className="text-base leading-none">ℹ️</span>
                            <div>
                                <p className="font-bold text-purple-900 mb-0.5">Konfigurasi Dyqris Gateway</p>
                                <p className="text-slate-600">
                                    Kredensial Dyqris (Merchant API Key, Webhook Secret, Base URL) dikelola secara aman melalui environment variables server (<code className="text-purple-700 font-bold">.env</code>).
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sekalipay Gateway Config */}
                {settings.payment_gateway === 'sekalipay' && (
                    <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                        <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex items-start gap-3 text-xs text-purple-900">
                            <span className="text-base leading-none">ℹ️</span>
                            <div>
                                <p className="font-bold text-purple-900 mb-0.5">Kredensial Sekalipay Gateway</p>
                                <p className="text-slate-600">
                                    Kredensial Sekalipay (API Key, Secret Key, Merchant Code, Base URL) dikelola secara aman melalui environment variables server (<code className="text-purple-700 font-bold">.env</code>).
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                Payment Code (Ketik Manual)
                            </label>
                            <input
                                type="text"
                                value={settings.sekalipay_gateway_config?.payment_code ?? 'QRIS'}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    sekalipay_gateway_config: {
                                        ...(typeof settings.sekalipay_gateway_config === 'object' ? settings.sekalipay_gateway_config : {}),
                                        payment_code: e.target.value
                                    }
                                })}
                                placeholder="Contoh: QRIS, QRISREALTIME, QRIS_CUSTOM, dll."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-purple-500 font-mono transition-colors"
                            />
                            <p className="text-[11px] text-slate-500 mt-1">
                                Masukkan kode channel pembayaran QRIS Sekalipay secara manual (default: <code className="text-purple-700 font-mono">QRIS</code>). Contoh: <code className="text-slate-600 font-mono">QRIS</code>, <code className="text-slate-600 font-mono">QRISREALTIME</code>, <code className="text-slate-600 font-mono">QRIS_CUSTOM</code>.
                            </p>
                        </div>

                        <button
                            onClick={() => updateSetting('sekalipay_gateway_config', {
                                payment_code: (settings.sekalipay_gateway_config?.payment_code || 'QRIS').trim()
                            })}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
                        >
                            <Save size={15} /> Simpan Payment Code Sekalipay
                        </button>
                    </div>
                )}

                {/* FinCloud Info Card */}
                {(settings.payment_gateway || 'fincloud') === 'fincloud' && (
                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3 text-xs text-blue-900">
                            <span className="text-base leading-none">ℹ️</span>
                            <div>
                                <p className="font-bold text-blue-900 mb-0.5">Konfigurasi FinCloud Gateway</p>
                                <p className="text-slate-600">
                                    Kredensial FinCloud dikelola secara aman melalui environment variables server (<code className="text-blue-700 font-bold">.env</code>).
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Admin Security */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <LogOut size={20} className="text-rose-600 rotate-180" />
                        Keamanan Admin
                    </h3>
                    <p className="text-xs text-slate-500">Ubah password login dashboard Anda. Password lama diperlukan untuk konfirmasi.</p>
                </div>
                <div className="grid grid-cols-1 gap-4 max-w-md">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Password Saat Ini</label>
                        <div className="relative">
                            <input
                                type={showCurrentPassword ? "text" : "password"}
                                placeholder="Masukkan password saat ini"
                                value={passwordForm.current_password}
                                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pr-10 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500 transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                            >
                                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Password Baru</label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                placeholder="Minimal 8 karakter"
                                value={passwordForm.new_password}
                                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pr-10 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500 transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                            >
                                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Konfirmasi Password Baru</label>
                        <div className="relative">
                            <input
                                type={showSettingsPassword ? "text" : "password"}
                                placeholder="Ulangi password baru"
                                value={passwordForm.confirm_password}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pr-10 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500 transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowSettingsPassword(!showSettingsPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                            >
                                {showSettingsPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleChangePassword}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 mt-6 transition-all shadow-xs"
                >
                    <Save size={16} /> Ubah Password
                </button>
            </div>
        </div>
    );
};

export default SettingsTab;
