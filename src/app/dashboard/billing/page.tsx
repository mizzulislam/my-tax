'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { useFetchReports } from '@/hooks/useFetchReports';
import { useConfirmBillingPaid, useCreateBillingCode, useFetchBillingCodes } from '@/hooks/useBillingCodes';
import { buildBillingVerificationPayload } from '@/lib/billingGenerator';
import { BillingCode } from '@/types/taxpayer';

const MIGRATION_SQL = `CREATE TABLE IF NOT EXISTS public.billing_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    report_id UUID REFERENCES public.tax_reports(id) ON DELETE CASCADE,
    billing_code VARCHAR(20) NOT NULL UNIQUE,
    amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    tax_type TEXT NOT NULL DEFAULT 'PPh 21',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paid', 'expired', 'cancelled')),
    expires_at TIMESTAMPTZ NOT NULL,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.billing_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User own billing SELECT" ON public.billing_codes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User own billing INSERT" ON public.billing_codes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User own billing UPDATE" ON public.billing_codes FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_billing_codes_user_status ON public.billing_codes(user_id, status);
CREATE INDEX IF NOT EXISTS idx_billing_codes_report ON public.billing_codes(report_id);`;

function formatRupiah(value: number) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
}

function BillingQr({ billing }: { billing: BillingCode }) {
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    QRCode.toDataURL(buildBillingVerificationPayload({
      billingCode: billing.billingCode,
      amount: billing.amount,
      reportId: billing.report_id,
    }), { margin: 1, width: 180 }).then(setQrUrl);
  }, [billing]);

  if (!qrUrl) return <div className="h-28 w-28 rounded-xl bg-slate-950 animate-pulse" />;
  return (
    <Image
      src={qrUrl}
      alt={`QR ${billing.billingCode}`}
      width={112}
      height={112}
      unoptimized
      className="h-28 w-28 rounded-xl border border-slate-800 bg-white p-2"
    />
  );
}

export default function BillingPage() {
  const [status, setStatus] = useState('all');
  const [copied, setCopied] = useState(false);
  const { data: billings = [], isLoading, error } = useFetchBillingCodes(status);
  const { data: reports = [] } = useFetchReports();
  const createBilling = useCreateBillingCode();
  const confirmPaid = useConfirmBillingPaid();

  const submittedReports = reports.filter((report) => report.status === 'submitted' && report.tax_payable > 0);
  const tableMissing = error?.message.includes('billing_codes') || error?.message.includes('schema cache');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3">
          e-Billing <span className="text-blue-500 font-extrabold">Mock</span>
        </h1>
        <p className="text-slate-400 max-w-2xl text-md leading-relaxed font-medium">
          Buat kode billing simulasi, pantau expiry 30 hari, dan konfirmasi pembayaran untuk mengubah laporan menjadi paid.
        </p>
      </div>

      {tableMissing ? (
        <div className="bg-slate-900/80 border border-red-500/30 rounded-3xl p-6 space-y-5">
          <h3 className="text-white font-black">Migrasi Billing Diperlukan</h3>
          <p className="text-sm text-slate-300">Jalankan SQL berikut di Supabase SQL Editor.</p>
          <div className="relative">
            <button
              onClick={() => {
                navigator.clipboard.writeText(MIGRATION_SQL);
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              }}
              className="absolute top-3 right-3 rounded-lg bg-blue-600 px-3 py-1.5 text-[10px] font-bold uppercase text-white"
            >
              {copied ? 'Tersalin' : 'Salin SQL'}
            </button>
            <pre className="max-h-80 overflow-auto rounded-2xl border border-slate-800 bg-slate-950 p-5 text-xs text-slate-300">{MIGRATION_SQL}</pre>
          </div>
        </div>
      ) : (
        <>
          <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-white">Buat Kode Billing dari Laporan Submitted</h2>
                <p className="text-sm text-slate-500 mt-1">Kode billing mock berlaku 30 hari sejak dibuat.</p>
              </div>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm outline-none"
              >
                <option value="all">Semua status</option>
                <option value="active">Active</option>
                <option value="paid">Paid</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {submittedReports.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-slate-800 border-dashed p-6 text-center text-sm text-slate-500">
                  Tidak ada laporan submitted yang siap dibuatkan billing.
                </div>
              ) : submittedReports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => createBilling.mutate(report)}
                  disabled={createBilling.isPending}
                  className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-left transition-all hover:border-blue-500/50 hover:bg-blue-500/10 disabled:opacity-50"
                >
                  <p className="text-sm font-bold text-white">{report.tax_year} / Masa {report.tax_period}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatRupiah(report.tax_payable)}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {isLoading ? (
              <div className="col-span-full h-48 rounded-3xl bg-slate-900/40 animate-pulse" />
            ) : billings.length === 0 ? (
              <div className="col-span-full rounded-3xl border border-slate-800 border-dashed py-20 text-center text-slate-500">
                Belum ada kode billing.
              </div>
            ) : billings.map((billing) => (
              <div key={billing.id} className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 flex gap-5">
                <BillingQr billing={billing} />
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-lg font-black text-white">{billing.billingCode}</p>
                      <p className="text-xs text-slate-500">Expires {new Date(billing.expiresAt).toLocaleDateString('id-ID')}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                      billing.status === 'paid' ? 'bg-emerald-500/10 text-emerald-300' :
                      billing.status === 'expired' ? 'bg-red-500/10 text-red-300' :
                      'bg-blue-500/10 text-blue-300'
                    }`}>
                      {billing.status}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-200">{formatRupiah(billing.amount)} - {billing.taxType}</p>
                  <p className="text-xs text-slate-500">
                    Laporan {billing.report?.tax_year || '-'} / Masa {billing.report?.tax_period || '-'}
                  </p>
                  {billing.status === 'active' && (
                    <button
                      onClick={() => confirmPaid.mutate(billing)}
                      disabled={confirmPaid.isPending}
                      className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-500 disabled:opacity-50"
                    >
                      Konfirmasi Bayar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
