import { motion } from "framer-motion";
import { GeneratedAd, RTL_LANGUAGES } from "@/types/ad";
import { Button } from "@/components/ui/button";
import { Copy, Download, Check, Share2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { copyToClipboard, formatAdForCopy, exportToTxt } from "@/lib/export";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdSocialPreview from "./AdSocialPreview";
import AdRawContent from "./AdRawContent";

interface AdOutputProps {
  ad: GeneratedAd | null;
  isGenerating: boolean;
  onAdUpdate?: (ad: GeneratedAd) => void;
  onRegenerate?: () => void;
}

const AdOutput = ({ ad, isGenerating, onAdUpdate, onRegenerate }: AdOutputProps) => {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleCopyAll = async () => {
    if (!ad) return;
    const success = await copyToClipboard(formatAdForCopy(ad));
    if (success) {
      setCopied(true);
      toast({ title: "Copied!", description: "Ad content copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExport = () => {
    if (!ad) return;
    exportToTxt(ad);
    toast({ title: "Exported!", description: "Ad saved as .txt file" });
  };

  const handleShare = async () => {
    if (!ad) return;
    setIsSharing(true);
    try {
      let shareToken = ad.shareToken;
      if (!shareToken) {
        const { data, error } = await supabase.rpc('generate_share_token', { p_ad_id: ad.id });
        if (error) throw error;
        shareToken = data;
        if (onAdUpdate) onAdUpdate({ ...ad, shareToken });
      }
      const shareUrl = `${window.location.origin}/share/${shareToken}`;
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied!", description: "Share link copied to clipboard" });
    } catch {
      toast({ title: "Error", description: "Failed to generate share link", variant: "destructive" });
    } finally {
      setIsSharing(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full gradient-bg flex items-center justify-center">
            <div className="w-10 h-10 border-3 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Crafting Your Ad</h3>
          <p className="text-muted-foreground text-sm">AI is generating copy & visuals…</p>
        </motion.div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <motion.div className="text-center max-w-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-muted/50 flex items-center justify-center">
            <span className="text-4xl">📢</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Ready to Create</h3>
          <p className="text-muted-foreground text-sm">
            Describe your product on the left and click Generate to create professional ads
          </p>
        </motion.div>
      </div>
    );
  }

  const isRtl = RTL_LANGUAGES.includes(ad.language);

  return (
    <motion.div
      className="space-y-4"
      dir={isRtl ? "rtl" : "ltr"}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Action Bar */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={handleCopyAll} variant="gradient" size="sm" className="flex-1 min-w-[100px]">
          {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy All</>}
        </Button>
        <Button onClick={handleShare} variant="outline" size="sm" className="flex-1 min-w-[100px]" disabled={isSharing}>
          <Share2 className="w-4 h-4" />
          {ad.shareToken ? "Copy Link" : "Share"}
        </Button>
        {onRegenerate && (
          <Button onClick={onRegenerate} variant="outline" size="sm" className="flex-1 min-w-[100px]">
            <RefreshCw className="w-4 h-4" /> Regenerate
          </Button>
        )}
        <Button onClick={handleExport} variant="outline" size="icon" className="shrink-0">
          <Download className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="preview">📱 Social Preview</TabsTrigger>
          <TabsTrigger value="raw">📋 Raw Copy</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="mt-4 space-y-4">
          <AdSocialPreview ad={ad} />
        </TabsContent>

        <TabsContent value="raw" className="mt-4 space-y-4">
          <AdRawContent ad={ad} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default AdOutput;
