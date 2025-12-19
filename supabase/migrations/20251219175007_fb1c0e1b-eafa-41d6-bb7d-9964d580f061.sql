-- Create a secure function to get shared ad data without exposing user_id
CREATE OR REPLACE FUNCTION public.get_shared_ad(p_share_token text)
RETURNS TABLE (
  id uuid,
  headline text,
  body_short text,
  body_long text,
  hashtags text[],
  cta text,
  target_audience text,
  images text[],
  style text,
  created_at timestamptz,
  input_type text,
  input_value text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    headline,
    body_short,
    body_long,
    hashtags,
    cta,
    target_audience,
    images,
    style,
    created_at,
    input_type,
    input_value
  FROM public.ad_history
  WHERE share_token = p_share_token
  LIMIT 1;
$$;