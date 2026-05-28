# Implementation Plan Big Repair Review

Tanggal review: 2026-05-28

Tujuan dokumen ini adalah merangkum ulang seluruh rekomendasi di folder `Big Repair/`, lalu mencocokkannya dengan kondisi kode saat ini. Prinsip utama: jangan mengulang rekomendasi yang sudah benar-benar diterapkan, jangan mengubah sentuhan UI/UX manual yang tidak berkaitan dengan risiko, dan prioritaskan perbaikan yang menaikkan kepercayaan, akurasi pajak, keamanan data, serta kejelasan batas produk.

## Ringkasan Eksekutif

Ada beberapa rekomendasi yang sudah masuk sebagian besar:

- e-Billing mock sudah berubah menjadi halaman panduan edukasi.
- Tax engine sudah mulai menangani konflik `pekerjaan_bebas` vs UMKM final, batas 7 tahun UMKM, BPHTB region fallback, dan validasi TER Desember.
- Komponen AI disclaimer/watermark sudah ada.
- OCR sudah punya verifikasi manual setelah ekstraksi.
- Signed URL dokumen sudah digunakan.
- Streak sudah tersambung ke tabel `gamification`.
- Folder `supabase/migrations` sudah ada.

Namun masih ada gap penting:

- Test saat ini gagal di `calculateVat` untuk mode PPN non-mewah 2025.
- `DisclaimerBox` ada tetapi belum dipasang di halaman kalkulator.
- Tarif sanksi masih hardcoded Mei 2026, belum memakai config/database.
- Field `registrationYearForUmkm` ada di schema dan engine, tetapi belum tersimpan lewat form/hook/database migration.
- Admin masking/decrypt belum konsisten dengan pola auth admin yang lebih aman.
- Dashboard masih analytics-first, belum SPT readiness-first.
- AI masih diposisikan terlalu kuat sebagai konsultan/taxologist, masih punya tone/persona humor/gaul, belum ada consent granular.
- What-if advisor sudah lebih baik, tetapi belum memakai rule advisor berbasis variabel penghasilan nyata dan link ke AI mengarah ke route yang salah.
- OCR belum punya confidence score, verified vs extracted data model, dan rate limit khusus.
- Banyak schema penting yang dipakai aplikasi belum tercakup di migration folder baru.
- Points/XP masih tampil `0` di profile dropdown.

## P0 - Wajib Sebelum Perbaikan Besar Lain

### 1. Pulihkan baseline test tax engine

Masalah:
- `npm test` gagal pada `calculateVat supports 2025 non-luxury DPP value and standard rate`.
- Expected `1.320.000`, actual `1.440.000` untuk `calculateVat(12_000_000, 'non_luxury_2025')`.
- Type `VatMode` saat ini hanya `11_percent | 12_percent`, tetapi test dan UI memakai konsep mode non-mewah 2025.

Plan:
- Selaraskan `VatMode`, opsi UI, dan implementasi `calculateVat`.
- Tambahkan regression test eksplisit untuk mode `non_luxury_2025`, `standard`, dan `includeTax`.
- Jalankan `npm test` sampai hijau.

File target:
- `src/lib/taxEngine.ts`
- `src/components/TaxCalculatorForm.tsx`
- `tests/taxEngine.test.cjs`

### 2. Pasang disclaimer estimasi di seluruh output kalkulator

Status saat ini:
- `src/components/DisclaimerBox.tsx` sudah ada.
- Belum ada penggunaan `DisclaimerBox` di `src/`.

Plan:
- Pasang disclaimer di halaman kalkulator tanpa mengubah layout utama yang sudah dirapikan.
- Pakai styling yang sejalan dengan dark dashboard saat ini, karena komponen sekarang masih light/yellow default.
- Tambahkan disclaimer ringkas pada PDF/export bila belum ada untuk semua jenis output.

File target:
- `src/components/DisclaimerBox.tsx`
- `src/app/dashboard/kalkulator/page.tsx`
- `src/components/TaxCalculatorForm.tsx`
- `src/components/TaxHistoryTable.tsx`

### 3. Hilangkan sisa risiko billing resmi palsu

