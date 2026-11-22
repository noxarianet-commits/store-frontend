import { Globe, Smartphone } from 'lucide-react';
import { notifyWarning } from '../../utils/notify';

const DEFAULT_CHANNELS = ['web', 'app'];

function productChannels(product) {
    return Array.isArray(product?.available_channels) && product.available_channels.length > 0
        ? product.available_channels
        : DEFAULT_CHANNELS;
}

/**
 * Toggle channel tampil produk (web / app).
 * Mematikan "App" menyembunyikan produk dari katalog Android tanpa
 * menyembunyikannya dari web. Minimal satu channel harus tetap aktif.
 */
const ChannelToggle = ({ product, onChange, className = '' }) => {
    const channels = productChannels(product);

    const toggleChannel = (channel) => {
        const next = channels.includes(channel)
            ? channels.filter(c => c !== channel)
            : [...channels, channel];

        if (next.length === 0) {
            notifyWarning('Minimal satu channel harus aktif.');
            return;
        }

        onChange?.(product.id, next);
    };

    return (
        <div
            className={`flex items-center gap-1 bg-slate-100 border border-slate-200 p-1 rounded-xl ${className}`}
            onClick={(e) => e.stopPropagation()}
            title="Channel tempat produk ini tampil"
        >
            <button
                type="button"
                onClick={() => toggleChannel('web')}
                aria-pressed={channels.includes('web')}
                title={channels.includes('web') ? 'Sembunyikan dari Web' : 'Tampilkan di Web'}
                className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase transition-all flex items-center gap-1 ${
                    channels.includes('web')
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                }`}
            >
                <Globe size={10} /> Web
            </button>
            <button
                type="button"
                onClick={() => toggleChannel('app')}
                aria-pressed={channels.includes('app')}
                title={channels.includes('app') ? 'Sembunyikan dari App' : 'Tampilkan di App'}
                className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase transition-all flex items-center gap-1 ${
                    channels.includes('app')
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                }`}
            >
                <Smartphone size={10} /> App
            </button>
        </div>
    );
};

export default ChannelToggle;
