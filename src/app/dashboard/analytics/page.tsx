'use client';

import { useFetchReports } from '@/hooks/useFetchReports';
import AdvancedAnalyticsSection from '@/components/AdvancedAnalyticsSection';

export default function AnalyticsPage() {
  const { data: reports, isLoading, isError } = useFetchReports();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 min-h-[60vh]">
        <div className="relative flex justify-center items-center">
          <div className="absolute animate-ping w-16 h-16 rounded-full bg-blue-500/20"></div>
          <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl backdrop-blur-xl">
        <h3 className="font-semibold text-lg mb-2">Gagal Memuat Analitik</h3>
        <p className="text-sm opacity-80">Terjadi kesalahan saat memproses data visualisasi Anda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <AdvancedAnalyticsSection reportsData={reports || []} />
    </div>
  );
}