Status saat ini:
- Halaman `/dashboard/billing` sudah menjadi panduan edukasi, ini bagus.
- Masih ada `useBillingCodes`, `billingGenerator`, dan aksi di riwayat laporan yang membuat "kode billing simulasi" serta status paid/lunas.

Plan:
- Ubah seluruh wording menjadi "draft data pembayaran" atau "ringkasan persiapan pembayaran".
- Hapus/disable generasi kode 15 digit yang menyerupai kode billing resmi.
- Hapus status paid/lunas dari alur simulasi, ganti dengan status `draft/reviewed/exported`.
- Pertahankan link ke DJP Online/SSE dan panduan resmi.

File target:
- `src/lib/billingGenerator.ts`
- `src/hooks/useBillingCodes.ts`
- `src/components/TaxHistoryTable.tsx`
- `src/types/taxpayer.ts`
- `src/app/dashboard/billing/page.tsx`

Open question:
- Apakah fitur billing ingin dihapus total dari MVP, atau dipertahankan sebagai "Draft Pembayaran" dengan export ringkasan saja?

### 4. Kunci alur admin decrypt dan masking

Status saat ini:
- `MaskedTaxData` ada, tetapi admin users table masih merender `user.npwp` langsung.
- `/api/admin/decrypt-field` memakai `supabase` browser client di route server dan tidak memakai `requireAdmin`.
- Audit insert di decrypt route memakai kolom `target_user_id`, sementara helper audit lain memakai `target_table/target_id`.
- Enkripsi client memakai `NEXT_PUBLIC_ENCRYPTION_KEY` dengan fallback hardcoded, ini kurang aman untuk data sensitif.

Plan:
- Terapkan `MaskedTaxData` di admin table untuk NPWP/NIK bila data memang perlu tampil.
- Refactor `/api/admin/decrypt-field` agar memakai `NextRequest`, `requireAdmin`, service role, validasi payload, dan `insertAuditLog`.
- Putuskan satu strategi enkripsi: database pgcrypto via RPC/server-only atau app-layer server-only. Jangan pakai public env key untuk data rahasia.
- Buat migration/audit yang memastikan raw `nik/npwp` tidak lagi dibaca admin secara langsung.

File target:
- `src/app/admin/page.tsx`
- `src/app/api/admin/decrypt-field/route.ts`
- `src/lib/adminServer.ts`
- `src/lib/encryption.ts`
- `supabase/migrations/*`

Open question:
- Untuk tahap ini, apakah kita boleh menonaktifkan fitur "lihat data lengkap" admin sepenuhnya sampai consent/audit final siap?

## P1 - Trust, Accuracy, dan Core Product

### 5. Lengkapi alur UMKM registration year dari form sampai DB

Status saat ini:
- `registrationYearForUmkm` sudah ada di Zod schema dan dipakai tax engine.
- `IncomeSourceForm` belum menampilkan field tersebut saat `sourceType === 'usaha'`.
- `useIncomeSources` belum map/persist `registration_year_for_umkm`.
- Belum ada migration untuk kolom ini.

Plan:
- Tambahkan migration kolom `income_sources.registration_year_for_umkm`.
- Tampilkan field "Tahun mulai/terdaftar UMKM" hanya untuk penghasilan usaha.
- Map field di fetch, insert, update, edit reset.
- Tampilkan warning engine di dashboard/income/calculation result.
- Tambahkan tests untuk usaha + pekerjaan bebas, usaha expired 7 tahun, dan usaha valid.

File target:
- `src/components/IncomeSourceForm.tsx`
- `src/hooks/useIncomeSources.ts`
- `src/lib/taxEngine.ts`
- `tests/taxEngine.test.cjs`
- `supabase/migrations/*`

### 6. Buat tax result traceable: rule version, asumsi, breakdown

Status saat ini:
- Kalkulator punya rincian UI pada beberapa jenis pajak, tetapi belum standar result object.
- `tax_reports` tampaknya masih menyimpan output minimal.

