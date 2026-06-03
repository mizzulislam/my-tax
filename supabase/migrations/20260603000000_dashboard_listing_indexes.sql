do $$
begin
  if to_regclass('public.documents') is not null then
    create index if not exists documents_user_created_at_idx
      on public.documents (user_id, created_at desc);

    create index if not exists documents_user_category_year_created_at_idx
      on public.documents (user_id, category, tax_year, created_at desc);
  end if;

  if to_regclass('public.assets') is not null then
    create index if not exists assets_user_tax_year_created_at_idx
      on public.assets (user_id, tax_year, created_at desc);
  end if;
end $$;
