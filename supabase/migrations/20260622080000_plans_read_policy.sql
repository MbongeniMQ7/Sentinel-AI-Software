-- ============================================================================
-- SentinelAI — allow reading subscription plans
--
-- `plans` is reference/pricing data the app needs when creating companies and
-- showing billing. RLS was active on the table without a SELECT policy, so the
-- authenticated client received zero rows (breaking company creation). Add a
-- permissive read policy — pricing tiers are non-sensitive, public catalog data.
-- ============================================================================

alter table plans enable row level security;

drop policy if exists plans_read on plans;
create policy plans_read on plans for select
  using (true);