Plan:
- Definisikan struktur `TaxCalculationResult` internal: `taxYear`, `taxType`, `ruleVersion`, `inputSnapshot`, `assumptions`, `formulaSteps`, `warnings`, `disclaimer`.
- Mulai dari PPh 21, PPN, UMKM/final, BPHTB, dan sanksi.
- Tampilkan tab/panel "Ringkasan, Breakdown, Asumsi, Peringatan, Dasar aturan".
- Simpan snapshot ke laporan agar hasil lama tetap dapat ditelusuri.

File target:
- `src/lib/taxEngine.ts`
- `src/types/taxpayer.ts`
- `src/components/TaxCalculatorForm.tsx`
- `src/hooks/useMutateReport.ts`
- `src/app/api/tax-reports/route.ts`

### 7. Pindahkan tarif sanksi ke config yang bisa diperbarui

Status saat ini:
- `MAY_2026_SANCTION_INTEREST_RATES` masih hardcoded.

Plan:
- Tambah migration `tax_rates_config`.
- Seed rate Mei 2026 sebagai data awal dengan `source_url`.
- Tax engine tetap punya fallback defensif, tetapi UI wajib menampilkan periode rate.
- Tambahkan admin-only update flow nanti; untuk fase awal cukup read config server-side.

File target:
- `src/lib/taxEngine.ts`
- `src/app/api/tax-rates/route.ts` atau server helper baru
- `supabase/migrations/*`
- `tests/taxEngine.test.cjs`

Open question:
- Apakah Anda ingin rate config bisa diedit via admin UI sekarang, atau cukup migration/seed dulu?

### 8. Ubah dashboard menjadi SPT readiness-first

Status saat ini:
- Dashboard masih berisi stats, trend chart, riwayat, analytics, calendar.
- Rekomendasi ChatGPT meminta hierarchy: readiness score, next best action, missing documents, estimate, warnings, deadline, baru charts.

Plan:
- Buat helper `readinessEngine` yang menghitung kategori: profil, penghasilan, dokumen, kalkulasi, risiko, export.
- Tambahkan `ReadinessScoreCard`, `NextBestActionCard`, `MissingDocumentsList`, `RiskWarningPanel`.
- Letakkan chart dan advanced analytics setelah action cards.
- Jangan ubah estetika dashboard secara besar; cukup reposisi dan tambah komponen yang sejalan dengan design existing.

File target:
- `src/app/dashboard/page.tsx`
- `src/lib/readinessEngine.ts`
- `src/components/dashboard/*`
- `src/hooks/useDocuments.ts`
- `src/hooks/useIncomeSources.ts`
- `src/hooks/useFetchReports.ts`

### 9. Perbaiki AI safety, positioning, dan consent

Status saat ini:
- Ada mandatory prompt dan AIResponseWrapper.
- Masih ada wording "Asisten Konsultan Pajak", "Taxologist AI", persona/tone humor/gaul.
- Belum ada consent granular "data apa yang digunakan AI".
- Risk filter masih kata-kunci sederhana.
- Floating chat `TaxAssistantChat` mengirim request tanpa bearer token, sementara API mewajibkan bearer token. Ini berpotensi gagal.

Plan:
- Rename UI menjadi "Asisten Edukasi Pajak" atau "Tax Preparation Assistant".
- Hapus/disable tone humor/gaul untuk konteks pajak, atau ubah menjadi "ramah & jelas" tanpa komedi.
- Tambah consent panel: gunakan profil, penghasilan, aset, laporan, skenario, atau tanpa data pribadi.
- Buat risk classifier bertingkat: low/medium/high/block.
- Pastikan semua client chat memakai bearer token secara konsisten.
- Ubah system prompt agar AI menjelaskan hasil tax engine, bukan menghitung final sendiri.

File target:
- `src/app/api/chat/route.ts`
- `src/app/dashboard/assistant/page.tsx`
- `src/components/TaxAssistantChat.tsx`
- `src/components/AIResponseWrapper.tsx`
- `src/hooks/useAiTaxContext.ts`

## P2 - Security, Data Model, dan Feature Cleanup

### 10. Lengkapi OCR beta flow

Status saat ini:
- OCR sudah memaksa verifikasi manual, bagus.
- Belum ada confidence score, extracted vs verified storage, classification lengkap, rate limit OCR, atau audit access.
- Error handling API masih generik.

