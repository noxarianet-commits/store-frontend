import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import api from '../api';
import { notifySuccess, notifyError, notifyWarning, confirmAction } from '../utils/notify';

import AdminSidebar from '../components/admin/AdminSidebar';
import AdminLoginForm from '../components/admin/AdminLoginForm';
import WelcomeMarquee from '../components/admin/WelcomeMarquee';
import DashboardTab from '../components/admin/DashboardTab';
import SekalipayTab from '../components/admin/SekalipayTab';
import RevenueTab from '../components/admin/RevenueTab';
import ProductsTab from '../components/admin/ProductsTab';
import ProductModal from '../components/admin/ProductModal';
import OrdersTab from '../components/admin/OrdersTab';
import OrderModal from '../components/admin/OrderModal';
import SettingsTab from '../components/admin/SettingsTab';
import FeaturedTab from '../components/admin/FeaturedTab';
import OkeconnectTab from '../components/admin/OkeconnectTab';

const AdminDashboard = () => {
    const [isLogin, setIsLogin] = useState(false);
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Data states
    const [orders, setOrders] = useState([]);
    const [services, setServices] = useState([]);
    const [settings, setSettings] = useState({});
    const [sekalipayProducts, setSekalipayProducts] = useState([]);
    const [sekalipayBalance, setSekalipayBalance] = useState(null);
    const [sekalipaySync, setSekalipaySync] = useState(null);
    const [sekalipayLoading, setSekalipayLoading] = useState(false);
    const [sekalipaySearch, setSekalipaySearch] = useState('');
    const [okeconnectProducts, setOkeconnectProducts] = useState([]);
    const [okeconnectBalance, setOkeconnectBalance] = useState(null);
    const [okeconnectSync, setOkeconnectSync] = useState(null);
    const [okeconnectLoading, setOkeconnectLoading] = useState(false);
    const [okeconnectSearch, setOkeconnectSearch] = useState('');
    const [expandedProduct, setExpandedProduct] = useState(null);
    const [syncInProgress, setSyncInProgress] = useState(false);
    const [globalMarkupValue, setGlobalMarkupValue] = useState('');
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [featuredLoading, setFeaturedLoading] = useState(false);
    const [error] = useState(null);
    const [loading, setLoading] = useState(true);


    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isAddingProduct, setIsAddingProduct] = useState(false);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);

    // Password change
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({ current_password: '', new_password: '', confirm_password: '' });

    const [orderRefreshCounter, setOrderRefreshCounter] = useState(0);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders/stats');
            setOrders(Array.isArray(res.data) ? res.data : (res.data.orders || []));
        } catch (e) { console.error('Gagal fetch orders stats:', e); }
    };

    const fetchServices = async () => {
        try { const res = await api.get('/services'); setServices(res.data); }
        catch (e) { console.error('Gagal fetch services:', e); }
    };

    const fetchSettings = async () => {
        try { const res = await api.get('/settings'); setSettings(res.data); }
        catch (e) { console.error('Gagal fetch settings:', e); }
    };

    const fetchSekalipay = useCallback(async () => {
        setSekalipayLoading(true);
        try {
            const [prodRes, balRes, syncRes] = await Promise.all([
                api.getAdminProducts({ vendor: 'sekalipay' }).catch(() => ({ data: [] })),
                api.getAdminBalance('sekalipay').catch(() => ({ data: null })),
                api.getAdminSyncStatus('sekalipay').catch(() => ({ data: null }))
            ]);
            setSekalipayProducts(prodRes.data || []);
            setSekalipayBalance(balRes.data?.data || balRes.data);
            setSekalipaySync(syncRes.data?.lastSync || syncRes.data);
        } catch (e) { console.error('Gagal fetch sekalipay:', e); }
        setSekalipayLoading(false);
    }, []);

    const fetchOkeconnect = useCallback(async () => {
        setOkeconnectLoading(true);
        try {
            const [prodRes, balRes, syncRes] = await Promise.all([
                api.getAdminProducts({ vendor: 'okeconnect' }).catch(() => ({ data: [] })),
                api.getAdminBalance('okeconnect').catch(() => ({ data: null })),
                api.getAdminSyncStatus('okeconnect').catch(() => ({ data: null }))
            ]);
            setOkeconnectProducts(prodRes.data || []);
            setOkeconnectBalance(balRes.data?.data || balRes.data);
            setOkeconnectSync(syncRes.data?.lastSync || syncRes.data);
        } catch (e) { console.error('Gagal fetch okeconnect:', e); }
        setOkeconnectLoading(false);
    }, []);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchOrders(), fetchServices(), fetchSettings()]);
        if (activeTab === 'sekalipay') await fetchSekalipay();
        if (activeTab === 'okeconnect') await fetchOkeconnect();
        if (activeTab === 'featured') await fetchFeaturedProducts();
        setLoading(false);
    };

    const fetchFeaturedProducts = useCallback(async () => {
        setFeaturedLoading(true);
        try {
            const res = await api.getAdminProducts({ vendor: 'sekalipay' });
            setFeaturedProducts(res.data || []);
        } catch (e) { console.error('Gagal fetch featured products:', e); }
        setFeaturedLoading(false);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            const token = localStorage.getItem('adminToken');
            if (token) {
                setIsLogin(true);
                fetchData();
            } else {
                setLoading(false);
            }
        }, 0);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (isLogin && activeTab === 'sekalipay') {
            const timer = setTimeout(() => fetchSekalipay(), 0);
            return () => clearTimeout(timer);
        }
    }, [activeTab, isLogin, fetchSekalipay]);

    useEffect(() => {
        if (isLogin && activeTab === 'featured') {
            const timer = setTimeout(() => fetchFeaturedProducts(), 0);
            return () => clearTimeout(timer);
        }
    }, [activeTab, isLogin, fetchFeaturedProducts]);

    useEffect(() => {
        if (isLogin && activeTab === 'okeconnect') {
            const timer = setTimeout(() => fetchOkeconnect(), 0);
            return () => clearTimeout(timer);
        }
    }, [activeTab, isLogin, fetchOkeconnect]);


    // ---- Auth ----
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/admin/login', loginData);
            localStorage.setItem('adminToken', res.data.token);
            setIsLogin(true);
            fetchData();
        } catch (err) {
            notifyError(err.response?.data?.error || 'Username atau password salah');
        }
    };

    const handleLogout = async () => {
        const confirmed = await confirmAction({ title: 'Yakin ingin logout?', text: 'Anda harus login kembali untuk mengakses dashboard.', confirmText: 'Ya, Logout', cancelText: 'Batal' });
        if (confirmed) {
            localStorage.removeItem('adminToken');
            setIsLogin(false);
        }
    };

    // ---- Password ----
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!passwordData.current_password || !passwordData.new_password) {
            notifyWarning('Password lama dan password baru wajib diisi!');
            return;
        }
        if (passwordData.new_password.length < 8) {
            notifyWarning('Password baru minimal 8 karakter!');
            return;
        }
        if (passwordData.new_password !== passwordData.confirm_password) {
            notifyWarning('Konfirmasi password baru tidak cocok!');
            return;
        }
        try {
            await api.put('/admin/password', {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            });
            notifySuccess('Password berhasil diubah!');
            setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
        } catch (err) {
            notifyError(err.response?.data?.error || 'Gagal mengubah password');
        }
    };

    // ---- Sekalipay handlers ----
    const handleSync = async (type) => {
        setSyncInProgress(true);
        try {
            const res = await api.triggerSync('sekalipay', type);
            notifySuccess(`Sync berhasil: ${res.data.syncedProducts || res.data.productCount || 0} produk disinkronkan`);
            await fetchSekalipay();
        } catch (err) {
            notifyError(err.response?.data?.error || 'Sync gagal');
        }
        setSyncInProgress(false);
    };

    const handleGlobalMarkup = async () => {
        const val = parseInt(globalMarkupValue);
        if (isNaN(val) || val < 0) { notifyWarning('Masukkan nilai markup yang valid'); return; }
        try {
            const res = await api.applyGlobalMarkup('sekalipay', val);
            notifySuccess(res.data.message);
            setGlobalMarkupValue('');
            await fetchSekalipay();
        } catch (err) {
            notifyError(err.response?.data?.error || 'Gagal menerapkan markup');
        }
    };

    const handleMarkupUpdate = async (productId, variantId, markup) => {
        try {
            await api.updateAdminMarkup(productId, { variantId, markup });
            await fetchSekalipay();
            notifySuccess('Markup berhasil diupdate!');
        } catch (err) {
            notifyError(err.response?.data?.error || 'Gagal update markup');
        }
    };

    const handleToggleProduct = async (productId) => {
        try {
            await api.toggleAdminProduct(productId);
            await fetchSekalipay();
            notifySuccess('Status produk berhasil diubah!');
        } catch (err) {
            notifyError(err.response?.data?.error || 'Gagal toggle produk');
        }
    };

    const handleToggleVariantHidden = async (productId, variantId) => {
        try {
            const res = await api.patch(`/admin/products/products/${productId}/variant/${variantId}/toggle-hidden`);
            await fetchSekalipay();
            notifySuccess(res.data.is_hidden ? 'Varian disembunyikan!' : 'Varian ditampilkan!');
        } catch (err) {
            notifyError(err.response?.data?.error || 'Gagal mengubah visibilitas varian');
        }
    };

    const handleToggleFeatured = async (productId) => {
        try {
            const res = await api.toggleAdminFeatured(productId);
            await fetchFeaturedProducts();
            notifySuccess(res.data.is_featured ? 'Produk ditandai sebagai unggulan!' : 'Produk dihapus dari unggulan.');
        } catch (err) {
            notifyError(err.response?.data?.error || 'Gagal mengubah status unggulan');
        }
    };

    // ---- OkeConnect handlers ----
    const handleOkeconnectSync = async (type = 'full') => {
        setSyncInProgress(true);
        try {
            const res = await api.triggerSync('okeconnect', type);
            notifySuccess(`Sync berhasil: ${res.data.productCount || res.data.productsUpserted || 0} produk disinkronkan`);
            await fetchOkeconnect();
        } catch (err) {
            notifyError(err.response?.data?.error || 'Sync OkeConnect gagal');
        }
        setSyncInProgress(false);
    };

    const handleOkeconnectGlobalMarkup = async () => {
        const val = parseInt(globalMarkupValue);
        if (isNaN(val) || val < 0) { notifyWarning('Masukkan nilai markup yang valid'); return; }
        try {
            const res = await api.applyGlobalMarkup('okeconnect', val);
            notifySuccess(res.data.message);
            setGlobalMarkupValue('');
            await fetchOkeconnect();
        } catch (err) {
            notifyError(err.response?.data?.error || 'Gagal menerapkan markup OkeConnect');
        }
    };

    const handleOkeconnectMarkupUpdate = async (productId, variantId, markup) => {
        try {
            await api.updateAdminMarkup(productId, { variantId, markup });
            await fetchOkeconnect();
            notifySuccess('Markup OkeConnect berhasil diupdate!');
        } catch (err) {
            notifyError(err.response?.data?.error || 'Gagal update markup OkeConnect');
        }
    };

    const handleOkeconnectToggleProduct = async (productId) => {
        try {
            await api.toggleAdminProduct(productId);
            await fetchOkeconnect();
        } catch (err) {
            notifyError(err.response?.data?.error || 'Gagal mengubah status produk OkeConnect');
        }
    };

    const handleOkeconnectToggleVariantHidden = async (productId, variantId) => {
        try {
            await api.toggleVariantHidden(variantId);
            await fetchOkeconnect();
            notifySuccess('Status tampilan varian berhasil diubah!');
        } catch (err) {
            notifyError(err.response?.data?.error || 'Gagal mengubah visibilitas varian');
        }
    };

    // ---- Product CRUD ----

    const openProductModal = (product = null) => {
        setEditingProduct(product);
        setIsAddingProduct(!product);
        setIsModalOpen(true);
    };
    const saveProduct = async (form) => {
        try {
            if (isAddingProduct) {
                await api.post('/services', form);
                notifySuccess('Produk berhasil ditambahkan!');
            } else {
                await api.put(`/services/${editingProduct.id}`, form);
                notifySuccess('Produk berhasil diperbarui!');
            }
            setIsModalOpen(false);
            setEditingProduct(null);
            setIsAddingProduct(false);
            await fetchServices();
        } catch (err) { notifyError(err.response?.data?.error || 'Gagal menyimpan produk'); }
    };
    const deleteProduct = async (id) => {
        const confirmed = await confirmAction({ title: 'Hapus produk?', text: 'Produk yang dihapus tidak bisa dikembalikan.', danger: true, confirmText: 'Ya, hapus!' });
        if (confirmed) { await api.delete(`/services/${id}`); await fetchServices(); notifySuccess('Produk berhasil dihapus!'); }
    };

    // ---- Order CRUD ----
    const openOrderModal = (order = null) => { setEditingOrder(order); setIsOrderModalOpen(true); };
    const saveOrder = async (form) => {
        try {
            if (editingOrder) {
                await api.put(`/orders/${editingOrder.id}`, form);
                notifySuccess('Pesanan berhasil diperbarui!');
            }
            setIsOrderModalOpen(false);
            setEditingOrder(null);
            await fetchOrders();
            setOrderRefreshCounter(c => c + 1);
        } catch (err) { notifyError(err.response?.data?.error || 'Gagal memperbarui pesanan'); }
    };
    const deleteOrder = async (id) => {
        const confirmed = await confirmAction({ title: 'Hapus pesanan?', text: 'Pesanan yang dihapus tidak bisa dikembalikan.', danger: true, confirmText: 'Ya, hapus!' });
        if (confirmed) {
            await api.delete(`/orders/${id}`);
            await fetchOrders();
            setOrderRefreshCounter(c => c + 1);
            notifySuccess('Pesanan berhasil dihapus!');
        }
    };

    // ---- Settings ----
    const updateSetting = async (key, value) => {
        try {
            await api.put(`/settings/${key}`, { value });
            await fetchSettings();
            notifySuccess('Pengaturan berhasil disimpan!');
        } catch (err) {
            notifyError('Gagal menyimpan pengaturan');
            console.error('Gagal update setting:', err);
        }
    };

    // ---- Render ----
    if (!isLogin) {
        return <AdminLoginForm loginData={loginData} setLoginData={setLoginData} showLoginPassword={showLoginPassword} setShowLoginPassword={setShowLoginPassword} handleLogin={handleLogin} />;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0A031A]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={40} className="animate-spin text-purple-500" />
                    <p className="text-gray-500 text-sm">Memuat data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0A031A] px-4">
                <div className="text-center bg-[#0E0E0E] border border-red-500/20 rounded-3xl p-8 max-w-md">
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Gagal Memuat Data</h2>
                    <p className="text-gray-400 text-sm mb-6">{error}</p>
                    <button onClick={fetchData} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all">Coba Lagi</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A031A] flex flex-col md:flex-row">
            <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

            <main className="flex-1 overflow-auto w-full">
                <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
                    <WelcomeMarquee />

                    {/* Tab Content */}
                    {activeTab === 'dashboard' && <DashboardTab orders={orders} />}
                    {activeTab === 'sekalipay' && (
                        <SekalipayTab
                            sekalipayProducts={sekalipayProducts} sekalipayBalance={sekalipayBalance}
                            sekalipaySync={sekalipaySync} sekalipayLoading={sekalipayLoading}
                            sekalipaySearch={sekalipaySearch} setSekalipaySearch={setSekalipaySearch}
                            handleSync={handleSync} handleGlobalMarkup={handleGlobalMarkup}
                            handleMarkupUpdate={handleMarkupUpdate} handleToggleProduct={handleToggleProduct}
                            syncInProgress={syncInProgress}
                            globalMarkupValue={globalMarkupValue} setGlobalMarkupValue={setGlobalMarkupValue}
                            expandedProduct={expandedProduct} setExpandedProduct={setExpandedProduct}
                            handleToggleVariantHidden={handleToggleVariantHidden}
                        />
                    )}
                    {activeTab === 'okeconnect' && (
                        <OkeconnectTab
                            okeconnectProducts={okeconnectProducts} okeconnectBalance={okeconnectBalance}
                            okeconnectSync={okeconnectSync} okeconnectLoading={okeconnectLoading}
                            okeconnectSearch={okeconnectSearch} setOkeconnectSearch={setOkeconnectSearch}
                            handleSync={handleOkeconnectSync} handleGlobalMarkup={handleOkeconnectGlobalMarkup}
                            handleMarkupUpdate={handleOkeconnectMarkupUpdate} handleToggleProduct={handleOkeconnectToggleProduct}
                            syncInProgress={syncInProgress}
                            globalMarkupValue={globalMarkupValue} setGlobalMarkupValue={setGlobalMarkupValue}
                            expandedProduct={expandedProduct} setExpandedProduct={setExpandedProduct}
                            handleToggleVariantHidden={handleOkeconnectToggleVariantHidden}
                        />
                    )}
                    {activeTab === 'revenue' && <RevenueTab orders={orders} settings={settings} updateSetting={updateSetting} />}

                    {activeTab === 'featured' && (
                        <FeaturedTab
                            products={featuredProducts}
                            featuredCount={featuredProducts.filter(p => p.is_featured).length}
                            loading={featuredLoading}
                            onToggleFeatured={handleToggleFeatured}
                        />
                    )}
                    {activeTab === 'products' && (
                        <ProductsTab
                            products={services} openProductModal={openProductModal} deleteProduct={deleteProduct}
                        />
                    )}
                    {activeTab === 'orders' && (
                        <OrdersTab openOrderModal={openOrderModal} deleteOrder={deleteOrder} refreshTrigger={orderRefreshCounter} />
                    )}
                    {activeTab === 'settings' && (
                        <SettingsTab
                            settings={settings} setSettings={setSettings} updateSetting={updateSetting}
                            passwordForm={passwordData} setPasswordForm={setPasswordData}
                            handleChangePassword={handleChangePassword}
                        />
                    )}
                </div>
            </main>

            {/* Modals */}
            <AnimatePresence>
                {isModalOpen && <ProductModal isAdding={isAddingProduct} editingProduct={editingProduct} onClose={() => { setIsModalOpen(false); setEditingProduct(null); setIsAddingProduct(false); }} onSave={saveProduct} />}
                {isOrderModalOpen && <OrderModal editingOrder={editingOrder} onClose={() => { setIsOrderModalOpen(false); setEditingOrder(null); }} onSave={saveOrder} />}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
