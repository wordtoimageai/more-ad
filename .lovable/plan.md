

## Problem Analysis

The `generate-ad` edge function has critical issues preventing it from working reliably:

1. **Replicate API misuse**: The `callReplicate` function posts to `/v1/predictions` with a `version` field, but passes model identifiers (e.g. `"black-forest-labs/flux-schnell"`) instead of version hashes. Official models on Replicate require using `/v1/models/{owner}/{name}/predictions` endpoint instead.

2. **Video generation unreliable**: The `wan-video/wan-2.1-1.3b` model is slow (can exceed 120s timeout) and uses the wrong API endpoint, making video generation effectively broken.

3. **Text generation via Replicate is unnecessary**: The project has access to Lovable AI Gateway with supported models that don't require an API key — faster and more reliable than Replicate's Llama 3.

---

## Plan

### 1. Switch text generation to Lovable AI Gateway

Replace the Replicate-based text generation with Lovable AI Gateway using `google/gemini-2.5-flash` (fast, good reasoning, free). This eliminates a major failure point and speeds up generation significantly.

### 2. Fix image generation with correct Replicate API

Update `callReplicate` to use the official models endpoint (`/v1/models/{owner}/{name}/predictions`) for models like `flux-schnell`, which don't use version hashes.

### 3. Make video generation optional and resilient

Video generation via Replicate is inherently slow and unreliable. Two options:
- **Remove it entirely** to keep generation fast and reliable
- **Keep it but don't block on it** — generate text + images first, return the ad immediately, and show video as "processing" with a polling mechanism

I recommend removing video generation for now to ensure a professional, fast experience. It can be re-added later as an opt-in premium feature.

### 4. Improve the Ad Output UI

Make the output look more polished and professional:
- Add a tabbed preview (Social Preview / Raw Copy) showing how the ad would look on Instagram/Facebook
- Better visual hierarchy with ad mockup frames
- Add a "Regenerate" button
- Show image generation progress separately

---

### Technical Changes

**`supabase/functions/generate-ad/index.ts`**:
- Replace `generateTextWithReplicate` with a call to Lovable AI Gateway (`https://api.lovable.dev/v1/chat/completions`) using `LOVABLE_API_KEY` secret (already configured)
- Fix `callReplicate` to use `/v1/models/{owner}/{name}/predictions` for official models
- Remove `generateVideoWithReplicate` (or make it opt-in)
- Remove `videoUrl` from response (or set to null)

**`src/components/app/AdOutput.tsx`**:
- Add a social media preview mockup (Instagram/Facebook card frame)
- Add a "Regenerate" button
- Remove or conditionally hide the video section
- Improve card styling with better spacing and visual hierarchy

**`src/components/app/AdInput.tsx`**:
- Add a "Generate Video" toggle checkbox (optional, off by default)
- Keep existing input flow

**`src/pages/AppPage.tsx`**:
- Add regenerate handler that re-calls with same inputs

