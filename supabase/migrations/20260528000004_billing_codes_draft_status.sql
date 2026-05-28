do $$
begin
  if to_regclass('public.billing_codes') is not null then
    alter table public.billing_codes
      drop constraint if exists billing_codes_status_check;

    alter table public.billing_codes
      add constraint billing_codes_status_check
      check (status in ('draft', 'reviewed', 'exported', 'cancelled', 'active', 'paid', 'expired'));

    comment on column public.billing_codes.billing_code is
      'Referensi draft internal aplikasi. Bukan kode billing resmi DJP.';
  end if;
end $$;
