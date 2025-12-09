import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdRequest {
  input: string;
  inputType: "image" | "url" | "description";
  styleId: string;
  styleName: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { input, inputType, styleId, styleName } = await req.json() as AdRequest;
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
