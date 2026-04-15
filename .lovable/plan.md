

# Audit Report & Implementation Plan

## Bugs Found

### BUG 1: Missing `handle_new_user` trigger (CRITICAL — already fixed)
The trigger `on_auth_user_created` exists and calls `handle_new_user()`. No action needed.

### BUG 2: Password min-length mismatch
Dashboard password change validates `< 6` chars (line 146), but AuthPage and ResetPasswordPage enforce `min(8)` + strength check. Dashboard should match.

### BUG 3: Dashboard `display_name` update uses `as any` cast
Line 79 in DashboardPage casts the update payload with `as any`, likely because `display_name` wasn't in the generated types at the time. Should be clean now — remove the cast.

### BUG 4: `console.error` in production code
`AppPage.tsx` line 53 logs errors to console. Memory rule says "no console logs." Also `generate-ad` edge function has multiple `console.error` calls (acceptable for server-side, but client should not leak).

### BUG 5: Blog posts are non-functional links
Blog cards have `cursor-pointer` and "Read more" text but no actual links — they go nowhere. Misleading UX.

### BUG 6: Unsplash fallback images in generate-ad
Lines 380-383 use hardcoded Unsplash URLs as image fallbacks. These can break (rate-limited, blocked). Should use a local placeholder.

---

## Security Issues

### SEC 1: 4 SECURITY DEFINER functions missing `search_path` (WARN)
Functions `read_email_batch`, `delete_email`, `move_to_dlq`, `enqueue_email` are `SECURITY DEFINER` without `SET search_path`. This is a search-path hijack risk.

### SEC 2: No `image` URL input validation on client
Image URL input accepts any string. A malicious URL could be passed to Replicate. The server validates URL type but not for `image` type specifically — only `url` type gets `isValidUrl()` check.

---

## Feature Gaps

### GAP 1: No display name shown in app header
Display name was added to profiles but is never shown anywhere except the dashboard edit field. The app header (AppPage) just shows `user?.email`.

### GAP 2: No ad history accessible from dashboard
Dashboard shows stats but no way to view/manage individual ads. Must go to AppPage and open history sidebar.

### GAP 3: Mobile layout issue on AppPage
Grid uses `grid-cols-1 sm:grid-cols-2` which forces side-by-side on small tablets (640px+). Input and output panels are too cramped. Should use `md:grid-cols-2` breakpoint.

### GAP 4: No loading state on auth page for OAuth redirect
After clicking Google sign-in, the page just sits there. No visual feedback that OAuth is in progress.

---

## Implementation Plan

### Step 1: Fix password validation on Dashboard
Update `handleChangePassword` to require min 8 chars and use `isPasswordStrong()` check, matching the auth/reset pages. Add `PasswordStrengthIndicator` component.

### Step 2: Fix search_path on 4 DB functions
Run a migration to `ALTER FUNCTION` for `read_email_batch`, `delete_email`, `move_to_dlq`, `enqueue_email` — add `SET search_path = public`.

### Step 3: Show display name in AppPage header
Fetch `display_name` from profiles and show "Hi, {name}" or fall back to email in the header.

### Step 4: Fix AppPage mobile breakpoint
Change `grid-cols-1 sm:grid-cols-2` to `grid-cols-1 md:grid-cols-2` for the main content grid.

### Step 5: Replace Unsplash fallbacks with local placeholder
Use `/placeholder.svg` (already in `public/`) instead of Unsplash URLs in the generate-ad edge function.

### Step 6: Fix blog page — remove fake links or add "Coming Soon"
Remove `cursor-pointer` and "Read more" from blog cards. Add a "Coming Soon" badge to each post.

### Step 7: Add image URL validation
In `generate-ad` edge function, validate `image` input type with `isValidUrl()` the same way `url` type is validated.

### Step 8: Remove client-side console.error
Replace `console.error` in AppPage with silent error handling (the toast already shows the error).

### Step 9: Remove `as any` cast in DashboardPage
Clean up the type cast on line 79.

---

## Technical Details

**Files modified:**
- `src/pages/DashboardPage.tsx` — password validation fix, display name cast cleanup, add PasswordStrengthIndicator
- `src/pages/AppPage.tsx` — grid breakpoint fix, display name greeting, remove console.error
- `src/pages/BlogPage.tsx` — remove fake interactive elements
- `supabase/functions/generate-ad/index.ts` — image URL validation, replace Unsplash fallbacks
- New migration SQL — fix search_path on 4 functions

**No new dependencies required.**

