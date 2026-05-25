import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AiTaxContext {
  currentYear: number;
  totalIncome: number;
  totalTax: number;
  draftCount: number;
  submittedCount: number;
  paidCount: number;
  incomeSources: Array<{
    name: string;
    type: string;
    annualIncome: number;
    taxYear: number;
  }>;
  assets: Array<{
    name: string;
    type: string;
    currentValue: number | null;
    taxYear: number;
  }>;
  recentTransactions: Array<{
    date: string;
    amount: number;
    category: string;
    description: string | null;
    taxType: string | null;
  }>;
  recentScenarios: Array<{
    name: string;
    baseTax: number;
    simTax: number | null;
    taxSaving: number | null;
  }>;
}

type QueryError = {
  code?: string;
  message?: string;
};

type ReportRow = { tax_year: number | string | null; gross_income: number | string | null; tax_payable: number | string | null; status: string | null };
type IncomeSourceContextRow = { source_name: string; source_type: string; annual_income: number | string | null; tax_year: number | string | null };
type AssetContextRow = { asset_name: string; asset_type: string; current_value: number | string | null; tax_year: number | string | null };
type TransactionContextRow = { date: string; amount: number | string | null; category: string; description: string | null; tax_type: string | null };
type ScenarioContextRow = { scenario_name: string; base_tax_result: number | string | null; sim_tax_result: number | string | null; tax_difference: number | string | null };

async function safeSelect<T>(query: PromiseLike<{ data: T | null; error: QueryError | null }>, fallback: T): Promise<T> {
  const { data, error } = await query;
  if (error) {
    if (
      error.code === '42P01' ||
      error.code === 'PGRST205' ||
      error.code === 'PGRST204' ||
      error.code === 'P0001' ||
      String(error.message || '').includes('Could not find the table') ||
      String(error.message || '').includes('Could not find') ||
      String(error.message || '').includes('schema cache')
    ) {
      return fallback;
    }
    throw new Error(error.message);
  }
  return data ?? fallback;
}

export function useAiTaxContext() {
  return useQuery<AiTaxContext>({
    queryKey: ['ai_tax_context'],
    queryFn: async () => {
      const currentYear = new Date().getFullYear();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          currentYear,
          totalIncome: 0,
          totalTax: 0,
          draftCount: 0,
          submittedCount: 0,
          paidCount: 0,
          incomeSources: [],
          assets: [],
          recentTransactions: [],
          recentScenarios: [],
        };
      }

      const [reports, incomeSources, assets, transactions, scenarios] = await Promise.all([
        safeSelect<ReportRow[]>(
          supabase
            .from('tax_reports')
            .select('tax_year, gross_income, tax_payable, status')
            .eq('user_id', user.id),
          []
        ),
        safeSelect<IncomeSourceContextRow[]>(
          supabase
            .from('income_sources')
            .select('source_name, source_type, annual_income, tax_year')
            .eq('user_id', user.id)
            .order('annual_income', { ascending: false })
            .limit(8),
          []
        ),
        safeSelect<AssetContextRow[]>(
          supabase
            .from('assets')
            .select('asset_name, asset_type, current_value, tax_year')
            .eq('user_id', user.id)
            .order('current_value', { ascending: false })
            .limit(8),
          []
        ),
        safeSelect<TransactionContextRow[]>(
          supabase
            .from('transactions')
            .select('date, amount, category, description, tax_type')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .limit(8),
          []
        ),
        safeSelect<ScenarioContextRow[]>(
          supabase
            .from('what_if_scenarios')
            .select('scenario_name, base_tax_result, sim_tax_result, tax_difference, created_at')
            .eq('user_id', user.id)
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
          name: source.source_name,
          type: source.source_type,
          annualIncome: Number(source.annual_income || 0),
          taxYear: Number(source.tax_year || currentYear),
        })),
        assets: assets.map((asset) => ({
          name: asset.asset_name,
          type: asset.asset_type,
          currentValue: asset.current_value === null ? null : Number(asset.current_value || 0),
          taxYear: Number(asset.tax_year || currentYear),
        })),
        recentTransactions: transactions.map((transaction) => ({
          date: transaction.date,
          amount: Number(transaction.amount || 0),
          category: transaction.category,
          description: transaction.description,
          taxType: transaction.tax_type,
        })),
        recentScenarios: scenarios.map((scenario) => ({
          name: scenario.scenario_name,
          baseTax: Number(scenario.base_tax_result || 0),
          simTax: scenario.sim_tax_result === null ? null : Number(scenario.sim_tax_result || 0),
          taxSaving: scenario.tax_difference === null ? null : Number(scenario.tax_difference || 0),
        })),
      };
    },
    staleTime: 60_000,
  });
}
