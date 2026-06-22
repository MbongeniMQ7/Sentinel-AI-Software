-- ============================================================================
-- SentinelAI — Email OTP (one-time passcode) storage
--
-- Backs the `send-otp` / `verify-otp` edge functions. Codes are never stored
-- in plaintext: only a SHA-256 hash is persisted. Rows are read/written
-- exclusively by trusted edge functions using the service_role key, so RLS is
-- enabled with NO policies (anon / authenticated clients get zero access).
-- ============================================================================

create table if not exists otp_codes (
  id           uuid primary key default gen_random_uuid(),
  email        citext      not null,
  code_hash    text        not null,            -- sha-256 hex of the 6-digit code
  role         user_role,                       -- requested workspace role (optional)
  expires_at   timestamptz not null,
  consumed_at  timestamptz,
  attempts     smallint    not null default 0,  -- failed verify attempts
  ip_address   inet,
  created_at   timestamptz not null default now()
);

create index if not exists otp_codes_email_created_idx
  on otp_codes (email, created_at desc);

create index if not exists otp_codes_expires_idx
  on otp_codes (expires_at);

alter table otp_codes enable row level security;
-- Intentionally no policies: only the service_role (edge functions) may access.

-- Housekeeping helper — purge expired / consumed codes. Safe to call from a
-- scheduled job (pg_cron) or manually.
create or replace function purge_expired_otp_codes()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted integer;
begin
  delete from otp_codes
  where expires_at < now() - interval '1 hour'
     or consumed_at is not null;
  get diagnostics deleted = row_count;
  return deleted;
end;
$$;
