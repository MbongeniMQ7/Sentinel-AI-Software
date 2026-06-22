-- ============================================================================
-- SentinelAI — Workforce Fatigue & Wellness Platform
-- Initial database schema (PostgreSQL / Supabase compatible)
--
-- Multi-tenant SaaS. Three roles:
--   owner    — platform operator (manages all companies, billing, fleet)
--   manager  — company-scoped admin (workforce, alerts, approvals)
--   employee — monitored worker (own monitoring, breaks, leave)
--
-- Conventions:
--   * snake_case identifiers, plural table names
--   * uuid primary keys (gen_random_uuid)
--   * created_at / updated_at on mutable tables (updated_at via trigger)
--   * tenant isolation via company_id + Row Level Security
-- ============================================================================

create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "citext";      -- case-insensitive email

-- ============================================================================
-- 1. ENUMERATED TYPES
-- ============================================================================

create type user_role        as enum ('owner', 'manager', 'employee');
create type presence_status  as enum ('online', 'offline', 'busy', 'away');
create type employee_status  as enum ('active', 'on_break', 'offline', 'on_leave');
create type monitoring_type  as enum ('camera', 'wearable', 'hybrid');
create type shift_type       as enum ('morning', 'evening', 'night');
create type risk_level       as enum ('low', 'moderate', 'high', 'critical');

create type alert_type       as enum ('fatigue', 'drowsiness', 'distraction', 'absence', 'heart_rate', 'no_helmet');
create type alert_status     as enum ('open', 'acknowledged', 'escalated', 'resolved');

create type device_type      as enum ('camera', 'wearable_band', 'edge_gateway', 'helmet_sensor');
create type device_status    as enum ('online', 'offline', 'maintenance');

create type leave_type       as enum ('annual', 'sick', 'personal', 'emergency');
create type request_status   as enum ('pending', 'approved', 'rejected');
create type break_status     as enum ('pending', 'approved', 'rejected', 'active', 'completed');

create type plan_tier        as enum ('starter', 'growth', 'enterprise');
create type company_status   as enum ('active', 'trial', 'past_due', 'churned');
create type subscription_status as enum ('active', 'trialing', 'past_due', 'canceled');
create type invoice_status   as enum ('paid', 'pending', 'failed', 'refunded');

create type ticket_status    as enum ('open', 'in_progress', 'resolved', 'closed');
create type ticket_priority  as enum ('low', 'medium', 'high', 'urgent');

create type report_status    as enum ('draft', 'generating', 'ready', 'failed');
create type report_format    as enum ('pdf', 'csv', 'xlsx');

-- ============================================================================
-- 2. SHARED TRIGGER — keep updated_at fresh
-- ============================================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- 3. TENANCY — companies, plans, subscriptions, departments, shifts
-- ============================================================================

