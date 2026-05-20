/**
 * Menghitung PPh Pasal 17 Orang Pribadi berdasarkan UU HPP
 * @param pkp Penghasilan Kena Pajak dalam Rupiah (Tahunan)
 * @returns Total PPh Terutang dalam Rupiah
 */
export function calculateProgressiveTax(pkp: number): number {
  if (pkp <= 0) return 0;

  let remainingPkp = pkp;
  let totalTax = 0;

  // Definisi Lapisan Tarif UU HPP
  const brackets = [
    { limit: 60000000, rate: 0.05 },
    { limit: 190000000, rate: 0.15 }, // 250jt - 60jt
    { limit: 250000000, rate: 0.25 }, // 500jt - 250jt
    { limit: 4500000000, rate: 0.30 }, // 5milyar - 500jt
    { limit: Infinity, rate: 0.35 }
  ];

  for (const bracket of brackets) {
    if (remainingPkp <= 0) break;

    const currentChunk = Math.min(remainingPkp, bracket.limit);
    totalTax += currentChunk * bracket.rate;
    remainingPkp -= currentChunk;
  }

  return totalTax;
}
