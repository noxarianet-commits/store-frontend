import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    AlertTriangle,
    ArrowLeft,
    Baby,
    CheckCircle2,
    Clock,
    Cookie,
    Database,
    FileText,
    Globe2,
    LifeBuoy,
    Lock,
    MessageCircle,
    RefreshCw,
    Share2,
    ShieldCheck,
    Trash2,
    UserCheck,
} from 'lucide-react';
import api from '../api';
import { formatWaDisplay, getWaNumber, getWaUrl } from '../utils/waUtils';

const LAST_UPDATED = '22 November 2026';
const POLICY_VERSION = '1.0';

const TOC = [
    { id: 'tentang', label: 'Tentang kebijakan ini' },
    { id: 'data', label: 'Data yang kami kumpulkan' },
    { id: 'penggunaan', label: 'Cara kami menggunakan data' },
    { id: 'dasar', label: 'Dasar pemrosesan & persetujuan' },
    { id: 'pihak-ketiga', label: 'Pembagian data' },
    { id: 'retensi', label: 'Penyimpanan & retensi' },
    { id: 'keamanan', label: 'Keamanan data' },
    { id: 'hak', label: 'Hak Anda' },
    { id: 'hapus-akun', label: 'Penghapusan akun' },
    { id: 'anak', label: 'Anak-anak' },
    { id: 'cookie', label: 'Cookie & penyimpanan lokal' },
    { id: 'internasional', label: 'Transfer data internasional' },
    { id: 'perubahan', label: 'Perubahan kebijakan' },
    { id: 'kontak', label: 'Hubungi kami' },
];

const SUMMARY_POINTS = [
    'Kami hanya meminta data yang diperlukan untuk membuat akun, memproses pesanan, dan memberikan bantuan.',
    'Kami tidak menjual data pribadi dan tidak memakai SDK iklan atau pelacakan perilaku pihak ketiga.',
    'Pembayaran QRIS diproses oleh penyedia pembayaran; kami tidak menyimpan nomor kartu, PIN, atau kredensial bank.',
    'Anda dapat meminta akses, koreksi, atau penghapusan akun kapan saja melalui CS.',
];

const Section = ({ id, icon: Icon, title, children }) => (
    <section
        id={id}
        className="scroll-mt-24 border-t border-slate-100 pt-8 first:border-t-0 first:pt-0"
    >
        <div className="mb-4 flex items-center gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-purple-100 bg-purple-50 text-purple-600">
                <Icon size={17} />
            </span>
            <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">{title}</h2>
        </div>
        <div className="space-y-4 text-sm leading-relaxed text-slate-600">{children}</div>
    </section>
);

