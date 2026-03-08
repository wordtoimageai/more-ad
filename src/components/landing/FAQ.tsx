import { useEffect } from "react";
import { motion } from "framer-motion";
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does More.ad generate ads?",
    answer: "More.ad uses advanced AI models to analyze your product, brand, or description and generate optimized ad copy, hashtags, and targeting suggestions. Our AI is trained on millions of high-performing ads across all major platforms.",
  },
  {
    question: "Which platforms are supported?",
    answer: "We support all major advertising platforms including Facebook, Instagram, TikTok, Google Search, YouTube Shorts, and X (Twitter). Each ad is automatically optimized for the platform's best practices and format requirements.",
  },
  {
    question: "Can I generate images for my ads?",
    answer: "Yes! Pro and Business plans include AI-powered image generation. Simply describe your product or upload a reference, and our AI will create stunning, on-brand visuals perfect for your ads.",
  },
  {
    question: "Is there a free trial?",
    answer: "Absolutely! Our Free plan gives you 5 ad generations per month at no cost. This is perfect for testing the platform and seeing the quality of our AI-generated content before upgrading.",
  },
  {
    question: "How accurate is the targeting suggestion?",
    answer: "Our AI analyzes your product and audience to suggest highly relevant targeting options. These suggestions are based on successful campaigns in similar industries and are designed to maximize your reach and conversions.",
  },
  {
    question: "Can I export my ads?",
    answer: "Yes! Free users can copy ads to clipboard. Pro and Business users can export to .txt or .docx files, and Business users get white-label exports for agency use.",
  },
];

const FAQ = () => {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "faq-schema";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { document.getElementById("faq-schema")?.remove(); };
  }, []);

  return (
      <div className="container px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Everything you need to know about More.ad
          </p>
        </motion.div>

        <motion.div 
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="glass gradient-border rounded-xl px-6 border-none"
              >
                <AccordionTrigger className="text-left hover:no-underline py-5">
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
