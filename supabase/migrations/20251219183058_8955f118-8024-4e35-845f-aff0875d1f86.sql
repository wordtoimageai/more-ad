-- Create a unique index on share_token to prevent collisions
CREATE UNIQUE INDEX IF NOT EXISTS idx_ad_history_share_token ON public.ad_history(share_token) WHERE share_token IS NOT NULL;

-- Create a SECURITY DEFINER function to generate share tokens server-side
CREATE OR REPLACE FUNCTION public.generate_share_token(p_ad_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token TEXT;
  v_max_attempts INTEGER := 10;
  v_attempt INTEGER := 0;
  v_owner_id UUID;
BEGIN
  -- Verify user owns the ad
  SELECT user_id INTO v_owner_id FROM ad_history WHERE id = p_ad_id;
  
  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Ad not found';
  END IF;
  
  IF v_owner_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  -- Check if token already exists
  SELECT share_token INTO v_token FROM ad_history WHERE id = p_ad_id;
  IF v_token IS NOT NULL THEN
    RETURN v_token;
  END IF;
  
  -- Generate unique token with retry logic
  LOOP
    v_attempt := v_attempt + 1;
    -- Use gen_random_bytes for high entropy (16 bytes = 128 bits, encoded to ~22 chars)
    v_token := encode(gen_random_bytes(12), 'base64');
    -- Remove non-URL-safe characters
    v_token := replace(replace(v_token, '+', '-'), '/', '_');
    
    -- Try to update, exit if successful (no collision)
    BEGIN
      UPDATE ad_history SET share_token = v_token WHERE id = p_ad_id AND user_id = auth.uid();
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      IF v_attempt >= v_max_attempts THEN
        RAISE EXCEPTION 'Failed to generate unique token';
      END IF;
    END;
  END LOOP;
  
  RETURN v_token;
END;
$$;