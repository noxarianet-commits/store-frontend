
import { Loader2, Upload, ExternalLink, Trash2, ImageIcon } from 'lucide-react';

const BannersTab = ({ banners, fileInputRef, handleBannerUpload, deleteBanner, uploadingBanner }) => (
    <div className="space-y-8">
        <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white">Daftar Banner Promo</h3>
                    <p className="text-xs text-gray-500">Upload gambar banner (JPG, PNG). Rekomendasi rasio 21:9 (Contoh: 1280x550px)</p>
                </div>
                <div className="relative">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleBannerUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingBanner}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-all disabled:opacity-50"
                    >
                        {uploadingBanner ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                        Upload Banner Baru
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {banners.map((url, idx) => (
                    <div key={idx} className="relative aspect-[21/9] rounded-2xl overflow-hidden border border-white/10 group shadow-xl bg-black/20">
                        <img src={url} className="w-full h-full object-cover" alt={`Banner ${idx + 1}`} />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                            <a href={url} target="_blank" rel="noreferrer" className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white backdrop-blur-md transition-all">
                                <ExternalLink size={20} />
                            </a>
                            <button
                                onClick={() => deleteBanner(idx)}
                                className="p-3 bg-red-500/20 hover:bg-red-500 rounded-xl text-red-500 hover:text-white backdrop-blur-md transition-all"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}
                {banners.length === 0 && (
                    <div className="col-span-full py-20 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-gray-500">
                        <ImageIcon size={48} className="mb-4 opacity-20" />
                        <p>Belum ada banner promo.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
);

export default BannersTab;
