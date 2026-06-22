-- ============================================================================
-- SentinelAI — account role mapping
--
-- Maps a login email to the role (and optional company) it should receive when
-- it first authenticates via the OTP edge functions. The verify-otp function
-- reads this table to provision the profile with the correct role.
-- Unmapped emails default to 'employee' with no company (they see only their
-- own empty workspace) — explicit mappings grant elevated / company access.
-- ============================================================================

create table if not exists account_roles (
  email       citext primary key,
  role        user_role not null default 'employee',
  company_id  uuid references companies(id) on delete set null,
  full_name   text,
  title       text,
  created_at  timestamptz not null default now()
);

alter table account_roles enable row level security;
-- Only the service_role (edge functions) reads/writes this table.

-- Platform owner.
insert into account_roles (email, role, full_name, title)
values ('qwabembongeni4@gmail.com', 'owner', 'Mbongeni Qwabe', 'Founder & CEO')
on conflict (email) do update
  set role = excluded.role,
      full_name = excluded.full_name,
      title = excluded.title;
