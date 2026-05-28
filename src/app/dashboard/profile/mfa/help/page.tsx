import Link from 'next/link';

const steps = [
  {
    title: 'Login ke Akun My Tax',
    body: 'Secara umum, Anda akan diarahkan ke halaman dashboard dan dapat langsung melanjutkan ke pengaturan akun.',
  },
  {
    title: 'Atur Two-Factor Authentication',
    body: 'Masuk ke halaman Pengaturan dengan klik foto profil Anda di pojok kanan atas, pilih menu Pengaturan, lalu buka bagian Akun. Pada bagian Two Factor Authentication, aktifkan tombol untuk masuk ke halaman verifikasi 2FA.',
  },
  {
    title: 'Scan QR Code dengan Google Authenticator',
    body: 'Setelah memilih untuk mengaktifkan 2FA, Anda akan melihat QR code di layar. Buka aplikasi Google Authenticator, tekan ikon tambah, pilih Pindai kode QR, lalu arahkan kamera perangkat Anda ke QR code.',
  },
  {
    title: 'Verifikasi Kode 2FA',
    body: 'Setelah QR code dipindai, Google Authenticator akan menampilkan kode enam digit untuk akun My Tax Anda. Masukkan kode tersebut ke halaman Two-Factor Authentication, lalu klik Verifikasi 2FA.',
  },
  {
    title: 'Verifikasi 2FA Berhasil',
    body: 'Setelah kode diverifikasi, 2FA akan aktif di akun Anda. Saat login ulang, Anda akan diminta memasukkan kode autentikasi enam digit dari aplikasi selain kata sandi.',
  },
];

const securityTips = [
  'Jangan bagikan kode autentikasi atau recovery code kepada siapa pun.',
  'Pastikan perangkat Anda selalu dalam keadaan aman.',
  'Perbarui aplikasi Google Authenticator secara berkala untuk mendapatkan fitur terbaru.',
  'Jangan hapus aplikasi authenticator dari perangkat Anda karena kode tersebut diperlukan setiap login.',
];

export default function MfaHelpPage() {
  return (
    <div className="min-h-[calc(100vh-7rem)] px-4 py-10 md:px-8">
      <article className="mx-auto max-w-4xl rounded-3xl border border-slate-800/70 bg-slate-950/45 p-6 shadow-2xl shadow-blue-950/20 md:p-10">
        <div className="mb-8 flex flex-col gap-5 border-b border-slate-800/70 pb-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-400">Panduan Keamanan</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-white md:text-4xl">
              Cara Mengaktifkan Two-Factor Authentication (2FA) di Akun My Tax
            </h1>
            <p className="mt-4 max-w-3xl text-sm font-medium leading-relaxed text-slate-400">
              Keamanan akun menjadi salah satu prioritas utama dalam dunia digital. Oleh karena itu, My Tax menyediakan fitur Two-Factor Authentication (2FA) untuk melindungi akun Anda dari akses tidak sah.
            </p>
          </div>
          <Link
            href="/dashboard/profile/mfa"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-500"
          >
            Aktifkan 2FA
          </Link>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Apa Itu Two-Factor Authentication (2FA)?</h2>
          <p className="text-sm font-medium leading-relaxed text-slate-400">
            2FA adalah lapisan tambahan keamanan yang mengharuskan pengguna memberikan dua jenis verifikasi untuk mengakses akun. Dengan mengaktifkan 2FA, selain memasukkan kata sandi, Anda juga harus memberikan kode autentikasi yang dihasilkan oleh aplikasi seperti Google Authenticator atau Microsoft Authenticator.
          </p>
        </section>

        <section className="mt-10 space-y-5">
          <h2 className="text-2xl font-bold text-white">Persiapan Sebelum Memulai</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800/70 bg-slate-900/45 p-5">
              <h3 className="font-bold text-white">Unduh Google Authenticator</h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-400">
                Pastikan Anda telah mengunduh dan menginstal aplikasi Google Authenticator di perangkat Anda. Aplikasi ini tersedia gratis di Google Play Store dan App Store.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800/70 bg-slate-900/45 p-5">
              <h3 className="font-bold text-white">Akses Akun My Tax</h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-400">
                Login ke akun My Tax Anda melalui website My Tax, lalu masuk ke halaman Pengaturan Akun.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-white">Langkah-Langkah Mengaktifkan 2FA</h2>
          <div className="mt-6 space-y-4">
            {steps.map((step, index) => (
              <div key={step.title} className="flex gap-4 rounded-2xl border border-slate-800/70 bg-slate-900/35 p-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-bold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-slate-400">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
          <h2 className="text-xl font-bold text-amber-100">Jika Tidak Bisa Scan QR Code</h2>
          <p className="mt-3 text-sm font-medium leading-relaxed text-amber-100/80">
            Jika Anda terkendala login menggunakan aplikasi authenticator, tidak bisa scan barcode, barcode tidak muncul, atau tidak menemukan kode, gunakan kode manual yang tersedia di bawah QR code. Masukkan secret tersebut ke aplikasi authenticator, lalu gunakan kode enam digit yang muncul untuk verifikasi.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-white">Tips Keamanan Tambahan</h2>
          <div className="mt-5 grid gap-3">
            {securityTips.map((tip) => (
              <div key={tip} className="flex gap-3 rounded-2xl border border-slate-800/70 bg-slate-900/35 p-4">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m5 13 4 4L19 7" />
                </svg>
                <p className="text-sm font-medium leading-relaxed text-slate-400">{tip}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-10 border-t border-slate-800/70 pt-6">
          <p className="text-sm font-medium leading-relaxed text-slate-400">
            Dengan mengaktifkan 2FA, keamanan akun My Tax Anda telah ditingkatkan. Nikmati pengalaman belajar, mengelola pajak, dan beraktivitas di My Tax dengan lebih tenang.
          </p>
        </div>
      </article>
    </div>
  );
}
