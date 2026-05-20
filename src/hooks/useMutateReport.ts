import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { TaxReportInput } from '@/types/taxpayer';
import { calculateProgressiveTax } from '@/lib/taxEngine';

export interface MutateReportData extends TaxReportInput {
  status?: 'draft' | 'submitted' | 'paid' | 'overdue';
  taxPayable?: number;
}

export function useMutateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportData: MutateReportData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sesi aktif tidak ditemukan. Silakan login kembali.');

      // Hitung nominal pajak terutang via taxEngine sebelum dikirim ke backend (gunakan yang dilempar dari Wizard jika ada)
      const taxPayable = reportData.taxPayable !== undefined
        ? reportData.taxPayable
        : calculateProgressiveTax(reportData.grossIncome);

      const { data, error } = await supabase
        .from('tax_reports')
        .insert({
          user_id: user.id,
          tax_year: reportData.taxYear,
          tax_period: reportData.taxPeriod,
          gross_income: reportData.grossIncome,
          tax_payable: taxPayable,
          status: reportData.status || 'draft',
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax_reports_list'] });
    },
  });
}
