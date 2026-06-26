import {
    Smartphone, Globe, Scissors, Music, Film, Palette, Brain,
    PlayCircle, Tv, Clapperboard, Play, Sparkles, BookOpen,
    Gamepad2, Swords, Trophy, Joystick, Target, Monitor,
    CreditCard, ShoppingCart, Zap, Heart, Gift, Ghost,
    Crosshair, Flame, Shield, Star, Crown, Rocket,
    Server, Code, Wallet,
} from 'lucide-react';

/**
 * Centralized icon map — maps icon key strings to Lucide icon components.
 * Used across LandingPage, ProductCard, CategoryGrid, etc.
 */
export const iconMap = {
    smartphone: Smartphone,
    globe: Globe,
    scissors: Scissors,
    music: Music,
    film: Film,
    palette: Palette,
    brain: Brain,
    youtube: PlayCircle,
    tv: Tv,
    clapperboard: Clapperboard,
    play: Play,
    sparkles: Sparkles,
    book: BookOpen,
    gamepad: Gamepad2,
    swords: Swords,
    trophy: Trophy,
    joystick: Joystick,
    target: Target,
    monitor: Monitor,
    card: CreditCard,
    cart: ShoppingCart,
    zap: Zap,
    heart: Heart,
    gift: Gift,
    ghost: Ghost,
    crosshair: Crosshair,
    flame: Flame,
    shield: Shield,
    star: Star,
    crown: Crown,
    rocket: Rocket,
    server: Server,
    code: Code,
    wallet: Wallet,
};

/**
 * Icon color/style mapping for product icons.
 * Each key maps to Tailwind classes for the icon container.
 */
export const iconColorMap = {
    scissors: 'bg-gradient-to-b from-gray-100/10 to-transparent border border-white/10 text-gray-200',
    music: 'bg-gradient-to-b from-[#1DB954]/15 to-transparent border border-[#1DB954]/20 text-[#1DB954]',
    film: 'bg-gradient-to-b from-[#E50914]/15 to-transparent border border-[#E50914]/20 text-[#E50914]',
    palette: 'bg-gradient-to-b from-[#00C4CC]/15 to-[#7D2AE8]/15 border border-[#7D2AE8]/20 text-cyan-300',
    brain: 'bg-gradient-to-b from-teal-500/15 to-transparent border border-teal-500/20 text-teal-300',
    youtube: 'bg-gradient-to-b from-red-500/15 to-transparent border border-red-500/20 text-red-400',
    tv: 'bg-gradient-to-b from-blue-500/15 to-transparent border border-blue-500/20 text-blue-300',
    clapperboard: 'bg-gradient-to-b from-purple-500/15 to-transparent border border-purple-500/20 text-purple-300',
    play: 'bg-gradient-to-b from-orange-500/15 to-transparent border border-orange-500/20 text-orange-300',
    sparkles: 'bg-gradient-to-b from-pink-500/15 to-transparent border border-pink-500/20 text-pink-300',
    book: 'bg-gradient-to-b from-emerald-500/15 to-transparent border border-emerald-500/20 text-emerald-300',
    gamepad: 'bg-gradient-to-b from-yellow-500/15 to-transparent border border-yellow-500/20 text-yellow-300',
    swords: 'bg-gradient-to-b from-rose-500/15 to-transparent border border-rose-500/20 text-rose-300',
    trophy: 'bg-gradient-to-b from-amber-500/15 to-transparent border border-amber-500/20 text-amber-300',
    joystick: 'bg-gradient-to-b from-indigo-500/15 to-transparent border border-indigo-500/20 text-indigo-300',
    target: 'bg-gradient-to-b from-red-600/15 to-transparent border border-red-600/20 text-red-400',
    monitor: 'bg-gradient-to-b from-blue-600/15 to-transparent border border-blue-600/20 text-blue-300',
    wallet: 'bg-gradient-to-b from-emerald-500/15 to-transparent border border-emerald-500/20 text-emerald-300',
    globe: 'bg-gradient-to-b from-indigo-500/15 to-transparent border border-indigo-500/20 text-indigo-300',
    server: 'bg-gradient-to-b from-orange-500/15 to-transparent border border-orange-500/20 text-orange-300',
    code: 'bg-gradient-to-b from-blue-500/15 to-transparent border border-blue-500/20 text-blue-300',
};

/**
 * Badge color styles by color key.
 */
export const badgeColorMap = {
    blue: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/20' },
    green: { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/20' },
    red: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/20' },
    purple: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/20' },
    emerald: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    yellow: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    cyan: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/20' },
    orange: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/20' },
};

/**
 * Default category icon mapping by slug.
 */
export const categoryIconMap = {
    'aplikasi-premium': 'smartphone',
    'top-up-game': 'gamepad',
    'transfer-e-wallet': 'wallet',
    'layanan-jasa-bot': 'globe',
};

/**
 * Check if a product is sold out based on its variants.
 * @param {object} product
 * @returns {boolean}
 */
export const isProductSoldOut = (product) => {
    if (product.is_service_table || (product.category && product.category.toLowerCase().includes('jasa'))) return false;
    if (product.status === 'sold_out') return true;
    if (product.variants && Array.isArray(product.variants)) {
        if (product.variants.length === 0) return true;
        return product.variants.every(v => v.stock === 0 || v.stock === null || v.stock === undefined);
    }
    return false;
};
