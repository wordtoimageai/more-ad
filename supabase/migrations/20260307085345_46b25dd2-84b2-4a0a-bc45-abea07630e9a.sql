
-- Remove unused account lockout functions and table
DROP FUNCTION IF EXISTS public.check_account_locked(text);
DROP FUNCTION IF EXISTS public.record_failed_login(text);
DROP FUNCTION IF EXISTS public.reset_login_attempts(text);
DROP TABLE IF EXISTS public.login_attempts;
