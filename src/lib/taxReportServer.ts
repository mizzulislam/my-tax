import { z } from 'zod';
import { calculateMonthlyTerTax, calculateProgressiveTax } from './taxEngine';

export const ptkpStatusSchema = z.enum(['TK/0', 'TK/1', 'K/0', 'K/1', 'K/2', 'K/3']);
export const taxPeriodSchema = z.enum(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']);
export const reportStatusSchema = z.enum(['draft', 'submitted']).default('draft');

export const createTaxReportSchema = z.object({
  taxYear: z.number().int().min(2020).max(2035),
  taxPeriod: taxPeriodSchema,
  grossIncome: z.number().finite().min(0).max(999_999_999_999_999),
  status: reportStatusSchema,
  ptkpStatus: ptkpStatusSchema.default('TK/0'),
  pensionContribution: z.number().finite().min(0).max(999_999_999_999_999).default(0),
});

export type CreateTaxReportInput = z.infer<typeof createTaxReportSchema>;

const ptkpMap: Record<z.infer<typeof ptkpStatusSchema>, number> = {
  'TK/0': 54_000_000,
  'TK/1': 58_500_000,
  'K/0': 58_500_000,
  'K/1': 63_000_000,
  'K/2': 67_500_000,
  'K/3': 72_000_000,
};

export function calculateServerTax(input: CreateTaxReportInput) {
  if (input.taxPeriod !== '12') {
    return calculateMonthlyTerTax(input.grossIncome, input.ptkpStatus);
  }

  const jobExpense = Math.min(input.grossIncome * 0.05, 6_000_000);
  const netIncome = Math.max(0, input.grossIncome - jobExpense - input.pensionContribution);
  const taxableIncome = Math.max(0, netIncome - ptkpMap[input.ptkpStatus]);

  return calculateProgressiveTax(taxableIncome);
}
