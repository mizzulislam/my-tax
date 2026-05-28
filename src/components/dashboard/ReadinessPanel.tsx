'use client';

import Link from 'next/link';
import { calculateReadiness, ReadinessStatus } from '@/lib/readinessEngine';
import type { TaxReportData } from '@/hooks/useFetchReports';
import { useFetchDocuments } from '@/hooks/useDocuments';
import { useFetchIncomeSources } from '@/hooks/useIncomeSources';
import { useTaxpayerStore } from '@/store/useTaxpayerStore';

function statusClass(status: ReadinessStatus) {
  if (status === 'complete') return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300';
  if (status === 'warning') return 'border-amber-500/25 bg-amber-500/10 text-amber-300';
  return 'border-blue-500/25 bg-blue-500/10 text-blue-300';
}

export default function ReadinessPanel({ reports }: { reports: TaxReportData[] }) {
  const profile = useTaxpayerStore((state) => state.profile);
  const taxYear = new Date().getFullYear();
  const { data: incomeSources } = useFetchIncomeSources(taxYear);
  const { data: documents } = useFetchDocuments(undefined, taxYear);
  const readiness = calculateReadiness({
    profile,
    reports,
    incomeSources,
    documents,
    taxYear,
  });

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/45 p-5 md:p-6 shadow-2xl shadow-slate-950/20">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">Kesiapan SPT {readiness.taxYear}</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">Checklist Wajib Pajak Orang Pribadi</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Fokuskan data identitas, penghasilan, berkas pendukung, dan laporan sebelum membuat kode billing resmi di kanal DJP.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-3 text-center">
            <div className="text-3xl font-black text-white">{readiness.score}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Skor</div>
          </div>
          <Link
            href={readiness.nextAction.href}
            className="rounded-xl bg-blue-600 px-4 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500"
          >
            Lanjutkan
          </Link>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {readiness.items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="rounded-xl border border-slate-800 bg-slate-950/45 p-4 transition hover:border-slate-700 hover:bg-slate-950/70"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-black text-white">{item.label}</span>
              <span className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${statusClass(item.status)}`}>
                {item.status === 'complete' ? 'Siap' : item.status === 'warning' ? 'Cek' : 'Isi'}
              </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-400">{item.detail}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
