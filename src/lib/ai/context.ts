import { createScopedServerClient } from '@/lib/adminServer';

export interface AiTaxContextPayload {
  currentYear?: number;
  totalIncome?: number;
  totalTax?: number;
  draftCount?: number;
  submittedCount?: number;
  paidCount?: number;
  incomeSources?: Array<{ name?: string; type?: string; annualIncome?: number; taxYear?: number }>;
  assets?: Array<{ name?: string; type?: string; currentValue?: number | null; taxYear?: number }>;
  recentTransactions?: Array<{ date?: string; amount?: number; category?: string; description?: string | null; taxType?: string | null }>;
  recentScenarios?: Array<{ name?: string; baseTax?: number; simTax?: number | null; taxSaving?: number | null }>;
}

export type ChatHistoryItem = {
  role: 'user' | 'ai' | 'system';
  content: string;
};

export type SupabaseQueryResult<T> = PromiseLike<{
  data: T | null;
  error: { code?: string; message?: string } | null;
}>;

export async function safeSelect<T>(query: SupabaseQueryResult<T>, fallback: T): Promise<T> {
  const { data, error } = await query;
  if (error) {
    const message = String(error.message || '');
    if (
      error.code === '42P01' ||
      error.code === 'PGRST205' ||
      error.code === 'PGRST204' ||
      error.code === 'P0001' ||
      message.includes('Could not find')
    ) {
      return fallback;
    }
    throw new Error(message);
  }
  return data ?? fallback;
}

export function formatRupiah(value?: number | null) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
}

export function formatAiContext(aiContext?: AiTaxContextPayload | null) {
  if (!aiContext) {
    return 'Konteks multi-source belum tersedia dari aplikasi.';
  }

  const incomeSources = (aiContext.incomeSources || [])
    .slice(0, 6)
    .map((source) => `${source.name || 'Sumber'} (${source.type || '-'}): ${formatRupiah(source.annualIncome)}/tahun ${source.taxYear || ''}`.trim())
    .join('; ') || 'Belum ada sumber penghasilan tersimpan';

  const recentTransactions = (aiContext.recentTransactions || [])
    .slice(0, 6)
    .map((trx) => `${trx.date || '-'} ${trx.category || 'Transaksi'} ${formatRupiah(trx.amount)} (${trx.taxType || 'jenis pajak belum diklasifikasi'})`)
    .join('; ') || 'Belum ada transaksi terbaru';

  const assets = (aiContext.assets || [])
    .slice(0, 5)
    .map((asset) => `${asset.name || 'Aset'} (${asset.type || '-'}): ${asset.currentValue === null ? 'nilai kini belum diisi' : formatRupiah(asset.currentValue)}`)
    .join('; ') || 'Belum ada aset tersimpan';

  const scenarios = (aiContext.recentScenarios || [])
    .slice(0, 4)
    .map((scenario) => `${scenario.name || 'Skenario'}: pajak dasar ${formatRupiah(scenario.baseTax)}, simulasi ${scenario.simTax === null ? 'belum dihitung' : formatRupiah(scenario.simTax)}, selisih ${scenario.taxSaving === null ? 'belum dihitung' : formatRupiah(scenario.taxSaving)}`)
    .join('; ') || 'Belum ada skenario what-if';

  return [
    `Tahun konteks: ${aiContext.currentYear || new Date().getFullYear()}`,
    `Total Penghasilan Tahun Ini: ${formatRupiah(aiContext.totalIncome)}`,
    `Total Pajak Terutang Tahun Ini: ${formatRupiah(aiContext.totalTax)}`,
    `Status Laporan: ${aiContext.draftCount || 0} draft, ${aiContext.submittedCount || 0} submitted, ${aiContext.paidCount || 0} arsip paid lama`,
    `Sumber Penghasilan: ${incomeSources}`,
    `Aset Tercatat: ${assets}`,
    `Transaksi Terakhir: ${recentTransactions}`,
    `Skenario What-If Terakhir: ${scenarios}`,
  ].join('\n- ');
}

export async function fetchAiTaxContextForUser(
  supabase: ReturnType<typeof createScopedServerClient>,
  userId: string
): Promise<AiTaxContextPayload> {
  const currentYear = new Date().getFullYear();
  const [reports, incomeSources, assets, transactions, scenarios] = await Promise.all([
    safeSelect<Array<{ tax_year: number | string | null; gross_income: number | string | null; tax_payable: number | string | null; status: string | null }>>(
      supabase
        .from('tax_reports')
        .select('tax_year, gross_income, tax_payable, status')
        .eq('user_id', userId),
      []
    ),
    safeSelect<Array<{ source_name: string | null; source_type: string | null; annual_income: number | string | null; tax_year: number | string | null }>>(
      supabase
        .from('income_sources')
        .select('source_name, source_type, annual_income, tax_year')
        .eq('user_id', userId)
        .order('annual_income', { ascending: false })
        .limit(8),
      []
    ),
    safeSelect<Array<{ asset_name: string | null; asset_type: string | null; current_value: number | string | null; tax_year: number | string | null }>>(
      supabase
        .from('assets')
        .select('asset_name, asset_type, current_value, tax_year')
        .eq('user_id', userId)
        .order('current_value', { ascending: false })
        .limit(8),
      []
    ),
    safeSelect<Array<{ date: string | null; amount: number | string | null; category: string | null; description: string | null; tax_type: string | null }>>(
      supabase
        .from('transactions')
        .select('date, amount, category, description, tax_type')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(8),
      []
    ),
    safeSelect<Array<{ scenario_name: string | null; base_tax_result: number | string | null; sim_tax_result: number | string | null; tax_difference: number | string | null }>>(
      supabase
        .from('what_if_scenarios')
        .select('scenario_name, base_tax_result, sim_tax_result, tax_difference, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5),
      []
    ),
  ]);

  const currentYearReports = reports.filter((report) => Number(report.tax_year) === currentYear);

  return {
    currentYear,
    totalIncome: currentYearReports.reduce((sum, report) => sum + Number(report.gross_income || 0), 0),
    totalTax: currentYearReports.reduce((sum, report) => sum + Number(report.tax_payable || 0), 0),
    draftCount: reports.filter((report) => report.status === 'draft').length,
    submittedCount: reports.filter((report) => report.status === 'submitted').length,
    paidCount: reports.filter((report) => report.status === 'paid').length,
    incomeSources: incomeSources.map((source) => ({
      name: source.source_name || 'Sumber penghasilan',
      type: source.source_type || '-',
      annualIncome: Number(source.annual_income || 0),
      taxYear: Number(source.tax_year || currentYear),
    })),
    assets: assets.map((asset) => ({
      name: asset.asset_name || 'Aset',
      type: asset.asset_type || '-',
      currentValue: asset.current_value === null ? null : Number(asset.current_value || 0),
      taxYear: Number(asset.tax_year || currentYear),
    })),
    recentTransactions: transactions.map((transaction) => ({
      date: transaction.date || '-',
      amount: Number(transaction.amount || 0),
      category: transaction.category || 'Transaksi',
      description: transaction.description,
      taxType: transaction.tax_type,
    })),
    recentScenarios: scenarios.map((scenario) => ({
      name: scenario.scenario_name || 'Skenario',
      baseTax: Number(scenario.base_tax_result || 0),
      simTax: scenario.sim_tax_result === null ? null : Number(scenario.sim_tax_result || 0),
      taxSaving: scenario.tax_difference === null ? null : Number(scenario.tax_difference || 0),
    })),
  };
}
