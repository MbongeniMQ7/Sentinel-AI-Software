-- ============================================================================
-- SentinelAI — Reference / seed data
-- Idempotent inserts for lookup tables that the app expects to exist.
-- Run after the initial schema migration.
-- ============================================================================

-- Subscription plans -----------------------------------------------------------
insert into plans (tier, name, price_per_seat_cents, description, features) values
  ('starter',    'Starter',    1200, 'Camera-only fatigue monitoring for small teams.',
     '["Camera monitoring","Basic alerts","Email support","Up to 50 seats"]'),
  ('growth',     'Growth',      900, 'Hybrid monitoring with analytics and approvals.',
     '["Hybrid monitoring","Advanced analytics","Approvals workflow","Priority support"]'),
  ('enterprise', 'Enterprise',  700, 'Full platform with SSO, API access and SLAs.',
     '["Unlimited seats","SSO & SCIM","API & webhooks","Dedicated CSM","99.9% SLA"]')
on conflict (tier) do nothing;

-- Report templates (per role) --------------------------------------------------
insert into report_templates (scope, title, description) values
  ('employee', 'My Fatigue Summary',     'Personal fatigue, focus and heart-rate trends.'),
  ('employee', 'Break & Leave History',  'Logged breaks and approved leave over time.'),
  ('manager',  'Team Wellness Report',   'Department fatigue, alerts and risk distribution.'),
  ('manager',  'Shift Performance',      'Per-shift fatigue and alert breakdown.'),
  ('manager',  'Compliance & PPE',       'Helmet/PPE compliance and incident log.'),
  ('owner',    'Platform Overview',      'Revenue, active companies and fleet health.'),
  ('owner',    'Revenue & Churn',        'MRR, ARR and churn across all tenants.'),
  ('owner',    'Fleet Utilization',      'IoT device uptime and assignment coverage.')
on conflict do nothing;

-- FAQs (Employee support center) ----------------------------------------------
insert into faqs (question, answer, sort_order) values
  ('How does SentinelAI detect fatigue?',
   'SentinelAI fuses computer-vision signals (eye-closure, head pose, micro-expressions) with optional wearable biometrics (heart-rate variability) to compute a real-time fatigue index, processed on-edge for privacy.', 1),
  ('Is my camera always recording?',
   'No. The camera processes frames on-device in real time and only stores anonymized metrics. Raw video is never uploaded unless you explicitly enable incident clips.', 2),
  ('How do I request a break?',
   'Open Break Management, tap Request Break, choose a reason and duration. Your manager is notified instantly and you will see the status update live.', 3),
  ('What happens when I get a high-fatigue alert?',
   'You receive an in-app prompt recommending a rest period. Critical alerts are also surfaced to your manager for support.', 4),
  ('Can I use SentinelAI without a wearable?',
   'Yes. Camera-only monitoring works standalone. Wearables add heart-rate context for higher accuracy in hybrid mode.', 5),
  ('How is my data protected?',
   'All biometric processing is encrypted in transit and at rest. Personally identifiable video never leaves the edge device by default.', 6)
on conflict do nothing;
