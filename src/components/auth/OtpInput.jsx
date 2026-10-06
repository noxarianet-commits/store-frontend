import { useRef } from 'react';
import { OTP_LENGTH, sanitizeOtp } from '../../utils/otpUtils';

/**
 * Input OTP 6 digit berupa kotak terpisah.
 *
 * Dipakai bersama oleh halaman verifikasi registrasi dan lupa password, jadi
 * perilaku fokus, tempel, dan panah satu arah hanya diimplementasikan sekali.
 *
 * Konvensi nilai: `value` adalah string digit yang benar-benar diketik user
 * (panjang 0..OTP_LENGTH). Kotak yang belum diisi dirender kosong, BUKAN '0'.
 * Padding dengan '0' akan membuat "belum diisi" tidak bisa dibedakan dari
 * digit nol sungguhan — dan nol di depan itu sah pada OTP (mis. "004271").
 *
 * @param {Object} props
 * @param {string} props.value - Digit yang sudah diketik user
 * @param {(next: string) => void} props.onChange - Dipanggil dengan digit baru
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.invalid] - Beri border merah
 * @param {string} [props.label] - Label aksesibilitas untuk kelompok kotak
 */
export default function OtpInput({ value, onChange, disabled = false, invalid = false, label = 'Kode verifikasi' }) {
    const inputRefs = useRef([]);
    const entered = String(value || '');

    const handleChange = (index, raw) => {
        const next = sanitizeOtp(raw);

        // Menyalin kode lengkap dari email/WhatsApp: sebar ke kotak berikutnya.
        if (next.length > 1) {
            const merged = (entered.slice(0, index) + next).slice(0, OTP_LENGTH);
            onChange(merged);
            inputRefs.current[Math.min(index + next.length, OTP_LENGTH - 1)]?.focus();
            return;
        }

        if (next.length === 0) {
            // Kotak dikosongkan (mis. tombol Delete di keyboard mobile).
            // Perlakukan sama dengan Backspace: hapus digit ini saja kalau ada,
            // kalau kotak memang kosong tinggal pangkas sisa setelahnya.
            const removed = index < entered.length
                ? entered.slice(0, index) + entered.slice(index + 1)
                : entered.slice(0, index);
            onChange(removed);
            return;
        }

        const padded = entered.padEnd(OTP_LENGTH, ' ');
        onChange((padded.slice(0, index) + next + padded.slice(index + 1)).slice(0, OTP_LENGTH));
        inputRefs.current[Math.min(index + 1, OTP_LENGTH - 1)]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            // Digit terisi → kosongkan kotak ini dulu, supaya satu kali tekan
            // Backspace cukup untuk menghapus satu digit.
            if (index < entered.length) {
                onChange(entered.slice(0, index) + entered.slice(index + 1));
                return;
            }
            if (index > 0) {
                onChange(entered.slice(0, index - 1));
                inputRefs.current[index - 1]?.focus();
            }
            return;
        }

        if (e.key === 'ArrowLeft' && index > 0) {
            e.preventDefault();
            inputRefs.current[index - 1]?.focus();
        }

        if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
            e.preventDefault();
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        const pasted = sanitizeOtp(e.clipboardData.getData('text'));
        if (!pasted) return;

        e.preventDefault();
        onChange(pasted);
        inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    };

    return (
        <div className="flex gap-2 sm:gap-2.5 justify-center" role="group" aria-label={`${label}, ${OTP_LENGTH} digit`}>
            {Array.from({ length: OTP_LENGTH }, (_, index) => (
                <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    // Satu-time-code membuat Android/iOS menampilkan kode OTP
                    // yang masuk lewat SMS atau notifikasi email.
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    autoCorrect="off"
                    spellCheck={false}
                    aria-label={`Digit ke-${index + 1}`}
                    value={index < entered.length ? entered[index] : ''}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    onFocus={(e) => e.target.select()}
                    disabled={disabled}
                    className={`w-full h-14 text-center text-xl font-bold rounded-xl border bg-white text-slate-900 outline-none transition-all disabled:bg-slate-100 disabled:cursor-not-allowed ${
                        invalid
                            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
                            : 'border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10'
                    }`}
                />
            ))}
        </div>
    );
}