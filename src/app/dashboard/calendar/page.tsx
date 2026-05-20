'use client';

import TaxCalendar from '@/components/TaxCalendar';
import Link from 'next/link';

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-blue-500/30 overflow-hidden relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -right-1/4 w-[1000px] h-[1000px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-1/4 -left-1/4 w-[800px] h-[800px] rounded-full bg-indigo-600/10 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-12 lg:px-24">
        <header className="mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium tracking-wide uppercase mb-6 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Sinkronisasi Regulasi
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60 mb-4">
              Kalender <span className="text-emerald-400">Pajak</span>
            </h1>
            <p className="text-slate-400 max-w-xl text-lg">
              Pantau seluruh tenggat waktu perpajakan Indonesia berdasarkan UU HPP agar terhindar dari sanksi administrasi.
            </p>
          </div>
          
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl transition-all font-medium text-sm self-start sm:self-center shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Kembali ke Dasbor
          </Link>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <TaxCalendar />
        </div>
      </div>
    </div>
  );
}
