'use client';

import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[dashboard-error-boundary]', error.digest || error.message);
  }, [error]);

  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-lg text-center">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-300">Dashboard</p>
        <h2 className="mt-4 text-2xl font-black text-white">Data belum bisa dimuat</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Silakan coba muat ulang panel ini. Detail teknis disimpan di log server, bukan ditampilkan bersama data pajak.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-400"
        >
          Coba lagi
        </button>
      </div>
    </section>
  );
}
