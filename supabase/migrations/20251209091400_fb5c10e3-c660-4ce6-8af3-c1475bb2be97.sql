-- Create table to track login attempts
CREATE TABLE public.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(email)
);

-- Enable RLS with DENY-ALL policies (access only via SECURITY DEFINER functions)
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Function to check if account is locked
CREATE OR REPLACE FUNCTION public.check_account_locked(p_email TEXT)
RETURNS TABLE(is_locked BOOLEAN, locked_until TIMESTAMP WITH TIME ZONE, attempts_remaining INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_max_attempts INTEGER := 5;
  v_lockout_minutes INTEGER := 15;
  v_attempt_count INTEGER;
  v_locked_until TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT la.attempt_count, la.locked_until INTO v_attempt_count, v_locked_until
  FROM public.login_attempts la
  WHERE la.email = lower(p_email);
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::TIMESTAMP WITH TIME ZONE, v_max_attempts;
    RETURN;
  END IF;
  
  -- Check if lock has expired
  IF v_locked_until IS NOT NULL AND v_locked_until > now() THEN
    RETURN QUERY SELECT true, v_locked_until, 0;
    RETURN;
  END IF;
  
  -- Lock expired or not locked, return remaining attempts
  IF v_locked_until IS NOT NULL AND v_locked_until <= now() THEN
    -- Reset the lock
    UPDATE public.login_attempts
    SET attempt_count = 0, locked_until = NULL, updated_at = now()
    WHERE email = lower(p_email);
    v_attempt_count := 0;
  END IF;
  
  RETURN QUERY SELECT false, NULL::TIMESTAMP WITH TIME ZONE, v_max_attempts - v_attempt_count;
END;
$$;

-- Function to record a failed login attempt
CREATE OR REPLACE FUNCTION public.record_failed_login(p_email TEXT)
RETURNS TABLE(is_now_locked BOOLEAN, locked_until TIMESTAMP WITH TIME ZONE, attempts_remaining INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_max_attempts INTEGER := 5;
  v_lockout_minutes INTEGER := 15;
  v_new_count INTEGER;
  v_locked_until TIMESTAMP WITH TIME ZONE;
BEGIN
  INSERT INTO public.login_attempts (email, attempt_count, last_attempt_at)
  VALUES (lower(p_email), 1, now())
  ON CONFLICT (email) DO UPDATE
  SET 
    attempt_count = CASE 
      WHEN login_attempts.locked_until IS NOT NULL AND login_attempts.locked_until <= now() THEN 1
      ELSE login_attempts.attempt_count + 1
    END,
    last_attempt_at = now(),
    locked_until = CASE 
      WHEN login_attempts.locked_until IS NOT NULL AND login_attempts.locked_until <= now() THEN NULL
      ELSE login_attempts.locked_until
    END,
    updated_at = now()
  RETURNING attempt_count, login_attempts.locked_until INTO v_new_count, v_locked_until;
  
  -- Check if we need to lock the account
  IF v_new_count >= v_max_attempts AND v_locked_until IS NULL THEN
    v_locked_until := now() + (v_lockout_minutes || ' minutes')::INTERVAL;
    UPDATE public.login_attempts
    SET locked_until = v_locked_until, updated_at = now()
    WHERE email = lower(p_email);
    
    RETURN QUERY SELECT true, v_locked_until, 0;
    RETURN;
  END IF;
  
  RETURN QUERY SELECT false, v_locked_until, v_max_attempts - v_new_count;
END;
$$;

-- Function to reset login attempts on successful login
CREATE OR REPLACE FUNCTION public.reset_login_attempts(p_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.login_attempts WHERE email = lower(p_email);
END;
$$;

-- Add trigger for updated_at
CREATE TRIGGER update_login_attempts_updated_at
BEFORE UPDATE ON public.login_attempts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();