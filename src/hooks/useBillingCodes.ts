import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { BillingCode } from '@/types/taxpayer';
import { calculateExpiry, generateBillingCode, isBillingExpired } from '@/lib/billingGenerator';
import { TaxReportData } from './useFetchReports';

type BillingRow = {
  id: string;
  user_id: string;
  report_id: string | null;
  billing_code: string;
  amount: number | string | null;
  tax_type: string;
  status: 'active' | 'paid' | 'expired' | 'cancelled';
  expires_at: string;
  paid_at: string | null;
  created_at: string;
  tax_reports?: {
    tax_year: number;
    tax_period: string;
    status: string;
  } | null;
};

function mapBilling(row: BillingRow): BillingCode {
  return {
    id: row.id,
    user_id: row.user_id,
    report_id: row.report_id,
    billingCode: row.billing_code,
    amount: Number(row.amount || 0),
    taxType: row.tax_type,
    status: isBillingExpired(row.expires_at) && row.status === 'active' ? 'expired' : row.status,
    expiresAt: row.expires_at,
    paidAt: row.paid_at,
    created_at: row.created_at,
    report: row.tax_reports || null,
  };
}

export function useFetchBillingCodes(status?: string) {
  return useQuery<BillingCode[]>({
    queryKey: ['billing_codes_list', status],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('billing_codes')
        .select('*, tax_reports(tax_year, tax_period, status)')
        .eq('user_id', user.id);

      if (status && status !== 'all') query = query.eq('status', status);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01' || error.message.includes('Could not find the table')) return [];
        throw new Error(error.message);
      }

      return ((data || []) as BillingRow[]).map(mapBilling);
    },
  });
}

export function useCreateBillingCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (report: TaxReportData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sesi aktif tidak ditemukan.');
      if (report.tax_payable <= 0) throw new Error('Kode billing hanya dapat dibuat untuk PPh terutang di atas Rp 0.');

      const { data: existing } = await supabase
        .from('billing_codes')
        .select('*')
        .eq('user_id', user.id)
        .eq('report_id', report.id)
        .in('status', ['active', 'paid'])
        .maybeSingle();

      if (existing) return mapBilling(existing);

      const { data, error } = await supabase
        .from('billing_codes')
        .insert({
          user_id: user.id,
          report_id: report.id,
          billing_code: generateBillingCode(),
          amount: report.tax_payable,
          tax_type: 'PPh 21',
          status: 'active',
          expires_at: calculateExpiry().toISOString(),
        })
        .select('*')
        .single();

      if (error) throw new Error(error.message);
      return mapBilling(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing_codes_list'] });
    },
  });
}

export function useConfirmBillingPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (billing: BillingCode) => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('billing_codes')
        .update({ status: 'paid', paid_at: now })
        .eq('id', billing.id)
        .select('*')
        .single();

      if (error) throw new Error(error.message);

      if (billing.report_id) {
        await supabase
          .from('tax_reports')
          .update({ status: 'paid' })
          .eq('id', billing.report_id);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('notifications').insert({
            user_id: user.id,
            title: 'Pembayaran pajak dikonfirmasi',
            message: `Kode billing ${billing.billingCode} telah ditandai lunas.`,
            is_read: false,
            notification_type: 'status_change',
            priority: 'normal',
            action_url: '/dashboard/billing',
            metadata: { billingCode: billing.billingCode, reportId: billing.report_id },
          });
        }
      }

      return mapBilling(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing_codes_list'] });
      queryClient.invalidateQueries({ queryKey: ['tax_reports_list'] });
      queryClient.invalidateQueries({ queryKey: ['notifications_list'] });
    },
  });
}
