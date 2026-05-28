import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, Package, Image as ImageIcon, Settings, 
    LogOut, Plus, Edit, Trash2, Save, X, 
    Store, AlertCircle, CheckCircle2, ChevronRight, Search, 
    Globe, Smartphone, Scissors, Music, Film, Palette, Brain, 
    PlayCircle, Tv, Clapperboard, Play, Sparkles, BookOpen,
    ShoppingBag, User, Mail, Calendar, ExternalLink, Upload, Loader2,
    Gamepad2, Swords, Trophy, Joystick, Target, Monitor, CreditCard, ShoppingCart, Zap, Heart, Gift,
    Ghost, Crosshair, Flame, Shield, Star, Crown, Rocket, Menu, ChevronDown, Eye, EyeOff,
    TrendingUp, BarChart3, DollarSign
} from 'lucide-react';
import api from '../api';
import Swal from 'sweetalert2';

// Icon mapping helper
const IconRenderer = ({ name, size = 20 }) => {
    const icons = {
        smartphone: <Smartphone size={size} />,
        globe: <Globe size={size} />,
        scissors: <Scissors size={size} />,
        music: <Music size={size} />,
        film: <Film size={size} />,
        palette: <Palette size={size} />,
        brain: <Brain size={size} />,
        youtube: <PlayCircle size={size} />,
        tv: <Tv size={size} />,
        clapperboard: <Clapperboard size={size} />,
        play: <Play size={size} />,
        sparkles: <Sparkles size={size} />,
        book: <BookOpen size={size} />,
        gamepad: <Gamepad2 size={size} />,
        swords: <Swords size={size} />,
        trophy: <Trophy size={size} />,
        joystick: <Joystick size={size} />,
        target: <Target size={size} />,
        monitor: <Monitor size={size} />,
        card: <CreditCard size={size} />,
        cart: <ShoppingCart size={size} />,
        zap: <Zap size={size} />,
        heart: <Heart size={size} />,
        gift: <Gift size={size} />,
        ghost: <Ghost size={size} />,
        crosshair: <Crosshair size={size} />,
        flame: <Flame size={size} />,
        shield: <Shield size={size} />,
        star: <Star size={size} />,
        crown: <Crown size={size} />,
        rocket: <Rocket size={size} />,
    };
    return icons[name] || <Package size={size} />;
};

// Icon options for product form select
const iconOptions = [
    { label: 'Ponsel', value: 'smartphone' },
    { label: 'Web/Dunia', value: 'globe' },
    { label: 'Edit/Gunting', value: 'scissors' },
    { label: 'Musik', value: 'music' },
    { label: 'Film', value: 'film' },
    { label: 'Desain/Palet', value: 'palette' },
    { label: 'AI/Otak', value: 'brain' },
    { label: 'YouTube/Play', value: 'youtube' },
    { label: 'TV', value: 'tv' },
    { label: 'Papan Film', value: 'clapperboard' },
    { label: 'Putar', value: 'play' },
    { label: 'Kilau', value: 'sparkles' },
    { label: 'Buku', value: 'book' },
    { label: 'Game/Gamepad', value: 'gamepad' },
    { label: 'Perang/Pedang', value: 'swords' },
    { label: 'Pemenang/Piala', value: 'trophy' },
    { label: 'Joystick', value: 'joystick' },
    { label: 'Target', value: 'target' },
    { label: 'Monitor', value: 'monitor' },
    { label: 'Kartu Kredit', value: 'card' },
    { label: 'Keranjang', value: 'cart' },
    { label: 'Cepat/Kilat', value: 'zap' },
    { label: 'Hati', value: 'heart' },
    { label: 'Hadiah', value: 'gift' },
    { label: 'Hantu', value: 'ghost' },
    { label: 'Crosshair', value: 'crosshair' },
    { label: 'Api', value: 'flame' },
    { label: 'Perisai', value: 'shield' },
    { label: 'Bintang', value: 'star' },
    { label: 'Mahkota', value: 'crown' },
    { label: 'Roket', value: 'rocket' },
];

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-5 sm:p-6 hover:border-purple-500/30 transition-all group">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                <Icon className={color.replace('bg-', 'text-')} size={24} />
            </div>
            <TrendingUp size={16} className="text-green-500" />
        </div>
        <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
        </div>
    </div>
);

const SimpleChart = ({ data }) => {
    if (!data || data.length === 0) return null;
    const maxValue = Math.max(...data.map(d => d.value), 1);
    
    return (
        <div className="h-48 w-full flex items-end gap-1 sm:gap-2 pt-4">
            {data.map((item, idx) => {
                const height = (item.value / maxValue) * 100;
                return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="relative w-full h-full flex items-end justify-center">
                            <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                className="w-full bg-gradient-to-t from-purple-600/40 to-purple-500 rounded-t-lg group-hover:from-purple-600/60 group-hover:to-purple-400 transition-all cursor-pointer relative"
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-gray-900 text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-20">
                                    Rp {item.value.toLocaleString('id-ID')}
                                </div>
                            </motion.div>
                        </div>
                        <span className="text-[10px] text-gray-500 font-medium">{item.date}</span>
                    </div>
                )
            })}
        </div>
    );
};

