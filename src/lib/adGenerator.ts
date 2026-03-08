import { GeneratedAd, AD_STYLES } from "@/types/ad";
import { supabase } from "@/integrations/supabase/client";

export const generateAd = async (
  input: string,
  inputType: "image" | "url" | "description",
  styleId: string,
  language: string = "auto"
): Promise<GeneratedAd> => {
  const style = AD_STYLES.find((s) => s.id === styleId) || AD_STYLES[0];

  const { data, error } = await supabase.functions.invoke("generate-ad", {
    body: {
      input,
      inputType,
      styleId,
      styleName: style.name,
      language,
    },
  });

  if (error) {
    throw new Error("Failed to generate ad. Please try again.");
  }

  if (data.error) {
    // Return sanitized error from server (already sanitized on backend)
    throw new Error(data.error);
  }

  const ad: GeneratedAd = {
    id: data.id,
    headline: data.headline,
    bodyShort: data.bodyShort,
    bodyLong: data.bodyLong,
    hashtags: data.hashtags,
    cta: data.cta,
    targetAudience: data.targetAudience,
    images: data.images,
    style: data.style,
    language: data.language || language,
    createdAt: new Date(data.createdAt),
    input: {
      type: data.input.type,
      value: data.input.value,
    },
  };

  return ad;
};
