import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { GeneratedAd, RTL_LANGUAGES } from "@/types/ad";
import { Loader2, Hash, Target, Megaphone, ImageIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

function updateMetaTags({ title, description, image, url }: { title: string; description: string; image: string; url: string }) {
  const setMeta = (property: string, content: string) => {
    let el = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
    if (!el) {
      el = document.createElement("meta");
      if (property.startsWith("og:") || property.startsWith("twitter:")) {
        el.setAttribute("property", property);
      } else {
        el.setAttribute("name", property);
      }
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  };

  document.title = title;
  setMeta("og:title", title);
  setMeta("og:description", description);
  setMeta("og:image", image);
  setMeta("og:url", url);
  setMeta("og:type", "article");
  setMeta("twitter:card", "summary_large_image");
  setMeta("twitter:title", title);
  setMeta("twitter:description", description);
  setMeta("twitter:image", image);
}

const SharePage = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [ad, setAd] = useState<GeneratedAd | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedAd = async () => {
      if (!shareToken) {
        setError("Invalid share link");
        setLoading(false);
        return;
      }

      // Use secure RPC function that doesn't expose user_id
      const { data, error: fetchError } = await supabase
        .rpc("get_shared_ad", { p_share_token: shareToken })
        .single();

      if (fetchError || !data) {
        setError("Ad not found or link has expired");
        setLoading(false);
        return;
      }

      const adData = data as any;
      const adLanguage = adData.language || "auto";
      setAd({
        id: data.id,
        headline: data.headline,
        bodyShort: data.body_short,
        bodyLong: data.body_long,
        hashtags: data.hashtags,
        cta: data.cta,
        targetAudience: data.target_audience,
        images: data.images,
        style: data.style,
        language: adLanguage,
        createdAt: new Date(data.created_at),
        input: {
          type: data.input_type as "image" | "url" | "description",
          value: data.input_value,
        },
      });

      // Set OG meta tags dynamically for client-side rendering
      updateMetaTags({
        title: `${data.headline} | More.ad`,
        description: data.body_short,
        image: data.images?.[0] || "https://more-ad.lovable.app/favicon.png",
        url: `${window.location.origin}/share/${shareToken}`,
      });

      setLoading(false);
    };

    fetchSharedAd();
  }, [shareToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !ad) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">Oops!</h1>
          <p className="text-muted-foreground mb-6">{error || "Something went wrong"}</p>
          <Link to="/">
            <Button variant="gradient">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <Link to="/auth">
            <Button variant="gradient" size="sm">
              Create Your Own Ad
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          className="space-y-6"
          dir={ad.language && RTL_LANGUAGES.includes(ad.language) ? "rtl" : "ltr"}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <p className="text-sm text-muted-foreground mb-2">Shared Ad</p>
            <h1 className="text-2xl font-bold">{ad.headline}</h1>
          </div>

          {/* Short Copy */}
          <OutputSection
            icon={<span className="text-xs">📝</span>}
            title="Short Copy"
            content={ad.bodyShort}
          />

          {/* Long Copy */}
          <OutputSection
            icon={<span className="text-xs">📄</span>}
            title="Long Copy"
            content={ad.bodyLong}
          />

          {/* Hashtags */}
          <div className="glass gradient-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Hash className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Hashtags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {ad.hashtags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* CTA & Style */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass gradient-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs">🎯</span>
                <span className="text-sm font-semibold">CTA</span>
              </div>
              <p className="text-primary font-bold">{ad.cta}</p>
            </div>
            <div className="glass gradient-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Style</span>
              </div>
              <p className="text-muted-foreground text-sm">{ad.style}</p>
            </div>
          </div>

          {/* Target Audience */}
          <OutputSection
            icon={<Target className="w-4 h-4" />}
            title="Target Audience"
            content={ad.targetAudience}
          />

          {/* Generated Images */}
          {ad.images.length > 0 && (
            <div className="glass gradient-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Suggested Creatives</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {ad.images.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden bg-muted"
                  >
                    <img
                      src={image}
                      alt={`Creative ${index + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA Banner */}
          <div className="glass gradient-border rounded-xl p-6 text-center mt-8">
            <Megaphone className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Want to create ads like this?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Generate high-converting ads in seconds with AI
            </p>
            <Link to="/auth">
              <Button variant="gradient">Get Started Free</Button>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

interface OutputSectionProps {
  icon: React.ReactNode;
  title: string;
  content: string;
}

const OutputSection = ({ icon, title, content }: OutputSectionProps) => (
  <div className="glass gradient-border rounded-xl p-4">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-primary">{icon}</span>
      <span className="text-sm font-semibold">{title}</span>
    </div>
    <p className="text-foreground">{content}</p>
  </div>
);

export default SharePage;
