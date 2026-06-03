import { WithholdingTaxResult } from './withholding';

export interface CorporateTaxResult {
  mode: CorporateTaxMode;
  taxableIncome: number;
  grossTurnover: number;
  facilityIncome: number;
  normalIncome: number;
  rate: number;
  tax: number;
  effectiveRate: number;
}

export type CorporateTaxMode = 'general' | 'public_company' | 'umkm_final';

export function calculateCorporateIncomeTax(
  taxableIncome: number,
  grossTurnover: number,
  useSmallBusinessFacility = true,
  mode: CorporateTaxMode = 'general'
): CorporateTaxResult {
  const safeTaxableIncome = Math.max(0, taxableIncome);
  const safeGrossTurnover = Math.max(0, grossTurnover);
  const normalRate = 0.22;

  if (mode === 'public_company') {
    const publicCompanyRate = 0.19;
    const tax = Math.round(safeTaxableIncome * publicCompanyRate);

    return {
      mode,
      taxableIncome: safeTaxableIncome,
      grossTurnover: safeGrossTurnover,
      facilityIncome: 0,
      normalIncome: safeTaxableIncome,
      rate: publicCompanyRate,
      tax,
      effectiveRate: safeTaxableIncome > 0 ? tax / safeTaxableIncome : 0,
    };
  }

  if (mode === 'umkm_final') {
    const finalRate = 0.005;
    const tax = Math.round(safeGrossTurnover * finalRate);

    return {
      mode,
      taxableIncome: safeTaxableIncome,
      grossTurnover: safeGrossTurnover,
      facilityIncome: safeGrossTurnover,
      normalIncome: 0,
      rate: finalRate,
      tax,
      effectiveRate: safeGrossTurnover > 0 ? tax / safeGrossTurnover : 0,
    };
  }

  const facilityRate = normalRate * 0.5;

  let facilityIncome = 0;
  if (useSmallBusinessFacility && safeGrossTurnover > 0 && safeGrossTurnover <= 50000000000) {
    const facilityRatio = Math.min(4800000000 / safeGrossTurnover, 1);
    facilityIncome = safeTaxableIncome * facilityRatio;
  }

  const normalIncome = Math.max(0, safeTaxableIncome - facilityIncome);
  const tax = Math.round((facilityIncome * facilityRate) + (normalIncome * normalRate));

  return {
    mode,
    taxableIncome: safeTaxableIncome,
    grossTurnover: safeGrossTurnover,
    facilityIncome,
    normalIncome,
    rate: normalRate,
    tax,
    effectiveRate: safeTaxableIncome > 0 ? tax / safeTaxableIncome : 0,
  };
}

export function calculateStampDuty(documentValue: number): number {
  return documentValue > 5000000 ? 10000 : 0;
}

export type PpnBmRateBand = '10' | '20' | '40' | '50' | '75';

export function calculatePpnBm(amount: number, rateBand: PpnBmRateBand, includeTax = false): WithholdingTaxResult {
  const baseAmount = Math.max(0, amount);
  const rate = Number(rateBand) / 100;

  let dpp = baseAmount;
  if (includeTax) {
    dpp = baseAmount / (1 + rate);
  }

  return {
    base: Math.round(dpp),
    rate,
    tax: Math.round(dpp * rate),
  };
}

export interface BphtbResult {
  npop: number;
  npoptkp: number;
  taxableBase: number;
  rate: number;
  tax: number;
  disclaimer: string | null;
}

const BPHTB_RATES_BY_REGION: Record<string, number> = {
  'DKI JAKARTA': 0.05,
  'SURABAYA': 0.05,
  'BANDUNG': 0.05,
  'DEFAULT': 0.05, // fallback dengan disclaimer
};

export function calculateBphtb(transactionValue: number, njop: number, npoptkp = 80000000, region: string = 'DEFAULT'): BphtbResult {
  const npop = Math.max(Math.max(0, transactionValue), Math.max(0, njop));
  const safeNpoptkp = Math.max(0, npoptkp);
  
  const regionKey = region.toUpperCase();
  const rate = BPHTB_RATES_BY_REGION[regionKey] ?? BPHTB_RATES_BY_REGION['DEFAULT'];
  const isDefaultRate = !BPHTB_RATES_BY_REGION[regionKey];
  
  const taxableBase = Math.max(0, npop - safeNpoptkp);

  return {
    npop,
    npoptkp: safeNpoptkp,
    taxableBase,
    rate,
    tax: Math.round(taxableBase * rate),
    disclaimer: isDefaultRate 
      ? `Tarif 5% digunakan sebagai estimasi. Tarif BPHTB untuk ${region} dapat berbeda berdasarkan Perda setempat. Verifikasi ke BPRD/BPKD daerah Anda.`
      : null
  };
}

