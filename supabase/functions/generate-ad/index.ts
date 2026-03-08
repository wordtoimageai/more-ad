import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

// Rate limiting configuration
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

// Input validation constants
const MAX_INPUT_LENGTH = 10000;
const MAX_STYLE_ID_LENGTH = 50;
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
    headline: string; 
    bodyShort: string; 
    bodyLong: string; 
    hashtags: string[]; 
    cta: string; 
    targetAudience: string; 
  } 
} | { valid: false; error: string } {
  if (!content || typeof content !== 'object') {
    return { valid: false, error: 'Invalid AI response structure' };
  }

  const obj = content as Record<string, unknown>;
  
  const requiredFields = ['headline', 'bodyShort', 'bodyLong', 'hashtags', 'cta', 'targetAudience'];
  for (const field of requiredFields) {
    if (!(field in obj)) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }

  if (!Array.isArray(obj.hashtags)) {
    return { valid: false, error: 'hashtags must be an array' };
  }
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
  }
  return 'An error occurred while generating your ad. Please try again.';
}

function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .substring(0, MAX_INPUT_LENGTH);
}

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function validateRequest(body: unknown): { valid: true; data: AdRequest } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: "Invalid request body" };
  }

  const { input, inputType, styleId, styleName, language } = body as Record<string, unknown>;

  if (typeof input !== 'string' || input.trim().length === 0) {
    return { valid: false, error: "Input is required and must be a non-empty string" };
  }
  if (input.length > MAX_INPUT_LENGTH) {
    return { valid: false, error: `Input exceeds maximum length of ${MAX_INPUT_LENGTH} characters` };
  }

  if (!VALID_INPUT_TYPES.includes(inputType as typeof VALID_INPUT_TYPES[number])) {
    return { valid: false, error: `Invalid input type. Must be one of: ${VALID_INPUT_TYPES.join(', ')}` };
  }

  if (inputType === "url" && !isValidUrl(input)) {
    return { valid: false, error: "Invalid URL format. Must be a valid HTTP or HTTPS URL" };
  }

  if (typeof styleId !== 'string' || styleId.length > MAX_STYLE_ID_LENGTH) {
    return { valid: false, error: "Invalid style ID" };
  }
  if (!VALID_STYLE_IDS.includes(styleId as typeof VALID_STYLE_IDS[number])) {
    return { valid: false, error: `Invalid style ID. Must be one of: ${VALID_STYLE_IDS.join(', ')}` };
  }

  if (typeof styleName !== 'string' || styleName.length === 0 || styleName.length > MAX_STYLE_NAME_LENGTH) {
    return { valid: false, error: "Invalid style name" };
  }

  // Validate language - default to "auto" if not provided
  const lang = typeof language === 'string' ? language : 'auto';
  if (!VALID_LANGUAGES.includes(lang as typeof VALID_LANGUAGES[number])) {
    return { valid: false, error: "Invalid language selection" };
  }

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: rateLimitData, error: rateLimitError } = await supabase
      .rpc("check_rate_limit", {
        p_user_id: user.id,
        p_endpoint: "generate-ad",
        p_max_requests: RATE_LIMIT_MAX_REQUESTS,
        p_window_minutes: RATE_LIMIT_WINDOW_MINUTES,
      });

    if (rateLimitError) {
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable. Please try again." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (rateLimitData && rateLimitData.length > 0) {
      const rateLimit = rateLimitData[0] as RateLimitResult;
      
      if (!rateLimit.allowed) {
        return new Response(
          JSON.stringify({ 
            error: "Rate limit exceeded. Please try again later.",
            retryAfter: rateLimit.reset_at
          }),
          { 
            status: 429, 
            headers: { 
              ...corsHeaders, 
              "Content-Type": "application/json",
              "X-RateLimit-Limit": String(RATE_LIMIT_MAX_REQUESTS),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": rateLimit.reset_at,
            } 
          }
        );
      }
    }

    const body = await req.json();
    
    const validation = validateRequest(body);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { input, inputType, styleId, styleName, language } = validation.data;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const languageName = LANGUAGE_NAMES[language] || "the same language as the user input";
    const languageInstruction = language === "auto"
      ? `Detect the language of the user's input and generate ALL ad copy in that same language. If the input language is unclear, default to English.`
      : `Generate ALL ad copy strictly in ${languageName}. This includes the headline, body copy, hashtags, CTA, and target audience description. Do NOT mix languages.`;

    const systemPrompt = `You are an expert multilingual advertising copywriter. Generate high-converting ad copy based on the user's input.

LANGUAGE INSTRUCTION: ${languageInstruction}

Your response must be valid JSON with this exact structure:
{
  "headline": "A compelling headline under 60 characters",
  "bodyShort": "Short ad copy, 1-2 sentences, punchy and engaging",
  "bodyLong": "Longer ad copy, 3-4 sentences, persuasive and detailed",
  "hashtags": ["#Hashtag1", "#Hashtag2", "#Hashtag3", "#Hashtag4", "#Hashtag5"],
  "cta": "Call to action button text (2-4 words)",
  "targetAudience": "Description of ideal target audience for this ad"
}

IMPORTANT: All hashtags must be in the target language and culturally relevant to that market. Do not use English hashtags unless the target language is English.

Style guidelines for "${styleName}" style:
${getStyleGuidelines(styleId, language)}

Respond ONLY with valid JSON. No markdown, no explanations.`;

    const userPrompt = `Create ad copy for the following ${inputType}:
${input}

Generate compelling, ${styleName.toLowerCase()}-style advertising content.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    
    let response: Response;
    try {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof DOMException && err.name === 'AbortError') {
        return new Response(
          JSON.stringify({ error: "Request timed out. Please try again." }),
          { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw err;
    }
    clearTimeout(timeout);

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    let parsedContent;
    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedContent = JSON.parse(cleanContent);
    } catch {
      throw new Error("Failed to parse AI response as JSON");
    }

    const aiValidation = validateAIResponse(parsedContent);
    if (!aiValidation.valid) {
      throw new Error("AI response validation failed");
    }

    const adContent = aiValidation.data;

    const images = [
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    ];

    const result = {
      id: `ad_${Date.now()}`,
      headline: adContent.headline || sanitizeAIContent("Your Amazing Product"),
      bodyShort: adContent.bodyShort || sanitizeAIContent("Discover something amazing."),
      bodyLong: adContent.bodyLong || sanitizeAIContent("Experience the difference with our product."),
      hashtags: adContent.hashtags.length > 0 ? adContent.hashtags : ["#Product", "#Sale", "#Shop"],
      cta: adContent.cta || sanitizeAIContent("Shop Now"),
      targetAudience: adContent.targetAudience || sanitizeAIContent("General audience"),
      images,
      style: styleName,
      language,
      createdAt: new Date().toISOString(),
      input: {
        type: inputType,
        value: input,
      },
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: getSafeErrorMessage(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getStyleGuidelines(styleId: string, language: string): string {
  const isNonEnglish = language !== "en" && language !== "auto";
  
  const guidelines: Record<string, string> = {
    simple: `
- Direct and clear messaging
- Focus on value proposition
- Professional tone
- Minimal emojis
- Straightforward call-to-action`,
    emotional: `
- Connect on an emotional level
- Use heartfelt language
- Create a sense of care and belonging
- Use warm, inviting words
- Include appropriate emojis (hearts, stars)`,
    storytelling: `
- Create a narrative arc
- Share the journey or origin story
- Build connection through story
- Use descriptive, evocative language
- Invite the reader to be part of the story`,
    viral: `
- Trendy, attention-grabbing language
- ${isNonEnglish ? "Use culturally relevant slang and trends for the target language" : "Use Gen-Z/millennial slang appropriately"}
- Create FOMO (fear of missing out)
- Punchy, energetic phrases
- Heavy use of emojis and casual tone`,
    "short-form": `
- Ultra-concise messaging
- Punchy one-liners
- Action-oriented
- Minimal words, maximum impact
- Perfect for social media feeds`,
  };

  return guidelines[styleId] || guidelines.simple;
}
