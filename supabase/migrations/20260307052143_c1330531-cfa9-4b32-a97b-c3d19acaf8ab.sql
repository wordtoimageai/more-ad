
-- Revoke public/anon access to lockout functions to prevent DoS and bypass attacks
REVOKE EXECUTE ON FUNCTION public.record_failed_login(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.reset_login_attempts(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.check_account_locked(text) FROM PUBLIC, anon;
