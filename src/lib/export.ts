import { GeneratedAd } from "@/types/ad";
import { saveAs } from "file-saver";

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export const formatAdForCopy = (ad: GeneratedAd): string => {
  return `
═══════════════════════════════════════
MORE.AD - Generated Advertisement
═══════════════════════════════════════

📢 HEADLINE
${ad.headline}

📝 SHORT COPY
${ad.bodyShort}

📄 LONG COPY
${ad.bodyLong}

#️⃣ HASHTAGS
${ad.hashtags.join(" ")}

🎯 CALL TO ACTION
${ad.cta}

👥 TARGET AUDIENCE
${ad.targetAudience}

📅 Generated: ${ad.createdAt.toLocaleDateString()}
🎨 Style: ${ad.style}

═══════════════════════════════════════
`.trim();
};

export const exportToTxt = (ad: GeneratedAd): void => {
  const content = formatAdForCopy(ad);
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  saveAs(blob, `moread-${ad.id}.txt`);
};

