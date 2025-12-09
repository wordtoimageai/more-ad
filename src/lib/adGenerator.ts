import { GeneratedAd, AD_STYLES } from "@/types/ad";
import { supabase } from "@/integrations/supabase/client";

export const generateAd = async (
  input: string,
  inputType: "image" | "url" | "description",
  styleId: string
): Promise<GeneratedAd> => {
  const style = AD_STYLES.find((s) => s.id === styleId) || AD_STYLES[0];

  const { data, error } = await supabase.functions.invoke("generate-ad", {
    body: {
      input,
      inputType,
      styleId,
      styleName: style.name,
    },
  });

  if (error) {
    console.error("Error calling generate-ad function:", error);
    throw new Error(error.message || "Failed to generate ad");
  }

  if (data.error) {
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
    createdAt: new Date(data.createdAt),
    input: {
      type: data.input.type,
      value: data.input.value,
    },
  };

  return ad;
};