const AdminDashboard = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('adminToken') !== null);
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [activeTab, setActiveTab] = useState(localStorage.getItem('adminActiveTab') || 'products');
    const [loading, setLoading] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showSettingsPassword, setShowSettingsPassword] = useState(false);

    // Data states
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [settings, setSettings] = useState({
        shop_status: { isOpen: true, message: '' },
        banners: [],
        site_content: { heroTitle: '', heroSubtitle: '', heroDesc: '' },
        info_modal_image: '/info.jpeg',
        initial_capital: 0
    });

    // Sekalipay states
    const [sekalipayProducts, setSekalipayProducts] = useState([]);
    const [sekalipayBalance, setSekalipayBalance] = useState(null);
    const [sekalipaySync, setSekalipaySync] = useState(null);
    const [sekalipayLoading, setSekalipayLoading] = useState(false);
    const [sekalipaySearch, setSekalipaySearch] = useState('');
    const [syncInProgress, setSyncInProgress] = useState(false);
    const [globalMarkupValue, setGlobalMarkupValue] = useState(0);
    const [expandedProduct, setExpandedProduct] = useState(null);

    // Form states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({
        name: '',
        category: '',
        icon: 'smartphone',
        is_active: true,
        variants: [{ name: '', price: 0 }]
    });

    const fileInputRef = useRef(null);

    const [authForm, setAuthForm] = useState({
        username: '',
        password: ''
    });

    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [orderForm, setOrderForm] = useState({
        id: '',
        product: '',
        variant: '',
        price: 0,
        wa_number: '',
        email: '',
        testimonial: ''
    });

    useEffect(() => {
        if (isAuthenticated) {
            localStorage.setItem('adminActiveTab', activeTab);
            if (activeTab === 'sekalipay') {
                fetchSekalipayData();
            } else {
                fetchData();
            }
        }
    }, [isAuthenticated, activeTab]);

    const fetchSekalipayData = async () => {
        setSekalipayLoading(true);
        try {
            const [itemsRes, statusRes, balanceRes] = await Promise.all([
                api.get('/admin/sekalipay/admin/items'),
                api.get('/admin/sekalipay/admin/sync-status'),
                api.get('/admin/sekalipay/admin/balance').catch(() => ({ data: null })),
            ]);
            setSekalipayProducts(itemsRes.data || []);
            setSekalipaySync(statusRes.data?.lastSync || null);
            if (balanceRes.data) setSekalipayBalance(balanceRes.data);
        } catch (err) {
            console.error('Sekalipay fetch error:', err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                handleLogout();
            }
        } finally {
            setSekalipayLoading(false);
        }
    };

    const handleSync = async (type = 'full') => {
        setSyncInProgress(true);
        try {
            const res = await api.post('/admin/sekalipay/admin/sync', { type });
            if (res.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Sinkronisasi Berhasil!',
                    text: `${res.data.productCount} produk berhasil disinkronkan`,
                    toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
                    background: '#0E0E0E', color: '#fff'
                });
                fetchSekalipayData();
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Sinkronisasi Gagal',
                text: err.response?.data?.error || err.message,
                background: '#0E0E0E', color: '#fff'
            });
        } finally {
            setSyncInProgress(false);
        }
    };

    const handleMarkupUpdate = async (productId, variantId, markup) => {
        try {
            const body = { markup: parseInt(markup) };
            if (variantId) body.variant_id = variantId;
            await api.put(`/admin/sekalipay/admin/items/${productId}/markup`, body);
            Swal.fire({
                icon: 'success', title: 'Markup Diperbarui',
                toast: true, position: 'top-end', showConfirmButton: false, timer: 2000,
                background: '#0E0E0E', color: '#fff'
            });
            fetchSekalipayData();
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Gagal Update Markup', text: err.message, background: '#0E0E0E', color: '#fff' });
        }
    };

    const handleToggleProduct = async (productId) => {
        try {
            await api.put(`/admin/sekalipay/admin/items/${productId}/toggle`);
            fetchSekalipayData();
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Gagal', text: err.message, background: '#0E0E0E', color: '#fff' });
        }
    };

    const handleGlobalMarkup = async () => {
        const result = await Swal.fire({
            title: 'Terapkan Markup Global?',
            text: `Semua varian akan di-markup Rp ${parseInt(globalMarkupValue || 0).toLocaleString('id-ID')}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#9333ea',
            cancelButtonColor: '#1f1f1f',
            confirmButtonText: 'Ya, Terapkan!',
            cancelButtonText: 'Batal',
            background: '#0E0E0E', color: '#fff'
        });
        if (result.isConfirmed) {
            try {
                await api.put('/admin/sekalipay/admin/global-markup', { markup: parseInt(globalMarkupValue || 0) });
                Swal.fire({
                    icon: 'success', title: 'Markup Global Diterapkan!',
                    toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
                    background: '#0E0E0E', color: '#fff'
                });
                fetchSekalipayData();
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Gagal', text: err.message, background: '#0E0E0E', color: '#fff' });
            }
        }
    };

    const getStats = () => {
        const totalRevenue = orders.reduce((sum, order) => sum + (order.price || 0), 0);
        const totalOrders = orders.length;
        
        // Calculate daily sales for chart (last 7 days)
        const dailyData = {};
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        last7Days.forEach(date => dailyData[date] = 0);
        orders.forEach(order => {
            const date = new Date(order.timestamp).toISOString().split('T')[0];
            if (dailyData[date] !== undefined) {
                dailyData[date] += order.price || 0;
            }
        });

        const chartData = last7Days.map(date => ({
            date: date.split('-').slice(1).join('/'),
            value: dailyData[date]
        }));

        return { totalRevenue, totalOrders, chartData };
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'orders') {
                const orderRes = await api.get('/orders');
                setOrders(orderRes.data || []);
            } else {
                const [prodRes, settingsRes] = await Promise.all([
                    api.get('/services'),
                    api.get('/settings')
                ]);
                setProducts(prodRes.data || []);
                setSettings({
                    shop_status: settingsRes.data.shop_status || { isOpen: true, message: '' },
                    banners: settingsRes.data.banners || [],
                    site_content: settingsRes.data.site_content || { heroTitle: '', heroSubtitle: '', heroDesc: '' },
                    info_modal_image: settingsRes.data.info_modal_image || '/info.jpeg',
                    initial_capital: settingsRes.data.initial_capital || 0
                });
            }
        } catch (err) {
            console.error('Fetch error:', err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                handleLogout();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/admin/login', loginData);
            if (res.data.success) {
                localStorage.setItem('adminToken', res.data.token);
                setIsAuthenticated(true);
                Swal.fire({
                    icon: 'success',
                    title: 'Selamat Datang Admin!',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    background: '#0E0E0E',
                    color: '#fff'
                });
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Login Gagal',
                text: err.response?.data?.error || 'Kredensial salah!',
                background: '#0E0E0E',
                color: '#fff'
            });
        }
    };

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Yakin ingin keluar?',
            text: "Anda akan keluar dari sesi admin.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#1f1f1f',
            confirmButtonText: 'Ya, Logout',
            cancelButtonText: 'Batal',
            background: '#0E0E0E',
            color: '#fff'
        });

        if (result.isConfirmed) {
            setIsAuthenticated(false);
            localStorage.removeItem('adminToken');
        }
    };

    // ════ PRODUCT ACTIONS ════

    const openProductModal = (prod = null, defaultCategory = '') => {
        if (prod) {
            setEditingProduct(prod);
            setProductForm({
                name: prod.name || '',
                category: prod.category || '',
                icon: prod.icon || 'smartphone',
                is_active: prod.is_active !== undefined ? prod.is_active : true,
                variants: prod.variants || [{ name: '', price: 0 }],
                features: prod.features || []
            });
        } else {
            setEditingProduct(null);
            setProductForm({
                name: '',
                category: defaultCategory || 'Layanan Jasa',
                icon: defaultCategory.toLowerCase().includes('game') ? 'gamepad' : defaultCategory.toLowerCase().includes('jasa') ? 'globe' : 'smartphone',
                is_active: true,
                variants: [{ name: '', price: 0 }],
                features: []
            });
        }
        setIsModalOpen(true);
    };

    const saveProduct = async () => {
        try {
            const filteredPayload = {
                name: productForm.name,
                category: productForm.category,
                icon: productForm.icon,
                is_active: productForm.is_active,
                variants: productForm.variants,
                features: productForm.features || []
            };
            
            if (editingProduct) {
                await api.put(`/services/${editingProduct.id}`, filteredPayload);
            } else {
                await api.post('/services', filteredPayload);
            }
            setIsModalOpen(false);
            fetchData();
            Swal.fire({ icon: 'success', title: 'Berhasil!', background: '#0E0E0E', color: '#fff' });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Gagal!', text: err.message, background: '#0E0E0E', color: '#fff' });
        }
    };

    const deleteProduct = async (id) => {
        const result = await Swal.fire({
            title: 'Hapus Produk?',
            text: "Data tidak bisa dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#9333ea',
            cancelButtonColor: '#1f1f1f',
            confirmButtonText: 'Ya, Hapus!',
            background: '#0E0E0E',
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/services/${id}`);
                fetchData();
                Swal.fire({ icon: 'success', title: 'Terhapus!', background: '#0E0E0E', color: '#fff' });
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Gagal!', text: err.message, background: '#0E0E0E', color: '#fff' });
            }
        }
    };

    const openOrderModal = (order) => {
        setEditingOrder(order);
        setOrderForm({ ...order });
        setIsOrderModalOpen(true);
    };

    const saveOrder = async () => {
        try {
            await api.put(`/orders/${orderForm.id}`, orderForm);
            setIsOrderModalOpen(false);
            fetchData();
            Swal.fire({ icon: 'success', title: 'Berhasil!', background: '#0E0E0E', color: '#fff' });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Gagal!', text: err.message, background: '#0E0E0E', color: '#fff' });
        }
    };

    const deleteOrder = async (id) => {
        const result = await Swal.fire({
            title: 'Hapus Pesanan?',
            text: "Data pesanan akan dihapus permanen!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#1f1f1f',
            confirmButtonText: 'Ya, Hapus!',
            background: '#0E0E0E',
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/orders/${id}`);
                fetchData();
                Swal.fire({ icon: 'success', title: 'Terhapus!', background: '#0E0E0E', color: '#fff' });
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Gagal!', text: err.message, background: '#0E0E0E', color: '#fff' });
            }
        }
    };

    const handleBannerUpload = async (e) => {
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
            const updatedBanners = [...settings.banners, newUrl];
            
            // Auto save to settings
            await api.put('/settings/banners', { value: updatedBanners });
            setSettings(prev => ({ ...prev, banners: updatedBanners }));
            
            Swal.fire({ icon: 'success', title: 'Banner Terupload!', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, background: '#0E0E0E', color: '#fff' });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Gagal Upload!', text: err.message, background: '#0E0E0E', color: '#fff' });
        } finally {
            setUploadingBanner(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const deleteBanner = async (idx) => {
        const updatedBanners = settings.banners.filter((_, i) => i !== idx);
        try {
            await api.put('/settings/banners', { value: updatedBanners });
            setSettings(prev => ({ ...prev, banners: updatedBanners }));
            Swal.fire({ icon: 'success', title: 'Banner Dihapus', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, background: '#0E0E0E', color: '#fff' });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Gagal Hapus!', background: '#0E0E0E', color: '#fff' });
        }
    };

    const updateSetting = async (key, value) => {
        try {
            await api.put(`/settings/${key}`, { value });
            setSettings(prev => ({ ...prev, [key]: value }));
            Swal.fire({
                icon: 'success',
                title: 'Pengaturan Disimpan',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
                background: '#0E0E0E',
                color: '#fff'
            });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Gagal!', background: '#0E0E0E', color: '#fff' });
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0A031A] px-4">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-[#0E0E0E] border border-white/10 rounded-3xl p-8 shadow-2xl"
                >
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4 border border-purple-500/20">
                            <Store className="text-purple-500" size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Panel Admin</h1>
                        <p className="text-gray-500 text-sm">Sistem Manajemen noxarianet</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-widest">Nama Pengguna</label>
                            <input 
                                type="text"
                                value={loginData.username}
                                onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500/50 transition-all"
                                placeholder="Masukkan username"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-widest">Kata Sandi</label>
                            <div className="relative">
                                <input 
                                    type={showLoginPassword ? "text" : "password"}
                                    value={loginData.password}
                                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pr-12 text-white focus:outline-none focus:border-purple-500/50 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <button 
                            type="submit"
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            Masuk Panel Dashboard
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'sekalipay', label: 'Sekalipay', icon: Zap },
        { id: 'revenue', label: 'Pendapatan', icon: DollarSign },
        { id: 'products', label: 'Produk', icon: Package },
        { id: 'orders', label: 'Pesanan', icon: ShoppingBag },
        { id: 'banners', label: 'Banner & Promo', icon: ImageIcon },
        { id: 'settings', label: 'Pengaturan Toko', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#0A031A] text-gray-200 flex flex-col md:flex-row">
            
            {/* Mobile Navbar */}
            <div className="md:hidden bg-[#0E0E0E] border-b border-white/5 p-4 flex justify-between items-center relative z-[60]">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" className="w-8 h-8 rounded-lg" alt="" />
                    <span className="text-xl font-bold text-white">noxaria<span className="text-purple-400">net</span></span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2">
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                
                {/* Mobile Dropdown */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 bg-[#0E0E0E] border-b border-white/5 shadow-2xl flex flex-col p-4 z-[60]"
                        >
                            {menuItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all mb-2 ${
                                        activeTab === item.id 
                                            ? 'bg-purple-600 text-white' 
                                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </button>
                            ))}
                            <button 
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all mt-4"
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 bg-[#0E0E0E] border-r border-white/5 p-6 flex-col">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <img src="/logo.png" className="w-8 h-8 rounded-lg" alt="" />
                    <span className="text-xl font-bold text-white">noxaria<span className="text-purple-400">net</span></span>
                </div>

                <nav className="flex-1 space-y-2">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                activeTab === item.id 
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/10' 
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all mt-10"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </aside>

            <main className="flex-1 p-6 md:p-10 overflow-y-auto max-h-screen">

                {/* ═══ SAPAAN OWNER MARQUEE ═══ */}
                <div className="mb-8 rounded-2xl overflow-hidden border border-purple-500/20 bg-gradient-to-r from-[#1a0a35] via-[#120825] to-[#1a0a35] relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-transparent to-purple-600/5 pointer-events-none"></div>
                    <div className="py-5 overflow-hidden whitespace-nowrap">
                        <div className="inline-block animate-marquee-slow">
                            <span className="text-2xl md:text-3xl font-extrabold tracking-wide">
                                <span className="text-purple-400">✦</span>
                                <span className="text-white mx-4">Selamat Datang,</span>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-300">ANDIKA KHAIRUL .A</span>
                                <span className="text-gray-500 mx-6">—</span>
                                <span className="text-gray-400 text-lg font-semibold">Bekerjasama dengan</span>
                                <span className="text-white mx-3 font-bold">PT BELANJA INDONESIA</span>
                                <span className="text-purple-400 mx-2">&</span>
                                <span className="text-white font-bold">SEKALIPAY</span>
                                <span className="text-purple-400 mx-4">✦</span>
                                <span className="text-gray-600 mx-8">|</span>
                                <span className="text-purple-400">✦</span>
                                <span className="text-white mx-4">Selamat Datang,</span>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-300">ANDIKA KHAIRUL .A</span>
                                <span className="text-gray-500 mx-6">—</span>
                                <span className="text-gray-400 text-lg font-semibold">Bekerjasama dengan</span>
                                <span className="text-white mx-3 font-bold">PT BELANJA INDONESIA</span>
                                <span className="text-purple-400 mx-2">&</span>
                                <span className="text-white font-bold">SEKALIPAY</span>
                                <span className="text-purple-400 mx-4">✦</span>
                            </span>
                        </div>
                    </div>
                </div>
                
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white capitalize">
                            {activeTab === 'dashboard' ? 'Beranda & Statistik' : 
                             activeTab === 'sekalipay' ? 'Integrasi Sekalipay' :
                             activeTab === 'revenue' ? 'Laporan Pendapatan' : 
                             activeTab === 'products' ? 'Manajemen Produk' : 
                             activeTab === 'orders' ? 'Daftar Pesanan' : 
                             activeTab === 'banners' ? 'Banner & Promo' : 
                             'Pengaturan Toko'}
                        </h2>
                        <p className="text-sm text-gray-500">Kelola konten dan fitur website noxarianet</p>
                    </div>
                </header>

                {activeTab === 'products' && (
                    <div className="space-y-6">
                        <div className="relative mb-2">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text"
                                placeholder="Cari nama produk atau kategori..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#0E0E0E] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
                            />
                        </div>
                        {loading ? (
                            <div className="py-20 flex justify-center"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>
                        ) : (() => {
                            const serviceIds = ['jasa-web', 'script-bot', 'vps-bot'];
                            const isServiceProduct = (p) => serviceIds.includes(p.id) || (p.category && p.category.toLowerCase().includes('jasa'));
                            
                            const filteredProducts = products.filter(p => isServiceProduct(p) && (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))));
                            
                            const serviceProducts = filteredProducts;

                            const renderProductCard = (p) => (
                                <div key={p.id} className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-white/10 transition-all group mb-3">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-gray-400">
                                            <IconRenderer name={p.icon} size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-white">{p.name}</h3>
                                                {!p.is_active && <span className="text-[9px] bg-red-500/15 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded uppercase font-bold">Nonaktif</span>}
                                            </div>
                                            <p className="text-xs text-gray-500">{p.category} • Rp {(p.price || (p.variants && p.variants[0]?.price) || 0).toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button 
                                            onClick={() => openProductModal(p)}
                                            className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button 
                                            onClick={() => deleteProduct(p.id)}
                                            className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );

                            return (
                                <div>
                                    <div className="mb-8">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2"><Globe size={20} className="text-purple-400"/> Layanan Jasa</h3>
                                            <button onClick={() => openProductModal(null, 'Layanan Jasa')} className="bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs font-bold transition-all"><Plus size={14}/> Tambah</button>
                                        </div>
                                        {serviceProducts.map(renderProductCard)}
                                    </div>
                                    {filteredProducts.length === 0 && (
                                        <div className="text-center py-10 text-gray-500 bg-[#0E0E0E] rounded-2xl border border-white/5">Tidak ada produk yang cocok dengan pencarian Anda.</div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                )}

                {activeTab === 'dashboard' && (
                    <div className="space-y-8">
                        {(() => {
                            const { totalRevenue, totalOrders, chartData } = getStats();
                            return (
                                <>
                                    <div className="bg-[#0E0E0E] border border-white/5 rounded-3xl p-8">
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <h3 className="text-xl font-bold text-white">Statistik Penjualan</h3>
                                                <p className="text-xs text-gray-500 mt-1">Grafik murni dari total pesanan masuk</p>
                                            </div>
                                            <BarChart3 className="text-purple-500" size={24} />
                                        </div>
                                        <SimpleChart data={chartData} />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-5 sm:p-6 flex items-center gap-3 sm:gap-4">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
                                                <ShoppingBag size={20} className="sm:w-6 sm:h-6" />
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Total Pesanan</p>
                                                <h4 className="text-xl sm:text-2xl font-bold text-white">{totalOrders}</h4>
                                            </div>
                                        </div>
                                        <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-5 sm:p-6 flex items-center gap-3 sm:gap-4">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
                                                <TrendingUp size={20} className="sm:w-6 sm:h-6" />
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Gross Revenue</p>
                                                <h4 className="text-xl sm:text-2xl font-bold text-white">Rp {totalRevenue.toLocaleString('id-ID')}</h4>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                )}

                {activeTab === 'revenue' && (
                    <div className="space-y-8">
                        {(() => {
                            const { totalRevenue } = getStats();
                            const netProfit = totalRevenue - settings.initial_capital;
                            
                            return (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <StatCard 
                                            title="Omzet (Kotor)" 
                                            value={`Rp ${totalRevenue.toLocaleString('id-ID')}`} 
                                            icon={DollarSign} 
                                            color="bg-blue-500" 
                                        />
                                        <StatCard 
                                            title="Modal Awal" 
                                            value={`Rp ${Number(settings.initial_capital).toLocaleString('id-ID')}`} 
                                            icon={Package} 
                                            color="bg-red-500" 
                                        />
                                        <StatCard 
                                            title="Laba Bersih" 
                                            value={`Rp ${netProfit.toLocaleString('id-ID')}`} 
                                            icon={Sparkles} 
                                            color={netProfit >= 0 ? "bg-green-500" : "bg-red-500"} 
                                        />
                                    </div>

                                    <div className="bg-[#0E0E0E] border border-white/5 rounded-3xl p-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h3 className="text-xl font-bold text-white">Catatan Modal Awal</h3>
                                                <p className="text-xs text-gray-500 mt-1">Masukkan total modal awal untuk menghitung laba bersih</p>
                                            </div>
                                            <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-400">
                                                <Settings size={20} />
                                            </div>
                                        </div>
                                        
                                        <div className="max-w-md">
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">Update Modal Awal (Rp)</label>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <input 
                                                    type="number"
                                                    defaultValue={settings.initial_capital}
                                                    onBlur={(e) => updateSetting('initial_capital', parseInt(e.target.value) || 0)}
                                                    className="w-full sm:flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500/50"
                                                    placeholder="Contoh: 1000000"
                                                />
                                                <div className="bg-purple-600/10 text-purple-400 px-6 py-4 rounded-xl text-sm font-bold border border-purple-500/20 flex items-center justify-center whitespace-nowrap">
                                                    Simpan Otomatis
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-gray-500 mt-3 flex items-center gap-2 italic">
                                                <AlertCircle size={12} /> Laba Bersih = Omzet - Modal Awal
                                            </p>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                )}
                {activeTab === 'orders' && (
                    <div className="space-y-4">
                        {loading ? (
                            <div className="py-20 flex justify-center">
                                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-10 text-center text-gray-500">
                                Belum ada pesanan masuk.
                            </div>
                        ) : (
                            orders.map(order => (
                                <div key={order.id} className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group">
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-1 rounded">{order.id}</span>
                                                <span className="text-[10px] text-gray-500 flex items-center gap-1"><Calendar size={12} /> {new Date(order.timestamp).toLocaleString('id-ID')}</span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">{order.product}</h3>
                                                <p className="text-sm text-gray-400">{order.variant} • Rp {order.price?.toLocaleString('id-ID')}</p>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center"><User size={14} /></div>
                                                    <div>
                                                        <p className="text-[10px] text-gray-500 uppercase">WhatsApp</p>
                                                        <p>{order.wa_number}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center"><Mail size={14} /></div>
                                                    <div>
                                                        <p className="text-[10px] text-gray-500 uppercase">Email</p>
                                                        <p>{order.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {order.testimonial && order.testimonial !== '-' && (
                                                <div className="bg-white/3 p-3 rounded-xl border border-white/5 italic text-sm text-gray-400">
                                                    "{order.testimonial}"
                                                </div>
                                            )}
                                        </div>
                                        <div className="w-full md:w-48 flex flex-col gap-3">
                                            {order.proof_image ? (
                                                <a href={order.proof_image} target="_blank" rel="noreferrer" className="relative block aspect-[3/4] rounded-xl overflow-hidden border border-white/10 group/img shadow-lg shadow-black/40">
                                                    <img src={order.proof_image} className="w-full h-full object-cover transition-transform group-hover/img:scale-110" alt="Bukti Transfer" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all">
                                                        <ExternalLink className="text-white" size={20} />
                                                    </div>
                                                </a>
                                            ) : (
                                                <div className="aspect-[3/4] rounded-xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center text-[10px] text-gray-500">Tanpa Bukti</div>
                                            )}
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => openOrderModal(order)}
                                                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all text-xs font-bold flex items-center justify-center gap-2"
                                                >
                                                    <Edit size={14} /> Edit
                                                </button>
                                                <button 
                                                    onClick={() => deleteOrder(order.id)}
                                                    className="flex-1 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all text-xs font-bold flex items-center justify-center gap-2"
                                                >
                                                    <Trash2 size={14} /> Hapus
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'banners' && (
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
                                {settings.banners.map((url, idx) => (
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
                                {settings.banners.length === 0 && (
                                    <div className="col-span-full py-20 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-gray-500">
                                        <ImageIcon size={48} className="mb-4 opacity-20" />
                                        <p>Belum ada banner promo.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-6">
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
                                    onChange={(e) => setSettings({...settings, shop_status: {...settings.shop_status, message: e.target.value}})}
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
                        {/* Info Modal Image Settings */}
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
                                    
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        id="infoModalInput"
                                        className="hidden" 
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;
                                            
                                            const formData = new FormData();
                                            formData.append('banner', file); // Re-use /api/banners logic
                                            
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
                                        }}
                                    />
                                    
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
                                <p className="text-xs text-gray-500">Ubah kredensial login dashboard Anda (Username & Password)</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-2">Username Baru</label>
                                    <input 
                                        type="text"
                                        placeholder="Masukkan username baru"
                                        value={authForm.username}
                                        onChange={(e) => setAuthForm({...authForm, username: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-2">Password Baru</label>
                                    <div className="relative">
                                        <input 
                                            type={showSettingsPassword ? "text" : "password"}
                                            placeholder="Masukkan password baru"
                                            value={authForm.password}
                                            onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
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
                                onClick={() => {
                                    if (!authForm.username || !authForm.password) {
                                        return Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Username dan Password tidak boleh kosong!', background: '#0E0E0E', color: '#fff' });
                                    }
                                    updateSetting('admin_auth', authForm);
                                }}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 mt-6 transition-all"
                            >
                                <Save size={18} /> Simpan Kredensial Baru
                            </button>
                        </div>
                    </div>

                )}

                {activeTab === 'sekalipay' && (
                    <div className="space-y-6">
                        {/* Sync Status & Balance Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Saldo Sekalipay</p>
                                    <DollarSign size={18} className="text-green-500" />
                                </div>
                                <h4 className="text-xl font-bold text-white">
                                    {sekalipayBalance ? `Rp ${sekalipayBalance.balance?.toLocaleString('id-ID')}` : '—'}
                                </h4>
                            </div>
                            <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Total Produk</p>
                                    <Package size={18} className="text-purple-500" />
                                </div>
                                <h4 className="text-xl font-bold text-white">{sekalipayProducts.length}</h4>
                            </div>
                            <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Sync Terakhir</p>
                                    <CheckCircle2 size={18} className="text-cyan-500" />
                                </div>
                                <h4 className="text-sm font-bold text-white">
                                    {sekalipaySync?.synced_at ? new Date(sekalipaySync.synced_at).toLocaleString('id-ID') : 'Belum pernah sync'}
                                </h4>
                                {sekalipaySync?.type && (
                                    <p className="text-[10px] text-gray-500 mt-1">Tipe: {sekalipaySync.type} • {sekalipaySync.productCount || 0} produk</p>
                                )}
                            </div>
                        </div>

                        {/* Sync Actions */}
                        <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-5">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2"><Zap size={20} className="text-yellow-400" /> Sinkronisasi Produk</h3>
                                    <p className="text-xs text-gray-500 mt-1">Delta sync otomatis setiap 3 jam. Full sync harian jam 03:00.</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleSync('delta')}
                                        disabled={syncInProgress}
                                        className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {syncInProgress ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                                        Delta Sync
                                    </button>
                                    <button
                                        onClick={() => handleSync('full')}
                                        disabled={syncInProgress}
                                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-purple-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {syncInProgress ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                                        Full Sync
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Global Markup */}
                        <div className="bg-[#0E0E0E] border border-white/5 rounded-2xl p-5">
                            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><DollarSign size={16} className="text-green-400" /> Markup Global</h3>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 flex-1">
                                    <span className="text-xs text-gray-500">Rp</span>
                                    <input
                                        type="number"
                                        value={globalMarkupValue}
                                        onChange={(e) => setGlobalMarkupValue(e.target.value)}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500/50 max-w-[200px]"
                                        placeholder="0"
                                    />
                                </div>
                                <button
                                    onClick={handleGlobalMarkup}
                                    className="bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                                >
                                    Terapkan ke Semua
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-600 mt-2">Terapkan markup nominal tetap ke semua varian produk. Harga jual = Harga dasar + Markup.</p>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Cari produk Sekalipay..."
                                value={sekalipaySearch}
                                onChange={(e) => setSekalipaySearch(e.target.value)}
                                className="w-full bg-[#0E0E0E] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
                            />
                        </div>

                        {/* Product List */}
                        {sekalipayLoading ? (
                            <div className="py-20 flex justify-center"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>
                        ) : (() => {
                            const filtered = sekalipayProducts.filter(p =>
                                p.name?.toLowerCase().includes(sekalipaySearch.toLowerCase()) ||
                                p.category?.toLowerCase().includes(sekalipaySearch.toLowerCase())
                            );

                            // Group by category
                            const grouped = {};
                            filtered.forEach(p => {
                                const cat = p.category || 'Lainnya';
                                if (!grouped[cat]) grouped[cat] = [];
                                grouped[cat].push(p);
                            });

                            return Object.keys(grouped).length === 0 ? (
                                <div className="text-center py-10 text-gray-500 bg-[#0E0E0E] rounded-2xl border border-white/5">
                                    {sekalipayProducts.length === 0 ? 'Belum ada produk. Klik "Full Sync" untuk mengambil data dari Sekalipay.' : 'Tidak ada produk yang cocok.'}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {Object.entries(grouped).map(([catName, catProducts]) => (
                                        <div key={catName}>
                                            <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <Package size={16} /> {catName}
                                                <span className="text-[10px] text-gray-600 font-normal lowercase">({catProducts.length} produk)</span>
                                            </h3>
                                            <div className="space-y-2">
                                                {catProducts.map(product => {
                                                    const totalVariants = (product.variants || []).length;
                                                    const inStock = (product.variants || []).filter(v => v.stock > 0).length;
                                                    const isExpanded = expandedProduct === product.id;

                                                    return (
                                                        <div key={product.id} className={`bg-[#0E0E0E] border rounded-2xl transition-all ${
                                                            product.is_active ? 'border-white/5 hover:border-white/10' : 'border-red-500/20 opacity-60'
                                                        }`}>
                                                            {/* Product Header */}
                                                            <div
                                                                className="p-4 flex items-center justify-between cursor-pointer"
                                                                onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                                                            >
                                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                    {product.image ? (
                                                                        <img src={product.image} alt="" className="w-10 h-10 rounded-xl object-cover bg-white/5" />
                                                                    ) : (
                                                                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-500">
                                                                            <Package size={18} />
                                                                        </div>
                                                                    )}
                                                                    <div className="min-w-0">
                                                                        <h4 className="font-bold text-white text-sm truncate">{product.name}</h4>
                                                                        <div className="flex items-center gap-2 mt-0.5">
                                                                            <span className="text-[10px] text-gray-500">{totalVariants} varian</span>
                                                                            <span className="text-[10px] text-green-500">{inStock} tersedia</span>
                                                                            {!product.is_active && <span className="text-[9px] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded uppercase font-bold">Hidden</span>}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleToggleProduct(product.id); }}
                                                                        className={`p-2 rounded-lg transition-all text-xs ${product.is_active ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
                                                                        title={product.is_active ? 'Sembunyikan' : 'Tampilkan'}
                                                                    >
                                                                        {product.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                                                                    </button>
                                                                    <ChevronDown size={16} className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                                </div>
                                                            </div>

                                                            {/* Expanded Variants */}
                                                            {isExpanded && (
                                                                <div className="border-t border-white/5 p-4">
                                                                    <div className="grid grid-cols-12 gap-2 mb-2 px-2">
                                                                        <span className="col-span-4 text-[9px] text-gray-600 uppercase tracking-widest font-bold">Varian</span>
                                                                        <span className="col-span-2 text-[9px] text-gray-600 uppercase tracking-widest font-bold text-right">Harga Dasar</span>
                                                                        <span className="col-span-2 text-[9px] text-gray-600 uppercase tracking-widest font-bold text-right">Markup</span>
                                                                        <span className="col-span-2 text-[9px] text-gray-600 uppercase tracking-widest font-bold text-right">Harga Jual</span>
                                                                        <span className="col-span-2 text-[9px] text-gray-600 uppercase tracking-widest font-bold text-right">Stok</span>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        {(product.variants || []).map(variant => (
                                                                            <div key={variant.id} className="grid grid-cols-12 gap-2 items-center bg-white/[0.02] rounded-xl px-2 py-2 hover:bg-white/5 transition-all">
                                                                                <div className="col-span-4">
                                                                                    <p className="text-xs text-white font-medium truncate">{variant.name}</p>
                                                                                    <p className="text-[9px] text-gray-600">{variant.sku || '—'}</p>
                                                                                </div>
                                                                                <p className="col-span-2 text-xs text-gray-400 text-right">Rp {variant.base_price?.toLocaleString('id-ID')}</p>
                                                                                <div className="col-span-2">
                                                                                    <input
                                                                                        type="number"
                                                                                        defaultValue={variant.markup || 0}
                                                                                        onBlur={(e) => {
                                                                                            const newMarkup = parseInt(e.target.value) || 0;
                                                                                            if (newMarkup !== (variant.markup || 0)) {
                                                                                                handleMarkupUpdate(product.id, variant.id, newMarkup);
                                                                                            }
                                                                                        }}
                                                                                        onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                                                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-right text-white focus:outline-none focus:border-purple-500/50"
                                                                                    />
                                                                                </div>
                                                                                <p className="col-span-2 text-xs text-green-400 font-bold text-right">Rp {variant.sell_price?.toLocaleString('id-ID')}</p>
                                                                                <div className="col-span-2 text-right">
                                                                                    <span className={`text-xs font-bold ${variant.stock > 0 ? 'text-white' : 'text-red-400'}`}>
                                                                                        {variant.stock > 0 ? variant.stock : 'Habis'}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    {/* Bulk markup for this product */}
                                                                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                                                                        <span className="text-[10px] text-gray-500">Markup semua varian:</span>
                                                                        <div className="flex items-center gap-1">
                                                                            <span className="text-[10px] text-gray-600">Rp</span>
                                                                            <input
                                                                                type="number"
                                                                                placeholder="0"
                                                                                className="w-24 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white text-right focus:outline-none focus:border-purple-500/50"
                                                                                onKeyDown={(e) => {
                                                                                    if (e.key === 'Enter') {
                                                                                        handleMarkupUpdate(product.id, null, parseInt(e.target.value) || 0);
                                                                                        e.target.value = '';
                                                                                    }
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <span className="text-[9px] text-gray-600">(tekan Enter)</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                )}

            </main>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-4xl bg-[#0E0E0E] border border-white/10 rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
                                <h2 className="text-xl font-bold text-white">{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-white"><X size={20} /></button>
                            </div>

                            <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4">Informasi Dasar</h4>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1.5">Nama Produk</label>
                                        <input 
                                            value={productForm.name}
                                            onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
                                            placeholder="contoh: Netflix Premium"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1.5">Kategori</label>
                                            <select 
                                                value={productForm.category}
                                                onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white appearance-none"
                                            >
                                                <option value="" className="bg-[#0E0E0E]" disabled>Pilih Kategori</option>
                                                <option value="Aplikasi premium" className="bg-[#0E0E0E]">Aplikasi premium</option>
                                                <option value="Top Up Game" className="bg-[#0E0E0E]">Top Up Game</option>
                                                <option value="Layanan Jasa" className="bg-[#0E0E0E]">Layanan Jasa</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1.5">Icon</label>
                                            <select 
                                                value={productForm.icon}
                                                onChange={(e) => setProductForm({...productForm, icon: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white appearance-none"
                                            >
                                                {iconOptions.map(opt => <option key={opt.value} value={opt.value} className="bg-[#0E0E0E]">{opt.label}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    {/* Status Produk */}
                                    <div className="mt-2">
                                        <label className="block text-xs text-gray-500 mb-2">Status Produk</label>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setProductForm({...productForm, is_active: !productForm.is_active})}
                                                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${productForm.is_active ? 'bg-green-500' : 'bg-red-500'}`}
                                            >
                                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${productForm.is_active ? 'left-[26px]' : 'left-0.5'}`} />
                                            </button>
                                            <span className={`text-sm font-bold ${productForm.is_active ? 'text-green-400' : 'text-red-400'}`}>
                                                {productForm.is_active ? '✓ Aktif' : '✗ Nonaktif'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest">Varian Paket</h4>
                                            <button 
                                                onClick={() => setProductForm({...productForm, variants: [...productForm.variants, {name: '', price: 0}]})}
                                                className="text-[10px] bg-white/5 px-2 py-1 rounded border border-white/10 text-gray-400 hover:text-white"
                                            >+ Tambah</button>
                                        </div>
                                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                            {productForm.variants.map((v, i) => (
                                                <div key={i} className="flex gap-2">
                                                    <input 
                                                        value={v.name}
                                                        onChange={(e) => {
                                                            const newV = [...productForm.variants];
                                                            newV[i].name = e.target.value;
                                                            setProductForm({...productForm, variants: newV});
                                                        }}
                                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white"
                                                        placeholder="Nama Varian"
                                                    />
                                                    <input 
                                                        type="number"
                                                        value={v.price}
                                                        onChange={(e) => {
                                                            const newV = [...productForm.variants];
                                                            newV[i].price = parseInt(e.target.value);
                                                            setProductForm({...productForm, variants: newV});
                                                        }}
                                                        className="w-24 bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white"
                                                        placeholder="Harga"
                                                    />
                                                    <button onClick={() => setProductForm({...productForm, variants: productForm.variants.filter((_, idx) => idx !== i)})} className="p-2 text-red-500"><X size={14}/></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="flex justify-between items-center mb-4 mt-6">
                                            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest">Fitur / Benefit Layanan</h4>
                                            <button 
                                                onClick={() => setProductForm({...productForm, features: [...(productForm.features || []), '']})}
                                                className="text-[10px] bg-white/5 px-2 py-1 rounded border border-white/10 text-gray-400 hover:text-white"
                                            >+ Tambah Fitur</button>
                                        </div>
                                        <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                                            {(productForm.features || []).map((f, i) => (
                                                <div key={i} className="flex gap-2">
                                                    <input 
                                                        value={f}
                                                        onChange={(e) => {
                                                            const newF = [...(productForm.features || [])];
                                                            newF[i] = e.target.value;
                                                            setProductForm({...productForm, features: newF});
                                                        }}
                                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white"
                                                        placeholder={`Fitur ke-${i + 1}`}
                                                    />
                                                    <button onClick={() => setProductForm({...productForm, features: productForm.features.filter((_, idx) => idx !== i)})} className="p-2 text-red-500"><X size={14}/></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className="p-6 border-t border-white/5 bg-white/2 flex justify-end gap-3">
                                <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-all text-sm font-bold">Batal</button>
                                <button onClick={saveProduct} className="px-8 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20 transition-all text-sm font-bold flex items-center gap-2"><Save size={18} /> Simpan Produk</button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {isOrderModalOpen && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80"
                            onClick={() => setIsOrderModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-[#0E0E0E] border border-white/10 rounded-3xl overflow-hidden flex flex-col"
                        >
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
                                <h2 className="text-xl font-bold text-white">Edit Pesanan</h2>
                                <button onClick={() => setIsOrderModalOpen(false)} className="p-2 text-gray-400 hover:text-white"><X size={20} /></button>
                            </div>

                            <div className="p-8 space-y-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1.5">Harga (Rp)</label>
                                    <input 
                                        type="number"
                                        value={orderForm.price}
                                        onChange={(e) => setOrderForm({...orderForm, price: parseInt(e.target.value)})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1.5">WhatsApp</label>
                                    <input 
                                        value={orderForm.wa_number}
                                        onChange={(e) => setOrderForm({...orderForm, wa_number: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1.5">Testimoni</label>
                                    <textarea 
                                        value={orderForm.testimonial}
                                        onChange={(e) => setOrderForm({...orderForm, testimonial: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white h-24 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-white/5 bg-white/2 flex justify-end gap-3">
                                <button onClick={() => setIsOrderModalOpen(false)} className="px-6 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-all text-sm font-bold">Batal</button>
                                <button onClick={saveOrder} className="px-8 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20 transition-all text-sm font-bold flex items-center gap-2"><Save size={18} /> Simpan Perubahan</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default AdminDashboard;
