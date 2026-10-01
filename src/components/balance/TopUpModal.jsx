import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, QrCode, CheckCircle2, RefreshCw } from 'lucide-react';
import api from '../../api';
import { formatRp } from '../../utils/currencyUtils';
import notify from '../../utils/notify';

const PRESET_AMOUNTS = [10000, 25000, 50000, 100000, 250000, 500000, 1000000];

export default function TopUpModal({ isOpen, onClose, balanceLimit, currentBalance, onSuccess, initialTopup = null }) {
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [error, setError] = useState('');
    const [topupData, setTopupData] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const resetState = useCallback(() => {
        setAmount('');
        setError('');
        setTopupData(null);
        setIsSuccess(false);
        setIsLoading(false);
        setIsChecking(false);
        setIsCancelling(false);
    }, []);

    const handleClose = useCallback(() => {
        // Jangan hapus pending topup di server agar user bisa melihat kembali QRIS-nya
        setError('');
        onClose();
    }, [onClose]);

    // Inisialisasi: jika ada initialTopup atau pending topup di database
    useEffect(() => {
        if (!isOpen) return;

        if (initialTopup) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTopupData(initialTopup);
            return;
        }

        // Cek apakah ada top-up pending yang aktif
        let isCancelled = false;
        const checkPending = async () => {
            try {
                const res = await api.getPendingTopup();
                if (!isCancelled && res.data?.data) {
                    setTopupData(res.data.data);
                }
            } catch {
                // Ignore
            }
        };
        checkPending();

        return () => { isCancelled = true; };
    }, [isOpen, initialTopup]);

    // Polling status pembayaran
    useEffect(() => {
        let interval;
        const refId = topupData?.topup_id || topupData?.reference_id || topupData?.id;

        if (isOpen && refId && !isSuccess) {
            const poll = async () => {
                try {
                    const res = await api.getTopupStatus(refId);
                    const status = res.data?.status;
                    if (status === 'completed' || status === 'success') {
                        setIsSuccess(true);
                        clearInterval(interval);
                        setTimeout(() => {
                            onSuccess();
                            resetState();
                        }, 2000);
                    } else if (status === 'failed' || status === 'cancelled' || status === 'expired') {
                        setError('Top up gagal, dibatalkan, atau kadaluarsa.');
                        setTopupData(null);
                        clearInterval(interval);
                    }
                } catch {
                    // Ignore poll errors
                }
            };

            interval = setInterval(poll, 4000);
        }
        return () => clearInterval(interval);
    }, [isOpen, topupData, isSuccess, onSuccess, resetState]);

    const handleManualCheck = async () => {
        const refId = topupData?.topup_id || topupData?.reference_id || topupData?.id;
        if (!refId) return;

        setIsChecking(true);
        try {
            const res = await api.getTopupStatus(refId);
            const status = res.data?.status;
            if (status === 'completed' || status === 'success') {
                setIsSuccess(true);
                setTimeout(() => {
                    onSuccess();
                    resetState();
                }, 1800);
            } else if (status === 'failed' || status === 'cancelled' || status === 'expired') {
                setError('Top up gagal, dibatalkan, atau kadaluarsa.');
                setTopupData(null);
            } else {
                notify.info('Pembayaran belum terdeteksi. Silakan coba beberapa saat lagi.');
            }
        } catch {
            notify.error('Gagal memeriksa status pembayaran');
        } finally {
            setIsChecking(false);
        }
    };

    const handleCancelTopup = async () => {
        const refId = topupData?.topup_id || topupData?.reference_id || topupData?.id;
        if (!refId) {
            setTopupData(null);
            return;
        }

        setIsCancelling(true);
        try {
            await api.cancelPendingTopup(refId);
            setTopupData(null);
            setError('');
            notify.info('Top up dibatalkan.');
        } catch (err) {
            notify.error(err.response?.data?.error || 'Gagal membatalkan top up');
        } finally {
            setIsCancelling(false);
        }
    };

    const maxAllowed = balanceLimit - (currentBalance || 0);

    const handleAmountChange = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        setAmount(val);
        setError('');
    };

    const handlePresetClick = (val) => {
        setAmount(val.toString());
        setError('');
    };

    const handleSubmit = async () => {
        const numAmount = parseInt(amount, 10);
        if (!numAmount || numAmount < 1000) {
            setError('Minimal top up adalah Rp 10.000');
            return;
        }
        if (numAmount > maxAllowed) {
            setError(`Maksimal top up adalah ${formatRp(maxAllowed)}`);
            return;
        }

        setIsLoading(true);
        setError('');
        
        try {
            const res = await api.createTopup({ amount: numAmount });
            setTopupData(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Gagal membuat top up');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const qrLink = topupData?.qr_link || topupData?.pg_qr_link;
    const totalPay = topupData?.total || topupData?.pg_total || topupData?.amount;
    const refCode = topupData?.topup_id || topupData?.reference_id || topupData?.id;
    const expiredAt = topupData?.pg_expired_at || topupData?.expired_at;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={handleClose} />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl w-full max-w-md relative z-10 overflow-hidden shadow-2xl"
            >
                <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-800">Top Up Saldo</h3>
                    <button onClick={handleClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 sm:p-6">
                    {isSuccess ? (
                        <div className="text-center py-8">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                            >
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </motion.div>
                            <h4 className="text-xl font-bold text-slate-800 mb-2">Top Up Berhasil!</h4>
                            <p className="text-slate-600">Saldo Anda telah ditambahkan secara otomatis.</p>
                        </div>
                    ) : topupData ? (
                        <div className="text-center space-y-4">
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">Total Pembayaran</p>
                                <p className="text-3xl font-extrabold text-purple-600">{formatRp(totalPay)}</p>
                                {refCode && (
                                    <p className="text-xs text-slate-400 mt-1">Ref ID: <span className="font-mono text-slate-600 font-medium">{refCode}</span></p>
                                )}
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 inline-block shadow-inner">
                                {qrLink ? (
                                    <img src={qrLink} alt="QRIS" className="w-48 h-48 sm:w-52 sm:h-52 mx-auto rounded-lg object-contain" />
                                ) : (
                                    <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">Memuat QRIS...</div>
                                )}
                            </div>

                            {expiredAt && (
                                <div>
                                    <span className="text-[11px] text-amber-700 bg-amber-50 py-1 px-3 rounded-full border border-amber-200/60 font-medium">
                                        ⏳ Berlaku hingga: {new Date(expiredAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                    </span>
                                </div>
                            )}

                            <div className="bg-purple-50 text-purple-700 p-3 rounded-xl text-xs flex items-center gap-2 justify-center font-medium border border-purple-100">
                                <Loader2 className="w-4 h-4 animate-spin text-purple-600 shrink-0" />
                                <span>Menunggu pembayaran... Saldo akan otomatis bertambah setelah dibayar.</span>
                            </div>

                            <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed text-left">
                                💡 <strong>Info:</strong> Jika Anda tidak sengaja menutup jendela ini, QRIS tetap dapat dilihat kembali kapan saja melalui menu <strong>Saldo & Top Up</strong> atau tombol <strong>Lihat QRIS</strong> di Riwayat Transaksi.
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={handleManualCheck}
                                    disabled={isChecking}
                                    className="flex-1 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                                >
                                    {isChecking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                                    Cek Pembayaran
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelTopup}
                                    disabled={isCancelling}
                                    className="py-2.5 px-4 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                                >
                                    {isCancelling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    Batalkan Top-Up
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-2">Pilih Nominal</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {PRESET_AMOUNTS.map(preset => (
                                        <button
                                            key={preset}
                                            onClick={() => handlePresetClick(preset)}
                                            disabled={preset > maxAllowed}
                                            className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                                                parseInt(amount) === preset 
                                                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' 
                                                    : preset > maxAllowed
                                                        ? 'bg-slate-50 text-slate-400 cursor-not-allowed opacity-50'
                                                        : 'bg-slate-50 text-slate-700 hover:bg-purple-50 hover:text-purple-600'
                                            }`}
                                        >
                                            {formatRp(preset).replace('Rp ', '')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-2">Atau Masukkan Nominal</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">Rp</span>
                                    <input
                                        type="text"
                                        value={amount ? parseInt(amount).toLocaleString('id-ID') : ''}
                                        onChange={handleAmountChange}
                                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 outline-none text-lg font-bold text-slate-800"
                                        placeholder="0"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    Maksimal top up: {formatRp(maxAllowed)}
                                </p>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isLoading || !amount}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <QrCode className="w-5 h-5" />}
                                Lanjutkan Pembayaran
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
