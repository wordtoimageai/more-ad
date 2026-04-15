import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

const RATE_LIMIT_MAX_REQUESTS = 50;
const RATE_LIMIT_WINDOW_MINUTES = 60;

interface AdRequest {
  input: string;
  inputType: "image" | "url" | "description";
  styleId: string;
  styleName: string;
  language: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset_at: string;
}

const MAX_INPUT_LENGTH = 10000;
const MAX_STYLE_NAME_LENGTH = 100;
const MAX_AI_FIELD_LENGTH = 5000;
const VALID_INPUT_TYPES = ["image", "url", "description"] as const;
const VALID_STYLE_IDS = ["simple", "emotional", "storytelling", "viral", "short-form"] as const;
const VALID_LANGUAGES = [
  "auto", "en", "es", "fr", "de", "pt", "it", "nl", "ar", "hi",
  "ja", "zh", "ko", "ru", "tr", "he", "ur", "fa", "th", "vi", "id"
] as const;

const LANGUAGE_NAMES: Record<string, string> = {
  auto: "the same language as the user input",
  en: "English", es: "Spanish", fr: "French", de: "German",
  pt: "Portuguese", it: "Italian", nl: "Dutch", ar: "Arabic",
  hi: "Hindi", ja: "Japanese", zh: "Chinese (Simplified)", ko: "Korean",
  ru: "Russian", tr: "Turkish", he: "Hebrew", ur: "Urdu",
  fa: "Persian (Farsi)", th: "Thai", vi: "Vietnamese", id: "Indonesian",
};

function sanitizeAIContent(content: string): string {
  if (typeof content !== 'string') return '';
  return content
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .substring(0, MAX_AI_FIELD_LENGTH);
}

function validateAIResponse(content: unknown): { 
  valid: true; 
  data: { 
    headline: string; bodyShort: string; bodyLong: string; 
    hashtags: string[]; cta: string; targetAudience: string; 
    imagePrompt?: string;
  } 
} | { valid: false; error: string } {
  if (!content || typeof content !== 'object') {
    return { valid: false, error: 'Invalid AI response structure' };
  }
  const obj = content as Record<string, unknown>;
  const requiredFields = ['headline', 'bodyShort', 'bodyLong', 'hashtags', 'cta', 'targetAudience'];
  for (const field of requiredFields) {
    if (!(field in obj)) return { valid: false, error: `Missing required field: ${field}` };
  }
  if (!Array.isArray(obj.hashtags)) return { valid: false, error: 'hashtags must be an array' };
  const sanitizedHashtags = obj.hashtags
    .filter((tag): tag is string => typeof tag === 'string')
    .slice(0, 10)
    .map(tag => sanitizeAIContent(tag.substring(0, 100)));
  return {
    valid: true,
    data: {
      headline: sanitizeAIContent(String(obj.headline || '')),
      bodyShort: sanitizeAIContent(String(obj.bodyShort || '')),
      bodyLong: sanitizeAIContent(String(obj.bodyLong || '')),
      hashtags: sanitizedHashtags,
      cta: sanitizeAIContent(String(obj.cta || '')),
      targetAudience: sanitizeAIContent(String(obj.targetAudience || '')),
      imagePrompt: typeof obj.imagePrompt === 'string' ? obj.imagePrompt : undefined,
    }
  };
}

function getSafeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('rate limit')) return 'Rate limit exceeded. Please try again later.';
    if (message.includes('authentication') || message.includes('auth')) return 'Authentication required.';
    if (message.includes('validation')) return 'Invalid request data.';
    if (message.includes('parse') || message.includes('json')) return 'Failed to process AI response.';
    if (message.includes('payment required') || message.includes('402')) return 'AI service credits exhausted. Please try again later.';
  }
  return 'An error occurred while generating your ad. Please try again.';
}

function sanitizeInput(input: string): string {
  return input.trim().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').substring(0, MAX_INPUT_LENGTH);
}

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch { return false; }
}

