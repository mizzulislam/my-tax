# Langkah 4: Mesin Penghitungan PPh Progresif & Penyimpanan Laporan Pajak

Dokumen ini memandu Anda untuk membangun logika komputasi perpajakan (*tax engine*) di sisi klien untuk mensimulasikan Penghitungan Pajak Penghasilan (PPh) Orang Pribadi berdasarkan **Tarif Progresif Pasal 17 UU Harmonisasi Peraturan Perpajakan (HPP)**. Data hasil hitungan kemudian akan divalidasi dan disimpan ke tabel `tax_reports` di database Supabase.

---

## 1. Logika Bisnis Perpajakan (Tarif Progresif UU HPP)

Tarif PPh Orang Pribadi menggunakan sistem lapisan (*layer*) kumulatif dari Penghasilan Kena Pajak (PKP):
- Lapisan 1: Sampai dengan Rp60.000.000 $\rightarrow$ 5%
- Lapisan 2: Di atas Rp60.000.000 s.d. Rp250.000.000 $\rightarrow$ 15%
- Lapisan 3: Di atas Rp250.000.000 s.d. Rp500.000.000 $\rightarrow$ 25%
- Lapisan 4: Di atas Rp500.000.000 s.d. Rp5.000.000.000 $\rightarrow$ 30%
- Lapisan 5: Di atas Rp5.000.000.000 $\rightarrow$ 35%

*Catatan: Pada tahap MVP ini, simulasi mengasumsikan input user sudah berupa Penghasilan Kena Pajak (PKP) bersih setahun untuk menyederhanakan alur.*

---

## 2. Implementasi Utilitas Penghitungan (`src/lib/taxEngine.ts`)

Buat fungsi murni (*pure function*) yang aman dan teruji untuk memecah nominal pendapatan ke dalam lapisan-lapisan tarif pajak progresif nasional.

```typescript
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

```

---

## 3. Skema Validasi Tambahan & Custom Hook Mutasi (`src/hooks/useMutateReport.ts`)

### A. Ekstensi Skema Validasi Zod (`src/types/taxpayer.ts`)

Tambahkan aturan validasi pengiriman laporan ini di bagian bawah file skema Zod Anda yang lama:

```typescript
export const taxReportSchema = z.object({
  taxYear: z
    .number()
    .int()
    .min(2020, { message: "Tahun pajak minimal 2020." })
    .max(new Date().getFullYear(), { message: "Tahun pajak tidak boleh melebihi tahun berjalan." }),
  taxPeriod: z
    .string()
    .length(2, { message: "Masa pajak harus 2 digit (contoh: '12' untuk Tahunan/Desember)." }),
  grossIncome: z
    .number()
    .min(0, { message: "Penghasilan bruto tidak boleh bernilai negatif." }),
});

export type TaxReportInput = z.infer<typeof taxReportSchema>;

```

### B. Custom Hook React Query

Buat berkas baru untuk menangani penyimpanan draf laporan pajak ke dalam database Supabase.

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { TaxReportInput } from '@/types/taxpayer';
import { calculateProgressiveTax } from '@/lib/taxEngine';

