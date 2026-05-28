create table if not exists public.tax_rates_config (
  id uuid primary key default gen_random_uuid(),
  rate_key text not null unique,
  label text not null,
  rate numeric(10, 6) not null,
  effective_from date not null,
  effective_to date,
  source_label text not null,
  source_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tax_rates_config enable row level security;

drop policy if exists "Tax rates are readable by authenticated users" on public.tax_rates_config;
create policy "Tax rates are readable by authenticated users"
  on public.tax_rates_config
  for select
  to authenticated
  using (true);

drop policy if exists "Only admins can manage tax rates" on public.tax_rates_config;
create policy "Only admins can manage tax rates"
  on public.tax_rates_config
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

insert into public.tax_rates_config (rate_key, label, rate, effective_from, effective_to, source_label, source_url)
values
  ('ppn_non_luxury_2025_dpp_factor', 'DPP nilai lain PPN barang/jasa non-mewah 2025', 0.916667, '2025-01-01', null, 'PMK 131 Tahun 2024', null),
  ('ppn_standard', 'Tarif umum PPN', 0.12, '2025-01-01', null, 'UU HPP dan ketentuan turunan', null),
  ('ppn_legacy_11_percent', 'Tarif PPN 11% untuk skenario historis', 0.11, '2022-04-01', '2024-12-31', 'UU HPP', null),
  ('sanction_interest_may_2026_correction_late_payment', 'Sanksi bunga pembetulan/terlambat bayar Mei 2026', 0.0097, '2026-05-01', '2026-05-31', 'KMK 19/MK/EF.2/2026', null)
on conflict (rate_key) do update
set
  label = excluded.label,
  rate = excluded.rate,
  effective_from = excluded.effective_from,
  effective_to = excluded.effective_to,
  source_label = excluded.source_label,
  source_url = excluded.source_url,
  is_active = true,
  updated_at = now();
