-- Remove the "Anyone can view shared ads" RLS policy since shared ads 
-- are accessed via the get_shared_ad SECURITY DEFINER function which 
-- already excludes user_id from the result set.
DROP POLICY IF EXISTS "Anyone can view shared ads" ON public.ad_history;