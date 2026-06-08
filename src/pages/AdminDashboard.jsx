import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import api from '../api';
import Swal from 'sweetalert2';

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
import BannersTab from '../components/admin/BannersTab';
import SettingsTab from '../components/admin/SettingsTab';

const AdminDashboard = () => {
    const [isLogin, setIsLogin] = useState(false);
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const fileInputRef = useRef(null);

    // Data states
    const [orders, setOrders] = useState([]);
    const [services, setServices] = useState([]);
    const [settings, setSettings] = useState({});
    const [banners, setBanners] = useState([]);
    const [sekalipayProducts, setSekalipayProducts] = useState([]);
    const [sekalipayBalance, setSekalipayBalance] = useState(null);
    const [sekalipaySync, setSekalipaySync] = useState(null);
    const [sekalipayLoading, setSekalipayLoading] = useState(false);
    const [sekalipaySearch, setSekalipaySearch] = useState('');
    const [expandedProduct, setExpandedProduct] = useState(null);
    const [syncInProgress, setSyncInProgress] = useState(false);
    const [globalMarkupValue, setGlobalMarkupValue] = useState('');
    const [error] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);

    // Password change
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({ current: '', newPass: '' });

    const fetchOrders = async () => {
        try { const res = await api.get('/orders'); setOrders(res.data); }
        catch (e) { console.error('Gagal fetch orders:', e); }
    };

    const fetchServices = async () => {
        try { const res = await api.get('/services'); setServices(res.data); }
        catch (e) { console.error('Gagal fetch services:', e); }
    };

    const fetchSettings = async () => {
        try { const res = await api.get('/settings'); setSettings(res.data); }
        catch (e) { console.error('Gagal fetch settings:', e); }
    };

    const fetchBanners = async () => {
        try { const res = await api.get('/banners'); setBanners(res.data); }
        catch (e) { console.error('Gagal fetch banners:', e); }
    };

    const fetchSekalipay = useCallback(async () => {
        setSekalipayLoading(true);
        try {
            const [prodRes, balRes, syncRes] = await Promise.all([
                api.get('/admin/sekalipay/products').catch(() => ({ data: [] })),
                api.get('/admin/sekalipay/balance').catch(() => ({ data: null })),
                api.get('/admin/sekalipay/sync-status').catch(() => ({ data: null }))
            ]);
            setSekalipayProducts(prodRes.data);
            setSekalipayBalance(balRes.data);
            setSekalipaySync(syncRes.data);
        } catch (e) { console.error('Gagal fetch sekalipay:', e); }
        setSekalipayLoading(false);
    }, []);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchOrders(), fetchServices(), fetchSettings(), fetchBanners()]);
        if (activeTab === 'sekalipay') await fetchSekalipay();
        setLoading(false);
    };

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

    // ---- Auth ----
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/admin/login', loginData);
            localStorage.setItem('adminToken', res.data.token);
            setIsLogin(true);
            fetchData();
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Gagal Masuk', text: err.response?.data?.error || 'Username atau password salah', background: '#0E0E0E', color: '#fff', confirmButtonColor: '#7c3aed' });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        setIsLogin(false);
    };

    // ---- Password ----
    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            await api.put('/admin/password', passwordData);
            Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Password berhasil diubah', background: '#0E0E0E', color: '#fff', confirmButtonColor: '#7c3aed' });
            setShowPasswordForm(false);
            setPasswordData({ current: '', newPass: '' });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.error || 'Terjadi kesalahan', background: '#0E0E0E', color: '#fff', confirmButtonColor: '#7c3aed' });
        }
    };

    // ---- Sekalipay handlers ----
    const handleSync = async (type) => {
        setSyncInProgress(true);
        try {
            const res = await api.post('/admin/sekalipay/sync', { type });
            Swal.fire({ icon: 'success', title: 'Sync Berhasil', text: `${res.data.message} (${res.data.syncedProducts || 0} produk)`, background: '#0E0E0E', color: '#fff', confirmButtonColor: '#7c3aed' });
            await fetchSekalipay();
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Sync Gagal', text: err.response?.data?.error || err.message, background: '#0E0E0E', color: '#fff', confirmButtonColor: '#7c3aed' });
        }
        setSyncInProgress(false);
    };

    const handleGlobalMarkup = async () => {
        const val = parseInt(globalMarkupValue);
        if (isNaN(val) || val < 0) { Swal.fire({ icon: 'warning', title: 'Masukkan nilai markup yang valid', background: '#0E0E0E', color: '#fff', confirmButtonColor: '#7c3aed' }); return; }
        try {
            const res = await api.post('/admin/sekalipay/global-markup', { markup: val });
            Swal.fire({ icon: 'success', title: 'Berhasil', text: res.data.message, background: '#0E0E0E', color: '#fff', confirmButtonColor: '#7c3aed' });
            setGlobalMarkupValue('');
            await fetchSekalipay();
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.error || err.message, background: '#0E0E0E', color: '#fff', confirmButtonColor: '#7c3aed' });
        }
    };

    const handleMarkupUpdate = async (productId, variantId, markup) => {
        try {
            await api.patch(`/admin/sekalipay/products/${productId}/markup`, { variantId, markup });
            await fetchSekalipay();
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Gagal update markup', text: err.response?.data?.error || err.message, background: '#0E0E0E', color: '#fff', confirmButtonColor: '#7c3aed' });
        }
    };

    const handleToggleProduct = async (productId) => {
        try {
            await api.patch(`/admin/sekalipay/products/${productId}/toggle`);
            await fetchSekalipay();
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.error || err.message, background: '#0E0E0E', color: '#fff', confirmButtonColor: '#7c3aed' });
        }
    };

    // ---- Product CRUD ----
    const openProductModal = (product = null) => { setEditingProduct(product); setIsModalOpen(true); };
    const saveProduct = async (form) => {
        try {
            if (editingProduct) {
                await api.put(`/services/${editingProduct.id}`, form);
                Swal.fire({ icon: 'success', title: 'Produk diperbarui!', background: '#0E0E0E', color: '#fff', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
            } else {
                await api.post('/services', form);
                Swal.fire({ icon: 'success', title: 'Produk ditambahkan!', background: '#0E0E0E', color: '#fff', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
            }
            setIsModalOpen(false);
            setEditingProduct(null);
            await fetchServices();
        } catch (err) { Swal.fire({ icon: 'error', title: 'Gagal simpan produk', text: err.response?.data?.error || err.message, background: '#0E0E0E', color: '#fff', confirmButtonColor: '#7c3aed' }); }
    };
    const deleteProduct = async (id) => {
        const result = await Swal.fire({ icon: 'warning', title: 'Hapus produk?', showCancelButton: true, confirmButtonText: 'Ya, hapus!', cancelButtonText: 'Batal', background: '#0E0E0E', color: '#fff', confirmButtonColor: '#dc2626' });
        if (result.isConfirmed) { await api.delete(`/services/${id}`); await fetchServices(); Swal.fire({ icon: 'success', title: 'Produk dihapus!', background: '#0E0E0E', color: '#fff', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false }); }
    };

    // ---- Order CRUD ----
    const openOrderModal = (order = null) => { setEditingOrder(order); setIsOrderModalOpen(true); };
    const saveOrder = async (form) => {
        try {
            if (editingOrder) {
                await api.put(`/orders/${editingOrder.id}`, form);
                Swal.fire({ icon: 'success', title: 'Pesanan diperbarui!', background: '#0E0E0E', color: '#fff', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
            }
            setIsOrderModalOpen(false);
            setEditingOrder(null);
            await fetchOrders();
        } catch (err) { Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.error || err.message, background: '#0E0E0E', color: '#fff', confirmButtonColor: '#7c3aed' }); }
    };
    const deleteOrder = async (id) => {
        const result = await Swal.fire({ icon: 'warning', title: 'Hapus pesanan?', showCancelButton: true, confirmButtonText: 'Ya, hapus!', cancelButtonText: 'Batal', background: '#0E0E0E', color: '#fff', confirmButtonColor: '#dc2626' });
        if (result.isConfirmed) { await api.delete(`/orders/${id}`); await fetchOrders(); Swal.fire({ icon: 'success', title: 'Pesanan dihapus!', background: '#0E0E0E', color: '#fff', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false }); }
    };

    // ---- Banner ----
    const handleBannerUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('banner', file);
        try {
            await api.post('/banners', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            Swal.fire({ icon: 'success', title: 'Banner diunggah!', background: '#0E0E0E', color: '#fff', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
            await fetchBanners();
        } catch (err) { Swal.fire({ icon: 'error', title: 'Gagal upload banner', text: err.response?.data?.error || err.message, background: '#0E0E0E', color: '#fff', confirmButtonColor: '#7c3aed' }); }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };
    const deleteBanner = async (id) => {
        const result = await Swal.fire({ icon: 'warning', title: 'Hapus banner?', showCancelButton: true, confirmButtonText: 'Ya, hapus!', cancelButtonText: 'Batal', background: '#0E0E0E', color: '#fff', confirmButtonColor: '#dc2626' });
        if (result.isConfirmed) { await api.delete(`/banners/${id}`); await fetchBanners(); }
    };

    // ---- Settings ----
    const updateSetting = async (key, value) => {
        try {
            await api.put(`/settings/${key}`, { value });
            await fetchSettings();
        } catch (err) { console.error('Gagal update setting:', err); }
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
        <div className="min-h-screen bg-[#0A031A] flex">
            <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

            <main className="flex-1 overflow-auto">
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
                        />
                    )}
                    {activeTab === 'revenue' && <RevenueTab orders={orders} settings={settings} />}
                    {activeTab === 'products' && (
                        <ProductsTab
                            products={services} openProductModal={openProductModal} deleteProduct={deleteProduct}
                        />
                    )}
                    {activeTab === 'orders' && (
                        <OrdersTab orders={orders} openOrderModal={openOrderModal} deleteOrder={deleteOrder} />
                    )}
                    {activeTab === 'banners' && (
                        <BannersTab banners={banners} handleBannerUpload={handleBannerUpload}
                            deleteBanner={deleteBanner} fileInputRef={fileInputRef}
                        />
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
                {isModalOpen && <ProductModal editingProduct={editingProduct} onClose={() => { setIsModalOpen(false); setEditingProduct(null); }} onSave={saveProduct} />}
                {isOrderModalOpen && <OrderModal editingOrder={editingOrder} onClose={() => { setIsOrderModalOpen(false); setEditingOrder(null); }} onSave={saveOrder} />}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
