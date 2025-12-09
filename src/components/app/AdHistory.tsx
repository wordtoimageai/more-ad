import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GeneratedAd } from "@/types/ad";
import { getCloudHistory, deleteFromCloudHistory, clearCloudHistory } from "@/lib/cloudStorage";
import { toast } from "sonner";

interface AdHistoryProps {
  onSelectAd: (ad: GeneratedAd) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function AdHistory({ onSelectAd, isOpen, onClose }: AdHistoryProps) {
  const [history, setHistory] = useState<GeneratedAd[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const ads = await getCloudHistory();
      setHistory(ads);
    } catch (error) {
      console.error("Error loading history:", error);
      toast.error("Failed to load history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteFromCloudHistory(id);
      setHistory(history.filter((ad) => ad.id !== id));
      toast.success("Ad deleted");
    } catch (error) {
      toast.error("Failed to delete ad");
    }
  };

  const handleClearAll = async () => {
    try {
      await clearCloudHistory();
      setHistory([]);
      toast.success("History cleared");
    } catch (error) {
      toast.error("Failed to clear history");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Ad History</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No history yet</p>
                  <p className="text-sm mt-1">Generated ads will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((ad) => (
                    <motion.div
                      key={ad.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-background/50 border border-border hover:border-primary/50 cursor-pointer transition-all group"
                      onClick={() => onSelectAd(ad)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{ad.headline}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {ad.bodyShort}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                              {ad.style}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(ad.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => handleDelete(ad.id, e)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {history.length > 0 && (
              <div className="p-4 border-t border-border">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleClearAll}
                >
                  Clear All History
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
