alter table public.income_sources
  add column if not exists registration_year_for_umkm integer;

comment on column public.income_sources.registration_year_for_umkm is
  'Tahun mulai/terdaftar UMKM untuk validasi masa pemanfaatan PPh Final PP 23 bagi Wajib Pajak Orang Pribadi.';
