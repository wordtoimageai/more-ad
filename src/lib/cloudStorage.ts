import { supabase } from "@/integrations/supabase/client";
import { GeneratedAd } from "@/types/ad";

export const saveAdToCloud = async (ad: GeneratedAd): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase.from("ad_history").insert({
    user_id: user.id,
    headline: ad.headline,
    body_short: ad.bodyShort,
    body_long: ad.bodyLong,
    hashtags: ad.hashtags,
    cta: ad.cta,
    target_audience: ad.targetAudience,
    images: ad.images,
    style: ad.style,
    language: ad.language || "auto",
    input_type: ad.input.type,
    input_value: ad.input.value,
  }).select("id").single();

  if (error || !data) {
    throw new Error("Failed to save ad. Please try again.");
  }

  return data.id;
};

export const getCloudHistory = async (): Promise<GeneratedAd[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("ad_history")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    headline: item.headline,
    bodyShort: item.body_short,
    bodyLong: item.body_long,
    hashtags: item.hashtags,
    cta: item.cta,
    targetAudience: item.target_audience,
    images: item.images,
    style: item.style,
    createdAt: new Date(item.created_at),
    shareToken: item.share_token,
    input: {
      type: item.input_type as "image" | "url" | "description",
      value: item.input_value,
    },
  }));
};

export const deleteFromCloudHistory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("ad_history")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error("Failed to delete ad. Please try again.");
  }
};

export const clearCloudHistory = async (): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("ad_history")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    throw new Error("Failed to clear history. Please try again.");
  }
};
