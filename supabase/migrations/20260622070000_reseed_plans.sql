-- ============================================================================
-- SentinelAI — re-seed subscription plans
--
-- The plans reference table was found empty on the remote project, which
-- breaks company creation (the plan lookup returns no row). Re-insert the
-- three canonical tiers idempotently so the app always has them available.
-- ============================================================================

insert into plans (tier, name, price_per_seat_cents, description, features) values
  ('starter',    'Starter',    1200, 'Camera-only fatigue monitoring for small teams.',
     '["Camera monitoring","Basic alerts","Email support","Up to 50 seats"]'),
  ('growth',     'Growth',      900, 'Hybrid monitoring with analytics and approvals.',
     '["Hybrid monitoring","Advanced analytics","Approvals workflow","Priority support"]'),
  ('enterprise', 'Enterprise',  700, 'Full platform with SSO, API access and SLAs.',
     '["Unlimited seats","SSO & SCIM","API & webhooks","Dedicated CSM","99.9% SLA"]')
on conflict (tier) do nothing;
