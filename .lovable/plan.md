

# International Ad Generation Assessment

## Current State

After reviewing the full ad generation pipeline, here is the international readiness assessment:

### What Works Today
- **Unicode input accepted**: The `sanitizeInput` function only strips control characters, so users can submit descriptions in any language (Arabic, Chinese, Japanese, Hindi, etc.)
- **AI model is multilingual**: Gemini 2.5 Flash supports 100+ languages natively
- **No hardcoded language restriction**: Neither the edge function nor the frontend enforces English-only input

### Gaps for True International-Level Support

| # | Gap | Severity | Detail |
|---|-----|----------|--------|
| 1 | **Prompt is English-only** | High | The system prompt instructs the AI in English with no language awareness. If a user writes in French, the AI may respond in English or mix languages unpredictably. |
| 2 | **No language/locale selector** | High | Users cannot specify their target market language. An Indian user selling to a Japanese audience has no way to indicate the output language. |
| 3 | **Hashtags are English-biased** | Medium | Fallback hashtags (`#Product`, `#Sale`, `#Shop`) are English. Style guidelines reference English slang ("Gen-Z/millennial slang"). |
| 4 | **No RTL layout support** | Medium | Arabic, Hebrew, and other RTL languages will render incorrectly in the output panels — text alignment is always LTR. |
| 5 | **Placeholder text is English-only** | Low | Input placeholders ("E.g., Premium organic coffee beans...") don't adapt. |
| 6 | **Static Unsplash images** | Low | Generated ad images are hardcoded stock photos, not relevant to regional markets. |

---

## Implementation Plan

### 1. Add language selector to AdInput (UI)
- Add a dropdown with 15-20 common advertising languages (English, Spanish, French, Arabic, Hindi, Japanese, Chinese, Portuguese, German, Korean, etc.)
- Default to "Auto-detect" which infers language from user input
- Pass `language` parameter through to the edge function

### 2. Update edge function to support multilingual generation
- Accept `language` field in the request body
- Update `systemPrompt` to include: *"Generate all ad copy in {language}. Hashtags should be in {language} and relevant to that market."*
- Update style guidelines to be language-aware (remove English-specific slang references for non-English)
- Update fallback values to be language-appropriate

### 3. Add RTL support for output display
- Detect RTL languages (Arabic, Hebrew, Urdu, Persian)
- Apply `dir="rtl"` and `text-align: right` to output sections when RTL language is selected
- Ensure copy buttons and layout adapt

### 4. Update validation and types
- Add `language` field to `AdRequest` interface and `GeneratedAd` type
- Add `language` column to `ad_history` table via migration
- Validate language parameter on the backend

### 5. Update ad history and sharing
- Store language with each generated ad
- Apply correct text direction when viewing shared ads in SharePage

### Files to modify:
- `src/components/app/AdInput.tsx` — add language selector
- `src/types/ad.ts` — add language to types
- `src/lib/adGenerator.ts` — pass language to edge function
- `supabase/functions/generate-ad/index.ts` — accept language, update prompts
- `src/components/app/AdOutput.tsx` — RTL support
- `src/pages/SharePage.tsx` — RTL support for shared ads
- `src/lib/cloudStorage.ts` — save language field
- DB migration — add `language` column to `ad_history`

