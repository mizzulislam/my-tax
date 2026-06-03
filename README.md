# My Tax - Asisten Persiapan Pajak Pribadi AI (Tax Feyments)

**My Tax** adalah asisten persiapan pajak pribadi berbasis AI yang dirancang khusus untuk Wajib Pajak Orang Pribadi di Indonesia (Karyawan, Freelancer, dan UMKM). Aplikasi ini membantu Anda merapikan data pajak, dokumen, dan melakukan simulasi (What-If) sebelum melaporkan SPT ke DJP/CoreTax secara resmi.

Proyek ini dibangun menggunakan **Next.js 15 (App Router)**, **React 19**, **Tailwind CSS v4**, **Supabase** (Auth & RLS Database), dan diintegrasikan dengan **Google Gemini AI** untuk menghasilkan wawasan pintar (AI Insights). Proyek ini dideploy menggunakan **Google Cloud Run**.

---

## 1. Rangkuman Langkah Implementasi (Development Journey)

Proyek ini dibangun melalui beberapa fase terstruktur yang tadinya didokumentasikan dalam file `LANGKAH_01` hingga `LANGKAH_05`:

- **Langkah 1: Inisialisasi Proyek & Desain Sistem**  
  Setup Next.js 15 dengan Tailwind CSS v4. Pembuatan UI/UX modern (Dark mode, glassmorphism) dan integrasi awal library seperti `lucide-react`, `zustand` (state management), dan `react-hook-form` + `zod` untuk validasi.
- **Langkah 2: Database & Row Level Security (RLS)**  
  Setup Supabase PostgreSQL. Pembuatan tabel inti: `profiles`, `income_sources`, `tax_reports`, `documents`. Penerapan RLS yang ketat agar setiap pengguna (berbasis UUID Supabase Auth) hanya bisa mengakses data mereka sendiri.
- **Langkah 3: Supabase Client & Formulir Data**  
  Integrasi `@supabase/ssr` untuk autentikasi server-side dan middleware Next.js guna memproteksi rute `/dashboard`. Pembuatan formulir profil wajib pajak dengan perlindungan otorisasi penuh.
- **Langkah 4: Tax Computation Engine & Integrasi AI**  
  Pembuatan kalkulator PPh 21 (TER), PPh 23, dan PPh Final UMKM. Integrasi dengan Google Gemini AI untuk mengekstrak informasi pajak dari dokumen, memberikan saran efisiensi pajak, dan men-generate laporan.
- **Langkah 5: Dashboard, Readiness Score, & History**  
  Pengembangan Dashboard interaktif yang menampilkan *Readiness Score* (skor kesiapan lapor pajak), panel *What-If Simulation* (simulasi perubahan penghasilan), *Document Vault* (brankas dokumen), dan riwayat laporan pajak.

---

## 2. Rangkuman Dokumen Lomba (Juara Vibe Coding)

Proyek ini merupakan submission untuk event **Juara Vibe Coding**. Dokumen sebelumnya (`docs/juara-vibe-coding/*`) memuat detail berikut:

- **Problem (Masalah):** Wajib pajak di Indonesia sering kebingungan dengan regulasi pajak yang dinamis, perhitungan berlapis (TER, PTKP), serta tercecernya dokumen bukti potong saat masa pelaporan SPT tahunan tiba.
- **Solution (Solusi):** "My Tax" hadir untuk mensentralisasi dokumen, menghitung estimasi pajak otomatis, dan menggunakan AI untuk memandu Wajib Pajak menyiapkan dokumen hingga skor kesiapan mereka mencapai 100%.
- **Uniqueness (Keunikan):** Fitur *What-If Scenario Builder* (simulasi skenario masa depan) dan *Tax Readiness Score* yang dikombinasikan dengan pembacaan cerdas oleh Gemini AI.
- **Demo Script:** Alur presentasi menyoroti proses pendaftaran, upload bukti potong, melihat AI insight yang membaca dokumen tersebut, dan melakukan simulasi jika wajib pajak beralih dari karyawan menjadi freelancer.
- **Acceptance Criteria & AI Instructions:** Instruksi spesifik bagi agen AI dalam membantu pengembangan, yang sangat menitikberatkan pada desain UI/UX kelas atas (premium, animasi mulus) dan keamanan data (RLS).

---

## 3. Rangkuman Hasil Audit Produksi (Production Readiness Audit)

Dari file `FINAL_PRODUCTION_READINESS_AUDIT.md`, aplikasi ini dinyatakan **SIAP PRODUKSI** dengan catatan:
- **Kelebihan:** Keamanan sangat baik berkat penerapan Middleware Next.js untuk autentikasi dan Supabase RLS. UI sangat responsif dan modern. Modul perpajakan (PPh 21, dll) telah terisolasi dengan baik.
- **Poin Optimalisasi (Telah/Akan diselesaikan):** Memastikan penanganan *graceful fallback* jika Gemini API mengalami *rate limit*, serta penyempurnaan SEO dan OpenGraph Tags (seperti thumbnail LinkedIn yang sudah diselesaikan).

---

## 4. Instruksi dan Prompt AI (Agent Rules)

Kumpulan aturan dari file lama (`AGENTS.md`, `CLAUDE.md`, `prompt-accounting-agent.md`):
- **Core Rule:** Menggunakan Next.js App Router terbaru. Dilarang menggunakan pola lama (Pages router).
- **Aesthetics & UI:** Diwajibkan menggunakan estetika premium, *dark mode sleek*, *micro-animations*, dan warna harmonis. Dilarang menggunakan *generic colors*.
- **Accounting Prompt:** Agen diposisikan sebagai "Asisten Pajak Indonesia" yang harus mematuhi UU HPP (Harmonisasi Peraturan Perpajakan), menggunakan PTKP terbaru, serta memberikan *disclaimer* bahwa AI bukan pengganti konsultan pajak resmi (DJP).

---

## 5. Rangkuman Implementation Plans (Big Repair & Lanjutan)

Dari dokumen `Implementation_Plan_*.md`:
- Menyelesaikan perbaikan *hydration mismatch* pada React 19.
- Merapikan struktur state global menggunakan Zustand untuk menghindari prop-drilling berlebih pada dashboard yang kompleks.
- Perbaikan aliran data (data flow) dari Supabase -> Server Components -> Client Components untuk sinkronisasi *Readiness Score* secara *real-time*.

---

*Dokumen tunggal ini kini menggantikan puluhan file dokumentasi yang tersebar demi menjaga repositori tetap bersih dan terpusat.*
