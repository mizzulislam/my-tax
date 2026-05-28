import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { IncomeSourceInput, IncomeSource } from '@/types/taxpayer';

type IncomeSourceRow = {
  id: string;
  user_id: string;
  source_name: string;
  source_type: IncomeSource['sourceType'];
  annual_income: number | string;
  tax_year: number | string;
  npwp_pemotong: string | null;
  is_tax_withheld: boolean;
  withheld_amount: number | string;
  registration_year_for_umkm: number | string | null;
  notes: string | null;
  created_at: string;
};

// Fetch Hook
export function useFetchIncomeSources(taxYear?: number) {
  return useQuery<IncomeSource[]>({
    queryKey: taxYear ? ['income_sources_list', taxYear] : ['income_sources_list'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('income_sources')
        .select('*')
        .eq('user_id', user.id);

      if (taxYear) {
        query = query.eq('tax_year', taxYear);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        if (error.message.includes("Could not find the table") || error.code === 'P0001') {
          return [];
        }
        throw new Error(error.message);
      }

      // Map snake_case database columns to camelCase Zod schema properties
      return ((data || []) as IncomeSourceRow[]).map((d) => ({
        id: d.id,
        user_id: d.user_id,
        sourceName: d.source_name,
        sourceType: d.source_type,
        annualIncome: Number(d.annual_income),
        taxYear: Number(d.tax_year),
        npwpPemotong: d.npwp_pemotong,
        isTaxWithheld: d.is_tax_withheld,
        withheldAmount: Number(d.withheld_amount),
        registrationYearForUmkm: d.registration_year_for_umkm ? Number(d.registration_year_for_umkm) : null,
        notes: d.notes,
        created_at: d.created_at,
      }));
    },
  });
}

// Mutate Hook (Insert & Update)
export function useMutateIncomeSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: { id?: string } & IncomeSourceInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sesi aktif tidak ditemukan. Silakan login kembali.');

      const payload = {
        user_id: user.id,
        source_name: input.sourceName,
        source_type: input.sourceType,
        annual_income: input.annualIncome,
        tax_year: input.taxYear,
        npwp_pemotong: input.npwpPemotong || null,
        is_tax_withheld: input.isTaxWithheld,
        withheld_amount: input.isTaxWithheld ? input.withheldAmount : 0,
        registration_year_for_umkm: input.sourceType === 'usaha' ? input.registrationYearForUmkm || null : null,
        notes: input.notes || null,
      };

      if (id) {
        // Update
        const { data, error } = await supabase
          .from('income_sources')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (error) throw new Error(error.message);
        return data;
      } else {
        // Insert
        const { data, error } = await supabase
          .from('income_sources')
          .insert(payload)
          .select()
          .single();

        if (error) throw new Error(error.message);
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income_sources_list'] });
    },
  });
}

// Delete Hook
export function useDeleteIncomeSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('income_sources')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income_sources_list'] });
    },
  });
}
