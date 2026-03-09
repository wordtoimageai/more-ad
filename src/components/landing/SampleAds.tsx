import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import sampleCoffee from "@/assets/sample-ad-coffee.jpg";
import sampleSkincare from "@/assets/sample-ad-skincare.jpg";
import sampleKitchen from "@/assets/sample-ad-kitchen.jpg";

const sampleAds = [
  {
    platform: "Instagram",
    headline: "Transform Your Morning ☕",
    body: "Start every day with the perfect brew. Our artisan coffee beans are sourced from the world's finest farms.",
    hashtags: "#CoffeeLovers #MorningRoutine #ArtisanCoffee",
    cta: "Shop Now",
    image: sampleCoffee,
    engagement: { likes: "12.4K", comments: "892" },
  },
  {
    platform: "TikTok",
    headline: "Wait for it... 🔥",
    body: "POV: You finally found skincare that actually works. 30-day transformation challenge starts NOW.",
    hashtags: "#SkincareTok #GlowUp #BeautyHacks",
    cta: "Try Free",
    image: sampleSkincare,
    engagement: { likes: "45.2K", comments: "2.1K" },
  },
  {
    platform: "Facebook",
    headline: "Your Dream Kitchen Awaits",
    body: "Professional-grade cookware at home chef prices. Join 50,000+ happy cooks who've upgraded their kitchen game.",
    hashtags: "#HomeChef #CookingLife #KitchenGoals",
    cta: "Learn More",
    image: sampleKitchen,
    engagement: { likes: "8.7K", comments: "645" },
  },
];

const SampleAds = () => {
  return (
    <section className="py-24 relative overflow-hidden" id="samples">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="container px-4 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            See What <span className="gradient-text">AI Creates</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Real examples of ads generated in seconds
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {sampleAds.map((ad, index) => (
            <motion.div
              key={ad.platform}
              className="glass gradient-border rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
            >
              {/* Platform Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <span className="text-sm font-semibold text-primary">{ad.platform}</span>
                <span className="text-xs text-muted-foreground">Sponsored</span>
              </div>

              {/* Ad Image Placeholder */}
              <div className="aspect-square overflow-hidden">
                <img 
                  src={ad.image} 
                  alt={`${ad.platform} ad example - ${ad.headline}`}
                  loading="lazy"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Ad Content */}
              <div className="p-5">
                <h3 className="font-bold text-lg mb-2">{ad.headline}</h3>
                <p className="text-muted-foreground text-sm mb-3">{ad.body}</p>
                <p className="text-primary text-xs mb-4">{ad.hashtags}</p>

                {/* CTA Button */}
                <div className="gradient-bg text-primary-foreground text-center py-2 rounded-lg text-sm font-semibold mb-4">
                  {ad.cta}
                </div>

                {/* Engagement */}
                <div className="flex items-center justify-between text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                      <Heart className="w-4 h-4" />
                      <span className="text-xs">{ad.engagement.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-xs">{ad.engagement.comments}</span>
                    </button>
                    <button className="hover:text-primary transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                  <button className="hover:text-primary transition-colors">
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SampleAds;
