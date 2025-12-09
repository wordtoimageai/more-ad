import { motion } from "framer-motion";
import { Upload, Wand2, Rocket } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload or Describe",
    description: "Add your product image, paste a URL, or describe your business in a few words.",
    step: "01",
  },
  {
    icon: Wand2,
    title: "AI Generates Ads",
    description: "Our AI creates optimized headlines, copy, hashtags, and stunning visuals instantly.",
    step: "02",
  },
  {
    icon: Rocket,
    title: "Launch & Grow",
    description: "Copy your ads directly to any platform. Watch your reach and sales multiply.",
    step: "03",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 relative" id="how-it-works">
      <div className="container px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            From idea to high-performing ads in three simple steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
            >
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-px bg-gradient-to-r from-primary/50 to-transparent z-0" />
              )}

              <div className="glass gradient-border rounded-2xl p-8 h-full hover:bg-card/80 transition-all duration-300 relative z-10">
                {/* Step Number */}
                <span className="absolute top-6 right-6 text-5xl font-extrabold text-muted/20">
                  {step.step}
                </span>

                {/* Icon */}
                <div className="w-16 h-16 rounded-xl gradient-bg flex items-center justify-center mb-6 neon-glow group-hover:neon-glow-intense transition-all duration-300">
                  <step.icon className="w-8 h-8 text-primary-foreground" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
