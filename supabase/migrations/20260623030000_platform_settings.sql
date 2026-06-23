-- ============================================================================
-- SentinelAI — platform settings (singleton)
--
-- Stores the handful of real, owner-configurable platform settings shown on
-- the owner Settings page: branding (platform name + support email) and the
-- owner notification preferences. Single row enforced by a fixed primary key.
-- ============================================================================

create table if not exists platform_settings (
  id              boolean primary key default true,
  platform_name   text not null default 'SentinelAI',
  support_email   text not null default 'info@sentinelai-software.co.za',
  notify_billing  boolean not null default true,
  notify_security boolean not null default true,
  notify_product  boolean not null default false,
  notify_churn    boolean not null default true,
  updated_at      timestamptz not null default now(),
  constraint platform_settings_singleton check (id)
);

insert into platform_settings (id) values (true) on conflict (id) do nothing;

alter table platform_settings enable row level security;

create policy platform_settings_read on platform_settings for select
  using (is_owner());

create policy platform_settings_write on platform_settings for all
  using (is_owner()) with check (is_owner());
