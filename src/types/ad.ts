export interface AdStyle {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface GeneratedAd {
  id: string;
  headline: string;
  bodyShort: string;
  bodyLong: string;
  hashtags: string[];
  cta: string;
  targetAudience: string;
  images: string[];
  style: string;
  createdAt: Date;
  shareToken?: string | null;
  input: {
    type: "image" | "url" | "description";
    value: string;
  };
}

export interface AdHistory {
  ads: GeneratedAd[];
}

export const AD_STYLES: AdStyle[] = [
  {
    id: "simple",
    name: "Simple",
    description: "Clean and straightforward messaging",
    icon: "✨",
  },
  {
    id: "emotional",
    name: "Emotional",
    description: "Connect through feelings and stories",
    icon: "❤️",
  },
  {
    id: "storytelling",
    name: "Storytelling",
    description: "Narrative-driven, engaging copy",
    icon: "📖",
  },
  {
    id: "viral",
    name: "Viral",
    description: "Trendy, shareable, attention-grabbing",
    icon: "🔥",
  },
  {
    id: "short-form",
    name: "Short-Form",
    description: "Punchy, perfect for TikTok & Reels",
    icon: "⚡",
  },
];
