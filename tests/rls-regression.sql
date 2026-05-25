-- RLS regression checklist for Supabase SQL Editor or psql against a staging database.
-- Replace the three placeholders before running:
--   :user_a_jwt, :user_b_jwt, :user_a_id
--
-- Goal: prove authenticated users cannot read or mutate another user's tax data.
-- Run only on staging/sandbox data.

-- 1) User A can see their own profile.
select set_config('request.jwt.claim.sub', :'user_a_id', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select id, role
from public.profiles
where id = :'user_a_id';

-- 2) User B must not see User A private rows when the JWT subject changes.
select set_config('request.jwt.claim.sub', :'user_b_id', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select count(*) as leaked_tax_reports
from public.tax_reports
where user_id = :'user_a_id';

select count(*) as leaked_documents
from public.documents
where user_id = :'user_a_id';

-- Expected: both counts are 0.

-- 3) User B must not update User A rows.
update public.tax_reports
set status = status
where user_id = :'user_a_id'
returning id;

update public.profiles
set role = 'admin'
where id = :'user_b_id'
returning id, role;

-- Expected:
-- - First UPDATE returns 0 rows.
-- - Second UPDATE fails because self role changes are blocked by trigger/policy.
