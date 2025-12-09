import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { AD_STYLES } from "@/types/ad";
import { Upload, Link, FileText, Sparkles } from "lucide-react";

interface AdInputProps {
  onGenerate: (input: string, inputType: "image" | "url" | "description", styleId: string) => void;
  isGenerating: boolean;
}

const AdInput = ({ onGenerate, isGenerating }: AdInputProps) => {
  const [inputType, setInputType] = useState<"image" | "url" | "description">("description");
  const [inputValue, setInputValue] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("simple");

  const inputTypes = [
    { id: "description", label: "Description", icon: FileText },
    { id: "url", label: "URL", icon: Link },
    { id: "image", label: "Image", icon: Upload },
  ];

  const handleGenerate = () => {
    if (!inputValue.trim()) return;
    onGenerate(inputValue, inputType, selectedStyle);
  };

  return (
    <div className="space-y-6">
      {/* Input Type Selector */}
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-3 block">
          Input Type
        </label>
        <div className="flex gap-2">
          {inputTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setInputType(type.id as "image" | "url" | "description")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                inputType === type.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50 text-muted-foreground"
              }`}
            >
              <type.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Field */}
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-3 block">
          {inputType === "description" && "Describe your product or business"}
          {inputType === "url" && "Paste your product URL"}
          {inputType === "image" && "Upload or paste image URL"}
        </label>
        {inputType === "description" ? (
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="E.g., Premium organic coffee beans sourced from Colombian highlands, perfect for coffee enthusiasts who appreciate rich, bold flavors..."
            className="min-h-[120px] bg-muted/50 border-border focus:border-primary resize-none"
          />
        ) : (
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              inputType === "url"
                ? "https://yourstore.com/product"
                : "https://example.com/image.jpg"
            }
            className="bg-muted/50 border-border focus:border-primary"
          />
        )}
      </div>

      {/* Style Selector */}
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-3 block">
          Ad Style
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {AD_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedStyle === style.id
                  ? "border-primary bg-primary/10 neon-glow"
                  : "border-border hover:border-primary/50 bg-muted/30"
              }`}
            >
              <span className="text-xl mb-1 block">{style.icon}</span>
              <span className="text-sm font-medium block">{style.name}</span>
              <span className="text-xs text-muted-foreground line-clamp-1">
                {style.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={handleGenerate}
          disabled={!inputValue.trim() || isGenerating}
          variant="gradient"
          size="xl"
          className="w-full"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Ads
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
};

export default AdInput;
