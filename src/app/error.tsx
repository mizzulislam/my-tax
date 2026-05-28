'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[global-error-boundary]', error.digest || error.message);
  }, [error]);

  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-blue-300">My Tax</p>
          <h1 className="mt-4 text-3xl font-black text-white">Terjadi gangguan aplikasi</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Kami tidak menampilkan detail teknis di layar untuk menjaga keamanan data pajak Anda.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-8 rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-400"
          >
            Coba lagi
          </button>
        </main>
      </body>
    </html>
  );
}