export function useMutateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportData: TaxReportInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sesi aktif tidak ditemukan. Silakan login kembali.');

      // Hitung nominal pajak terutang via taxEngine sebelum dikirim ke backend
      const taxPayable = calculateProgressiveTax(reportData.grossIncome);

      const { data, error } = await supabase
        .from('tax_reports')
        .insert({
          user_id: user.id,
          tax_year: reportData.taxYear,
          tax_period: reportData.taxPeriod,
          gross_income: reportData.grossIncome,
          tax_payable: taxPayable,
          status: 'draft',
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

```

---

## 4. Komponen Kalkulator & Form Pajak (`src/components/TaxCalculatorForm.tsx`)

Komponen ini memfasilitasi simulasi interaktif. Pengguna dapat melihat estimasi PPh Terutang secara instan saat mengetik nominal pendapatan bruto (*reactive UI*).

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taxReportSchema, TaxReportInput } from '@/types/taxpayer';
import { calculateProgressiveTax } from '@/lib/taxEngine';
import { useMutateReport } from '@/hooks/useMutateReport';

export default function TaxCalculatorForm() {
  const { mutate, isPending, error: serverError } = useMutateReport();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TaxReportInput>({
    resolver: zodResolver(taxReportSchema),
    defaultValues: {
      taxYear: new Date().getFullYear(),
      taxPeriod: '12',
      grossIncome: 0,
    },
  });

  // Memantau input grossIncome secara real-time untuk simulasi counter pajaknya
  const currentGrossIncome = watch('grossIncome') || 0;
  const estimatedTax = calculateProgressiveTax(Number(currentGrossIncome));

  const onSubmit = (data: TaxReportInput) => {
    mutate(data, {
      onSuccess: () => alert('Draf simulasi laporan pajak berhasil disimpan ke server!'),
    });
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold mb-1 text-gray-900">Simulasi & Pelaporan PPh</h2>
      <p className="text-sm text-gray-500 mb-6">Hitung estimasi PPh terutang Anda secara instan berdasarkan UU HPP.</p>

      
      <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <span className="text-xs font-semibold text-blue-700 tracking-wider uppercase">Estimasi PPh Terutang</span>
        <p className="text-3xl font-extrabold text-blue-900 mt-1">
          Rp {estimatedTax.toLocaleString('id-ID')}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Tahun Pajak</label>
            <input
              type="number"
              {...register('taxYear', { valueAsNumber: true })}
              className="mt-1 w-full p-2 border rounded-md"
            />
            {errors.taxYear && <p className="text-xs text-red-500 mt-1">{errors.taxYear.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Masa Pajak (Bulan)</label>
            <select {...register('taxPeriod')} className="mt-1 w-full p-2 border rounded-md">
              <option value="12">Desember / Tahunan</option>
              <option value="01">01 - Januari</option>
              <option value="06">06 - Juni</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Penghasilan Kena Pajak (Bersih Setahun)</label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">Rp</span>
            </div>
            <input
              type="number"
              {...register('grossIncome', { valueAsNumber: true })}
              className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
          </div>
          {errors.grossIncome && <p className="text-xs text-red-500 mt-1">{errors.grossIncome.message}</p>}
        </div>

        {serverError && (
          <div className="p-3 bg-red-50 text-xs text-red-600 rounded border border-red-200">
            {serverError.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 px-4 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 transition"
        >
          {isPending ? 'Memproses Transaksi...' : 'Simpan Sebagai Dokumen Draf'}
        </button>
      </form>
    </div>
  );
}

```

---

## 5. Tolok Ukur Keberhasilan Langkah 4

1. [ ] Memasukkan nominal `grossIncome` sebesar Rp100.000.000 menghasilkan nilai `estimatedTax` tepat Rp9.000.000 *(Akurasi hitungan: $(60\text{jt} \times 5\%) + (40\text{jt} \times 15\%) = 3\text{jt} + 6\text{jt} = 9\text{jt})$*.
2. [ ] Sistem memblokir input nominal negatif menggunakan validasi bawaan Zod di sisi terdepan aplikasi.
3. [ ] Saat tombol simpan diklik, server mengeksekusi hitungan ulang di sisi backend, lalu memvalidasi ID pengirim terhadap RLS tabel `tax_reports` sebelum memberikan respons sukses `201 Created`.

```

<FollowUp label="Lanjutkan ke script .md Langkah 5: Dashboard Ringkasan & Data Table Riwayat Pajak?" query="Buatkan skrip format .md untuk Langkah ke-5 yang mencakup pembuatan halaman dashboard utama pembaca histori perpajakan menggunakan TanStack Query Fetching dari tabel tax_reports, lengkap dengan representasi Data Table serta indikator badge status (draft, submitted, paid)."/></TaxReportInput>

```