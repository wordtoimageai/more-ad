-- Add explicit deny-all RLS policies to rate_limits table
-- This documents the intentional design: rate_limits is only accessed via SECURITY DEFINER function
-- Regular users should never have direct access to this table

-- Deny all SELECT access for regular users
CREATE POLICY "No direct user access - managed by SECURITY DEFINER function" 
ON public.rate_limits 
FOR ALL 
USING (false)
WITH CHECK (false);

-- Add comment to document the design
COMMENT ON TABLE public.rate_limits IS 'Rate limiting data. No direct user access - managed exclusively by check_rate_limit SECURITY DEFINER function and service role.';