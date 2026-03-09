import { GeneratedAd } from "@/types/ad";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";

interface AdSocialPreviewProps {
  ad: GeneratedAd;
}

const AdSocialPreview = ({ ad }: AdSocialPreviewProps) => {
  return (
    <div className="space-y-6">
      {/* Instagram-style Preview */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        {/* Post Header */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-xs font-bold text-primary-foreground">
            Ad
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">your_brand</p>
            <p className="text-xs text-muted-foreground">Sponsored</p>
          </div>
          <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* Post Image */}
        {ad.images.length > 0 && (
          <div className="aspect-square bg-muted relative overflow-hidden">
            <img
              src={ad.images[0]}
              alt="Ad creative"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Post Actions */}
        <div className="px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Heart className="w-6 h-6 text-foreground cursor-pointer hover:text-destructive transition-colors" />
              <MessageCircle className="w-6 h-6 text-foreground cursor-pointer" />
              <Send className="w-6 h-6 text-foreground cursor-pointer" />
            </div>
            <Bookmark className="w-6 h-6 text-foreground cursor-pointer" />
          </div>

          {/* Caption */}
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-semibold">your_brand</span>{" "}
              {ad.bodyShort}
            </p>
            <p className="text-sm text-primary">
              {ad.hashtags.slice(0, 5).join(" ")}
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="px-4 pb-4">
          <button className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
            {ad.cta}
          </button>
        </div>
      </div>

      {/* Facebook-style Preview */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-xs font-bold text-primary-foreground">
              Ad
            </div>
            <div>
              <p className="text-sm font-semibold">Your Brand</p>
              <p className="text-xs text-muted-foreground">Sponsored · 🌐</p>
            </div>
          </div>
          <p className="text-sm mb-3">{ad.bodyShort}</p>
        </div>

        {/* Link Preview Card */}
        {ad.images.length > 0 && (
          <div className="bg-muted">
            <div className="aspect-video overflow-hidden">
              <img
                src={ad.images[0]}
                alt="Ad creative"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="px-4 py-3 border-t border-border bg-muted/50">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">more.ad</p>
              <p className="text-sm font-semibold line-clamp-1">{ad.headline}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{ad.bodyShort}</p>
            </div>
          </div>
        )}

        <div className="px-4 py-3">
          <button className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm">
            {ad.cta}
          </button>
        </div>
      </div>

      {/* Additional Creatives Grid */}
      {ad.images.length > 1 && (
        <div>
          <h4 className="text-sm font-semibold mb-3 text-muted-foreground">All Creatives</h4>
          <div className="grid grid-cols-3 gap-2">
            {ad.images.map((image, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
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

export default AdSocialPreview;
