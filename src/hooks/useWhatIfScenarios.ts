import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { WhatIfScenario, WhatIfScenarioInput } from '@/types/taxpayer';

type WhatIfScenarioRow = {
  id: string;
  user_id: string;
  scenario_name: string;
  base_gross_income: number | string;
  base_ptkp_status: string;
  base_tax_result: number | string;
  sim_gross_income: number | string | null;
  sim_ptkp_status: string | null;
  sim_additional_income: number | string;
  sim_additional_deductions: number | string;
  sim_umkm_mode: boolean;
  sim_umkm_omzet: number | string;
  sim_tax_result: number | string;
  tax_difference: number | string;
  savings_percentage: number | string;
  notes: string | null;
  created_at: string;
};

// Fetch all scenarios
export function useWhatIfScenarios() {
  return useQuery<WhatIfScenario[]>({
    queryKey: ['what_if_scenarios'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('what_if_scenarios')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.message.includes("Could not find the table") || error.code === 'P0001' || error.code === '42P01') {
          return [];
        }
        throw new Error(error.message);
      }

      return ((data || []) as WhatIfScenarioRow[]).map((d) => ({
        id: d.id,
        user_id: d.user_id,
        scenarioName: d.scenario_name,
        baseGrossIncome: Number(d.base_gross_income),
        basePtkpStatus: d.base_ptkp_status,
        baseTaxResult: Number(d.base_tax_result),
        simGrossIncome: d.sim_gross_income ? Number(d.sim_gross_income) : null,
        simPtkpStatus: d.sim_ptkp_status,
        simAdditionalIncome: Number(d.sim_additional_income),
        simAdditionalDeductions: Number(d.sim_additional_deductions),
        simUmkmMode: d.sim_umkm_mode,
        simUmkmOmzet: Number(d.sim_umkm_omzet),
        simTaxResult: Number(d.sim_tax_result),
        taxDifference: Number(d.tax_difference),
        savingsPercentage: Number(d.savings_percentage),
        notes: d.notes,
        created_at: d.created_at,
      }));
    },
  });
}

// Create new scenario
export function useCreateScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: WhatIfScenarioInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sesi tidak ditemukan.');

      const dbPayload = {
        user_id: user.id,
        scenario_name: payload.scenarioName,
        base_gross_income: payload.baseGrossIncome,
        base_ptkp_status: payload.basePtkpStatus,
        base_tax_result: payload.baseTaxResult,
        sim_gross_income: payload.simGrossIncome,
        sim_ptkp_status: payload.simPtkpStatus,
        sim_additional_income: payload.simAdditionalIncome,
        sim_additional_deductions: payload.simAdditionalDeductions,
        sim_umkm_mode: payload.simUmkmMode,
        sim_umkm_omzet: payload.simUmkmOmzet,
        sim_tax_result: payload.simTaxResult,
        tax_difference: payload.taxDifference,
        savings_percentage: payload.savingsPercentage,
        notes: payload.notes,
      };

      const { data, error } = await supabase
        .from('what_if_scenarios')
        .insert(dbPayload)
        .select()
        .single();

      if (error) throw new Error(`Gagal menyimpan skenario: ${error.message}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['what_if_scenarios'] });
    },
  });
}

// Update existing scenario
export function useUpdateScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string, payload: WhatIfScenarioInput }) => {
      const dbPayload = {
        scenario_name: payload.scenarioName,
        base_gross_income: payload.baseGrossIncome,
        base_ptkp_status: payload.basePtkpStatus,
        base_tax_result: payload.baseTaxResult,
        sim_gross_income: payload.simGrossIncome,
        sim_ptkp_status: payload.simPtkpStatus,
        sim_additional_income: payload.simAdditionalIncome,
        sim_additional_deductions: payload.simAdditionalDeductions,
        sim_umkm_mode: payload.simUmkmMode,
        sim_umkm_omzet: payload.simUmkmOmzet,
        sim_tax_result: payload.simTaxResult,
        tax_difference: payload.taxDifference,
        savings_percentage: payload.savingsPercentage,
        notes: payload.notes,
      };

      const { data, error } = await supabase
        .from('what_if_scenarios')
        .update(dbPayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(`Gagal update skenario: ${error.message}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['what_if_scenarios'] });
    },
  });
}

// Delete scenario
export function useDeleteScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('what_if_scenarios')
        .delete()
        .eq('id', id);

      if (error) throw new Error(`Gagal menghapus skenario: ${error.message}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['what_if_scenarios'] });
    },
  });
}
