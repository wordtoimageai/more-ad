-- Create rate_limits table to track API usage per user
CREATE TABLE public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Enable Row Level Security
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to manage rate limits (edge functions use service role)
-- No user-facing policies needed as this is managed server-side only

-- Create index for faster lookups
CREATE INDEX idx_rate_limits_user_endpoint ON public.rate_limits(user_id, endpoint);
CREATE INDEX idx_rate_limits_window_start ON public.rate_limits(window_start);

-- Create function to check and update rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id UUID,
  p_endpoint TEXT,
  p_max_requests INTEGER DEFAULT 50,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS TABLE(allowed BOOLEAN, remaining INTEGER, reset_at TIMESTAMP WITH TIME ZONE) AS $$
DECLARE
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_request_count INTEGER;
  v_reset_at TIMESTAMP WITH TIME ZONE;
BEGIN
  v_window_start := now() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Try to get existing rate limit record
  SELECT rl.request_count, rl.window_start INTO v_request_count, v_reset_at
  FROM public.rate_limits rl
  WHERE rl.user_id = p_user_id AND rl.endpoint = p_endpoint;
  
  IF NOT FOUND THEN
    -- First request, create new record
    INSERT INTO public.rate_limits (user_id, endpoint, request_count, window_start)
    VALUES (p_user_id, p_endpoint, 1, now());
    
    RETURN QUERY SELECT true, p_max_requests - 1, now() + (p_window_minutes || ' minutes')::INTERVAL;
    RETURN;
  END IF;
  
  -- Check if window has expired
  IF v_reset_at < v_window_start THEN
    -- Reset the window
    UPDATE public.rate_limits
    SET request_count = 1, window_start = now(), updated_at = now()
    WHERE user_id = p_user_id AND endpoint = p_endpoint;
    
    RETURN QUERY SELECT true, p_max_requests - 1, now() + (p_window_minutes || ' minutes')::INTERVAL;
    RETURN;
  END IF;
  
  -- Check if rate limit exceeded
  IF v_request_count >= p_max_requests THEN
    RETURN QUERY SELECT false, 0, v_reset_at + (p_window_minutes || ' minutes')::INTERVAL;
    RETURN;
  END IF;
  
  -- Increment counter
  UPDATE public.rate_limits
  SET request_count = request_count + 1, updated_at = now()
  WHERE user_id = p_user_id AND endpoint = p_endpoint
  RETURNING request_count INTO v_request_count;
  
  RETURN QUERY SELECT true, p_max_requests - v_request_count, v_reset_at + (p_window_minutes || ' minutes')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;