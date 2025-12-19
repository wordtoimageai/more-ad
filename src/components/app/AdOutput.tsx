import { motion } from "framer-motion";
import { GeneratedAd } from "@/types/ad";
import { Button } from "@/components/ui/button";
import { Copy, Download, Check, Hash, Target, Megaphone, ImageIcon, Share2, Link } from "lucide-react";
import { useState } from "react";
import { copyToClipboard, formatAdForCopy, exportToTxt } from "@/lib/export";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AdOutputProps {
  ad: GeneratedAd | null;
  isGenerating: boolean;
  onAdUpdate?: (ad: GeneratedAd) => void;
}

const AdOutput = ({ ad, isGenerating, onAdUpdate }: AdOutputProps) => {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleCopyAll = async () => {
    if (!ad) return;
    const success = await copyToClipboard(formatAdForCopy(ad));
    if (success) {
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Ad content copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExport = () => {
    if (!ad) return;
    exportToTxt(ad);
    toast({
      title: "Exported!",
      description: "Ad saved as .txt file",
    });
  };

  const handleShare = async () => {
    if (!ad) return;
    setIsSharing(true);

    try {
      let shareToken = ad.shareToken;

      if (!shareToken) {
        // Generate a secure share token server-side
        const { data, error } = await supabase.rpc('generate_share_token', { 
          p_ad_id: ad.id 
        });

        if (error) throw error;
        shareToken = data;

        // Update local state
        if (onAdUpdate) {
          onAdUpdate({ ...ad, shareToken });
        }
      }

      const shareUrl = `${window.location.origin}/share/${shareToken}`;
      await navigator.clipboard.writeText(shareUrl);
      
      toast({
        title: "Link copied!",
        description: "Share link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate share link",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="h-full flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-bg animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground">Generating your perfect ad...</p>
        </motion.div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="h-full flex items-center justify-center">
        <motion.div
          className="text-center max-w-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
            <Megaphone className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Ready to Create</h3>
          <p className="text-muted-foreground text-sm">
            Enter your product details and click Generate to create high-converting ads
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Floating Action Buttons */}
      <div className="flex gap-2 sticky top-0 z-10 bg-background/80 backdrop-blur-sm pb-4">
        <Button
          onClick={handleCopyAll}
          variant="gradient"
          className="flex-1"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy All
            </>
          )}
        </Button>
        <Button
          onClick={handleShare}
          variant="outline"
          className="flex-1"
          disabled={isSharing}
        >
          <Share2 className="w-4 h-4" />
          {ad.shareToken ? "Copy Link" : "Share"}
        </Button>
        <Button
          onClick={handleExport}
          variant="outline"
          size="icon"
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>

      {/* Headline */}
      <OutputSection
        icon={<Megaphone className="w-4 h-4" />}
        title="Headline"
        content={ad.headline}
      />

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

      {/* CTA & Target */}
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
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

interface OutputSectionProps {
  icon: React.ReactNode;
  title: string;
  content: string;
}

const OutputSection = ({ icon, title, content }: OutputSectionProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass gradient-border rounded-xl p-4 group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-primary">{icon}</span>
          <span className="text-sm font-semibold">{title}</span>
        </div>
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-muted rounded"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-primary" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>
      </div>
      <p className="text-foreground">{content}</p>
    </div>
  );
};

export default AdOutput;
