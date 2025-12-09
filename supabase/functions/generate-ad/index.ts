import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting configuration
const RATE_LIMIT_MAX_REQUESTS = 50; // Max requests per window
const RATE_LIMIT_WINDOW_MINUTES = 60; // Time window in minutes

interface AdRequest {
  input: string;
  inputType: "image" | "url" | "description";
  styleId: string;
  styleName: string;
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
const VALID_INPUT_TYPES = ["image", "url", "description"] as const;
const VALID_STYLE_IDS = ["simple", "emotional", "storytelling", "viral", "short-form"] as const;

// Sanitize string input - remove potential injection patterns
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .substring(0, MAX_INPUT_LENGTH);
}

// Validate URL format
function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Validate the request payload
function validateRequest(body: unknown): { valid: true; data: AdRequest } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: "Invalid request body" };
  }

  const { input, inputType, styleId, styleName } = body as Record<string, unknown>;

  // Validate input
  if (typeof input !== 'string' || input.trim().length === 0) {
    return { valid: false, error: "Input is required and must be a non-empty string" };
  }
  if (input.length > MAX_INPUT_LENGTH) {
    return { valid: false, error: `Input exceeds maximum length of ${MAX_INPUT_LENGTH} characters` };
  }

  // Validate inputType
  if (!VALID_INPUT_TYPES.includes(inputType as typeof VALID_INPUT_TYPES[number])) {
    return { valid: false, error: `Invalid input type. Must be one of: ${VALID_INPUT_TYPES.join(', ')}` };
  }

  // Validate URL if inputType is "url"
  if (inputType === "url" && !isValidUrl(input)) {
    return { valid: false, error: "Invalid URL format. Must be a valid HTTP or HTTPS URL" };
  }

  // Validate styleId
  if (typeof styleId !== 'string' || styleId.length > MAX_STYLE_ID_LENGTH) {
    return { valid: false, error: "Invalid style ID" };
  }
  if (!VALID_STYLE_IDS.includes(styleId as typeof VALID_STYLE_IDS[number])) {
    return { valid: false, error: `Invalid style ID. Must be one of: ${VALID_STYLE_IDS.join(', ')}` };
  }

  // Validate styleName
  if (typeof styleName !== 'string' || styleName.length === 0 || styleName.length > MAX_STYLE_NAME_LENGTH) {
    return { valid: false, error: "Invalid style name" };
  }

  return {
    valid: true,
    data: {
      input: sanitizeInput(input),
      inputType: inputType as AdRequest['inputType'],
      styleId: styleId,
      styleName: styleName.trim().substring(0, MAX_STYLE_NAME_LENGTH),
    }
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract user ID from the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role for rate limiting
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user's JWT and get user ID
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check rate limit
    const { data: rateLimitData, error: rateLimitError } = await supabase
      .rpc("check_rate_limit", {
        p_user_id: user.id,
        p_endpoint: "generate-ad",
        p_max_requests: RATE_LIMIT_MAX_REQUESTS,
        p_window_minutes: RATE_LIMIT_WINDOW_MINUTES,
      });

    if (rateLimitError) {
      console.error("Rate limit check error:", rateLimitError);
      // Continue without rate limiting if there's an error (fail open for usability)
    } else if (rateLimitData && rateLimitData.length > 0) {
      const rateLimit = rateLimitData[0] as RateLimitResult;
      
      if (!rateLimit.allowed) {
        console.log(`Rate limit exceeded for user ${user.id}`);
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
      
      console.log(`Rate limit check passed for user ${user.id}: ${rateLimit.remaining} requests remaining`);
    }

    const body = await req.json();
    
    // Validate and sanitize input
    const validation = validateRequest(body);
    if (!validation.valid) {
      console.error("Validation error:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { input, inputType, styleId, styleName } = validation.data;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert advertising copywriter. Generate high-converting ad copy based on the user's input. Your response must be valid JSON with this exact structure:
{
  "headline": "A compelling headline under 60 characters",
  "bodyShort": "Short ad copy, 1-2 sentences, punchy and engaging",
  "bodyLong": "Longer ad copy, 3-4 sentences, persuasive and detailed",
  "hashtags": ["#Hashtag1", "#Hashtag2", "#Hashtag3", "#Hashtag4", "#Hashtag5"],
  "cta": "Call to action button text (2-4 words)",
  "targetAudience": "Description of ideal target audience for this ad"
}

Style guidelines for "${styleName}" style:
${getStyleGuidelines(styleId)}

Respond ONLY with valid JSON. No markdown, no explanations.`;

    const userPrompt = `Create ad copy for the following ${inputType}:
${input}

Generate compelling, ${styleName.toLowerCase()}-style advertising content.`;

    console.log("Calling Lovable AI Gateway...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
    });

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
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("AI response:", content);

    // Parse the JSON response
    let adContent;
    try {
      // Clean the response - remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      adContent = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      throw new Error("Failed to parse AI response as JSON");
    }

    // Generate placeholder images (in future, could use image generation)
    const images = [
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    ];

    const result = {
      id: `ad_${Date.now()}`,
      headline: adContent.headline || "Your Amazing Product",
      bodyShort: adContent.bodyShort || "Discover something amazing.",
      bodyLong: adContent.bodyLong || "Experience the difference with our product.",
      hashtags: adContent.hashtags || ["#Product", "#Sale", "#Shop"],
      cta: adContent.cta || "Shop Now",
      targetAudience: adContent.targetAudience || "General audience",
      images,
      style: styleName,
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
    console.error("Error in generate-ad function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getStyleGuidelines(styleId: string): string {
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
- Use Gen-Z/millennial slang appropriately
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