export type LocalTaxObject =
  | 'pbb_p2'
  | 'pkb_first'
  | 'pkb_progressive_max'
  | 'bbnkb'
  | 'pbjt_general'
  | 'pbjt_specific_entertainment'
  | 'reklame'
  | 'air_tanah'
  | 'pbbkb'
  | 'rokok'
  | 'mblb'
  | 'sarang_burung_walet';

export interface LocalTaxResult {
  base: number;
  rate: number;
  tax: number;
}

export function getDefaultLocalTaxRate(object: LocalTaxObject): number {
  const rates: Record<LocalTaxObject, number> = {
    pbb_p2: 0.005,
    pkb_first: 0.012,
    pkb_progressive_max: 0.06,
    bbnkb: 0.12,
    pbjt_general: 0.10,
    pbjt_specific_entertainment: 0.40,
    reklame: 0.25,
    air_tanah: 0.20,
    pbbkb: 0.10,
    rokok: 0.10,
    mblb: 0.20,
    sarang_burung_walet: 0.10,
  };

  return rates[object];
}

export function calculateLocalTax(baseAmount: number, object: LocalTaxObject, customRate?: number): LocalTaxResult {
  const base = Math.max(0, baseAmount);
  const rate = customRate === undefined ? getDefaultLocalTaxRate(object) : Math.min(Math.max(customRate, 0), 1);

  return {
    base,
    rate,
    tax: Math.round(base * rate),
  };
}

export interface PbbP2Result {
  njop: number;
  njoptkp: number;
  taxableBase: number;
  rate: number;
  tax: number;
}

export function calculatePbbP2(njop: number, njoptkp = 10000000, rate = 0.005): PbbP2Result {
  const safeNjop = Math.max(0, njop);
  const safeNjoptkp = Math.max(0, njoptkp);
  const safeRate = Math.min(Math.max(rate, 0), 1);
  const taxableBase = Math.max(0, safeNjop - safeNjoptkp);

  return {
    njop: safeNjop,
    njoptkp: safeNjoptkp,
    taxableBase,
    rate: safeRate,
    tax: Math.round(taxableBase * safeRate),
  };
}

export type TaxPenaltyObject =
  | 'late_spt_annual_individual'
  | 'late_spt_annual_corporate'
  | 'late_spt_vat_period'
  | 'late_spt_other_period'
  | 'interest_collection'
  | 'interest_correction_late_payment'
  | 'interest_disclosure'
  | 'interest_skpkb'
  | 'interest_skpkb_additional';

export interface TaxPenaltyResult {
  base: number;
  months: number;
  rate: number;
  fixedFine: number;
  penalty: number;
}

const MAY_2026_SANCTION_INTEREST_RATES: Record<Extract<TaxPenaltyObject,
  | 'interest_collection'
  | 'interest_correction_late_payment'
  | 'interest_disclosure'
  | 'interest_skpkb'
  | 'interest_skpkb_additional'
>, number> = {
  interest_collection: 0.0055,
  interest_correction_late_payment: 0.0097,
  interest_disclosure: 0.0139,
  interest_skpkb: 0.0180,
  interest_skpkb_additional: 0.0222,
};

const FIXED_TAX_FINES: Record<Extract<TaxPenaltyObject,
  | 'late_spt_annual_individual'
  | 'late_spt_annual_corporate'
  | 'late_spt_vat_period'
  | 'late_spt_other_period'
>, number> = {
  late_spt_annual_individual: 100000,
  late_spt_annual_corporate: 1000000,
  late_spt_vat_period: 500000,
  late_spt_other_period: 100000,
};

export function calculateTaxPenalty(baseAmount: number, object: TaxPenaltyObject, months = 1): TaxPenaltyResult {
  const base = Math.max(0, baseAmount);
  const safeMonths = Math.min(Math.max(Math.ceil(months), 0), 24);

  if (object in FIXED_TAX_FINES) {
    const fixedFine = FIXED_TAX_FINES[object as keyof typeof FIXED_TAX_FINES];

    return {
      base,
      months: 0,
      rate: 0,
      fixedFine,
      penalty: fixedFine,
    };
  }

  const rate = MAY_2026_SANCTION_INTEREST_RATES[object as keyof typeof MAY_2026_SANCTION_INTEREST_RATES];
  const penalty = Math.round(base * rate * safeMonths);

  return {
    base,
    months: safeMonths,
    rate,
    fixedFine: 0,
    penalty,
  };
}

export type PphUnificationObject =
  | 'pph22_government_goods'
  | 'pph22_import_api'
  | 'pph22_import_non_api'
  | 'pph22_luxury_goods'
  | 'pph23_service_rent'
  | 'pph23_royalty_dividend_interest'
  | 'pph4_land_building_transfer'
  | 'pph4_land_building_rent'
  | 'pph15_domestic_shipping'
  | 'pph26_gross_income';

