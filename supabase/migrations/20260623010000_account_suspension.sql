-- ============================================================================
-- SentinelAI — account suspension flag
--
-- Adds a persistent `is_active` flag to account_roles so an owner can suspend
-- a user. The OTP edge functions (send-otp / verify-otp) read this flag to
-- block sign-in for suspended accounts, and verify-otp mirrors it onto the
-- profile so RLS / the app reflect the suspension on next login.
-- ============================================================================

alter table account_roles
  add column if not exists is_active boolean not null default true;