create table plans (
  id           uuid primary key default gen_random_uuid(),
  tier         plan_tier   not null unique,
  name         text        not null,
  price_per_seat_cents integer not null check (price_per_seat_cents >= 0),
  description  text,
  features     jsonb       not null default '[]'::jsonb,
  is_active    boolean     not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table companies (
  id            uuid primary key default gen_random_uuid(),
  name          text          not null,
  slug          citext        not null unique,
  industry      text,
  plan_id       uuid          references plans(id) on delete set null,
  status        company_status not null default 'trial',
  seats         integer       not null default 0 check (seats >= 0),
  logo_url      text,
  -- branding / company-level configuration kept inline for the MVP
  primary_color text          default '#1f43f5',
  settings      jsonb         not null default '{}'::jsonb,
  since         date          not null default current_date,
  created_at    timestamptz   not null default now(),
  updated_at    timestamptz   not null default now()
);

create table subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  company_id         uuid not null references companies(id) on delete cascade,
  plan_id            uuid not null references plans(id) on delete restrict,
  status             subscription_status not null default 'trialing',
  seats              integer not null default 0 check (seats >= 0),
  mrr_cents          integer not null default 0 check (mrr_cents >= 0),
  current_period_start date not null default current_date,
  current_period_end   date,
  canceled_at        timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table departments (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references companies(id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (company_id, name)
);

create table shifts (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references companies(id) on delete cascade,
  type        shift_type not null,
  label       text not null,
  starts_at   time not null,
  ends_at     time not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (company_id, type)
);

-- ============================================================================
-- 4. IDENTITY — profiles (1:1 with auth.users), employee details, hierarchy
-- ============================================================================

-- Mirrors Supabase auth.users. On Supabase, the FK below targets auth.users;
-- a standalone Postgres can drop the FK and treat profiles as the user table.
create table profiles (
  id            uuid primary key,            -- references auth.users(id)
  company_id    uuid references companies(id) on delete set null, -- null for platform owners
  role          user_role  not null default 'employee',
  full_name     text       not null,
  email         citext     not null unique,
  title         text,
  avatar_url    text,
  phone         text,
  presence      presence_status not null default 'offline',
  last_active_at timestamptz,
  is_active     boolean    not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- On Supabase, enable this FK to bind profiles to auth users:
-- alter table profiles
--   add constraint profiles_id_fkey
--   foreign key (id) references auth.users(id) on delete cascade;

-- Extended attributes for monitored employees.
create table employee_profiles (
  profile_id     uuid primary key references profiles(id) on delete cascade,
  company_id     uuid not null references companies(id) on delete cascade,
  department_id  uuid references departments(id) on delete set null,
  shift_id       uuid references shifts(id) on delete set null,
  manager_id     uuid references profiles(id) on delete set null,  -- reporting line
  job_title      text,                          -- e.g. Line Operator, Forklift Driver
  monitoring     monitoring_type not null default 'camera',
  status         employee_status not null default 'offline',
  -- latest snapshot (full history lives in fatigue_readings)
  fatigue_score  smallint check (fatigue_score between 0 and 100),
  heart_rate     smallint check (heart_rate between 0 and 250),
  risk_level     risk_level not null default 'low',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index on employee_profiles (company_id);
create index on employee_profiles (department_id);
create index on employee_profiles (manager_id);
create index on employee_profiles (status);
create index on employee_profiles (risk_level);

-- ============================================================================
-- 5. DEVICES & MONITORING
-- ============================================================================

create table devices (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references companies(id) on delete cascade,
  name          text not null,
  type          device_type not null,
  status        device_status not null default 'offline',
  battery_pct   smallint check (battery_pct between 0 and 100),
  firmware      text,
  assigned_to   uuid references profiles(id) on delete set null,
  department_id uuid references departments(id) on delete set null,
  location      text,                          -- e.g. "Assembly · Zone 3"
  last_seen_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index on devices (company_id);
create index on devices (status);
create index on devices (assigned_to);

create table monitoring_sessions (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references companies(id) on delete cascade,
  employee_id   uuid not null references profiles(id) on delete cascade,
  device_id     uuid references devices(id) on delete set null,
  monitoring    monitoring_type not null,
  started_at    timestamptz not null default now(),
  ended_at      timestamptz,
  avg_fatigue   smallint check (avg_fatigue between 0 and 100),
  peak_fatigue  smallint check (peak_fatigue between 0 and 100),
  alert_count   integer not null default 0,
  created_at    timestamptz not null default now()
);

create index on monitoring_sessions (company_id);
create index on monitoring_sessions (employee_id);
create index on monitoring_sessions (started_at desc);

-- High-frequency biometric / vision telemetry (time-series).
create table fatigue_readings (
  id            bigint generated always as identity primary key,
  session_id    uuid references monitoring_sessions(id) on delete cascade,
  employee_id   uuid not null references profiles(id) on delete cascade,
  company_id    uuid not null references companies(id) on delete cascade,
  recorded_at   timestamptz not null default now(),
  fatigue_score smallint not null check (fatigue_score between 0 and 100),
  heart_rate    smallint check (heart_rate between 0 and 250),
  focus_score   smallint check (focus_score between 0 and 100),
  risk_level    risk_level not null default 'low'
);

create index on fatigue_readings (employee_id, recorded_at desc);
create index on fatigue_readings (company_id, recorded_at desc);
create index on fatigue_readings (session_id);

-- ============================================================================
-- 6. ALERTS
-- ============================================================================

create table alerts (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references companies(id) on delete cascade,
  employee_id   uuid not null references profiles(id) on delete cascade,
  device_id     uuid references devices(id) on delete set null,
  session_id    uuid references monitoring_sessions(id) on delete set null,
  type          alert_type not null,
  severity      risk_level not null,
  status        alert_status not null default 'open',
  message       text not null,
  location      text,
  acknowledged_by uuid references profiles(id) on delete set null,
  acknowledged_at timestamptz,
  resolved_by   uuid references profiles(id) on delete set null,
  resolved_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index on alerts (company_id, created_at desc);
create index on alerts (employee_id);
create index on alerts (status);
create index on alerts (severity);
create index on alerts (type);

-- Audit trail of every status transition / escalation on an alert.
create table alert_events (
  id          bigint generated always as identity primary key,
  alert_id    uuid not null references alerts(id) on delete cascade,
  actor_id    uuid references profiles(id) on delete set null,
  from_status alert_status,
  to_status   alert_status not null,
  note        text,
  created_at  timestamptz not null default now()
);

create index on alert_events (alert_id, created_at);

-- ============================================================================
-- 7. WORKFORCE — leave & break requests
-- ============================================================================

create table leave_requests (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references companies(id) on delete cascade,
  employee_id   uuid not null references profiles(id) on delete cascade,
  type          leave_type not null,
  start_date    date not null,
  end_date      date not null,
  days          integer generated always as ((end_date - start_date) + 1) stored,
  reason        text,
  status        request_status not null default 'pending',
  reviewed_by   uuid references profiles(id) on delete set null,
  reviewed_at   timestamptz,
  review_note   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (end_date >= start_date)
);

create index on leave_requests (company_id, status);
create index on leave_requests (employee_id);

create table break_requests (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references companies(id) on delete cascade,
  employee_id   uuid not null references profiles(id) on delete cascade,
  reason        text,
  duration_min  smallint not null check (duration_min > 0),
  status        break_status not null default 'pending',
  reviewed_by   uuid references profiles(id) on delete set null,
  requested_at  timestamptz not null default now(),
  started_at    timestamptz,
  ended_at      timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index on break_requests (company_id, status);
create index on break_requests (employee_id);

-- ============================================================================
-- 8. REPORTS
-- ============================================================================

create table report_templates (
  id          uuid primary key default gen_random_uuid(),
  scope       user_role not null,             -- which role the template targets
  title       text not null,
  description text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table reports (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid references companies(id) on delete cascade,
  template_id   uuid references report_templates(id) on delete set null,
  created_by    uuid references profiles(id) on delete set null,
  title         text not null,
  date_range    text,                          -- e.g. '30d', 'quarter', 'year'
  format        report_format not null default 'pdf',
  status        report_status not null default 'draft',
  file_url      text,
  params        jsonb not null default '{}'::jsonb,
  generated_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index on reports (company_id, created_at desc);
create index on reports (created_by);

-- ============================================================================
-- 9. BILLING — invoices (subscriptions defined in section 3)
-- ============================================================================

create table invoices (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references companies(id) on delete cascade,
  subscription_id uuid references subscriptions(id) on delete set null,
  number        text not null unique,          -- e.g. INV-7001
  amount_cents  integer not null check (amount_cents >= 0),
  currency      char(3) not null default 'USD',
  status        invoice_status not null default 'pending',
  issued_on     date not null default current_date,
  due_on        date,
  paid_at       timestamptz,
  pdf_url       text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index on invoices (company_id, issued_on desc);
create index on invoices (status);

-- ============================================================================
-- 10. PLATFORM ADMIN — support, api keys, webhooks, notifications, audit
-- ============================================================================

create table support_tickets (
  id            uuid primary key default gen_random_uuid(),
  number        text not null unique,          -- e.g. TKT-4821
  company_id    uuid references companies(id) on delete cascade,
  opened_by     uuid references profiles(id) on delete set null,
  assigned_to   uuid references profiles(id) on delete set null,
  subject       text not null,
  category      text,
  priority      ticket_priority not null default 'medium',
  status        ticket_status not null default 'open',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index on support_tickets (company_id, status);

create table ticket_messages (
  id          uuid primary key default gen_random_uuid(),
  ticket_id   uuid not null references support_tickets(id) on delete cascade,
  author_id   uuid references profiles(id) on delete set null,
  body        text not null,
  is_internal boolean not null default false,
  created_at  timestamptz not null default now()
);

create index on ticket_messages (ticket_id, created_at);

create table faqs (
  id          uuid primary key default gen_random_uuid(),
  question    text not null,
  answer      text not null,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table api_keys (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references companies(id) on delete cascade,
  name          text not null,
  prefix        text not null,                 -- visible key prefix, e.g. sk_live_a1b2
  hashed_secret text not null,                 -- never store plaintext secrets
  scopes        text[] not null default '{}',
  last_used_at  timestamptz,
  created_by    uuid references profiles(id) on delete set null,
  revoked_at    timestamptz,
  created_at    timestamptz not null default now()
);

create index on api_keys (company_id);

create table webhooks (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references companies(id) on delete cascade,
  endpoint_url  text not null,
  secret        text,
  events        text[] not null default '{}',
  is_active     boolean not null default true,
  last_status   integer,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index on webhooks (company_id);

-- Per-user notification channel preferences.
create table notification_preferences (
  profile_id        uuid primary key references profiles(id) on delete cascade,
  fatigue_alerts    boolean not null default true,
  break_reminders   boolean not null default true,
  shift_summaries   boolean not null default true,
  email_enabled     boolean not null default true,
  push_enabled      boolean not null default true,
  sms_enabled       boolean not null default false,
  updated_at        timestamptz not null default now()
);

-- Delivered/in-app notifications.
create table notifications (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references profiles(id) on delete cascade,
  company_id  uuid references companies(id) on delete cascade,
  title       text not null,
  body        text,
  category    text,                            -- alert, approval, system, billing
  link        text,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index on notifications (profile_id, created_at desc);

-- Invitations to join a company (used by Owner/Manager onboarding).
create table invites (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid references companies(id) on delete cascade,
  email       citext not null,
  role        user_role not null default 'employee',
  invited_by  uuid references profiles(id) on delete set null,
  token       text not null unique,
  accepted_at timestamptz,
  expires_at  timestamptz not null default (now() + interval '7 days'),
  created_at  timestamptz not null default now()
);

create index on invites (company_id);

-- Security / compliance audit log (who did what, from where).
create table audit_logs (
  id          bigint generated always as identity primary key,
  company_id  uuid references companies(id) on delete cascade,
  actor_id    uuid references profiles(id) on delete set null,
  action      text not null,                   -- e.g. "approved leave request"
  target_type text,                            -- e.g. "alert", "device"
  target_id   text,
  ip_address  inet,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index on audit_logs (company_id, created_at desc);
create index on audit_logs (actor_id);

-- Platform-wide activity stream surfaced on the Owner dashboard.
create table activity_events (
  id          bigint generated always as identity primary key,
  company_id  uuid references companies(id) on delete cascade,
  actor_id    uuid references profiles(id) on delete set null,
  type        text not null,
  summary     text not null,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index on activity_events (created_at desc);

-- ============================================================================
-- 11. updated_at TRIGGERS
-- ============================================================================

do $$
declare
  t text;
begin
  foreach t in array array[
    'plans','companies','subscriptions','departments','shifts','profiles',
    'employee_profiles','devices','alerts','leave_requests','break_requests',
    'report_templates','reports','invoices','support_tickets','webhooks'
  ]
  loop
    execute format(
      'create trigger trg_%1$s_updated_at before update on %1$s
         for each row execute function set_updated_at();', t);
  end loop;
end$$;

-- ============================================================================
-- 12. ROW LEVEL SECURITY
--   Helper functions assume Supabase auth.uid(). They read the caller's
--   profile to derive role + company for tenant isolation.
-- ============================================================================

create or replace function current_role_name()
returns user_role
language sql stable
as $$ select role from profiles where id = auth.uid() $$;

create or replace function current_company_id()
returns uuid
language sql stable
as $$ select company_id from profiles where id = auth.uid() $$;

create or replace function is_owner()
returns boolean
language sql stable
as $$ select coalesce(current_role_name() = 'owner', false) $$;

-- Enable RLS on every tenant-scoped table.
do $$
declare
  t text;
begin
  foreach t in array array[
    'companies','subscriptions','departments','shifts','profiles',
    'employee_profiles','devices','monitoring_sessions','fatigue_readings',
    'alerts','alert_events','leave_requests','break_requests','reports',
    'invoices','support_tickets','ticket_messages','api_keys','webhooks',
    'notifications','invites','audit_logs','activity_events'
  ]
  loop
    execute format('alter table %I enable row level security;', t);
  end loop;
end$$;

-- Owners see everything; managers/employees are scoped to their company.
create policy companies_read on companies for select
  using (is_owner() or id = current_company_id());

create policy companies_write on companies for all
  using (is_owner()) with check (is_owner());

-- Generic per-company read policy for the common tables.
do $$
declare
  t text;
begin
  foreach t in array array[
    'subscriptions','departments','shifts','employee_profiles','devices',
    'monitoring_sessions','fatigue_readings','alerts','alert_events',
    'leave_requests','break_requests','reports','invoices','support_tickets',
    'api_keys','webhooks','invites','audit_logs','activity_events'
  ]
  loop
    execute format(
      'create policy %1$s_company_read on %1$s for select
         using (is_owner() or company_id = current_company_id());', t);
  end loop;
end$$;

-- Profiles: a user can read peers in their company; owners read all.
create policy profiles_read on profiles for select
  using (is_owner() or company_id = current_company_id() or id = auth.uid());

create policy profiles_self_update on profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- Notifications & preferences are private to the owning user.
create policy notifications_owner on notifications for select
  using (profile_id = auth.uid());

-- Employees manage their own break / leave requests; managers approve.
create policy break_requests_insert on break_requests for insert
  with check (employee_id = auth.uid() and company_id = current_company_id());

create policy leave_requests_insert on leave_requests for insert
  with check (employee_id = auth.uid() and company_id = current_company_id());

-- NOTE: Manager/owner write policies (approvals, device mgmt, escalations)
-- should be added per workflow, e.g.:
--   create policy alerts_manage on alerts for update
--     using (is_owner() or (current_role_name() = 'manager'
--            and company_id = current_company_id()));
