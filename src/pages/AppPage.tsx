import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import AdInput from "@/components/app/AdInput";
import AdOutput from "@/components/app/AdOutput";
import AdHistory from "@/components/app/AdHistory";
import { GeneratedAd } from "@/types/ad";
import { generateAd } from "@/lib/adGenerator";
import { saveAdToCloud } from "@/lib/cloudStorage";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { History, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export default function AppPage() {
  useDocumentMeta({ title: "Create Ad | More.ad", description: "Generate high-converting ad copy with AI. Describe your product and get instant headlines, body copy, and CTAs." });
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut, isAuthenticated } = useAuth();
  const [currentAd, setCurrentAd] = useState<GeneratedAd | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // Session timeout - auto logout after 15 minutes of inactivity
  useSessionTimeout(isAuthenticated);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleGenerate = async (
    input: string,
    inputType: "image" | "url" | "description",
    styleId: string
  ) => {
    setIsGenerating(true);
    try {
      const ad = await generateAd(input, inputType, styleId);
      
      // Save to cloud and get the DB-generated UUID
      const dbId = await saveAdToCloud(ad);
      const adWithDbId = { ...ad, id: dbId };
      setCurrentAd(adWithDbId);
      toast.success("Ad generated and saved!");
    } catch (error) {
      console.error("Error generating ad:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate ad");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectAd = (ad: GeneratedAd) => {
    setCurrentAd(ad);
    setIsHistoryOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <Logo size="sm" />
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsHistoryOpen(true)}
              className="relative"
            >
              <History className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
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
            <AdOutput ad={currentAd} isGenerating={isGenerating} onAdUpdate={setCurrentAd} />
          </motion.div>
        </div>
      </main>

      {/* History Sidebar */}
      <AdHistory
        onSelectAd={handleSelectAd}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
}