export function calculatePphUnification(amount: number, object: PphUnificationObject, withoutNpwp = false, isGrossUp = false): WithholdingTaxResult {
  const base = Math.max(0, amount);
  let rate = 0.02;
  let taxableBase = base;
  let canDoubleWithoutNpwp = false;

  if (object === 'pph22_government_goods') {
    rate = 0.015;
    canDoubleWithoutNpwp = true;
  } else if (object === 'pph22_import_api') {
    rate = 0.025;
    canDoubleWithoutNpwp = true;
  } else if (object === 'pph22_import_non_api') {
    rate = 0.075;
    canDoubleWithoutNpwp = true;
  } else if (object === 'pph22_luxury_goods') {
    rate = 0.05;
    canDoubleWithoutNpwp = true;
  } else if (object === 'pph23_service_rent') {
    rate = 0.02;
    canDoubleWithoutNpwp = true;
  } else if (object === 'pph23_royalty_dividend_interest') {
    rate = 0.15;
    canDoubleWithoutNpwp = true;
  } else if (object === 'pph4_land_building_transfer') {
    rate = 0.025;
  } else if (object === 'pph4_land_building_rent') {
    rate = 0.10;
  } else if (object === 'pph15_domestic_shipping') {
    rate = 0.012;
  } else if (object === 'pph26_gross_income') {
    rate = 0.20;
  }

  if (withoutNpwp && canDoubleWithoutNpwp) {
    rate *= 2;
  }

  if (isGrossUp) {
    taxableBase = base / (1 - rate);
  }

  return {
    base: Math.round(taxableBase),
    rate,
    tax: Math.round(taxableBase * rate),
  };
}

/**
 * Validasi pengurang tambahan (Zakat, Donasi)
 * Berdasarkan aturan, maksimal biasanya dibatasi (misal 5% dari bruto). Di sini kita terapkan batasan umum.
 * @param bruto Penghasilan bruto total
 * @param deductions Jumlah pengurang yang dimasukkan pengguna
 * @returns Pengurang yang valid untuk dikurangkan dari bruto
 */
export function calculateAdditionalDeductions(bruto: number, deductions: number): number {
  if (deductions <= 0) return 0;
  // Capping deduction to maximum 5% of gross income as a safe heuristic for simulation
  const maxDeduction = bruto * 0.05;
  return Math.min(deductions, maxDeduction);
}

/**
 * Membandingkan 2 hasil skenario pajak
 * @param baseTax Total pajak skenario awal
 * @param simTax Total pajak skenario simulasi
 * @returns Selisih (diff) dan Persentase Penghematan (pct)
 */
export function compareScenarios(baseTax: number, simTax: number): { diff: number; pct: number } {
  const diff = baseTax - simTax;
  let pct = 0;
  
  if (baseTax > 0) {
    pct = (diff / baseTax) * 100;
  } else if (baseTax === 0 && simTax > 0) {
    // Jika base 0 tapi simTax ada, berarti rugi/nambah pajak.
    pct = -100;
  }
  
  return { diff, pct };
}

export function calculateFiscalDepreciation(acquisitionValue: number, acquisitionYear: number, currentYear: number, assetType: string, assetName: string): number {
  if (acquisitionValue <= 0 || currentYear < acquisitionYear) return acquisitionValue;
  const yearsElapsed = currentYear - acquisitionYear;
  if (yearsElapsed === 0) return acquisitionValue;
  let usefulLife = 0;
  const nameLower = (assetName || '').toLowerCase();
  switch (assetType) {
    case 'kendaraan':
      if (nameLower.includes('motor') || nameLower.includes('sepeda')) { usefulLife = 4; } else { usefulLife = 8; }
      break;
    case 'peralatan':
      usefulLife = 4;
      break;
    case 'tanah_bangunan':
      if (nameLower.includes('tanah') && !nameLower.includes('bangunan') && !nameLower.includes('rumah')) {
        usefulLife = 0;
      } else {
        usefulLife = 20;
      }
      break;
    default:
      usefulLife = 0;
      break;
  }
  if (usefulLife === 0) return acquisitionValue;
  const depreciationRate = 1 / usefulLife;
  const totalDepreciation = acquisitionValue * depreciationRate * yearsElapsed;
  const bookValue = acquisitionValue - totalDepreciation;
  return Math.max(0, bookValue);
}

export function getAssetFiscalGroup(assetType: string, assetName: string): string {
  const nameLower = (assetName || '').toLowerCase();
  switch (assetType) {
    case 'kendaraan':
      return (nameLower.includes('motor') || nameLower.includes('sepeda')) ? 'Kelompok 1 (4 Tahun)' : 'Kelompok 2 (8 Tahun)';
    case 'peralatan':
      return 'Kelompok 1 (4 Tahun)';
    case 'tanah_bangunan':
      return (nameLower.includes('tanah') && !nameLower.includes('bangunan') && !nameLower.includes('rumah')) ? 'Tidak Disusutkan' : 'Bangunan (20 Tahun)';
    default:
      return 'Tidak Disusutkan';
  }
}

