'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { MaskedTaxData } from '@/components/admin/MaskedTaxData';
import { ModernSelect } from '@/components/ui/ModernSelect';
import RoleGuard from '@/components/RoleGuard';
import {
  useAdminDocuments,
  useAdminStats,
  useAdminUsers,
  useAuditLogs,
  useUpdateAdminUserRole,
  useVerifyAdminDocument,
} from '@/hooks/admin/useAdminApi';
import { AdminUser, UserRole } from '@/types/taxpayer';


import { OverviewTab, UsersTab, AuditTab, DocumentsTab, tabs, TabId } from '@/components/admin/AdminTabs';


export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="min-h-screen bg-slate-950 text-slate-50 relative flex overflow-hidden">
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 -right-1/4 w-[900px] h-[900px] rounded-full bg-red-600/5 blur-[150px]" />
          <div className="absolute bottom-1/4 -left-1/4 w-[760px] h-[760px] rounded-full bg-blue-600/5 blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-10 lg:px-16 w-full space-y-8 animate-in fade-in duration-500">
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-900 pb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold tracking-wider uppercase mb-3 shadow-inner">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                </span>
                Admin Panel Fungsional
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
                Sistem <span className="text-red-500">Administration</span>
              </h1>
              <p className="text-slate-400 max-w-2xl text-md mt-2">
                Kelola user, pantau audit trail, verifikasi dokumen, dan lihat statistik sistem berbasis data Supabase real.
              </p>
            </div>

            <Link
              href="/admin/modules"
              className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl transition-all font-semibold text-xs uppercase tracking-wider self-start sm:self-center shadow-lg"
            >
              CMS Modul Pajak
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl transition-all font-semibold text-xs uppercase tracking-wider self-start sm:self-center shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Kembali ke Dasbor
            </Link>
          </header>

          <nav className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider border whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-500/10'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'audit' && <AuditTab />}
          {activeTab === 'documents' && <DocumentsTab />}
        </div>
      </div>
    </RoleGuard>
  );
}
