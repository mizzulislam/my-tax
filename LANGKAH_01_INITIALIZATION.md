# Langkah 1: Inisialisasi Proyek & Konfigurasi Validasi Data (Zod)

Dokumen ini memandu Anda melalui tahap awal pembangunan aplikasi **Tax Feyments**. Pada tahap ini, kita akan melakukan inisialisasi proyek Next.js, mengatur struktur folder standar industri, dan menerapkan skema validasi data wajib pajak yang ketat menggunakan Zod.

---

## 1. Persiapan & Instalasi Dependensi

Jalankan perintah berikut pada terminal Anda untuk menginstal pustaka utama yang dibutuhkan untuk manajemen form, validasi, dan state management:

```bash
# Instalasi pustaka form dan validasi
npm install zod react-hook-form @hookform/resolvers

# Instalasi state management global
npm install zustand

```

---

## 2. Struktur Arsitektur Folder

Pastikan struktur direktori di dalam folder `src/` Anda mengikuti pola modular di bawah ini untuk menjaga skalabilitas kode:

```text
src/
├── app/                  # Next.js App Router (Pages, Layouts, APIs)
├── components/           # Komponen UI (Shadcn UI)
│   └── ui/               # Atom komponen dasar (Button, Input, dll)
├── hooks/                # Custom React Hooks & TanStack Query
├── lib/                  # Konfigurasi Supabase Client & Utils
├── store/                # Zustand Store (Global State Management)
└── types/                # Skema Zod & Inferensi Tipe TypeScript
    └── taxpayer.ts       # Validasi aturan data perpajakan

```

---

## 3. Implementasi Kode Validasi (`src/types/taxpayer.ts`)

Sebagai aplikasi perpajakan (*Taxologist architecture*), validasi ganda di sisi klien sangat krusial sebelum data berinteraksi dengan database. Berkas ini bertugas memastikan format NIK, NPWP, dan nomor telepon bersih dari karakter asing dan manipulasi.

```typescript
import { z } from "zod";

// Regex pengunci: Memastikan input string hanya berisi angka 0-9
const numericRegex = /^[0-9]+$/;

export const taxpayerProfileSchema = z.object({
  fullName: z
    .string()
    .min(3, { message: "Nama lengkap minimal terdiri dari 3 karakter." })
    .max(100, { message: "Nama lengkap maksimal 100 karakter." }),
  
  taxpayerType: z.enum(["pribadi", "badan"], {
    errorMap: () => ({ message: "Jenis wajib pajak harus dipilih antara 'pribadi' atau 'badan'." }),
  }),

  // NIK Indonesia wajib tepat 16 digit angka sesuai KTP
  nik: z
    .string()
    .length(16, { message: "NIK harus tepat berukuran 16 digit." })
    .regex(numericRegex, { message: "NIK hanya boleh berisi karakter angka." }),

  // NPWP format 15 digit (lama) atau 16 digit (KTP/format baru per 2024/2026)
  npwp: z
    .string()
    .refine((val) => val.length === 15 || val.length === 16, {
      message: "NPWP wajib berukuran 15 digit atau 16 digit (format baru).",
    })
    .regex(numericRegex, { message: "NPWP hanya boleh berisi karakter angka tanpa tanda baca." }),

  phoneNumber: z
    .string()
    .min(10, { message: "Nomor telepon minimal berjumlah 10 digit." })
    .max(15, { message: "Nomor telepon maksimal berjumlah 15 digit." })
    .regex(/^\+?[0-9]+$/, { message: "Format nomor telepon tidak valid (Gunakan format standar angka)." }),
});

// Inferensi tipe otomatis dari skema Zod untuk TypeScript static typing
export type TaxpayerProfile = z.infer<typeof taxpayerProfileSchema>;

```

---

## 4. Implementasi Global State (`src/store/useTaxpayerStore.ts`)

Zustand akan mengelola siklus hidup data wajib pajak selama sesi aplikasi berjalan, termasuk status pembatasan fitur sensitif lewat indikator Multi-Factor Authentication (MFA).

```typescript
import { create } from "zustand";
import { TaxpayerProfile } from "@/types/taxpayer";

interface TaxpayerState {
  profile: TaxpayerProfile | null;
  isLoading: boolean;
  isMfaVerified: boolean;
  setProfile: (profile: TaxpayerProfile) => void;
  setMfaStatus: (status: boolean) => void;
  clearStore: () => void;
}

export const useTaxpayerStore = create<TaxpayerState>((set) => ({
  profile: null,
  isLoading: false,
  isMfaVerified: false,

  setProfile: (profile) => set({ profile }),
  setMfaStatus: (status) => set({ isMfaVerified: status }),
  clearStore: () => set({ profile: null, isMfaVerified: false, isLoading: false }),
}));

```

---

## 5. Tolok Ukur Keberhasilan Langkah 1

1. [ ] Dependensi `zod`, `react-hook-form`, dan `zustand` berhasil terpasang tanpa konflik versi.
2. [ ] Berkas tipe data dan skema validasi bersih dari *compiler error* TypeScript.
3. [ ] Store Zustand dapat diimpor secara modular tanpa menyebabkan *re-render loop* di komponen utama.

```

<FollowUp label="Lanjutkan ke script .md Langkah 2: Setup Database & RLS di Supabase?" query="Buatkan skrip format .md untuk Langkah ke-2 yang berfokus pada pembuatan skema database PostgreSQL di Supabase lengkap dengan perintah DDL untuk mengaktifkan Row Level Security (RLS) serta membuat kebijakan (policies) berbasis auth.uid()."/></TaxpayerState>

```