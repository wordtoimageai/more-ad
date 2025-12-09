import { motion } from "framer-motion";
import { GeneratedAd } from "@/types/ad";
import { getHistory, deleteFromHistory, clearHistory } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Clock, Trash2, X } from "lucide-react";
import { useState, useEffect } from "react";

interface AdHistoryProps {
  onSelectAd: (ad: GeneratedAd) => void;
  isOpen: boolean;
  onClose: () => void;
}

const AdHistory = ({ onSelectAd, isOpen, onClose }: AdHistoryProps) => {
  const [history, setHistory] = useState<GeneratedAd[]>([]);

  useEffect(() => {
    if (isOpen) {
      const data = getHistory();
      setHistory(data.ads);
    }
  }, [isOpen]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteFromHistory(id);
    setHistory(history.filter((ad) => ad.id !== id));
  };

  const handleClearAll = () => {
    clearHistory();
    setHistory([]);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg">History</h2>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-destructive hover:text-destructive"
              >
                Clear All
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100%-65px)] p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No history yet</p>
              <p className="text-muted-foreground text-sm">
                Generated ads will appear here
              </p>
            </div>
          ) : (
            history.map((ad) => (
              <motion.div
                key={ad.id}
                className="p-4 rounded-xl bg-muted/50 border border-border hover:border-primary/50 cursor-pointer group transition-all"
                onClick={() => {
                  onSelectAd(ad);
                  onClose();
                }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{ad.headline}</p>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {ad.bodyShort}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                        {ad.style}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(ad.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(ad.id, e)}
                    className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 rounded transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdHistory;
