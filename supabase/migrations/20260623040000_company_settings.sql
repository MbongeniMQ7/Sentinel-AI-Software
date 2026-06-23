-- ============================================================================
-- SentinelAI — company settings
--
-- Per-company operational preferences shown on the manager Settings page:
-- team defaults, notification preferences and automation toggles. One row per
-- company, keyed by company_id. Readable/writable by the platform owner or a
-- manager of that company (manages_company).
-- ============================================================================

create table if not exists company_settings (
  company_id          uuid primary key references companies(id) on delete cascade,
  default_shift       text not null default 'Morning',
  fatigue_threshold   integer not null default 60,
  break_length        integer not null default 15,
  notify_critical     boolean not null default true,
  notify_digest       boolean not null default true,
  notify_escalation   boolean not null default true,
  auto_approve_breaks boolean not null default false,
  auto_escalate_ppe   boolean not null default true,
  updated_at          timestamptz not null default now()
);

alter table company_settings enable row level security;

create policy company_settings_read on company_settings for select
  using (manages_company(company_id));

create policy company_settings_write on company_settings for all
  using (manages_company(company_id)) with check (manages_company(company_id));
