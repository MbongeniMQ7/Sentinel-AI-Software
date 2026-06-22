-- ============================================================================
-- SentinelAI — reset to real data
--
-- Wipes ALL demo / seeded tenant data and every user EXCEPT the real platform
-- owner (qwabembongeni4@gmail.com) so the workspace can be exercised with live
-- data. Reference/config tables (plans, report_templates, faqs) are preserved
-- because the app depends on them.
--
-- Deletes run leaf-first to respect foreign keys. Safe to run on an already
-- clean database (every statement is an unconditional or filtered delete).
-- ============================================================================

do $reset$
declare
  v_owner_email citext := 'qwabembongeni4@gmail.com';
begin
  -- ---- Telemetry & alerts -------------------------------------------------
  delete from alert_events;
  delete from alerts;
  delete from fatigue_readings;
  delete from monitoring_sessions;

  -- ---- Requests & tickets -------------------------------------------------
  delete from break_requests;
  delete from leave_requests;
  delete from ticket_messages;
  delete from support_tickets;

  -- ---- Billing & reporting artifacts --------------------------------------
  delete from reports;
  delete from invoices;

  -- ---- Notifications & integrations ---------------------------------------
  delete from notifications;
  delete from notification_preferences;
  delete from api_keys;
  delete from webhooks;

  -- ---- Invites, audit & activity ------------------------------------------
  delete from invites;
  delete from audit_logs;
  delete from activity_events;

  -- ---- Fleet & workforce --------------------------------------------------
  delete from devices;
  delete from employee_profiles;
  delete from subscriptions;

  -- ---- Profiles: keep only the real owner ---------------------------------
  update profiles set company_id = null where email = v_owner_email;
  delete from profiles where email <> v_owner_email;

  -- ---- Org structure & companies ------------------------------------------
  delete from departments;
  delete from shifts;
  delete from companies;

  -- ---- Role mapping: keep only the real owner -----------------------------
  delete from account_roles where email <> v_owner_email;
  update account_roles set company_id = null where email = v_owner_email;

  -- ---- Clear any test OTP codes -------------------------------------------
  delete from otp_codes;

  -- ---- Remove every auth user except the owner ----------------------------
  delete from auth.users where lower(email) <> lower(v_owner_email::text);
end
$reset$;
