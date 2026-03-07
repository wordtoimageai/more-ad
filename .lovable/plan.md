

# Implementation Plan — Remaining Audit Items (Steps 3–8)

Steps 1 (lockout RPC revocation) and 2 (client-side lockout removal) are already complete.

---

## Step 3: Remove `console.error` from AdHistory
**File:** `src/components/app/AdHistory.tsx` line 31
Remove `console.error("Error loading history:", error);` — the toast already handles user feedback.

## Step 4: Fix Navbar "Log In" buttons
**File:** `src/components/landing/Navbar.tsx`
Wrap both desktop (line 47) and mobile (line 86) "Log In" buttons with `<Link to="/auth">`.

## Step 5: Remove dead "Watch Demo" button
**File:** `src/components/landing/Hero.tsx` line 74-76
Remove the "Watch Demo" button since there's no demo to link to. Keeps the hero clean with a single CTA.

## Step 6: Add confirmation dialogs for destructive actions
**File:** `src/components/app/AdHistory.tsx`
- Import `AlertDialog` components from shadcn
- Wrap "Clear All History" button with an AlertDialog confirmation
- Wrap individual delete buttons with an AlertDialog confirmation

## Step 7: Make delete buttons visible on mobile
**File:** `src/components/app/AdHistory.tsx` line 131
Change `opacity-0 group-hover:opacity-100` to `sm:opacity-0 sm:group-hover:opacity-100` so buttons are always visible on touch devices.

## Step 8: Fix Share page CTA links
**File:** `src/pages/SharePage.tsx`
Change both `<Link to="/app">` instances (lines 90 and 199) to `<Link to="/auth">` so unauthenticated users land on the auth page with proper context.

## Bonus: Remove misleading `exportToDocx`
**File:** `src/lib/export.ts`
Remove the `exportToDocx` function — it's unused and misleadingly named.

---

**Total changes:** 5 files edited, no migrations needed.