const DataTable = ({ columns, children }) => (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[560px] text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-700">
                <tr>
                    {columns.map((column) => (
                        <th key={column} className="whitespace-nowrap px-3 py-2.5 font-bold">
                            {column}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">{children}</tbody>
        </table>
    </div>
);

const Callout = ({ tone = 'purple', icon: Icon = ShieldCheck, title, children }) => {
    const tones = {
        purple: 'border-purple-200 bg-purple-50/60 text-purple-900',
        amber: 'border-amber-200 bg-amber-50/70 text-amber-900',
        teal: 'border-teal-200 bg-teal-50/70 text-teal-900',
    };

    return (
        <div className={`rounded-2xl border p-4 ${tones[tone]}`}>
            <div className="flex items-start gap-3">
                <Icon size={18} className="mt-0.5 shrink-0" />
                <div className="space-y-1 text-xs leading-relaxed sm:text-sm">
                    {title ? <p className="font-bold">{title}</p> : null}
                    <div>{children}</div>
                </div>
            </div>
        </div>
    );
};

const PrivacyPage = () => {
    const navigate = useNavigate();
    const [settings, setSettings] = useState({});

    useEffect(() => {
        api.get('/settings', { skipGlobalErrorRedirect: true })
            .then((res) => setSettings(res.data || {}))
            .catch(() => {});
    }, []);

    useEffect(() => {
        const previousTitle = document.title;
        document.title = 'Kebijakan Privasi — Noxarianet Store';
        return () => {
            document.title = previousTitle;
        };
    }, []);

    // ScrollToTop selalu kembali ke atas saat mount; halaman ini juga dipakai
    // sebagai tautan langsung ke bagian penghapusan akun (mis. /privacy#hapus-akun).
    useEffect(() => {
        const hash = window.location.hash.replace('#', '');
        if (!hash) return;
        const target = document.getElementById(hash);
        if (target) target.scrollIntoView({ block: 'start' });
    }, []);

    const waNumber = getWaNumber(settings);
    const privacyWaUrl = getWaUrl(
        settings,
        'Halo CS Noxarianet, saya ingin mengajukan pertanyaan tentang Kebijakan Privasi.'
    );
    const deleteWaUrl = getWaUrl(
        settings,
        'Halo CS Noxarianet, saya ingin mengajukan permohonan penghapusan akun.'
    );

    return (
        <div className="min-h-screen p-6 font-sans text-slate-800 md:p-12">
            <div className="mx-auto max-w-4xl">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-purple-600"
                >
                    <ArrowLeft size={16} /> Kembali
                </button>

                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-purple-100 bg-purple-50 text-purple-600 shadow-sm">
                        <ShieldCheck size={26} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-purple-600">
                            Privacy Policy · Dokumen Legal
                        </p>
                        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                            Kebijakan Privasi
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Noxarianet Store &amp; Aplikasi Android Noxarianet
                        </p>
                    </div>
                </div>

                <div className="mb-6 mt-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500">
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                        Terakhir diperbarui: {LAST_UPDATED}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                        Versi {POLICY_VERSION}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                        Bahasa Indonesia
                    </span>
                </div>

                <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm md:p-8">
                    <h2 className="text-lg font-extrabold text-slate-900">Ringkasan</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        Kebijakan ini menjelaskan data apa yang kami akses, kumpulkan, gunakan,
                        simpan, dan bagikan saat Anda memakai situs dan aplikasi Noxarianet.
                        Kami berusaha menulisnya dengan bahasa yang jelas, bukan sekadar
                        memenuhi syarat formal.
                    </p>
                    <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                        {SUMMARY_POINTS.map((point) => (
                            <li
                                key={point}
                                className="flex items-start gap-2.5 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-xs leading-relaxed text-slate-600"
                            >
                                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-teal-600" />
                                <span>{point}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <nav
                    aria-label="Daftar isi kebijakan privasi"
                    className="mt-4 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm md:p-6"
                >
                    <div className="mb-3 flex items-center gap-2">
                        <FileText size={16} className="text-purple-600" />
                        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-700">
                            Daftar Isi
                        </p>
                    </div>
                    <ol className="grid gap-x-6 gap-y-2 text-xs sm:grid-cols-2 sm:text-sm">
                        {TOC.map((item, index) => (
                            <li key={item.id}>
                                <a
                                    href={`#${item.id}`}
                                    className="text-slate-600 transition-colors hover:text-purple-600 hover:underline"
                                >
                                    {index + 1}. {item.label}
                                </a>
                            </li>
                        ))}
                    </ol>
                </nav>

                <div className="mt-4 space-y-8 rounded-3xl border border-purple-100 bg-white p-6 shadow-sm md:p-8">
                    <Section id="tentang" icon={ShieldCheck} title="1. Tentang Kebijakan Ini">
                        <p>
                            <strong>Noxarianet Store</strong> (&ldquo;Noxarianet&rdquo;,
                            &ldquo;kami&rdquo;) mengelola situs Noxarianet dan aplikasi Android{' '}
                            <strong>Noxarianet</strong> dengan nama paket{' '}
                            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[12px] text-slate-700">
                                com.noxarianet.store
                            </code>
                            . Alamat operasional kami berada di Kab. Pekalongan, Jawa Tengah,
                            Indonesia.
                        </p>
                        <p>
                            Kebijakan Privasi ini menjelaskan bagaimana kami mengakses,
                            mengumpulkan, menggunakan, menyimpan, membagikan, dan menghapus data
                            pribadi. Kebijakan ini berlaku untuk situs, aplikasi Android, layanan
                            customer service (CS), dan tiket bantuan Noxarianet.
                        </p>
                        <p>
                            Dengan membuat akun atau menggunakan layanan kami, Anda menyatakan
                            telah membaca dan memahami kebijakan ini. Jika Anda tidak setuju,
                            mohon jangan membuat akun atau menggunakan layanan.
                        </p>
                        <Callout tone="purple" icon={ShieldCheck} title="Identitas pengelola">
                            Noxarianet Store — Kab. Pekalongan, Jawa Tengah, Indonesia. Kanal
                            pertanyaan privasi tersedia di bagian <a href="#kontak" className="font-semibold underline">Hubungi Kami</a>.
                        </Callout>
                    </Section>

                    <Section id="data" icon={Database} title="2. Data yang Kami Kumpulkan">
                        <p>
                            Kami hanya mengumpulkan data yang relevan dengan fungsi layanan.
                            Data akun dan transaksi bersifat wajib untuk menggunakan layanan,
                            sedangkan izin perangkat seperti notifikasi dan penyimpanan struk
                            bersifat opsional. Tabel berikut merangkum kategori data, sumber, dan
                            tujuannya.
                        </p>
                        <DataTable columns={['Kategori', 'Contoh data', 'Sumber', 'Tujuan']}>
                            <tr>
                                <td className="px-3 py-2.5 align-top font-semibold text-slate-800">
                                    Identitas akun
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Nama tampilan, email, nomor WhatsApp, kata sandi (dalam bentuk
                                    hash), status verifikasi email.
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Anda saat mendaftar, masuk, atau mengubah profil.
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Membuat dan mengamankan akun, login, verifikasi OTP, serta
                                    menghubungi Anda.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2.5 align-top font-semibold text-slate-800">
                                    Transaksi &amp; pesanan
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Nomor pesanan, produk/varian, nominal, status, waktu, ID tujuan
                                    (ID game, nomor meter PLN, nomor HP/e-wallet), nama pelanggan,
                                    email/WA checkout, catatan, serta SN/token/kode lisensi.
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Anda, sistem Noxarianet, dan vendor pemenuhan produk.
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Memproses pesanan, menampilkan struk, menangani garansi, dan
                                    menyelesaikan sengketa.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2.5 align-top font-semibold text-slate-800">
                                    Akun produk digital
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Kredensial akun (email/kata sandi) untuk produk akun shared atau
                                    private, jika jenis produk yang dibeli memang berupa akun.
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Anda dan/atau vendor penyedia akun.
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Mengirim akses produk dan memverifikasi klaim garansi.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2.5 align-top font-semibold text-slate-800">
                                    Saldo &amp; pembayaran
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Saldo, riwayat top-up/pembelian/refund, metode pembayaran
                                    (saldo atau QRIS), referensi/invoice, dan status pembayaran.
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Anda, sistem Noxarianet, dan penyedia pembayaran.
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Memproses pembayaran, pengembalian dana, dan pencatatan
                                    keuangan.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2.5 align-top font-semibold text-slate-800">
                                    Dukungan pelanggan
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Nama, email/WA, nomor tiket, kategori, subjek, isi pesan, dan
                                    pesanan terkait.
                                </td>
                                <td className="px-3 py-2.5 align-top">Anda.</td>
                                <td className="px-3 py-2.5 align-top">
                                    Menjawab pertanyaan, mencatat riwayat bantuan, dan
                                    menindaklanjuti kendala.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2.5 align-top font-semibold text-slate-800">
                                    Perangkat &amp; teknis
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Expo Push Token, platform, versi aplikasi, status token; alamat
                                    IP, waktu, jalur permintaan, user agent, dan log kesalahan.
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Aplikasi dan server Noxarianet.
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Mengirim notifikasi, menjaga keamanan, membatasi penyalahgunaan,
                                    dan mendiagnosis gangguan.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2.5 align-top font-semibold text-slate-800">
                                    Data lokal di perangkat
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Token sesi, cache profil/beranda/konfigurasi, info
                                    pembayaran/top-up sementara, email pendaftaran tertunda, dan
                                    preferensi banner.
                                </td>
                                <td className="px-3 py-2.5 align-top">Aplikasi Noxarianet.</td>
                                <td className="px-3 py-2.5 align-top">
                                    Menjaga sesi tetap aktif dan memberi pengalaman yang lebih
                                    stabil saat koneksi lambat.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2.5 align-top font-semibold text-slate-800">
                                    Izin perangkat
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Izin notifikasi dan izin penyimpanan/galeri untuk menyimpan
                                    gambar struk.
                                </td>
                                <td className="px-3 py-2.5 align-top">Anda.</td>
                                <td className="px-3 py-2.5 align-top">
                                    Menampilkan notifikasi transaksi dan menyimpan struk ke
                                    perangkat. Izin bersifat opsional.
                                </td>
                            </tr>
                        </DataTable>

                        <p className="text-xs text-slate-500">
                            Data lokal tidak diunggah sebagai profil terpisah. Token sesi
                            dikirim ke server hanya untuk mengautentikasi permintaan Anda.
                        </p>

                        <Callout tone="amber" icon={AlertTriangle} title="Yang tidak kami minta">
                            Kami tidak meminta akses lokasi, kontak, SMS, log panggilan,
                            mikrofon, kamera, data kesehatan, atau daftar aplikasi yang terpasang
                            di perangkat Anda. Aplikasi juga tidak mengunggah isi galeri foto ke
                            server; gambar struk hanya disimpan ke perangkat jika Anda menekan
                            tombol simpan dan memberikan izin.
                        </Callout>
                    </Section>

                    <Section id="penggunaan" icon={UserCheck} title="3. Cara Kami Menggunakan Data">
                        <p>Data yang kami kumpulkan digunakan untuk:</p>
                        <ul className="list-disc space-y-2 pl-5">
                            <li>Membuat, memverifikasi, dan mengamankan akun Anda.</li>
                            <li>Memproses pesanan, pembayaran, top-up saldo, refund, dan pengiriman produk.</li>
                            <li>Mengirim kode OTP, notifikasi status pesanan, dan informasi penting terkait layanan.</li>
                            <li>Menyediakan customer service, tiket bantuan, garansi, dan penyelesaian sengketa.</li>
                            <li>Mencegah penipuan, spam, penyalahgunaan, dan serangan terhadap sistem.</li>
                            <li>Memenuhi kewajiban hukum, perpajakan, akuntansi, dan permintaan otoritas yang sah.</li>
                            <li>Mendiagnosis gangguan teknis dan meningkatkan keandalan layanan berdasarkan log yang terbatas.</li>
                        </ul>
                        <p>
                            Kami <strong>tidak</strong> menggunakan data Anda untuk iklan
                            bertarget, membuat profil iklan, atau menjual data kepada pihak lain.
                            Kami juga tidak menggunakan keputusan otomatis yang menimbulkan akibat
                            hukum signifikan tanpa keterlibatan manusia.
                        </p>
                    </Section>

                    <Section id="dasar" icon={CheckCircle2} title="4. Dasar Pemrosesan & Persetujuan">
                        <p>
                            Kami memproses data pribadi berdasarkan satu atau lebih dasar berikut:
                        </p>
                        <ul className="list-disc space-y-2 pl-5">
                            <li>
                                <strong>Persetujuan Anda</strong> — saat mendaftar, melakukan
                                checkout, atau mengaktifkan izin opsional seperti notifikasi dan
                                penyimpanan struk.
                            </li>
                            <li>
                                <strong>Pelaksanaan layanan</strong> — untuk membuat akun,
                                memproses pesanan, menangani pembayaran, dan memberikan garansi.
                            </li>
                            <li>
                                <strong>Kewajiban hukum</strong> — untuk pencatatan transaksi,
                                perpajakan, akuntansi, dan permintaan sah dari otoritas.
                            </li>
                            <li>
                                <strong>Kepentingan yang sah</strong> — untuk keamanan sistem,
                                pencegahan penipuan, dan peningkatan layanan, dengan tetap
                                memperhatikan hak dan kebebasan Anda.
                            </li>
                        </ul>
                        <p>
                            Anda dapat menarik persetujuan kapan saja melalui kanal di bagian{' '}
                            <a href="#kontak" className="font-semibold text-purple-600 hover:underline">
                                Hubungi Kami
                            </a>
                            . Penarikan persetujuan tidak membatalkan pemrosesan yang sudah
                            dilakukan secara sah, tetapi layanan tertentu mungkin tidak dapat
                            diberikan tanpa data yang diperlukan.
                        </p>
                        <p className="text-xs text-slate-500">
                            Kebijakan ini disusun dengan memperhatikan Undang-Undang No. 27 Tahun
                            2022 tentang Pelindungan Data Pribadi dan praktik perlindungan data
                            yang berlaku umum.
                        </p>
                    </Section>

                    <Section id="pihak-ketiga" icon={Share2} title="5. Pembagian Data dengan Pihak Ketiga & Penyedia Layanan">
                        <p>
                            Kami tidak menjual data pribadi. Kami hanya membagikan data kepada
                            pihak yang membantu operasional layanan, atau jika diwajibkan hukum.
                            Pihak-pihak tersebut hanya menerima data yang diperlukan untuk
                            tugasnya.
                        </p>
                        <DataTable columns={['Pihak', 'Peran', 'Data yang dibagikan']}>
                            <tr>
                                <td className="px-3 py-2.5 align-top font-semibold text-slate-800">
                                    Supabase
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Penyedia basis data dan infrastruktur autentikasi.
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Data akun, pesanan, tiket, saldo, dan metadata perangkat.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2.5 align-top font-semibold text-slate-800">
                                    Penyedia pembayaran QRIS
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    DYQRIS untuk transaksi aktif; Sekalipay/FinCloud untuk transaksi
                                    historis.
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Nomor pesanan, nominal, status, dan data pelanggan yang
                                    diperlukan untuk membuat serta memverifikasi tagihan.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2.5 align-top font-semibold text-slate-800">
                                    Vendor pemenuhan produk
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    OkeConnect dan Sekalipay untuk pengiriman produk digital, top-up,
                                    serta tagihan.
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    ID tujuan, produk/varian, nominal, dan data kontak yang
                                    diperlukan untuk pemenuhan atau pengecekan status.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2.5 align-top font-semibold text-slate-800">
                                    Penyedia email
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Resend, Brevo, dan Mailketing untuk OTP serta notifikasi
                                    transaksi.
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Alamat email, nama, dan informasi pesanan yang relevan.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2.5 align-top font-semibold text-slate-800">
                                    Expo &amp; Google FCM
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Expo Push Service, pembaruan aplikasi (OTA), dan Google FCM
                                    untuk pengiriman notifikasi push.
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Push token perangkat, versi aplikasi, dan isi notifikasi.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2.5 align-top font-semibold text-slate-800">
                                    Infrastruktur hosting
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    VPS, Cloudflare, dan Nginx untuk menyajikan situs serta API dan
                                    menjaga keamanan lalu lintas.
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Metadata teknis seperti alamat IP, waktu akses, dan jalur
                                    permintaan.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2.5 align-top font-semibold text-slate-800">
                                    Google Fonts
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Penyedia font yang dimuat oleh situs.
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Alamat IP dan metadata permintaan font.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2.5 align-top font-semibold text-slate-800">
                                    WhatsApp / Meta &amp; Telegram
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Kanal CS yang Anda hubungi dan notifikasi internal untuk admin.
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Nomor WhatsApp, isi percakapan, ID pesanan, produk, nominal,
                                    email/WA pembeli, dan data tiket.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2.5 align-top font-semibold text-slate-800">
                                    Admin &amp; staf berwenang
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Menangani pesanan, tiket, refund, dan garansi.
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Data yang diperlukan untuk menyelesaikan permintaan Anda.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2.5 align-top font-semibold text-slate-800">
                                    Otoritas hukum
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Jika diwajibkan oleh hukum atau perintah yang sah.
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Data yang diminta secara sah dan proporsional.
                                </td>
                            </tr>
                        </DataTable>
                        <p>
                            Jika terjadi penggabungan, akuisisi, atau pengalihan usaha, data dapat
                            dialihkan kepada pihak penerus dengan pemberitahuan yang wajar dan
                            tetap tunduk pada kebijakan ini.
                        </p>
                        <p>
                            Kami tidak menggunakan jaringan iklan, broker data, atau SDK analitik
                            perilaku pihak ketiga di situs maupun aplikasi.
                        </p>
                    </Section>

                    <Section id="retensi" icon={Clock} title="6. Penyimpanan & Retensi Data">
                        <p>
                            Kami menyimpan data hanya selama diperlukan untuk tujuan di atas,
                            memenuhi kewajiban hukum, atau menyelesaikan sengketa.
                        </p>
                        <DataTable columns={['Jenis data', 'Masa simpan', 'Catatan']}>
                            <tr>
                                <td className="px-3 py-2.5 align-top font-semibold text-slate-800">
                                    Profil &amp; akun
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Selama akun aktif; dihapus atau dianonimkan paling lambat 30 hari
                                    setelah permintaan terverifikasi.
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Termasuk email, nomor WhatsApp, dan kata sandi.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2.5 align-top font-semibold text-slate-800">
                                    Transaksi &amp; keuangan
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Hingga 10 tahun setelah transaksi, atau selama diwajibkan hukum.
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Untuk akuntansi, perpajakan, garansi, dan penyelesaian sengketa.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2.5 align-top font-semibold text-slate-800">
                                    Tiket dukungan
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    24 bulan setelah aktivitas terakhir.
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Untuk menjaga riwayat bantuan dan kualitas layanan.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2.5 align-top font-semibold text-slate-800">
                                    Push token
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Sampai logout, uninstall, token tidak valid, atau akun dihapus.
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Token yang tidak aktif ditandai agar tidak dipakai lagi.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2.5 align-top font-semibold text-slate-800">
                                    OTP &amp; pendaftaran tertunda
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    OTP berlaku 10 menit; pendaftaran yang tidak diverifikasi
                                    dihapus otomatis.
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Kode disimpan dalam bentuk hash, bukan teks biasa.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2.5 align-top font-semibold text-slate-800">
                                    Log teknis
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Maksimal 30 hari, kecuali diperlukan untuk investigasi keamanan.
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Dipakai untuk keamanan, pembatasan laju, dan diagnostik.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2.5 align-top font-semibold text-slate-800">
                                    Cache lokal
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Sampai logout, uninstall, atau data aplikasi dibersihkan.
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Berada di perangkat Anda, bukan di server.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2.5 align-top font-semibold text-slate-800">
                                    Backup sistem
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Mengikuti siklus backup penyedia, umumnya tidak lebih dari 30
                                    hari.
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    Salinan backup ditimpa secara otomatis.
                                </td>
                            </tr>
                        </DataTable>
                        <p>
                            Setelah masa retensi berakhir, data dihapus atau dianonimkan sehingga
                            tidak lagi dapat dikaitkan dengan Anda.
                        </p>
                    </Section>

                    <Section id="keamanan" icon={Lock} title="7. Keamanan Data">
                        <p>
                            Kami menerapkan langkah teknis dan organisasi yang wajar untuk
                            melindungi data pribadi, antara lain:
                        </p>
                        <ul className="list-disc space-y-2 pl-5">
                            <li>Koneksi situs dan API menggunakan HTTPS/TLS.</li>
                            <li>Kata sandi disimpan sebagai hash bcrypt, bukan teks biasa.</li>
                            <li>Kode OTP disimpan sebagai hash dengan tambahan pepper dan memiliki masa berlaku terbatas.</li>
                            <li>Token sesi aplikasi Android disimpan di penyimpanan aman perangkat (SecureStore).</li>
                            <li>Akses ke dashboard admin dibatasi dan dilindungi autentikasi.</li>
                            <li>Kredensial akun produk digital hanya dapat diakses admin berwenang dan digunakan untuk pengiriman produk serta penanganan garansi.</li>
                            <li>Data pembayaran sensitif seperti nomor kartu, PIN, atau kredensial bank tidak disimpan di sistem kami.</li>
                        </ul>
                        <Callout tone="teal" icon={ShieldCheck} title="Jaga kerahasiaan akun Anda">
                            CS Noxarianet tidak pernah meminta kata sandi, PIN, atau kode OTP
                            akun Anda. Jangan membagikan kode OTP kepada siapa pun, termasuk
                            kepada pihak yang mengaku sebagai CS.
                        </Callout>
                        <p>
                            Tidak ada sistem yang sepenuhnya bebas risiko. Jika terjadi
                            pelanggaran data yang berdampak pada Anda, kami akan memberi tahu
                            pengguna yang terdampak dan otoritas yang berwenang sesuai ketentuan
                            hukum yang berlaku.
                        </p>
                    </Section>

                    <Section id="hak" icon={UserCheck} title="8. Hak Anda">
                        <p>Anda berhak untuk:</p>
                        <ul className="list-disc space-y-2 pl-5">
                            <li>Meminta akses dan salinan data pribadi yang kami simpan.</li>
                            <li>Meminta koreksi data yang tidak akurat atau tidak lengkap.</li>
                            <li>Meminta penghapusan data dan akun, dengan ketentuan pada bagian berikutnya.</li>
                            <li>Menarik persetujuan atas pemrosesan yang didasarkan pada persetujuan.</li>
                            <li>Membatasi atau mengajukan keberatan atas pemrosesan tertentu.</li>
                            <li>Meminta salinan data dalam format yang terstruktur dan dapat dibaca.</li>
                            <li>Mengajukan keluhan kepada otoritas pengawasan perlindungan data pribadi yang berwenang di Indonesia.</li>
                        </ul>
                        <p>
                            Permintaan dapat diajukan melalui WhatsApp CS atau tiket bantuan.
                            Kami akan memverifikasi kepemilikan akun terlebih dahulu, lalu
                            menindaklanjuti dalam waktu yang wajar, paling lambat 14 hari kerja.
                            Permintaan tidak dikenakan biaya, kecuali bersifat berulang secara
                            berlebihan atau memerlukan upaya teknis yang tidak wajar.
                        </p>
                        <p>
                            Dalam kondisi tertentu, kami dapat menolak permintaan jika
                            bertentangan dengan hak pihak lain, kewajiban hukum, atau kepentingan
                            keamanan yang sah. Jika demikian, kami akan menjelaskan alasannya.
                        </p>
                    </Section>

                    <Section id="hapus-akun" icon={Trash2} title="9. Penghapusan Akun">
                        <Callout tone="amber" icon={AlertTriangle} title="Penghapusan bersifat permanen">
                            Setelah akun dihapus, Anda tidak dapat mengakses riwayat pesanan,
                            struk, garansi, atau saldo yang terkait. Pastikan Anda sudah
                            menyimpan bukti transaksi yang diperlukan.
                        </Callout>
                        <p>
                            Anda dapat mengajukan penghapusan akun dari luar aplikasi melalui
                            halaman ini, atau dari dalam aplikasi melalui menu{' '}
                            <strong>Bantuan &gt; Chat CS</strong>. Ikuti langkah berikut:
                        </p>
                        <ol className="list-decimal space-y-3 pl-5">
                            <li>
                                Hubungi CS melalui{' '}
                                <a
                                    href={deleteWaUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-semibold text-purple-600 hover:underline"
                                >
                                    WhatsApp {formatWaDisplay(waNumber)}
                                </a>{' '}
                                atau buat tiket baru dengan kategori <strong>Akun</strong> dan
                                subjek <strong>&ldquo;Permintaan Penghapusan Akun&rdquo;</strong>.
                            </li>
                            <li>
                                Sertakan email terdaftar dan nomor WhatsApp yang Anda pakai. Jangan
                                pernah mengirim kata sandi atau kode OTP.
                            </li>
                            <li>
                                Kami akan memverifikasi kepemilikan akun dalam waktu paling lama 3
                                hari kerja. Jika diperlukan, kami dapat meminta bukti kepemilikan
                                tambahan.
                            </li>
                            <li>
                                Setelah terverifikasi, data akun dihapus atau dianonimkan dalam
                                waktu paling lama 30 hari kalender. Konfirmasi akan dikirim melalui
                                email atau WhatsApp terdaftar.
                            </li>
                        </ol>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-teal-100 bg-teal-50/60 p-4">
                                <p className="text-xs font-extrabold uppercase tracking-wider text-teal-800">
                                    Yang dihapus
                                </p>
                                <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs text-teal-900/80">
                                    <li>Profil, nama tampilan, email, dan nomor WhatsApp.</li>
                                    <li>Kata sandi dan status verifikasi akun.</li>
                                    <li>Push token dan sesi aktif di perangkat.</li>
                                    <li>Data akun lain yang tidak wajib disimpan untuk tujuan hukum.</li>
                                </ul>
                            </div>
                            <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
                                <p className="text-xs font-extrabold uppercase tracking-wider text-amber-800">
                                    Yang dapat dipertahankan
                                </p>
                                <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs text-amber-900/80">
                                    <li>Catatan transaksi untuk kewajiban pajak dan akuntansi.</li>
                                    <li>Data yang diperlukan untuk pencegahan penipuan atau sengketa.</li>
                                    <li>Data yang wajib disimpan berdasarkan perintah hukum.</li>
                                    <li>Data agregat yang tidak dapat dikaitkan dengan Anda.</li>
                                </ul>
                            </div>
                        </div>
                        <p>
                            Jika masih terdapat saldo, CS akan menjelaskan pilihan penyelesaian
                            saldo sebelum proses penghapusan dijalankan. Data yang dipertahankan
                            untuk kewajiban hukum akan disimpan sesuai masa retensi pada bagian 6
                            dan tidak digunakan untuk tujuan lain.
                        </p>
                    </Section>

                    <Section id="anak" icon={Baby} title="10. Anak-Anak">
                        <p>
                            Layanan Noxarianet tidak ditujukan untuk anak di bawah 13 tahun. Kami
                            tidak dengan sengaja mengumpulkan data pribadi anak di bawah 13 tahun.
                        </p>
                        <p>
                            Jika Anda berusia 13&ndash;17 tahun, gunakan layanan ini hanya dengan
                            izin dan pengawasan orang tua atau wali. Jika kami mengetahui adanya
                            data anak di bawah 13 tahun yang dikumpulkan tanpa dasar yang sah,
                            kami akan menghapusnya.
                        </p>
                        <p>
                            Orang tua atau wali yang mengetahui anaknya memberikan data kepada
                            kami dapat menghubungi CS untuk meminta penghapusan.
                        </p>
                    </Section>

                    <Section id="cookie" icon={Cookie} title="11. Cookie & Penyimpanan Lokal">
                        <p>
                            Kami tidak menggunakan cookie iklan atau pelacakan perilaku pihak
                            ketiga. Situs menggunakan penyimpanan lokal browser untuk menyimpan
                            token sesi, token akses pesanan (sessionStorage), token akses tiket
                            (localStorage), preferensi tampilan, dan draf testimoni.
                        </p>
                        <p>
                            Aplikasi Android menggunakan penyimpanan aman perangkat (SecureStore)
                            untuk token sesi dan penyimpanan lokal (AsyncStorage) untuk cache
                            profil, beranda, konfigurasi, serta informasi pembayaran/top-up
                            sementara. Data ini membantu menjaga sesi dan pengalaman saat koneksi
                            lambat.
                        </p>
                        <p>
                            Anda dapat menghapus data lokal kapan saja melalui pengaturan browser
                            atau dengan logout dan membersihkan data aplikasi di perangkat. Logout
                            juga menghapus cache sensitif yang terkait dengan sesi.
                        </p>
                    </Section>

                    <Section id="internasional" icon={Globe2} title="12. Transfer Data Internasional">
                        <p>
                            Data Anda dapat disimpan atau diproses di luar Indonesia oleh penyedia
                            layanan seperti Supabase, penyedia pembayaran, vendor pemenuhan, dan
                            layanan email/push. Kami berupaya memastikan pemrosesan tersebut
                            dilakukan dengan pengamanan kontraktual dan teknis yang wajar.
                        </p>
                        <p>
                            Dengan menggunakan layanan, Anda memahami bahwa data dapat diproses di
                            yurisdiksi lain yang mungkin memiliki ketentuan perlindungan data yang
                            berbeda. Kami tetap berkomitmen melindungi data sesuai kebijakan ini.
                        </p>
                    </Section>

                    <Section id="perubahan" icon={RefreshCw} title="13. Perubahan Kebijakan">
                        <p>
                            Kami dapat memperbarui kebijakan ini untuk menyesuaikan fitur,
                            teknologi, atau ketentuan hukum yang berlaku. Versi terbaru selalu
                            tersedia di halaman ini dengan tanggal pembaruan.
                        </p>
                        <p>
                            Untuk perubahan yang bersifat material, kami akan memberi tahu Anda
                            melalui situs, aplikasi, atau email terdaftar sebelum perubahan
                            berlaku. Jika Anda tetap menggunakan layanan setelah tanggal berlaku,
                            Anda dianggap menyetujui kebijakan yang diperbarui.
                        </p>
                    </Section>

                    <Section id="kontak" icon={MessageCircle} title="14. Hubungi Kami">
                        <p>
                            Untuk pertanyaan, permintaan akses/koreksi data, atau permintaan
                            penghapusan akun, hubungi kami melalui kanal resmi berikut. Sertakan
                            email terdaftar dan nomor pesanan (jika ada) agar kami dapat membantu
                            lebih cepat.
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <a
                                href={privacyWaUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="group rounded-2xl border border-teal-200 bg-teal-50/60 p-4 transition-all hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-sm"
                            >
                                <div className="flex items-center gap-2 text-teal-800">
                                    <MessageCircle size={18} />
                                    <p className="text-sm font-extrabold">WhatsApp CS</p>
                                </div>
                                <p className="mt-1 text-xs text-teal-900/70">
                                    {formatWaDisplay(waNumber)}
                                </p>
                                <p className="mt-2 text-xs font-semibold text-teal-700 group-hover:underline">
                                    Buka percakapan &rarr;
                                </p>
                            </a>
                            <Link
                                to="/ticket/new"
                                className="group rounded-2xl border border-purple-200 bg-purple-50/60 p-4 transition-all hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-sm"
                            >
                                <div className="flex items-center gap-2 text-purple-800">
                                    <LifeBuoy size={18} />
                                    <p className="text-sm font-extrabold">Tiket Bantuan</p>
                                </div>
                                <p className="mt-1 text-xs text-purple-900/70">
                                    Catat permintaan Anda agar diproses tim CS.
                                </p>
                                <p className="mt-2 text-xs font-semibold text-purple-700 group-hover:underline">
                                    Buat tiket &rarr;
                                </p>
                            </Link>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-xs leading-relaxed text-slate-600">
                            <p className="font-bold text-slate-800">Noxarianet Store</p>
                            <p>Kab. Pekalongan, Jawa Tengah, Indonesia</p>
                            <p className="mt-1">
                                Subjek pesan: <strong>&ldquo;Privasi&rdquo;</strong> atau{' '}
                                <strong>&ldquo;Hapus Akun&rdquo;</strong>.
                            </p>
                        </div>
                    </Section>
                </div>

                <footer className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row">
                    <p>&copy; {new Date().getFullYear()} Noxarianet Store. Seluruh hak cipta dilindungi.</p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link to="/tos" className="font-medium transition hover:text-purple-600">
                            Syarat &amp; Ketentuan
                        </Link>
                        <Link to="/garansi" className="font-medium transition hover:text-purple-600">
                            Garansi
                        </Link>
                        <Link to="/faq" className="font-medium transition hover:text-purple-600">
                            FAQ
                        </Link>
                        <Link to="/download" className="font-medium transition hover:text-purple-600">
                            Aplikasi Android
                        </Link>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default PrivacyPage;
