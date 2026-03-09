import { useState } from "react";
import { GeneratedAd } from "@/types/ad";
import { Copy, Check, Hash, Target, Megaphone, ImageIcon } from "lucide-react";
import { copyToClipboard } from "@/lib/export";

interface AdRawContentProps {
  ad: GeneratedAd;
}

const AdRawContent = ({ ad }: AdRawContentProps) => {
  return (
    <div className="space-y-4">
      <CopySection icon={<Megaphone className="w-4 h-4" />} title="Headline" content={ad.headline} />
      <CopySection icon={<span className="text-xs">📝</span>} title="Short Copy" content={ad.bodyShort} />
      <CopySection icon={<span className="text-xs">📄</span>} title="Long Copy" content={ad.bodyLong} />

      {/* Hashtags */}
      <div className="glass gradient-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Hash className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Hashtags</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {ad.hashtags.map((tag, index) => (
            <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* CTA & Style */}
      <div className="grid grid-cols-2 gap-3">
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

      <CopySection icon={<Target className="w-4 h-4" />} title="Target Audience" content={ad.targetAudience} />

      {/* Images */}
      {ad.images.length > 0 && (
        <div className="glass gradient-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Generated Creatives</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {ad.images.map((image, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
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
    </div>
  );
};

interface CopySectionProps {
  icon: React.ReactNode;
  title: string;
  content: string;
}

const CopySection = ({ icon, title, content }: CopySectionProps) => {
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
          className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1.5 hover:bg-muted rounded"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
        </button>
      </div>
      <p className="text-foreground">{content}</p>
    </div>
  );
};

export default AdRawContent;
