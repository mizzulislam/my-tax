# Langkah 5: Dashboard Ringkasan & Tabel Riwayat Perpajakan

Dokumen ini memandu Anda untuk membangun antarmuka dashboard utama untuk aplikasi **Tax Feyments**. Kita akan menarik data secara dinamis dari tabel `tax_reports` menggunakan **TanStack Query**, lalu menyajikannya ke dalam komponen akumulasi statistik ringkasan kartu serta komponen *Data Table* riwayat laporan dengan penanda warna status (*badge status*).

---

## 1. Custom Hook Pengambilan Data (`src/hooks/useFetchReports.ts`)

Kita membutuhkan sebuah hook untuk mengambil seluruh daftar laporan pajak yang dimiliki oleh pengguna yang sedang aktif. Lapisan RLS di database memastikan pengguna hanya menerima baris data milik mereka sendiri.

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface TaxReportData {
  id: string;
  tax_year: number;
  tax_period: string;
  gross_income: number;
  tax_payable: number;
  status: 'draft' | 'submitted' | 'paid' | 'overdue';
  created_at: string;
}

export function useFetchReports() {
  return useQuery<TaxReportData[]>({
    queryKey: ['tax_reports_list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_reports')
        .select('id, tax_year, tax_period, gross_income, tax_payable, status, created_at')
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data as TaxReportData[];
    },
  });
}

```

---

## 2. Komponen Ringkasan Kartu Dashboard (`src/components/DashboardStats.tsx`)

Komponen ini berfungsi mengakumulasikan data mentah dari database ke dalam ringkasan metrik yang mudah dipahami oleh wajib pajak, seperti total draf pajak yang harus dibayar dan jumlah pelaporan aktif.

```typescript
import { TaxReportData } from '@/hooks/useFetchReports';

export default function DashboardStats({ data }: { data: TaxReportData[] }) {
  // Hitung akumulasi nilai finansial dari array laporan
  const totalDraftPayable = data
    .filter((report) => report.status === 'draft')
    .reduce((sum, current) => sum + current.tax_payable, 0);

  const totalSubmitted = data.filter((report) => report.status === 'submitted').length;
  const totalPaid = data.filter((report) => report.status === 'paid').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      
      <div className="p-5 bg-white border border-orange-100 rounded-xl shadow-sm">
        <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Draf PPh Terutang</span>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          Rp {totalDraftPayable.toLocaleString('id-ID')}
        </p>
        <p className="text-xs text-gray-400 mt-2">Menunggu pembuatan kode billing & pelaporan</p>
      </div>

      
      <div className="p-5 bg-white border border-blue-100 rounded-xl shadow-sm">
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Laporan Disampaikan</span>
        <p className="text-2xl font-bold text-gray-900 mt-1">{totalSubmitted} Dokumen</p>
        <p className="text-xs text-gray-400 mt-2">Sedang dalam proses review administrasi</p>
      </div>

      
      <div className="p-5 bg-white border border-green-100 rounded-xl shadow-sm">
        <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">Laporan Selesai (Lunas)</span>
        <p className="text-2xl font-bold text-gray-900 mt-1">{totalPaid} Sukses</p>
        <p className="text-xs text-gray-400 mt-2">Telah mendapatkan Bukti Penerimaan Elektronik (BPE)</p>
      </div>
    </div>
  );
}

```

---

## 3. Komponen Tabel Riwayat Pajak (`src/components/TaxHistoryTable.tsx`)

Komponen tabel ini menyajikan visualisasi data historis secara mendetail lengkap dengan pemetaan komponen *badge status* dinamis yang profesional.

```typescript
import { TaxReportData } from '@/hooks/useFetchReports';

