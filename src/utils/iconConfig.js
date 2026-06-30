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
    scissors: 'bg-gray-100 border border-gray-200 text-gray-700',
    music: 'bg-green-50 border border-green-100 text-[#1DB954]',
    film: 'bg-red-50 border border-red-100 text-[#E50914]',
    palette: 'bg-indigo-50 border border-indigo-100 text-indigo-600',
    brain: 'bg-teal-50 border border-teal-100 text-teal-600',
    youtube: 'bg-red-50 border border-red-100 text-red-600',
    tv: 'bg-blue-50 border border-blue-100 text-blue-600',
    clapperboard: 'bg-purple-50 border border-purple-100 text-purple-600',
    play: 'bg-orange-50 border border-orange-100 text-orange-600',
    sparkles: 'bg-pink-50 border border-pink-100 text-pink-600',
    book: 'bg-emerald-50 border border-emerald-100 text-emerald-600',
    gamepad: 'bg-yellow-50 border border-yellow-100 text-yellow-600',
    swords: 'bg-rose-50 border border-rose-100 text-rose-600',
    trophy: 'bg-amber-50 border border-amber-100 text-amber-600',
    joystick: 'bg-indigo-50 border border-indigo-100 text-indigo-600',
    target: 'bg-red-50 border border-red-100 text-red-600',
    monitor: 'bg-blue-50 border border-blue-100 text-blue-600',
    wallet: 'bg-emerald-50 border border-emerald-100 text-emerald-600',
    globe: 'bg-indigo-50 border border-indigo-100 text-indigo-600',
    server: 'bg-orange-50 border border-orange-100 text-orange-600',
    code: 'bg-blue-50 border border-blue-100 text-blue-600',
};

/**
 * Badge color styles by color key.
 */
export const badgeColorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
    red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-100' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
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
