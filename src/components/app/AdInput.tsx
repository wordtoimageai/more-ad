import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { AD_STYLES, SUPPORTED_LANGUAGES } from "@/types/ad";
import { Upload, Link, FileText, Sparkles, Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdInputProps {
  onGenerate: (input: string, inputType: "image" | "url" | "description", styleId: string, language: string) => void;
  isGenerating: boolean;
}

const AdInput = ({ onGenerate, isGenerating }: AdInputProps) => {
  const [inputType, setInputType] = useState<"image" | "url" | "description">("description");
  const [inputValue, setInputValue] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("simple");
  const [selectedLanguage, setSelectedLanguage] = useState("auto");

  const inputTypes = [
    { id: "description", label: "Description", icon: FileText },
    { id: "url", label: "URL", icon: Link },
    { id: "image", label: "Image URL", icon: Upload },
  ];

  const handleGenerate = () => {
    if (!inputValue.trim()) return;
    onGenerate(inputValue, inputType, selectedStyle, selectedLanguage);
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

      {/* Language Selector */}
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-3 block flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Output Language
        </label>
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger className="bg-muted/50 border-border">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <SelectItem key={lang.id} value={lang.id}>
                <span className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