Plan:
- Label UI menjadi "OCR Beta - perlu verifikasi".
- API return `success`, `data`, `confidence`, `fallback`, dan error khusus quota/rate/file.
- Tambah metadata `extracted_data`, `verified_data`, `confidence_score`, `verification_status`.
- Tambah rate limit OCR 5 request/5 menit.
- Catat upload, view signed URL, delete, verify ke audit log.

File target:
- `src/app/api/ocr/route.ts`
- `src/components/OcrUploader.tsx`
- `src/components/documents/DocumentUploader.tsx`
- `src/hooks/useDocuments.ts`
- `supabase/migrations/*`

### 11. Rapikan gamification agar tidak terlihat palsu

Status saat ini:
- Streak sudah tersambung DB.
- Points/XP di profile dropdown masih hardcoded `0`.
- Chat quiz masih memberi reward XP visual, tetapi tidak jelas tersimpan atau relevan untuk domain pajak.

Plan:
- Pilih satu: sembunyikan points/XP dari dropdown, atau hubungkan ke tabel `gamification.points`.
- Jika dipertahankan, buat event points yang jelas dan tidak terlalu playful untuk konteks pajak.
- Pastikan copy tidak merusak kredibilitas domain pajak.

File target:
- `src/components/dashboard/DashboardShell.tsx`
- `src/hooks/useGamification.ts`
- `src/app/dashboard/assistant/page.tsx`
- `src/components/ChatQuiz.tsx`

Open question:
- Apakah gamification tetap bagian identitas produk, atau lebih baik diturunkan menjadi progress edukasi yang understated?

### 12. Perbaiki TourGuide agar selector aman

Status saat ini:
- TourGuide masih menjalankan steps dengan selector `.tax-type-chip` dan `.upload-area` walau tidak selalu ada di halaman aktif.

Plan:
- Filter step berdasarkan elemen yang benar-benar ada sebelum `run`.
- Jika hanya `body` yang valid, tampilkan welcome saja atau skip.
- Pastikan localStorage hanya menyimpan preferensi non-sensitif.

File target:
- `src/components/TourGuide.tsx`

### 13. Migration hygiene dan RLS baseline

Status saat ini:
- Folder migrations ada, tetapi hanya enkripsi dan gamification.
- Aplikasi memakai banyak tabel: profiles, tax_reports, income_sources, documents, assets, transactions, chat_sessions, chat_messages, what_if_scenarios, audit_logs, rate_limit, billing_codes.
- File schema lama tampaknya dihapus dari root menurut `git status`, tetapi migration lengkap belum menggantikannya.

Plan:
- Buat migration canon untuk seluruh tabel user-owned, RLS, indexes, storage policies, audit logs, rate limit RPC.
- Pastikan tidak ada SQL setup yang dirender ke user.
- Tambahkan `README` database setup singkat.
- Jalankan/pertahankan `tests/rls-regression.sql`.

File target:
- `supabase/migrations/*`
- `tests/rls-regression.sql`
- `README.md`

### 14. Rate limit bertingkat

Status saat ini:
- Chat memakai DB RPC `consume_rate_limit`, tetapi config masih `20/60s` hardcoded.
- OCR belum memakai rate limit.

Plan:
- Buat `src/lib/rateLimit.ts` berisi config: chat 10/min, OCR 5/5min, export 10/5min, calculation 60/min bila perlu.
- Pakai helper konsisten di API route.
- UI tampilkan pesan Retry-After yang informatif.

File target:
- `src/app/api/chat/route.ts`
- `src/app/api/ocr/route.ts`
- `src/lib/rateLimit.ts`

### 15. Dynamic import untuk library berat

Status saat ini:
- Recharts, jsPDF, react-markdown, react-joyride tampaknya masih import langsung.
- Karena e-Billing mock sudah berubah, QRCode harus bisa dihapus jika tidak dipakai.

Plan:
- Dynamic import chart section dan TourGuide.
- Lazy-load jsPDF hanya saat export PDF diklik.
- Pertimbangkan split untuk assistant/markdown bila first load dashboard berat.
- Jalankan bundle analysis setelah fitur P0/P1 stabil.

