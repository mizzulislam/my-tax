# Langkah 2: Skema Database PostgreSQL & Konfigurasi Row Level Security (RLS)

Dokumen ini memandu Anda untuk membangun arsitektur database di **Supabase SQL Editor**. Fokus utama kita adalah mengunci lapisan keamanan data finansial dan wajib pajak dari sisi server menggunakan fitur native PostgreSQL, yaitu **Row Level Security (RLS)**.

---

## 1. Desain Relasi Tabel Database

Setiap tabel akan berelasi langsung dengan tabel bawaan dari Supabase Auth (`auth.users`) melalui *Foreign Key* `user_id`. Aturan penghapusan data disetel ke `CASCADE` pada profil utama, namun menggunakan *Soft Delete* atau restriksi ketat pada data keuangan untuk keperluan audit log.

---

## 2. Implementasi Skrip DDL & RLS (`supabase_schema.sql`)

Jalankan seluruh blok query SQL di bawah ini di dalam **SQL Editor** pada dashboard project Supabase Anda:

```sql
-- ====================================================================
-- 1. PEMBUATAN TABEL PROFIL WAJIB PAJAK (profiles)
-- ====================================================================
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    taxpayer_type TEXT NOT NULL CHECK (taxpayer_type IN ('pribadi', 'badan')),
    nik CHAR(16) NOT NULL UNIQUE,
    npwp VARCHAR(16) NOT NULL UNIQUE,
    phone_number VARCHAR(15) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Comment untuk dokumentasi kolom database
COMMENT ON TABLE public.profiles IS 'Menyimpan data identitas inti wajib pajak yang terikat dengan akun auth.';

-- ====================================================================
-- 2. PEMBUATAN TABEL DRAFT LAPORAN PAJAK (tax_reports)
-- ====================================================================
CREATE TABLE public.tax_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    tax_year INT NOT NULL,
    tax_period VARCHAR(2) NOT NULL, -- Format bulan (01-12) atau kode masa
    gross_income NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (gross_income >= 0),
    tax_payable NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (tax_payable >= 0),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'paid', 'overdue')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ====================================================================
-- 3. AKTIVASI ROW LEVEL SECURITY (RLS)
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_reports ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- 4. PEMBUATAN POLICY KEAMANAN BERBASIS auth.uid()
-- ====================================================================

-- Kebijakan untuk Tabel Profiles:
-- User hanya bisa melihat, menambah, dan mengubah profil miliknya sendiri.
CREATE POLICY "Pengguna hanya bisa melihat profil sendiri" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Pengguna hanya bisa membuat profil sendiri" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Pengguna hanya bisa memperbarui profil sendiri" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Kebijakan untuk Tabel Tax Reports:
-- Data laporan diisolasi penuh berdasarkan user_id pemilik laporan.
CREATE POLICY "Pengguna hanya bisa melihat laporan pajak sendiri" 
ON public.tax_reports FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Pengguna hanya bisa membuat laporan pajak sendiri" 
ON public.tax_reports FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pengguna hanya bisa memperbarui laporan pajak sendiri" 
ON public.tax_reports FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pengguna hanya bisa menghapus draf laporan sendiri" 
ON public.tax_reports FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id AND status = 'draft');

```

---

## 3. Otomatisasi Sinkronisasi `updated_at` (Database Trigger)

Supaya aplikasi mencatat jejak waktu pembaruan data secara akurat di sisi database, jalankan fungsi trigger berikut untuk memperbarui kolom `updated_at` secara otomatis setiap ada instruksi `UPDATE`:

```sql
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Pasang trigger ke tabel profiles
CREATE TRIGGER update_profiles_modtime
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

-- Pasang trigger ke tabel tax_reports
CREATE TRIGGER update_tax_reports_modtime
    BEFORE UPDATE ON public.tax_reports
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

```

---

## 4. Tolok Ukur Keberhasilan Langkah 2

1. [ ] Semua tabel (`profiles`, `tax_reports`) berhasil terbuat di dalam skema `public`.
2. [ ] Fitur RLS berstatus **Enabled** pada menu *Database -> Tables* di dashboard Supabase.
3. [ ] Pengujian menggunakan *Service Role Key* dapat mengakses semua data, sedangkan pengujian menggunakan *Anon/Authenticated Key* dibatasi ketat oleh fungsi `auth.uid()`.
4. [ ] Percobaan penghapusan data laporan bermutasi `status = 'submitted'` akan ditolak oleh sistem berdasarkan batasan *Delete Policy*.

```

<FollowUp label="Lanjutkan ke script .md Langkah 3: Integrasi Next.js dengan Supabase Client & Form Pengisian Profil?" query="Buatkan skrip format .md untuk Langkah ke-3 yang mencakup inisialisasi Supabase client di Next.js, pembuatan form registrasi profil menggunakan React Hook Form, validasi Zod, dan pengiriman data ke tabel profiles menggunakan TanStack Query."/>

```