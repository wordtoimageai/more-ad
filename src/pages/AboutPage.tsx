import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { motion } from "framer-motion";
import { Target, Heart, Zap, Users } from "lucide-react";

const values = [
  { icon: Target, title: "Mission-Driven", description: "We believe every business deserves access to professional advertising, regardless of budget or expertise." },
  { icon: Heart, title: "Creator-First", description: "Everything we build starts with creators and small business owners in mind." },
  { icon: Zap, title: "Innovation", description: "We push the boundaries of AI to deliver ads that actually convert." },
  { icon: Users, title: "Community", description: "We're building a global community of creators who support each other." },
];

const AboutPage = () => {
  useDocumentMeta({
    title: "About More.ad - Our Mission & Story",
    description: "Learn about More.ad's mission to democratize advertising with AI. We help creators and businesses generate high-converting ads in seconds.",
    ogUrl: "https://more.ad/about",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
              About <span className="gradient-text">More.ad</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              More.ad was born from a simple idea: creating great ads shouldn't require an agency, a big budget, or hours of copywriting. Our AI-powered platform lets anyone generate professional, high-converting ad copy in seconds — for any platform, any product, any audience.
            </p>
          </motion.div>

          <motion.div
            className="max-w-4xl mx-auto mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-center mb-10">Our Values</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {values.map((value, i) => (
                <div key={value.title} className="glass gradient-border rounded-2xl p-6">
                  <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4">
                    <value.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We started More.ad because we saw too many great products fail — not because they weren't good, but because their creators couldn't afford professional advertising. We set out to level the playing field with AI.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Today, thousands of creators, freelancers, and small businesses use More.ad to generate ads that compete with those made by top agencies — in a fraction of the time and cost.
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
