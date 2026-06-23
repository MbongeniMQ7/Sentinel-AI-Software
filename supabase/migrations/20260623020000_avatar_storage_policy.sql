-- ============================================================================
-- SentinelAI — avatar upload policies for the public-assets bucket
--
-- The bucket is public-read (created in 20260622020000). These policies let
-- authenticated users upload / replace their own images (e.g. profile avatars)
-- into it. Reads stay public so emails and the app can render the images.
-- ============================================================================

-- Allow any authenticated user to upload into the public-assets bucket.
create policy "public_assets_authenticated_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'public-assets');

-- Allow authenticated users to replace objects in the bucket.
create policy "public_assets_authenticated_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'public-assets')
  with check (bucket_id = 'public-assets');
