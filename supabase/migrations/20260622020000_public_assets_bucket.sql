-- ============================================================================
-- SentinelAI — public asset bucket
--
-- Hosts brand assets (e.g. the logo) used in transactional emails sent from
-- edge functions. Public read so email clients can load the image.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true)
on conflict (id) do update set public = excluded.public;