function validateRequest(body: unknown): { valid: true; data: AdRequest } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') return { valid: false, error: "Invalid request body" };
  const { input, inputType, styleId, styleName, language } = body as Record<string, unknown>;
  if (typeof input !== 'string' || input.trim().length === 0) return { valid: false, error: "Input is required" };
  if (input.length > MAX_INPUT_LENGTH) return { valid: false, error: "Input exceeds maximum length" };
  if (!VALID_INPUT_TYPES.includes(inputType as typeof VALID_INPUT_TYPES[number])) return { valid: false, error: "Invalid input type" };
  if (inputType === "url" && !isValidUrl(input)) return { valid: false, error: "Invalid URL format" };
  if (inputType === "image" && !isValidUrl(input)) return { valid: false, error: "Invalid image URL format" };
  if (typeof styleId !== 'string' || !VALID_STYLE_IDS.includes(styleId as typeof VALID_STYLE_IDS[number])) return { valid: false, error: "Invalid style ID" };
  if (typeof styleName !== 'string' || styleName.length === 0 || styleName.length > MAX_STYLE_NAME_LENGTH) return { valid: false, error: "Invalid style name" };
  const lang = typeof language === 'string' ? language : 'auto';
  if (!VALID_LANGUAGES.includes(lang as typeof VALID_LANGUAGES[number])) return { valid: false, error: "Invalid language" };
  return {
    valid: true,
    data: {
      input: sanitizeInput(input),
      inputType: inputType as AdRequest['inputType'],
      styleId: styleId,
      styleName: styleName.trim().substring(0, MAX_STYLE_NAME_LENGTH),
      language: lang,
    }
  };
}

// --- Lovable AI Gateway for text generation ---

