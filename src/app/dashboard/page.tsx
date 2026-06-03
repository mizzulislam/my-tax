'use client';

import { useFetchReports } from '@/hooks/useFetchReports';
import { useFetchIncomeSources } from '@/hooks/useIncomeSources';
import DashboardStats from '@/components/DashboardStats';
import ReadinessPanel from '@/components/dashboard/ReadinessPanel';
import TaxHistoryTable from '@/components/TaxHistoryTable';

import TaxCalendar from '@/components/TaxCalendar';
import TaxTrendChart from '@/components/TaxTrendChart';
import AdvancedAnalyticsSection from '@/components/AdvancedAnalyticsSection';
import AIInsightCard from '@/components/dashboard/AIInsightCard';
import ExportReportButton from '@/components/dashboard/ExportReportButton';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useDemoStore } from '@/store/useDemoStore';
import { IncomeSource } from '@/types/taxpayer';

type TabType = 'overview' | 'analytics' | 'history' | 'calendar';

const dashboardTabs: { id: TabType; label: string }[] = [
  { id: 'overview', label: 'Ringkasan' },
  { id: 'analytics', label: 'Analitik' },
  { id: 'history', label: 'Riwayat Penghasilan' },
  { id: 'calendar', label: 'Kalender Pajak' },
];

function DashboardContent() {
  const { data: reports, isLoading, isError, error } = useFetchReports();
  const { data: incomeSources } = useFetchIncomeSources();
  const searchParams = useSearchParams();
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  const { isDemoMode } = useDemoStore();

  useEffect(() => {
    const err = searchParams.get('error');
    if (err) {
      setErrorBanner(decodeURIComponent(err));
      // Hapus query parameter dari URL agar bersih dan rapi
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams]);

  if (isLoading && !isDemoMode) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="relative flex justify-center items-center">
          <div className="absolute animate-ping w-16 h-16 rounded-full bg-blue-500/20"></div>
          <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (isError && !isDemoMode) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl backdrop-blur-xl">
        <h3 className="font-semibold text-lg mb-2">Gagal Memuat Data</h3>
        <p className="text-sm opacity-80">{error?.message}</p>
      </div>
    );
  }

  const reportsData = reports || [];
  const incomeData = (incomeSources || []) as IncomeSource[];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 relative">
      
      {/* BANNER NOTIFIKASI ERROR (ROLE GUARD LIMITATION) */}
      {errorBanner && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-sm text-red-400 rounded-2xl backdrop-blur-md flex items-center gap-3 shadow-lg shadow-red-500/5 animate-in slide-in-from-top-4 duration-300">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <span className="font-semibold">{errorBanner}</span>
        </div>
      )}

      {/* Welcome Title Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2 md:mb-3">
            Dasbor Utama
          </h1>
          <p className="text-slate-400 max-w-2xl text-sm md:text-md leading-relaxed">
            Kelola, simulasikan, dan pantau riwayat pelaporan pajak Anda secara terintegrasi menggunakan kalkulator pintar UU HPP.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tour-target-dashboard-tabs relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/45 p-1.5 shadow-2xl shadow-blue-950/20 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,0.16),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_35%,rgba(14,165,233,0.06))]" />
        <div
          aria-label="Navigasi dashboard"
          className="relative flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-4"
          role="tablist"
        >
          {dashboardTabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                type="button"
                className={`group relative min-h-11 shrink-0 overflow-hidden rounded-xl px-4 py-2.5 text-sm font-bold whitespace-nowrap outline-none transition-all duration-300 ease-out focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:min-w-0 sm:whitespace-normal ${
                  isActive
                    ? 'text-white shadow-lg shadow-cyan-500/15'
                    : 'text-slate-400 hover:-translate-y-0.5 hover:text-slate-100'
                }`}
              >
                <span
                  className={`absolute inset-0 rounded-xl transition-all duration-300 ease-out ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-400/95 via-blue-500/95 to-indigo-500/95 opacity-100'
                      : 'bg-white/[0.04] opacity-0 group-hover:opacity-100'
                  }`}
                />
                <span
                  className={`absolute inset-x-4 bottom-0 h-px rounded-full bg-cyan-200 transition-all duration-300 ${
                    isActive ? 'opacity-70 shadow-[0_0_18px_rgba(125,211,252,0.8)]' : 'opacity-0 group-hover:opacity-40'
                  }`}
                />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${isActive ? 'bg-white shadow-[0_0_12px_rgba(255,255,255,0.85)]' : 'bg-slate-600 group-hover:bg-cyan-300/80'}`} />
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="mt-4 animate-in fade-in zoom-in-95 duration-300">
        {activeTab === 'overview' && (
          <div className="space-y-6 md:space-y-8">
            <ReadinessPanel reports={reportsData} />
            <div className="tour-target-dashboard-stats">
              <DashboardStats data={reportsData} />
            </div>
            <div className="tour-target-trend-chart">
              <TaxTrendChart data={reportsData} />
            </div>
            <TaxHistoryTable 
              data={incomeData.slice(0, 3)} 
              variant="compact" 
              onViewAll={() => setActiveTab('history')} 
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <AdvancedAnalyticsSection reportsData={reportsData} />
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <TaxHistoryTable data={incomeData} />
          </div>
        )}

        {activeTab === 'calendar' && (
          <div>
            <TaxCalendar />
          </div>
        )}
      </div>

    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
