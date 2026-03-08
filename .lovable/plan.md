

# Fix Navigation, Add Missing Pages, and Enhance SEO

## Current State Assessment

**Nav links are NOT 404ing** — they use anchor hashes (`#pricing`, `#features`, etc.) that scroll to sections on the landing page. However, they won't work if clicked from a non-landing page. The footer links all point to `#` (dead links). There are no standalone pages for About, Contact, Privacy, Terms, or Blog. SEO meta tags and structured data already exist in `index.html` and via `useDocumentMeta`, but individual pages lack unique meta.

## What Needs to Change

### 1. Create missing pages (5 new page components)
- **About** (`/about`) — company mission, team, story
- **Contact** (`/contact`) — contact form + info
- **Blog** (`/blog`) — placeholder blog listing page
- **Privacy Policy** (`/privacy`) — standard privacy policy content
- **Terms of Service** (`/terms`) — standard terms content

Each page will use `useDocumentMeta` for unique SEO per route and include Navbar + Footer.

### 2. Add routes to App.tsx
Register all 5 new routes plus dedicated routes for `/features`, `/pricing`, `/how-it-works`, `/faq` that scroll to or render those sections.

### 3. Fix Navbar links
- When on the landing page: keep anchor scroll behavior (`#features`, etc.)
- When on other pages: navigate to `/#features` so users land on the homepage and scroll to the section

### 4. Fix Footer links
- Map footer items to real routes: Features → `/#features`, Pricing → `/#pricing`, About → `/about`, Blog → `/blog`, Privacy → `/privacy`, Terms → `/terms`, Contact → `/contact`
- Remove or grey out items that don't have pages yet (API, Integrations, Careers, Press, Documentation, Help Center, Community, Status, Security, Cookies)

### 5. Enhance structured data
- Add `FAQPage` schema to the FAQ section (already has content in `FAQ.tsx`)
- Add `HowTo` schema for the How It Works section
- These can be injected via `useEffect` in each component or added to `index.html`

### 6. Update sitemap.xml
Add all new public pages: `/about`, `/contact`, `/blog`, `/privacy`, `/terms`

### Files to create
- `src/pages/AboutPage.tsx`
- `src/pages/ContactPage.tsx`
- `src/pages/BlogPage.tsx`
- `src/pages/PrivacyPage.tsx`
- `src/pages/TermsPage.tsx`

### Files to modify
- `src/App.tsx` — add new routes
- `src/components/landing/Navbar.tsx` — fix navigation for cross-page linking
- `src/components/landing/Footer.tsx` — replace `#` hrefs with real routes
- `src/components/landing/FAQ.tsx` — add FAQPage structured data
- `src/components/landing/HowItWorks.tsx` — add HowTo structured data
- `public/sitemap.xml` — add new URLs

