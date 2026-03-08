import { useEffect } from "react";

interface DocumentMeta {
  title: string;
  description?: string;
}

const DEFAULT_TITLE = "More.ad - AI-Powered Ad Generation";
const DEFAULT_DESCRIPTION = "Create high-converting ad copy in seconds with AI. Generate compelling headlines, body copy, hashtags, and CTAs for any product or service.";

export function useDocumentMeta({ title, description }: DocumentMeta) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute("content") ?? "";
    if (metaDesc && description) {
      metaDesc.setAttribute("content", description);
    }

    return () => {
      document.title = prevTitle;
      if (metaDesc) metaDesc.setAttribute("content", prevDesc);
    };
  }, [title, description]);
}

export { DEFAULT_TITLE, DEFAULT_DESCRIPTION };
