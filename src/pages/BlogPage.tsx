import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

const posts = [
  {
    title: "5 Tips for Writing High-Converting Ad Copy",
    excerpt: "Learn the proven techniques that top marketers use to craft ad copy that drives clicks, engagement, and conversions.",
    date: "2026-03-05",
    category: "Tips & Tricks",
  },
  {
    title: "How AI Is Transforming Digital Advertising",
    excerpt: "Discover how artificial intelligence is reshaping the advertising landscape and what it means for your business.",
    date: "2026-02-28",
    category: "Industry",
  },
  {
    title: "Platform-Specific Ad Strategies for 2026",
    excerpt: "A comprehensive guide to optimizing your ads for Facebook, Instagram, TikTok, Google, and more.",
    date: "2026-02-20",
    category: "Strategy",
  },
  {
    title: "More.ad Launch: What's New and What's Coming",
    excerpt: "We're excited to announce the launch of More.ad with AI-powered ad generation, multi-platform support, and more.",
    date: "2026-02-15",
    category: "Product",
  },
];

const BlogPage = () => {
  useDocumentMeta({
    title: "More.ad Blog - Ad Tips, AI Insights & Product Updates",
    description: "Stay up to date with the latest in AI advertising, copywriting tips, platform strategies, and More.ad product news.",
    ogUrl: "https://more.ad/blog",
    noIndex: true,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              The More.ad <span className="gradient-text">Blog</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Tips, strategies, and updates from the world of AI-powered advertising
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto grid gap-6">
            {posts.map((post, i) => (
              <motion.article
                key={post.title}
                className="glass gradient-border rounded-2xl p-6 md:p-8 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <span className="text-xs font-semibold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full ml-auto">
                    Coming Soon
                  </span>
                </div>
                <h2 className="text-xl font-bold mb-2">
                  {post.title}
                </h2>
                <p className="text-muted-foreground text-sm">{post.excerpt}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPage;
