

# Pre-Deployment Audit Report: More.ad

## EXECUTIVE SUMMARY

- **Engineering Health Score:** 74/100
- **Production Readiness:** Needs Work
- **One-Paragraph Assessment:** More.ad is a well-structured, security-conscious SPA with solid fundamentals -- strong RLS policies, server-side input validation, rate limiting, and XSS protections. The main gaps are: no timeouts on external API calls in edge functions (risk of hung requests), missing `handle_new_user` trigger (profiles table never populated), dead code (`storage.ts`, `NavLink.tsx`), no error boundary, and several SEO issues (stale sitemap, wrong canonical domain, dead footer links). None are stop-ship security vulnerabilities, but several are high-priority for production reliability.

---

## Top 10 Critical Risks

| # | Risk | Severity | File | Impact |
|---|------|----------|------|--------|
| 1 | No timeout on AI gateway fetch in `generate-ad` | High | `supabase/functions/generate-ad/index.ts:208` | Edge function can hang indefinitely if AI gateway is slow |
| 2 | Missing `handle_new_user` trigger | High | DB triggers (empty) | Profiles table never gets populated on signup |
| 3 | No React Error Boundary | High | `src/App.tsx` | Any unhandled error crashes the entire app with a white screen |
| 4 | RLS policies use RESTRICTIVE (`Permissive: No`) for ad_history | Medium | DB RLS | All policies must pass simultaneously; if any future permissive policy is added, restrictive ones still block. Currently functional but fragile. |
| 5 | Sitemap uses `more.ad` domain, published at `more-ad.lovable.app` | Medium | `public/sitemap.xml` | SEO mismatch -- search engines index wrong URLs |
| 6 | Dead code: `storage.ts` localStorage module still imported | Medium | `src/lib/storage.ts`, `src/hooks/useAuth.ts` | Confusing dual storage pattern; localStorage ads never used |
| 7 | No `font-display: swap` on Google Fonts import | Medium | `src/index.css:1` | FOIT (flash of invisible text) during font load |
| 8 | Footer has 16+ dead `href="#"` links | Medium | `src/components/landing/Footer.tsx` | Poor UX and SEO (crawlers follow dead links) |
| 9 | Copyright year hardcoded to 2024 | Low | `src/components/landing/Footer.tsx:59` | Outdated branding |
| 10 | `console.error` in production NotFound page | Low | `src/pages/NotFound.tsx:8` | Information leakage (minor) |

---

## DETAILED FINDINGS BY SECTION

### Section 1: Repository Structure & Architecture

**Total Issues: 3** -- Critical: 0 | High: 0 | Medium: 2 | Low: 1

