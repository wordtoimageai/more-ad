-- Block ALL direct access to login_attempts - table is managed by SECURITY DEFINER functions only
CREATE POLICY "No direct user access - managed by SECURITY DEFINER function" 
ON public.login_attempts
FOR ALL
USING (false)
WITH CHECK (false);