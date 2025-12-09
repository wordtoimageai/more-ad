import { motion } from "framer-motion";
import { 
  Zap, 
  Target, 
  Layers, 
  ImageIcon, 
  Hash, 
  Globe2,
  BarChart3,
  Clock
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Generation",
    description: "Get complete ad campaigns in seconds, not hours",
  },
  {
    icon: Target,
    title: "Smart Targeting",
    description: "AI-powered audience suggestions for maximum reach",
  },
  {
    icon: Layers,
    title: "Multiple Variations",
    description: "Generate 5+ ad versions to A/B test and optimize",
  },
  {
    icon: ImageIcon,
    title: "AI Creatives",
    description: "Stunning visuals generated to match your brand",
  },
  {
    icon: Hash,
    title: "Hashtag Research",
    description: "Trending and relevant hashtags auto-selected",
  },
  {
    icon: Globe2,
    title: "Multi-Platform",
    description: "Optimized for Facebook, Instagram, TikTok, and more",
  },
  {
    icon: BarChart3,
    title: "Performance Tips",
    description: "Get suggestions to improve ad performance",
  },
  {
    icon: Clock,
    title: "Save History",
    description: "Access all your generated ads anytime",
  },
];

const Features = () => {
  return (
    <section className="py-24 relative" id="features">
      <div className="container px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            Everything You <span className="gradient-text">Need</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Powerful features to create ads that convert
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group p-6 rounded-2xl bg-card/50 hover:bg-card border border-border/50 hover:border-primary/30 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
