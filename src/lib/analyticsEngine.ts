import { TaxReportData } from '@/hooks/useFetchReports';

export interface MonthlyAggregate {
  month: string;
  gross: number;
  tax: number;
  year: number;
}

export interface YearlyAggregate {
  year: number;
  gross: number;
  tax: number;
}

export interface CategoryBreakdown {
  name: string;
  value: number;
  taxValue: number;
}

export interface YoYComparison {
  year: number;
  currentGross: number;
  prevGross: number;
  currentTax: number;
  prevTax: number;
  grossDiff: number;
  grossDiffPct: number;
  taxDiff: number;
  taxDiffPct: number;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  tax_type: string;
}

/**
 * Agregasi data laporan pajak per bulan/masa pajak untuk tahun berjalan dan tahun sebelumnya
 */
export function aggregateByMonth(reports: TaxReportData[]): MonthlyAggregate[] {
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const aggregates: Record<string, { gross: number; tax: number; year: number; monthIdx: number }> = {};

  // Inisialisasi 12 bulan untuk tahun berjalan agar grafik tidak kosong dan tetap premium
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < 12; i++) {
    const key = `${currentYear}-${String(i + 1).padStart(2, '0')}`;
    aggregates[key] = { gross: 0, tax: 0, year: currentYear, monthIdx: i };
  }

  reports.forEach(r => {
    const yr = Number(r.tax_year);
    const period = r.tax_period; // "01", "02", ..., "12"
    
    let mIdx = parseInt(period, 10) - 1;
    if (isNaN(mIdx) || mIdx < 0 || mIdx > 11) {
      mIdx = 11; // default ke Desember jika tidak valid
    }
    
    const key = `${yr}-${String(mIdx + 1).padStart(2, '0')}`;
    if (!aggregates[key]) {
      aggregates[key] = { gross: 0, tax: 0, year: yr, monthIdx: mIdx };
    }
    aggregates[key].gross += r.gross_income;
    aggregates[key].tax += r.tax_payable;
  });

  return Object.values(aggregates)
    .map((val) => ({
      month: `${months[val.monthIdx]} ${val.year}`,
      gross: val.gross,
      tax: val.tax,
      year: val.year
    }))
    .sort((a, b) => {
      // Urutkan kronologis berdasarkan tahun lalu bulan
      const aParts = a.month.split(' ');
      const bParts = b.month.split(' ');
      const yearA = parseInt(aParts[1]);
      const yearB = parseInt(bParts[1]);
      if (yearA !== yearB) return yearA - yearB;
      return months.indexOf(aParts[0]) - months.indexOf(bParts[0]);
    });
}

/**
 * Agregasi bruto dan pajak terutang tahunan
 */
export function aggregateByYear(reports: TaxReportData[]): YearlyAggregate[] {
  const yearMap: Record<number, { gross: number; tax: number }> = {};
  
  // Inisialisasi default 3 tahun terakhir untuk visualisasi yang indah
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 2; y <= currentYear; y++) {
    yearMap[y] = { gross: 0, tax: 0 };
  }

  reports.forEach((r) => {
    const yr = Number(r.tax_year);
    if (!isNaN(yr)) {
      if (!yearMap[yr]) {
        yearMap[yr] = { gross: 0, tax: 0 };
      }
      yearMap[yr].gross += r.gross_income;
      yearMap[yr].tax += r.tax_payable;
    }
  });

  return Object.keys(yearMap)
    .map(Number)
    .sort((a, b) => a - b)
    .map((yr) => ({
      year: yr,
      gross: yearMap[yr].gross,
      tax: yearMap[yr].tax,
    }));
}

/**
 * Menghitung tarif pajak efektif rata-rata (Effective Tax Rate)
 */
export function calculateEffectiveRate(grossIncome: number, taxPayable: number): number {
  if (grossIncome <= 0) return 0;
  return parseFloat(((taxPayable / grossIncome) * 100).toFixed(2));
}

/**
 * Mengelompokkan transaksi bruto berdasarkan kategori finansial
 */
export function breakdownByCategory(transactions: Transaction[]): CategoryBreakdown[] {
  const categoryMap: Record<string, { value: number; taxValue: number }> = {};

  transactions.forEach(t => {
    const cat = t.category || 'Lainnya';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { value: 0, taxValue: 0 };
    }
    categoryMap[cat].value += t.amount;
    
    // Taksiran PPh berdasarkan jenis pajak untuk breakdown visual
    let tax = 0;
    const taxTypeLower = (t.tax_type || '').toLowerCase();
    if (taxTypeLower.includes('0.5%')) {
      tax = t.amount * 0.005;
    } else if (taxTypeLower.includes('10%')) {
      tax = t.amount * 0.10;
    } else if (taxTypeLower.includes('20%')) {
      tax = t.amount * 0.20;
    } else if (taxTypeLower.includes('15%')) {
      tax = t.amount * 0.15;
    } else if (taxTypeLower.includes('21')) {
      // PPh 21 perkiraan rata-rata tarif efektif progresif tingkat pertama
      tax = t.amount * 0.05; 
    }
    categoryMap[cat].taxValue += tax;
  });

  return Object.entries(categoryMap).map(([name, data]) => ({
    name,
    value: data.value,
    taxValue: parseFloat(data.taxValue.toFixed(2))
  }));
}

/**
 * Membandingkan data Year-over-Year (YoY)
 */
export function compareYearOverYear(currentYear: YearlyAggregate, prevYear: YearlyAggregate): YoYComparison {
  const grossDiff = currentYear.gross - prevYear.gross;
  const grossDiffPct = prevYear.gross > 0 ? (grossDiff / prevYear.gross) * 100 : 0;
  
  const taxDiff = currentYear.tax - prevYear.tax;
  const taxDiffPct = prevYear.tax > 0 ? (taxDiff / prevYear.tax) * 100 : 0;

  return {
    year: currentYear.year,
    currentGross: currentYear.gross,
    prevGross: prevYear.gross,
    currentTax: currentYear.tax,
    prevTax: prevYear.tax,
    grossDiff,
    grossDiffPct: parseFloat(grossDiffPct.toFixed(2)),
    taxDiff,
    taxDiffPct: parseFloat(taxDiffPct.toFixed(2))
  };
}