File target:
- `src/components/TaxHistoryTable.tsx`
- `src/components/TaxTrendChart.tsx`
- `src/components/charts/*`
- `src/components/TourGuide.tsx`
- `next.config.ts`

## P3 - Product, Docs, dan Roadmap

### 16. Rewrite README dan product positioning

Status saat ini:
- Root README masih template Next.js.

Plan:
- Rewrite README sebagai "Personal Tax Preparation Assistant for Indonesian Taxpayers".
- Jelaskan batasan: bukan DJP, bukan PJAP, bukan konsultan pajak, bukan billing resmi.
- Tambahkan setup, env, migration, testing, dan risk disclaimers.

File target:
- `README.md`
- opsional `docs/`

### 17. Privacy policy, data export, delete account

Plan:
- Tambah halaman privacy policy sederhana.
- Tambah "download my data" dan "delete account/data" sebagai privacy controls.
- Tambah clear chat history yang sudah sebagian ada, tetapi perlu masuk privacy story.

File target:
- `src/app/privacy/page.tsx` atau lokasi yang disepakati
- `src/app/dashboard/profile/*`
- API route baru untuk export/delete

Open question:
- Apakah privacy policy perlu tampil di public landing/login, atau cukup di dashboard profile untuk tahap ini?

### 18. Admin/RBAC roadmap

Plan:
- Untuk MVP, batasi role ke `user` dan `admin` dulu.
- Role `consultant` jangan dipakai untuk akses data sampai ada consent flow.
- Roadmap berikutnya: support_admin/system_admin/auditor, access grants, revoke flow, consent scopes.

File target:
- `src/types/taxpayer.ts`
- `src/lib/adminServer.ts`
- `src/app/admin/page.tsx`
- `supabase/migrations/*`

## Rekomendasi yang Dilewati Karena Sudah Cukup Diterapkan

- Redesign e-Billing dari mock menjadi halaman edukasi: sudah dilakukan, tetapi sisa generator billing masih perlu dibereskan.
- Basic OCR manual verification: sudah ada, lanjutannya confidence/data model/rate limit.
- Basic AI response disclaimer: sudah ada, lanjutannya consent, risk levels, dan repositioning.
- Basic UMKM conflict logic di tax engine: sudah ada, lanjutannya persistence dan UI warning.
- Basic document signed URL: sudah ada lewat `createSignedUrl`.
- Basic gamification table/streak: sudah ada, lanjutannya points/XP dan relevansi UX.

## Urutan Commit yang Disarankan

1. `fix: restore tax engine test baseline`
2. `feat: add calculator disclaimer and traceable calculation warnings`
3. `refactor: replace simulated billing code with payment draft flow`
4. `security: harden admin masking and decrypt audit flow`
5. `feat: persist UMKM registration year and surface compliance warnings`
6. `feat: add SPT readiness dashboard primitives`
7. `feat: add AI consent and risk-level guardrails`
8. `feat: improve OCR beta verification metadata`
9. `chore: consolidate supabase migrations and RLS docs`
10. `docs: rewrite product README and boundaries`

## Pertanyaan Terbuka Untuk Review

1. Billing: hapus total dari MVP atau ubah menjadi Draft Pembayaran tanpa kode/status mirip resmi?
2. Admin decrypt: boleh dimatikan sementara sampai consent/audit matang?
3. Tax rates: cukup seed via migration dulu atau perlu admin UI untuk update tarif?
4. Gamification: tetap dipertahankan, atau diturunkan menjadi progress edukasi yang lebih serius?
5. Privacy policy: perlu public page sekarang atau cukup di dashboard profile?
6. Fokus user utama: apakah kita kunci ke Wajib Pajak Orang Pribadi dengan penghasilan campuran, sesuai mayoritas rekomendasi?

## Catatan Verifikasi Baseline

`npm test` sudah dijalankan. Hasil saat review:

- 26 test lulus.
- 1 test gagal: `calculateVat supports 2025 non-luxury DPP value and standard rate`.
- Kegagalan ini menjadi item P0 pertama sebelum mengerjakan perubahan besar lain.
