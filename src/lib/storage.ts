import { GeneratedAd, AdHistory } from "@/types/ad";

const STORAGE_KEY = "moread_history";

export const saveToHistory = (ad: GeneratedAd): void => {
  const history = getHistory();
  history.ads.unshift(ad);
  // Keep only last 50 ads
  if (history.ads.length > 50) {
    history.ads = history.ads.slice(0, 50);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
};

export const getHistory = (): AdHistory => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return { ads: [] };
  }
  try {
    const parsed = JSON.parse(stored);
    // Convert date strings back to Date objects
    parsed.ads = parsed.ads.map((ad: GeneratedAd) => ({
      ...ad,
      createdAt: new Date(ad.createdAt),
    }));
    return parsed;
  } catch {
    return { ads: [] };
  }
};

export const clearHistory = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const deleteFromHistory = (id: string): void => {
  const history = getHistory();
  history.ads = history.ads.filter((ad) => ad.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
};