export default function TaxHistoryTable({ data }: { data: TaxReportData[] }) {
  
  // Fungsi pembantu untuk memetakan style warna badge berdasarkan status backend
  const getStatusBadge = (status: TaxReportData['status']) => {
    const baseClass = "px-2.5 py-1 text-xs font-semibold rounded-full tracking-wide inline-block";
    switch (status) {
      case 'draft':
        return `${baseClass} bg-amber-100 text-amber-800 border border-amber-200`;
      case 'submitted':
        return `${baseClass} bg-blue-100 text-blue-800 border border-blue-200`;
      case 'paid':
        return `${baseClass} bg-green-100 text-green-800 border border-green-200`;
      case 'overdue':
        return `${baseClass} bg-red-100 text-red-800 border border-red-200`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
        Belum ada riwayat simulasi atau pelaporan pajak yang tersimpan.
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h3 className="font-bold text-lg text-gray-900">Riwayat Laporan Pajak</h3>
        <p className="text-xs text-gray-500">Daftar arsip kalkulasi dan pengajuan pajak Anda.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-xs font-semibold text-gray-500 border-b border-gray-200">
              <th className="p-4">Tahun / Masa</th>
              <th className="p-4">Penghasilan Bruto</th>
              <th className="p-4">PPh Terutang</th>
              <th className="p-4">Tanggal Dibuat</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {data.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50/70 transition-colors">
                <td className="p-4 font-medium text-gray-900">
                  {report.tax_year} / Masa {report.tax_period}
                </td>
                <td className="p-4">Rp {report.gross_income.toLocaleString('id-ID')}</td>
                <td className="p-4 font-semibold text-gray-900">
                  Rp {report.tax_payable.toLocaleString('id-ID')}
                </td>
                <td className="p-4 text-xs text-gray-400">
                  {new Date(report.created_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
                <td className="p-4">
                  <span className={getStatusBadge(report.status)}>
                    {report.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

```

---

## 4. Penggabungan Halaman Utama Dashboard (`src/app/dashboard/page.tsx`)

Terakhir, satukan seluruh komponen yang telah dibuat ke dalam sebuah halaman utama router Next.js.

```typescript
'use client';

import { useFetchReports } from '@/hooks/useFetchReports';
import DashboardStats from '@/components/DashboardStats';
import TaxHistoryTable from '@/components/TaxHistoryTable';
import TaxCalculatorForm from '@/components/TaxCalculatorForm';

export default function DashboardPage() {
  const { data: reports, isLoading, isError, error } = useFetchReports();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 text-sm">
        Memuat data panel perpajakan...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-red-600 bg-red-50 rounded-xl border border-red-200 text-sm mt-8">
        Terjadi kesalahan sistem saat mengambil data riwayat: {error?.message}
      </div>
    );
  }

  const reportsData = reports || [];

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Tax Feyments App</h1>
          <p className="text-sm text-gray-500 mt-1">Selamat datang di panel integrasi teknologi perpajakan mandiri Anda.</p>
        </header>

        
        <DashboardStats data="{reportsData}"/>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-2">
            <TaxHistoryTable data="{reportsData}"/>
          </div>

          
          <div className="lg:col-span-1">
            <TaxCalculatorForm/>
          </div>
        </div>
      </div>
    </div>
  );
}

```

---

## 5. Tolok Ukur Keberhasilan Langkah 5

1. [ ] Halaman `/dashboard` memuat data tanpa memicu *infinite loop request* pada tab jaringan (*Network tab*).
2. [ ] Penambahan data melalui komponen kalkulator di sisi kanan secara instan memperbarui (*invalidate*) metrik jumlah draf dan daftar tabel di sisi kiri setelah status respons sukses diterima.
3. [ ] Setiap perubahan status (misal diubah langsung via database editor dari `draft` ke `paid`) otomatis mengubah skema warna komponen *badge status* tanpa merusak tata letak tabel data.

```

---

*Selamat! Seluruh rancangan arsitektur dasar dan MVP untuk **Tax Feyments App** kini telah selesai disusun langkah demi langkah dari inisialisasi, pembuatan arsitektur keamanan server, hingga visualisasi antarmuka pengguna.*</TaxReportData[]>

```