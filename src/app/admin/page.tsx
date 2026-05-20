'use client';

import RoleGuard from '@/components/RoleGuard';
import Link from 'next/link';

export default function AdminPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="min-h-screen bg-slate-950 text-slate-50 relative flex overflow-hidden">
        
        {/* Background Gradients */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 -right-1/4 w-[1000px] h-[1000px] rounded-full bg-red-600/5 blur-[150px]" />
          <div className="absolute bottom-1/4 -left-1/4 w-[800px] h-[800px] rounded-full bg-orange-600/5 blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-12 lg:px-24 w-full space-y-8 animate-in fade-in duration-500">
          
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-900 pb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold tracking-wider uppercase mb-3 shadow-inner">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                </span>
                Admin Panel Resmi
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
                Sistem <span className="text-red-500">Administration</span>
              </h1>
              <p className="text-slate-400 max-w-xl text-md mt-2">
                FR-02: Hak akses khusus Admin. Kelola parameter sistem, batasan PPh, audit log, serta kinerja asisten AI secara global.
              </p>
            </div>
            
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 rounded-xl transition-all font-semibold text-xs uppercase tracking-wider self-start sm:self-center shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Kembali ke Dasbor
            </Link>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">Total Pengguna Aktif</span>
              <p className="text-3xl font-black text-white font-mono">14,204</p>
              <span className="text-[10px] text-emerald-400 font-bold">+12% bulan ini</span>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">Kueri AI Terproses</span>
              <p className="text-3xl font-black text-white font-mono">82,410</p>
              <span className="text-[10px] text-blue-400 font-bold">Rata-rata 1.4s respons</span>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">Total Transaksi Audit</span>
              <p className="text-3xl font-black text-white font-mono">Rp 4.2B</p>
              <span className="text-[10px] text-slate-500 font-medium">Dalam 24 jam terakhir</span>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">Status Sistem</span>
              <p className="text-3xl font-black text-emerald-400 font-mono">99.98%</p>
              <span className="text-[10px] text-emerald-500 font-bold">Optimal & Sehat</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* System Audit Logs */}
            <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <h3 className="text-lg font-bold text-white tracking-tight border-b border-slate-800/80 pb-4">
                Global System Audit Log (24h)
              </h3>
              
              <div className="space-y-4 font-mono text-xs text-slate-400">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-900 flex justify-between gap-4">
                  <span className="text-slate-500">[21:14:02]</span>
                  <span className="text-white flex-1 truncate">ROLE CHANGE: User 'luzzyizzul27@gmail.com' role updated to 'admin'</span>
                  <span className="text-emerald-400">SUCCESS</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-900 flex justify-between gap-4">
                  <span className="text-slate-500">[20:45:11]</span>
                  <span className="text-slate-300 flex-1 truncate">AI ENGINE: Fine-tuning weights re-indexed for UU HPP</span>
                  <span className="text-blue-400">INFO</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-900 flex justify-between gap-4">
                  <span className="text-slate-500">[19:12:30]</span>
                  <span className="text-slate-300 flex-1 truncate">BACKUP: Daily database snapshot generated to storage</span>
                  <span className="text-emerald-400">SUCCESS</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-900 flex justify-between gap-4">
                  <span className="text-slate-500">[17:02:49]</span>
                  <span className="text-red-400 flex-1 truncate">SECURITY: MFA challenge bypass blocked from IP 182.16.2.40</span>
                  <span className="text-red-500 font-bold">BLOCKED</span>
                </div>
              </div>
            </div>

            {/* Admin Controls */}
            <div className="lg:col-span-1 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <h3 className="text-lg font-bold text-white tracking-tight border-b border-slate-800/80 pb-4">
                Administrasi Cepat
              </h3>
              
              <div className="space-y-4">
                <button className="w-full py-3 px-4 bg-red-650/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-bold text-xs rounded-xl transition-all uppercase tracking-wider">
                  Paksa Pembaruan Skema Cache
                </button>
                <button className="w-full py-3 px-4 bg-slate-800 border border-slate-700 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl transition-all uppercase tracking-wider">
                  Unduh Log Enkripsi Lengkap
                </button>
                <button className="w-full py-3 px-4 bg-slate-850/50 border border-slate-800 text-slate-500 font-semibold text-xs rounded-xl cursor-not-allowed uppercase tracking-wider" disabled>
                  Reset Konfigurasi (Disabled)
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </RoleGuard>
  );
}
