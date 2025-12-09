import { GeneratedAd, AD_STYLES } from "@/types/ad";

// Mock AI generation - in production, this would call OpenAI/Anthropic
export const generateAd = async (
  input: string,
  inputType: "image" | "url" | "description",
  styleId: string
): Promise<GeneratedAd> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const style = AD_STYLES.find((s) => s.id === styleId) || AD_STYLES[0];

  // Generate mock ad content based on style
  const adContent = generateMockContent(input, style.id);

  const ad: GeneratedAd = {
    id: `ad_${Date.now()}`,
    headline: adContent.headline,
    bodyShort: adContent.bodyShort,
    bodyLong: adContent.bodyLong,
    hashtags: adContent.hashtags,
    cta: adContent.cta,
    targetAudience: adContent.targetAudience,
    images: [
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    ],
    style: style.name,
    createdAt: new Date(),
    input: {
      type: inputType,
      value: input,
    },
  };

  return ad;
};

interface MockAdContent {
  headline: string;
  bodyShort: string;
  bodyLong: string;
  hashtags: string[];
  cta: string;
  targetAudience: string;
}

const generateMockContent = (input: string, styleId: string): MockAdContent => {
  const productName = input.slice(0, 30) || "Your Amazing Product";

  const contentByStyle: Record<string, MockAdContent> = {
    simple: {
      headline: `Discover ${productName} Today`,
      bodyShort: `Quality meets simplicity. Get yours now and experience the difference.`,
      bodyLong: `Looking for something that just works? ${productName} delivers exactly what you need, without the complexity. Join thousands of satisfied customers who've made the switch. Simple, effective, reliable.`,
      hashtags: ["#QualityFirst", "#SimpleSolutions", "#MustHave", "#ShopNow", "#BestValue"],
      cta: "Shop Now",
      targetAudience: "Adults 25-54, value-conscious shoppers, quality seekers",
    },
    emotional: {
      headline: `Feel the Difference with ${productName} ❤️`,
      bodyShort: `Because you deserve something that truly cares. Made with love, for you.`,
      bodyLong: `We believe everyone deserves to feel special. That's why we created ${productName} – not just a product, but a promise. A promise that you'll feel the difference the moment you experience it. Because when something is made with genuine care, you can feel it.`,
      hashtags: ["#FeelTheLove", "#YouDeserveIt", "#MadeForYou", "#HeartfeltQuality", "#LoveWhat YouDo"],
      cta: "Experience Now",
      targetAudience: "Women 25-45, emotionally-driven buyers, gift shoppers",
    },
    storytelling: {
      headline: `The Story Behind ${productName}`,
      bodyShort: `It started with a simple idea... and changed everything.`,
      bodyLong: `Every great product has a story. Ours began in a small workshop, with a dream to create something truly special. Countless hours, endless iterations, and unwavering dedication led to ${productName}. Today, we're proud to share this journey with you. This isn't just our story – it's about to become yours.`,
      hashtags: ["#OurStory", "#BehindTheScenes", "#JourneyToGreatness", "#Handcrafted", "#DreamBig"],
      cta: "Be Part of the Story",
      targetAudience: "Millennials 28-40, brand-conscious consumers, experience seekers",
    },
    viral: {
      headline: `Wait... ${productName} is ACTUALLY Real?! 🤯`,
      bodyShort: `POV: You finally found THE product everyone's talking about.`,
      bodyLong: `Okay but hear me out... what if I told you ${productName} is about to break the internet? 👀 Everyone's sleeping on this rn but not for long. Don't be that person who finds out too late. The girlies know. The boys know. Now you know. You're welcome 😌`,
      hashtags: ["#TikTokMadeMeBuyIt", "#Viral", "#NeedIt", "#GameChanger", "#TrendAlert"],
      cta: "Get It Before It Sells Out",
      targetAudience: "Gen Z & Young Millennials 18-30, trend followers, social media savvy",
    },
    "short-form": {
      headline: `${productName}. Yes. Now. ⚡`,
      bodyShort: `No fluff. Just results.`,
      bodyLong: `Problem? Solved. Questions? Answered. ${productName}. That's it. That's the whole thing. Stop scrolling. Start doing.`,
      hashtags: ["#Quick", "#Easy", "#Done", "#LevelUp", "#GetIt"],
      cta: "Get Yours",
      targetAudience: "Mobile-first users 18-35, busy professionals, action-oriented buyers",
    },
  };

  return contentByStyle[styleId] || contentByStyle.simple;
};