async function generateTextWithAI(systemPrompt: string, userPrompt: string, apiKey: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
      signal: controller.signal,
    });

    if (response.status === 429) {
      throw new Error("Rate limit exceeded from AI gateway");
    }
    if (response.status === 402) {
      throw new Error("Payment required - AI credits exhausted");
    }
    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI gateway error [${response.status}]`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");
    return content;
  } finally {
    clearTimeout(timeout);
  }
}

// --- Replicate for image generation (fixed API endpoint) ---

async function generateImagesWithReplicate(prompt: string, apiToken: string): Promise<string[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    // Use the official models endpoint for official models
    const createRes = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json",
        "Prefer": "wait",
      },
      body: JSON.stringify({
        input: {
          prompt: `Professional advertising creative: ${prompt}`,
          num_outputs: 3,
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 90,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!createRes.ok) {
      const errBody = await createRes.text();
      console.error("Replicate create failed:", createRes.status, errBody);
      return [];
    }

    let prediction = await createRes.json();

    // If not using "Prefer: wait", poll for completion
    if (prediction.status !== "succeeded") {
      const maxWait = 60_000;
      const start = Date.now();
      while (prediction.status !== "succeeded" && prediction.status !== "failed" && prediction.status !== "canceled") {
        if (Date.now() - start > maxWait) {
          console.error("Replicate image prediction timed out");
          return [];
        }
        await new Promise(r => setTimeout(r, 2000));
        const pollRes = await fetch(prediction.urls.get, {
          headers: { "Authorization": `Bearer ${apiToken}` },
        });
        prediction = await pollRes.json();
      }
    }

    if (prediction.status !== "succeeded" || !prediction.output) {
      console.error("Replicate image prediction failed:", prediction.error);
      return [];
    }

    if (Array.isArray(prediction.output)) {
      return prediction.output.map((url: unknown) => String(url));
    }
    return [];
  } catch (err) {
    console.error("Replicate image generation error:", err);
    return [];
  }
}

function getStyleGuidelines(styleId: string, language: string): string {
  const isNonEnglish = language !== "en" && language !== "auto";
  const guidelines: Record<string, string> = {
    simple: `- Direct and clear messaging\n- Focus on value proposition\n- Professional tone\n- Minimal emojis\n- Straightforward call-to-action`,
    emotional: `- Connect on an emotional level\n- Use heartfelt language\n- Create a sense of care and belonging\n- Use warm, inviting words\n- Include appropriate emojis`,
    storytelling: `- Create a narrative arc\n- Share the journey or origin story\n- Build connection through story\n- Use descriptive, evocative language\n- Invite the reader to be part of the story`,
    viral: `- Trendy, attention-grabbing language\n- ${isNonEnglish ? "Use culturally relevant slang" : "Use Gen-Z/millennial slang appropriately"}\n- Create FOMO\n- Punchy, energetic phrases\n- Heavy use of emojis and casual tone`,
    "short-form": `- Ultra-concise messaging\n- Punchy one-liners\n- Action-oriented\n- Minimal words, maximum impact\n- Perfect for social media feeds`,
  };
  return guidelines[styleId] || guidelines.simple;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Rate limiting
    const { data: rateLimitData, error: rateLimitError } = await supabase
      .rpc("check_rate_limit", {
        p_user_id: user.id, p_endpoint: "generate-ad",
        p_max_requests: RATE_LIMIT_MAX_REQUESTS, p_window_minutes: RATE_LIMIT_WINDOW_MINUTES,
      });
    if (rateLimitError) {
      return new Response(JSON.stringify({ error: "Service temporarily unavailable." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (rateLimitData && rateLimitData.length > 0) {
      const rateLimit = rateLimitData[0] as RateLimitResult;
      if (!rateLimit.allowed) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later.", retryAfter: rateLimit.reset_at }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    const body = await req.json();
    const validation = validateRequest(body);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { input, inputType, styleId, styleName, language } = validation.data;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const REPLICATE_API_TOKEN = Deno.env.get("REPLICATE_API_TOKEN");
    if (!REPLICATE_API_TOKEN) {
      throw new Error("REPLICATE_API_TOKEN is not configured");
    }

    const languageName = LANGUAGE_NAMES[language] || "the same language as the user input";
    const languageInstruction = language === "auto"
      ? `Detect the language of the user's input and generate ALL ad copy in that same language. If unclear, default to English.`
      : `Generate ALL ad copy strictly in ${languageName}. Do NOT mix languages.`;

    const systemPrompt = `You are an expert multilingual advertising copywriter. Generate high-converting ad copy based on the user's input.

LANGUAGE INSTRUCTION: ${languageInstruction}

Your response must be valid JSON with this exact structure:
{
  "headline": "A compelling headline under 60 characters",
  "bodyShort": "Short ad copy, 1-2 sentences, punchy and engaging",
  "bodyLong": "Longer ad copy, 3-4 sentences, persuasive and detailed",
  "hashtags": ["#Hashtag1", "#Hashtag2", "#Hashtag3", "#Hashtag4", "#Hashtag5"],
  "cta": "Call to action button text (2-4 words)",
  "targetAudience": "Description of ideal target audience for this ad",
  "imagePrompt": "A detailed prompt to generate an advertising image for this product"
}

IMPORTANT: All hashtags must be in the target language. The imagePrompt should be in English and describe a professional advertising visual.

Style guidelines for "${styleName}" style:
${getStyleGuidelines(styleId, language)}

Respond ONLY with valid JSON. No markdown, no explanations.`;

    const userPrompt = `Create ad copy for the following ${inputType}:\n${input}\n\nGenerate compelling, ${styleName.toLowerCase()}-style advertising content.`;

    // Step 1: Generate text with Lovable AI Gateway
    const textOutput = await generateTextWithAI(systemPrompt, userPrompt, LOVABLE_API_KEY);

    let parsedContent;
    try {
      const cleanContent = textOutput.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      parsedContent = JSON.parse(jsonMatch[0]);
    } catch {
      throw new Error("Failed to parse AI response as JSON");
    }

    const aiValidation = validateAIResponse(parsedContent);
    if (!aiValidation.valid) throw new Error("AI response validation failed");

    const adContent = aiValidation.data;
    const imagePrompt = adContent.imagePrompt || `Professional ad creative for: ${adContent.headline}`;

    // Step 2: Generate images with Replicate (correct API)
    const images = await generateImagesWithReplicate(imagePrompt, REPLICATE_API_TOKEN);

    // Fallback images if Replicate fails
    const finalImages = images.length > 0 ? images : [
      "/placeholder.svg",
    ];

    const result = {
      id: `ad_${Date.now()}`,
      headline: adContent.headline || sanitizeAIContent("Your Amazing Product"),
      bodyShort: adContent.bodyShort || sanitizeAIContent("Discover something amazing."),
      bodyLong: adContent.bodyLong || sanitizeAIContent("Experience the difference with our product."),
      hashtags: adContent.hashtags.length > 0 ? adContent.hashtags : ["#Product", "#Sale", "#Shop"],
      cta: adContent.cta || sanitizeAIContent("Shop Now"),
      targetAudience: adContent.targetAudience || sanitizeAIContent("General audience"),
      images: finalImages,
      videoUrl: null,
      style: styleName,
      language,
      createdAt: new Date().toISOString(),
      input: { type: inputType, value: input },
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-ad error:", error);
    return new Response(JSON.stringify({ error: getSafeErrorMessage(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
