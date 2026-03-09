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
  videoUrl?: string | null;
  style: string;
  language: string;
  createdAt: Date;
  shareToken?: string | null;
  input: {
    type: "image" | "url" | "description";
    value: string;
  };
}

export const RTL_LANGUAGES = ["ar", "he", "ur", "fa"];

export const SUPPORTED_LANGUAGES = [
  { id: "auto", name: "Auto-detect", flag: "🌐" },
  { id: "en", name: "English", flag: "🇺🇸" },
  { id: "es", name: "Español", flag: "🇪🇸" },
  { id: "fr", name: "Français", flag: "🇫🇷" },
  { id: "de", name: "Deutsch", flag: "🇩🇪" },
  { id: "pt", name: "Português", flag: "🇧🇷" },
  { id: "it", name: "Italiano", flag: "🇮🇹" },
  { id: "nl", name: "Nederlands", flag: "🇳🇱" },
  { id: "ar", name: "العربية", flag: "🇸🇦" },
  { id: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { id: "ja", name: "日本語", flag: "🇯🇵" },
  { id: "zh", name: "中文", flag: "🇨🇳" },
  { id: "ko", name: "한국어", flag: "🇰🇷" },
  { id: "ru", name: "Русский", flag: "🇷🇺" },
  { id: "tr", name: "Türkçe", flag: "🇹🇷" },
  { id: "he", name: "עברית", flag: "🇮🇱" },
  { id: "ur", name: "اردو", flag: "🇵🇰" },
  { id: "fa", name: "فارسی", flag: "🇮🇷" },
  { id: "th", name: "ไทย", flag: "🇹🇭" },
  { id: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
  { id: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
];

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
