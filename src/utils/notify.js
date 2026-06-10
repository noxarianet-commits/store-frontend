import Swal from 'sweetalert2';

/**
 * Sistem Notifikasi Toast — seperti flash message di PHP
 * Muncul di pojok kanan atas, auto-dismiss
 */

const toastBase = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#1a1a2e',
    color: '#fff',
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

/** Notifikasi sukses (hijau) */
export const notifySuccess = (title) => {
    toastBase.fire({ icon: 'success', title, iconColor: '#22c55e' });
};

/** Notifikasi error (merah) */
export const notifyError = (title) => {
    toastBase.fire({ icon: 'error', title, iconColor: '#ef4444', timer: 4000 });
};

/** Notifikasi warning (kuning) */
export const notifyWarning = (title) => {
    toastBase.fire({ icon: 'warning', title, iconColor: '#eab308' });
};

/** Notifikasi info (biru) */
export const notifyInfo = (title) => {
    toastBase.fire({ icon: 'info', title, iconColor: '#3b82f6' });
};

/** Dialog konfirmasi (untuk hapus dll) */
export const confirmAction = async ({ title = 'Yakin?', text = 'Tindakan ini tidak bisa dibatalkan.', confirmText = 'Ya, lanjutkan!', cancelText = 'Batal', danger = false } = {}) => {
    const result = await Swal.fire({
        icon: 'warning',
        title,
        text,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        confirmButtonColor: danger ? '#dc2626' : '#7c3aed',
        cancelButtonColor: '#374151',
        background: '#0E0E0E',
        color: '#fff'
    });
    return result.isConfirmed;
};

/** Alert besar (untuk pesan penting seperti pesanan selesai) */
export const showAlert = async ({ icon = 'success', title, text, confirmText = 'OK' } = {}) => {
    await Swal.fire({
        icon,
        title,
        text,
        confirmButtonText: confirmText,
        background: '#0E0E0E',
        color: '#fff',
        confirmButtonColor: '#7c3aed'
    });
};

export default { success: notifySuccess, error: notifyError, warning: notifyWarning, info: notifyInfo, confirm: confirmAction, alert: showAlert };
