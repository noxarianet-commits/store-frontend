import {
    Smartphone, Globe, Scissors,
    Music, Film, Palette, Brain,
    PlayCircle, Tv, Clapperboard,
    Play, Sparkles, BookOpen,
    Gamepad2, Swords, Trophy,
    Joystick, Target, Monitor,
    CreditCard, ShoppingCart, Zap,
    Heart, Gift, Ghost,
    Crosshair, Flame, Shield,
    Star, Crown, Rocket
} from 'lucide-react';

export const iconMap = {
    smartphone: Smartphone, globe: Globe, scissors: Scissors,
    music: Music, film: Film, palette: Palette, brain: Brain,
    youtube: PlayCircle, tv: Tv, clapperboard: Clapperboard,
    play: Play, sparkles: Sparkles, book: BookOpen,
    gamepad: Gamepad2, swords: Swords, trophy: Trophy,
    joystick: Joystick, target: Target, monitor: Monitor,
    card: CreditCard, cart: ShoppingCart, zap: Zap,
    heart: Heart, gift: Gift, ghost: Ghost,
    crosshair: Crosshair, flame: Flame, shield: Shield,
    star: Star, crown: Crown, rocket: Rocket,
};

export const iconOptions = Object.keys(iconMap).map(key => ({
    value: key,
    label: key.charAt(0).toUpperCase() + key.slice(1)
}));
