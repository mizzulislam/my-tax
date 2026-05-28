import type { TaxReportData } from '@/hooks/useFetchReports';
import type { IncomeSource, TaxDocument, TaxpayerProfile } from '@/types/taxpayer';

export type ReadinessStatus = 'complete' | 'action' | 'warning';

export interface ReadinessItem {
  label: string;
  detail: string;
  href: string;
  status: ReadinessStatus;
  weight: number;
}

export interface ReadinessResult {
  score: number;
  taxYear: number;
  items: ReadinessItem[];
  nextAction: ReadinessItem;
}

export function calculateReadiness(input: {
  profile?: TaxpayerProfile | null;
  reports?: TaxReportData[];
  incomeSources?: IncomeSource[];
  documents?: TaxDocument[];
  taxYear?: number;
}): ReadinessResult {
  const taxYear = input.taxYear || new Date().getFullYear();
  const reports = input.reports || [];
  const incomeSources = input.incomeSources || [];
  const documents = input.documents || [];
  const profile = input.profile;

  const hasCoreProfile = Boolean(profile?.fullName && profile?.nik && profile?.npwp);
  const currentYearIncome = incomeSources.filter((source) => source.taxYear === taxYear);
  const currentYearDocuments = documents.filter((document) => !document.taxYear || document.taxYear === taxYear);
  const currentYearReport = reports.find((report) => report.tax_year === taxYear);
  const reportSubmitted = currentYearReport?.status === 'submitted' || currentYearReport?.status === 'paid';

  const items: ReadinessItem[] = [
    {
      label: 'Profil WP',
      detail: hasCoreProfile ? 'Identitas utama sudah terisi.' : 'Lengkapi nama, NIK, dan NPWP.',
      href: '/dashboard/profile',
      status: hasCoreProfile ? 'complete' : 'action',
      weight: 25,
    },
    {
      label: 'Penghasilan',
      detail: currentYearIncome.length > 0
        ? `${currentYearIncome.length} sumber penghasilan tahun ${taxYear} tercatat.`
        : `Tambahkan sumber penghasilan tahun ${taxYear}.`,
      href: '/dashboard/income',
      status: currentYearIncome.length > 0 ? 'complete' : 'action',
      weight: 25,
    },
    {
      label: 'Berkas',
      detail: currentYearDocuments.length > 0
        ? `${currentYearDocuments.length} berkas pendukung siap ditinjau.`
        : 'Unggah bukti potong, identitas, atau dokumen pendukung.',
      href: '/dashboard/documents',
      status: currentYearDocuments.length > 0 ? 'complete' : 'warning',
      weight: 25,
    },
    {
      label: 'Laporan',
      detail: reportSubmitted
        ? 'Laporan sudah masuk tahap submitted di aplikasi.'
        : currentYearReport
          ? 'Laporan masih perlu ditinjau sebelum pembayaran/pelaporan resmi.'
          : `Buat simulasi/laporan pajak tahun ${taxYear}.`,
      href: '/dashboard/kalkulator',
      status: reportSubmitted ? 'complete' : currentYearReport ? 'warning' : 'action',
      weight: 25,
    },
  ];

  const score = Math.round(
    items.reduce((total, item) => total + (item.status === 'complete' ? item.weight : 0), 0)
  );
  const nextAction = items.find((item) => item.status === 'action') || items.find((item) => item.status === 'warning') || items[0];

  return { score, taxYear, items, nextAction };
}
