-- ============================================================================
-- SentinelAI — account role contact details
--
-- Owners/managers invite new admins & users from the app. The invite carries
-- the person's contact details (phone, avatar) so that when they first sign in
-- via OTP, verify-otp can hydrate their profile with everything the inviter
-- entered — not just their role and company.
-- ============================================================================

alter table account_roles
  add column if not exists phone      text,
  add column if not exists avatar_url text;