**Issue 1.1: Dead code -- `storage.ts` and `NavLink.tsx` unused**
- **Severity:** Medium
- **Location:** `src/lib/storage.ts` (entire file), `src/components/NavLink.tsx` (entire file)
- **Evidence:** `storage.ts` provides localStorage-based ad history. The app uses `cloudStorage.ts` for all CRUD. `storage.ts` is only imported in `useAuth.ts` to call `clearHistory()` on sign-out (clearing localStorage that's never written to). `NavLink.tsx` is not imported anywhere.
- **Impact:** Dead code increases maintenance burden and confusion.
- **Fix:** Remove `storage.ts` and `NavLink.tsx`. Replace the `clearHistory()` call in `useAuth.ts` with `localStorage.removeItem("moread_history")` or remove entirely.

**Issue 1.2: No code splitting / lazy loading for routes**
- **Severity:** Medium
- **Location:** `src/App.tsx:6-11`
- **Evidence:** All page components are statically imported. The landing page loads `AppPage`, `AuthPage`, `SharePage`, etc. even when only the homepage is visited.
- **Impact:** Larger initial bundle size; slower first paint.
- **Fix:** Use `React.lazy()` + `Suspense` for route-level code splitting.

**Issue 1.3: Architecture is well-organized**
- **Severity:** Low (positive finding)
- **Evidence:** Clean separation: `pages/` for routes, `components/app/` and `components/landing/` for domain-specific UI, `lib/` for business logic, `hooks/` for reusable state, `types/` for TypeScript interfaces. Edge functions are properly isolated.

---

### Section 2: Performance Optimization

**Total Issues: 4** -- Critical: 0 | High: 0 | Medium: 3 | Low: 1

**Issue 2.1: No `font-display: swap` on Google Fonts**
- **Severity:** Medium
- **Location:** `src/index.css:1`
- **Evidence:**
  ```css
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  ```
  The URL does include `display=swap` in the query parameter, but loading fonts via `@import` in CSS is render-blocking.
- **Impact:** Render-blocking CSS import delays first paint.
- **Fix:** Move the font `<link>` to `index.html` `<head>` with `rel="preload"` or use `<link rel="preconnect">` + `<link rel="stylesheet">` pattern.

**Issue 2.2: No lazy loading on images**
- **Severity:** Medium
- **Location:** `src/components/app/AdOutput.tsx:239-242`, `src/pages/SharePage.tsx:217-220`
- **Evidence:**
  ```tsx
  <img src={image} alt={`Creative ${index + 1}`} className="w-full h-full object-cover..." />
  ```
  No `loading="lazy"` attribute.
- **Impact:** All images load eagerly even if below the fold.
- **Fix:** Add `loading="lazy"` to all `<img>` tags.

**Issue 2.3: Large dependency -- framer-motion used everywhere**
- **Severity:** Medium
- **Location:** Nearly every component imports `framer-motion`
- **Evidence:** `framer-motion` is ~30KB+ gzipped. Used for simple fade/slide animations on every landing section and app page.
- **Impact:** Bundle bloat for animations achievable with CSS transitions.
- **Fix:** Consider CSS animations for simple effects; keep framer-motion only where complex orchestration is needed. Or ensure tree-shaking with `import { motion } from "framer-motion"` (already done).

**Issue 2.4: No pagination on ad history query**
- **Severity:** Low
- **Location:** `src/lib/cloudStorage.ts:39-43`
- **Evidence:**
  ```ts
  const { data, error } = await supabase.from("ad_history").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  ```
  No `.limit()` -- defaults to 1000 rows.
- **Impact:** For power users with many ads, this could return large payloads.
- **Fix:** Add `.limit(50)` or implement pagination.

---

### Section 3: Security Hardening

**Total Issues: 5** -- Critical: 0 | High: 2 | Medium: 2 | Low: 1

**Issue 3.1: No timeout/AbortController on AI gateway fetch**
- **Severity:** High
- **Location:** `supabase/functions/generate-ad/index.ts:208-222`
- **Evidence:**
  ```ts
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { ... },
    body: JSON.stringify({ ... }),
  });
  ```
  No `AbortController`, no timeout. If the AI gateway hangs, the edge function hangs indefinitely.
- **Impact:** Resource exhaustion; user gets no response; potential billing implications.
- **Fix:** Add AbortController with 30s timeout:
  ```ts
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  const response = await fetch(url, { ...options, signal: controller.signal });
  clearTimeout(timeout);
  ```

**Issue 3.2: Missing `handle_new_user` trigger**
- **Severity:** High
- **Location:** Database triggers (empty per schema)
- **Evidence:** The `handle_new_user()` function exists as a DB function but there are NO triggers attached to it. The function inserts into `profiles` on new user creation, but it never fires.
- **Impact:** The `profiles` table is never populated. If any feature relies on profiles data, it silently fails.
- **Fix:** Create migration:
  ```sql
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  ```

**Issue 3.3: `og-share` edge function has no rate limiting**
- **Severity:** Medium
- **Location:** `supabase/functions/og-share/index.ts`
- **Evidence:** The function accepts unauthenticated requests (no JWT check) and queries the database with no rate limiting.
- **Impact:** Could be abused for enumeration or DoS on the database.
- **Fix:** Add basic rate limiting by IP or request throttling. Since it's meant for social crawlers, consider caching responses.

**Issue 3.4: `og-share` config missing from `config.toml`**
- **Severity:** Medium
- **Location:** `supabase/config.toml`
- **Evidence:**
  ```toml
  [functions.generate-ad]
  verify_jwt = true
  ```
  No `[functions.og-share]` entry. This means `og-share` defaults to `verify_jwt = true`, but it needs to be accessible without auth for social media crawlers.
- **Impact:** Social media crawlers cannot fetch OG metadata because they don't have a JWT. The share preview feature is broken for unauthenticated visitors.
- **Fix:** Add to config.toml:
  ```toml
  [functions.og-share]
  verify_jwt = false
  ```

**Issue 3.5: `console.error` in NotFound page**
- **Severity:** Low
- **Location:** `src/pages/NotFound.tsx:8`
- **Evidence:**
  ```ts
  console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  ```
- **Impact:** Minor information leakage in production console.
- **Fix:** Remove or gate behind `import.meta.env.DEV`.

---

### Section 4: SEO Optimization

**Total Issues: 5** -- Critical: 0 | High: 1 | Medium: 3 | Low: 1

**Issue 4.1: Sitemap and canonical URL domain mismatch**
- **Severity:** High
- **Location:** `public/sitemap.xml`, `index.html:44`
- **Evidence:** Sitemap uses `https://more.ad/` and canonical is `<link rel="canonical" href="https://more.ad" />`. The app is published at `https://more-ad.lovable.app`.
- **Impact:** Search engines see conflicting signals. If `more.ad` domain isn't connected, all SEO signals are wasted.
- **Fix:** Either connect the `more.ad` custom domain, or update sitemap and canonical to use `more-ad.lovable.app`.

**Issue 4.2: Sitemap `lastmod` dates are stale (2025-12-10)**
- **Severity:** Medium
- **Location:** `public/sitemap.xml`
- **Impact:** Search engines may deprioritize crawling.
- **Fix:** Update to current date.

**Issue 4.3: SPA pages lack unique meta tags**
- **Severity:** Medium
- **Location:** `src/pages/AuthPage.tsx`, `src/pages/AppPage.tsx`, `src/pages/NotFound.tsx`
- **Evidence:** Only `index.html` sets meta tags. `/auth`, `/app`, `/reset-password` all share the same title and description since there's no per-route meta tag management.
- **Impact:** All pages show "More.ad - AI-Powered Ad Generation" in search results.
- **Fix:** Use `document.title` and meta tag updates in each page component, or add a `useDocumentTitle` hook.

**Issue 4.4: `/app` is in sitemap but requires auth**
- **Severity:** Medium
- **Location:** `public/sitemap.xml:14-19`
- **Evidence:** `/app` redirects to `/auth` for unauthenticated users. Including it in the sitemap means crawlers hit a redirect.
- **Impact:** Wasted crawl budget; poor indexation signal.
- **Fix:** Remove `/app` and `/reset-password` from sitemap.

**Issue 4.5: Footer copyright year is 2024**
- **Severity:** Low
- **Location:** `src/components/landing/Footer.tsx:59`
- **Fix:** Use `new Date().getFullYear()`.

---

### Section 5: Code Quality & Maintainability

**Total Issues: 4** -- Critical: 0 | High: 1 | Medium: 2 | Low: 1

**Issue 5.1: No React Error Boundary**
- **Severity:** High
- **Location:** `src/App.tsx`
- **Evidence:** No `ErrorBoundary` component wraps the app or any route. An unhandled error in any component crashes the entire app to a white screen.
- **Impact:** Complete app crash on any runtime error.
- **Fix:** Add an ErrorBoundary component wrapping routes in `App.tsx`.

**Issue 5.2: ResetPasswordPage `onAuthStateChange` subscription leak**
- **Severity:** Medium
- **Location:** `src/pages/ResetPasswordPage.tsx:27`
- **Evidence:**
  ```ts
  supabase.auth.onAuthStateChange((event, session) => { ... });
  ```
  The subscription is never unsubscribed in the cleanup function.
- **Impact:** Memory leak on unmount.
- **Fix:** Store the subscription and return `() => subscription.unsubscribe()` from the useEffect.

**Issue 5.3: Duplicate `OutputSection` component**
- **Severity:** Medium
- **Location:** `src/components/app/AdOutput.tsx:252-290` and `src/pages/SharePage.tsx:251-259`
- **Evidence:** Two nearly identical `OutputSection` components defined in different files.
- **Impact:** DRY violation; maintenance burden.
- **Fix:** Extract to a shared component.

**Issue 5.4: No tests**
- **Severity:** Low
- **Location:** Project-wide
- **Evidence:** No test files found in the project.
- **Impact:** No automated verification of critical paths (auth, ad generation, sharing).
- **Fix:** Add tests for critical business logic (ad generation, auth flow, share token generation).

---

### Section 6: User Experience & Accessibility

**Total Issues: 3** -- Critical: 0 | High: 0 | Medium: 2 | Low: 1

**Issue 6.1: Footer links are all dead (`href="#"`)**
- **Severity:** Medium
- **Location:** `src/components/landing/Footer.tsx:21-52`
- **Evidence:** All 16 footer links (Product, Company, Resources, Legal) and all 4 social media icons link to `#`.
- **Impact:** Poor UX; broken navigation; negative SEO signal.
- **Fix:** Either link to real pages, remove non-functional links, or add `rel="nofollow"`.

**Issue 6.2: Mobile menu button lacks ARIA label**
- **Severity:** Medium
- **Location:** `src/components/landing/Navbar.tsx:60-64`
- **Evidence:**
  ```tsx
  <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
    {isOpen ? <X /> : <Menu />}
  </button>
  ```
  No `aria-label`, no `aria-expanded`.
- **Impact:** Screen readers cannot identify the button's purpose.
- **Fix:** Add `aria-label="Toggle menu"` and `aria-expanded={isOpen}`.

**Issue 6.3: Copy buttons in AdOutput are hidden on mobile (opacity-0 group-hover)**
- **Severity:** Low
- **Location:** `src/components/app/AdOutput.tsx:278`
- **Evidence:** `className="opacity-0 group-hover:opacity-100"` -- mobile devices don't have hover.
- **Impact:** Copy buttons per-section are invisible on touch devices.
- **Fix:** Make buttons always visible on mobile: `opacity-100 sm:opacity-0 sm:group-hover:opacity-100`.

---

### Section 7: Business Logic & Functionality

**Total Issues: 2** -- Critical: 0 | High: 1 | Medium: 1 | Low: 0

**Issue 7.1: og-share likely broken due to JWT requirement**
- **Severity:** High
- **Location:** `supabase/config.toml` + `supabase/functions/og-share/index.ts`
- **Evidence:** `config.toml` only has `[functions.generate-ad]` with `verify_jwt = true`. The `og-share` function is not listed, so it defaults to `verify_jwt = true`. Social media crawlers (Facebook, Twitter) cannot provide a JWT.
- **Impact:** Share previews on social media show generic fallbacks instead of ad content. The entire sharing feature's social preview is non-functional.
- **Fix:** Add `[functions.og-share]` with `verify_jwt = false` to `config.toml`.

**Issue 7.2: Pricing page links to `/app` for all plans including "Contact Sales"**
- **Severity:** Medium
- **Location:** `src/components/landing/Pricing.tsx:120`
- **Evidence:**
  ```tsx
  <Link to="/app"><Button>{plan.cta}</Button></Link>
  ```
  The "Contact Sales" button for the Business plan navigates to `/app` instead of a contact form or email.
- **Impact:** Misleading CTA; lost sales leads.
- **Fix:** Route "Contact Sales" to a mailto link or contact page.

---

## Implementation Plan

The fixes should be prioritized in this order:

1. **Add `[functions.og-share] verify_jwt = false`** to `config.toml` (fixes sharing feature)
2. **Add AbortController timeout** to AI gateway fetch in `generate-ad`
3. **Create `handle_new_user` trigger** via database migration
4. **Add React Error Boundary** wrapping routes in `App.tsx`
5. **Fix `ResetPasswordPage` subscription leak**
6. **Add lazy loading** (`React.lazy`) for route-level code splitting
7. **Add `loading="lazy"`** to all `<img>` tags
8. **Move Google Fonts** from CSS `@import` to HTML `<link>` in `<head>`
9. **Add ARIA attributes** to mobile menu button
10. **Fix SEO issues**: update sitemap dates/domain, remove auth-required pages, add per-page titles
11. **Remove dead code**: `storage.ts`, `NavLink.tsx`
12. **Extract shared `OutputSection`** component
13. **Fix footer**: update copyright year, remove or fix dead links
14. **Fix mobile copy button** visibility
15. **Remove production `console.error`** in NotFound

