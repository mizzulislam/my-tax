# Langkah 3: Integrasi Supabase Client & Form Profil Wajib Pajak

Dokumen ini memandu Anda untuk menghubungkan aplikasi Next.js dengan layanan backend Supabase. Kita akan membuat *client instance*, mengonfigurasi interaksi server menggunakan **TanStack Query**, dan membangun formulir profil wajib pajak yang responsif menggunakan kombinasi **React Hook Form**, **Zod**, dan komponen **Shadcn UI**.

---

## 1. Instalasi Supabase SDK & TanStack Query

Jalankan perintah berikut di terminal Anda untuk menginstal pustaka konektor Supabase dan pengelola *async state* dari server:

```bash
# Instalasi Supabase SDK untuk browser dan server
npm install @supabase/supabase-js @supabase/ssr

# Instalasi TanStack React Query untuk sinkronisasi data server
npm install @tanstack/react-query

```

---

## 2. Inisialisasi Supabase Client & Query Provider

### A. File Lingkungan (`.env.local`)

Pastikan Anda sudah menyalin kredensial API dari dashboard Supabase Anda ke dalam file akar proyek:

```text
NEXT_PUBLIC_SUPABASE_URL=[https://id-proyek-anda.supabase.co](https://id-proyek-anda.supabase.co)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

```

### B. Konfigurasi Instansiasi Client (`src/lib/supabase.ts`)

Berkas ini bertugas membuat instansiasi *client side* tunggal (singleton) untuk berinteraksi dengan API Supabase di komponen browser.

```typescript
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

```

### C. Pengaturan Providers (`src/app/providers.tsx`)

Bungkus aplikasi Next.js Anda dengan QueryClientProvider agar fitur *caching* dan *fetching* data server berjalan optimal.

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // Data dianggap segar selama 5 menit
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client="{queryClient}">
      {children}
    </QueryClientProvider>
  );
}

```

*Jangan lupa untuk membungkus komponen `{children}` di dalam `src/app/layout.tsx` menggunakan komponen `<Providers>` ini.*

---

## 3. Custom Hook Mutasi Data (`src/hooks/useMutateProfile.ts`)

Gunakan TanStack Query untuk menangani proses pengiriman (*insert/update*) data profil ke tabel `profiles` di Supabase yang sudah dilindungi RLS.

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { TaxpayerProfile } from '@/types/taxpayer';
import { useTaxpayerStore } from '@/store/useTaxpayerStore';

export function useMutateProfile() {
  const queryClient = useQueryClient();
  const setProfile = useTaxpayerStore((state) => state.setProfile);

  return useMutation({
    mutationFn: async (profileData: TaxpayerProfile) => {
      // Mengambil data user yang sedang login saat ini
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Pengguna tidak terautentikasi.');

      // Melakukan upsert data ke tabel public.profiles berbasis user.id
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profileData.fullName,
          taxpayer_type: profileData.taxpayerType,
          nik: profileData.nik,
          npwp: profileData.npwp,
          phone_number: profileData.phoneNumber,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (data) => {
      // Sinkronisasi data ke Zustand store global
      setProfile({
        fullName: data.full_name,
        taxpayerType: data.taxpayer_type as 'pribadi' | 'badan',
        nik: data.nik,
        npwp: data.npwp,
        phoneNumber: data.phone_number,
      });
      // Menghapus cache query profil lama agar diperbarui secara otomatis
      queryClient.invalidateQueries({ queryKey: ['taxpayer_profile'] });
    },
  });
}

```

---

## 4. Implementasi Formulir UI Komponen (`src/components/TaxpayerForm.tsx`)

Berikut adalah komponen formulir pendaftaran profil wajib pajak bertipe *Client Component*. Skema validasi Zod dari **Langkah 1** disuntikkan langsung melalui `@hookform/resolvers/zod`.

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taxpayerProfileSchema, TaxpayerProfile } from '@/types/taxpayer';
import { useMutateProfile } from '@/hooks/useMutateProfile';

export default function TaxpayerForm() {
  const { mutate, isPending, error: mutationError } = useMutateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaxpayerProfile>({
    resolver: zodResolver(taxpayerProfileSchema),
    defaultValues: {
      fullName: '',
      taxpayerType: 'pribadi',
      nik: '',
      npwp: '',
      phoneNumber: '',
    },
  });

  const onSubmit = (data: TaxpayerProfile) => {
    mutate(data, {
      onSuccess: () => alert('Profil wajib pajak berhasil disimpan!'),
    });
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Lengkapi Profil Wajib Pajak</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
          <input
            {...register('fullName')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Masukkan nama sesuai KTP"
          />
          {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
        </div>

        
        <div>
          <label className="block text-sm font-medium text-gray-700">Jenis Wajib Pajak</label>
          <select
            {...register('taxpayerType')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="pribadi">Orang Pribadi</option>
            <option value="badan">Badan / Perusahaan</option>
          </select>
          {errors.taxpayerType && <p className="mt-1 text-xs text-red-500">{errors.taxpayerType.message}</p>}
        </div>

        
        <div>
          <label className="block text-sm font-medium text-gray-700">NIK (16 Digit)</label>
          <input
            {...register('nik')}
            maxLength={16}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="3171xxxxxxxxxxxx"
          />
          {errors.nik && <p className="mt-1 text-xs text-red-500">{errors.nik.message}</p>}
        </div>

        
        <div>
          <label className="block text-sm font-medium text-gray-700">NPWP (15/16 Digit)</label>
          <input
            {...register('npwp')}
            maxLength={16}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Hanya angka tanpa tanda baca"
          />
          {errors.npwp && <p className="mt-1 text-xs text-red-500">{errors.npwp.message}</p>}
        </div>

        
        <div>
          <label className="block text-sm font-medium text-gray-700">Nomor Telepon</label>
          <input
            {...register('phoneNumber')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Contoh: 081234567890"
          />
          {errors.phoneNumber && <p className="mt-1 text-xs text-red-500">{errors.phoneNumber.message}</p>}
        </div>

        
        {mutationError && (
          <div className="p-3 bg-red-50 text-xs text-red-600 rounded border border-red-200">
            {mutationError.message}
          </div>
        )}

        
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isPending ? 'Menyimpan...' : 'Simpan Profil'}
        </button>
      </form>
    </div>
  );
}

```

---

## 5. Tolok Ukur Keberhasilan Langkah 3

1. [ ] Variabel `.env.local` terbaca dengan benar tanpa menghasilkan nilai `undefined` pada instansiasi Supabase.
2. [ ] Aplikasi web dibungkus dengan `<Providers>` sehingga tidak memunculkan eror konteks QueryClient.
3. [ ] Mengisi NIK/NPWP dengan huruf atau jumlah digit yang kurang akan langsung memicu pesan peringatan merah secara *realtime* di sisi UI.
4. [ ] Pengiriman data berhasil menyimpan baris data baru ke tabel `profiles` di dashboard Supabase jika pengguna sudah dalam posisi ter-login.

```

<FollowUp label="Lanjutkan ke script .md Langkah 4: Pembuatan Mesin Hitung Simulasi PPh & Form Pajak?" query="Buatkan skrip format .md untuk Langkah ke-4 yang berfokus pada logika komputasi penghitungan simulasi PPh Pasal 21/25 (pajak penghasilan) di sisi frontend menggunakan rumus tarif progresif terbaru, divalidasi dengan Zod, dan disimpan ke tabel tax_reports via TanStack Query."/></TaxpayerProfile>

```