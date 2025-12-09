import { useState } from "react";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import AdInput from "@/components/app/AdInput";
import AdOutput from "@/components/app/AdOutput";
import AdHistory from "@/components/app/AdHistory";
import { GeneratedAd } from "@/types/ad";
import { generateAd } from "@/lib/adGenerator";
import { saveToHistory } from "@/lib/storage";
import { Link } from "react-router-dom";
import { History, Home } from "lucide-react";

const AppPage = () => {
  const [generatedAd, setGeneratedAd] = useState<GeneratedAd | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const handleGenerate = async (
    input: string,
    inputType: "image" | "url" | "description",
    styleId: string
  ) => {
    setIsGenerating(true);
    try {
      const ad = await generateAd(input, inputType, styleId);
      setGeneratedAd(ad);
      saveToHistory(ad);
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectFromHistory = (ad: GeneratedAd) => {
    setGeneratedAd(ad);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="container px-4 h-16 flex items-center justify-between">
          <Link to="/">
            <Logo size="sm" />
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Home</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHistoryOpen(true)}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">History</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-8">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            Create Your <span className="gradient-text">Perfect Ad</span>
          </h1>
          <p className="text-muted-foreground">
            Describe your product and let AI do the magic
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Input Panel */}
          <motion.div
            className="glass gradient-border rounded-2xl p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-sm">
                1
              </span>
              Input
            </h2>
            <AdInput onGenerate={handleGenerate} isGenerating={isGenerating} />
          </motion.div>

          {/* Output Panel */}
          <motion.div
            className="glass gradient-border rounded-2xl p-6 min-h-[500px]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-sm">
                2
              </span>
              Generated Ad
            </h2>
            <AdOutput ad={generatedAd} isGenerating={isGenerating} />
          </motion.div>
        </div>
      </main>

      {/* History Sidebar */}
      <AdHistory
        onSelectAd={handleSelectFromHistory}
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
    </div>
  );
};

export default AppPage;
