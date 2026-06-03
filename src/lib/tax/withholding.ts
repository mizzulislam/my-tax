
/**
 * Kalkulasi PPh UMKM PP 23 (Final 0.5%) dengan threshold Rp 500 juta bebas pajak untuk WPOP
 * @param annualOmzet Omzet tahunan dalam Rupiah
 * @returns PPh UMKM Terutang
 */
export function calculateUmkmTax(annualOmzet: number): number {
  if (annualOmzet <= 500000000) return 0;
  return (annualOmzet - 500000000) * 0.005;
}

export type VatMode = 'non_luxury_2025' | 'standard' | '11_percent' | '12_percent';

export interface VatResult {
  dpp: number;
  rate: number;
  effectiveRate: number;
  tax: number;
}

/**
 * Menghitung PPN dengan opsi sudah termasuk pajak atau belum.
 */
export function calculateVat(amount: number, mode: VatMode = '11_percent', includeTax = false): VatResult {
  const safeAmount = Math.max(0, amount);
  const rate = mode === 'standard' || mode === '12_percent' ? 0.12 : 0.11;
  
  let dpp = safeAmount;
  if (includeTax) {
    dpp = safeAmount / (1 + rate);
  }

  const tax = Math.round(dpp * rate);

  return {
    dpp: Math.round(dpp),
    rate,
    effectiveRate: rate,
    tax,
  };
}

export type Pph23Object = 'royalty_dividend_interest' | 'service_rent';

export interface WithholdingTaxResult {
  base: number;
  rate: number;
  tax: number;
}

export function calculatePph23(amount: number, object: Pph23Object, withoutNpwp = false, isGrossUp = false): WithholdingTaxResult {
  const baseAmount = Math.max(0, amount);
  const baseRate = object === 'royalty_dividend_interest' ? 0.15 : 0.02;
  const rate = withoutNpwp ? baseRate * 2 : baseRate;

  let dpp = baseAmount;
  if (isGrossUp) {
    dpp = baseAmount / (1 - rate);
  }

  return {
    base: Math.round(dpp),
    rate,
    tax: Math.round(dpp * rate),
  };
}

export type Pph26Object = 'gross_income' | 'asset_transfer' | 'insurance_premium';

export function calculatePph26(amount: number, object: Pph26Object = 'gross_income', treatyRate?: number, isGrossUp = false): WithholdingTaxResult {
  const base = Math.max(0, amount);
  const treaty = treatyRate !== undefined ? Math.min(Math.max(treatyRate, 0), 1) : undefined;
  let rate = treaty ?? 0.20;
  let taxableBase = base;

  if (object === 'asset_transfer') {
    rate = treaty ?? 0.20;
    taxableBase = base * 0.25;
  } else if (object === 'insurance_premium') {
    rate = treaty ?? 0.20;
    taxableBase = base * 0.50;
  }

  if (isGrossUp) {
    const effectiveRate = object === 'asset_transfer' ? rate * 0.25 : object === 'insurance_premium' ? rate * 0.50 : rate;
    const grossedUpBase = base / (1 - effectiveRate);
    taxableBase = object === 'asset_transfer' ? grossedUpBase * 0.25 : object === 'insurance_premium' ? grossedUpBase * 0.50 : grossedUpBase;
  }

  return {
    base: Math.round(taxableBase),
    rate,
    tax: Math.round(taxableBase * rate),
  };
}

export type FinalTaxObject = 'umkm_individual' | 'umkm_entity' | 'land_building_rent' | 'land_building_transfer';

export function calculateFinalTax(amount: number, object: FinalTaxObject, isGrossUp = false): WithholdingTaxResult {
  const base = Math.max(0, amount);
  let taxableBase = base;
  let rate = 0.005;

  if (object === 'umkm_individual') {
    taxableBase = Math.max(0, base - 500000000);
  } else if (object === 'land_building_rent') {
    rate = 0.10;
  } else if (object === 'land_building_transfer') {
    rate = 0.025;
  }

  if (isGrossUp && object !== 'umkm_individual') {
    taxableBase = base / (1 - rate);
  }

  return {
    base: Math.round(taxableBase),
    rate,
    tax: Math.round(taxableBase * rate),
  };
}
