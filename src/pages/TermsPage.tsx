import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { motion } from "framer-motion";

const sections = [
  { title: "Acceptance of Terms", content: "By accessing or using More.ad, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform." },
  { title: "Description of Service", content: "More.ad provides an AI-powered advertising content generation platform. We offer tools to create ad copy, headlines, hashtags, and visual content for various advertising platforms." },
  { title: "User Accounts", content: "You must create an account to access certain features. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account." },
  { title: "Acceptable Use", content: "You agree not to use More.ad for generating content that is illegal, misleading, defamatory, or violates the rights of others. We reserve the right to suspend accounts that violate these guidelines." },
  { title: "Intellectual Property", content: "Content generated through More.ad is owned by you, the user. However, More.ad retains all rights to its platform, technology, and branding. You may not copy, modify, or distribute our platform code." },
  { title: "Payment & Subscriptions", content: "Paid plans are billed according to the pricing displayed at the time of purchase. Subscriptions auto-renew unless cancelled. Refunds are handled on a case-by-case basis." },
  { title: "Limitation of Liability", content: "More.ad is provided \"as is\" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform." },
  { title: "Termination", content: "We may terminate or suspend your account at our discretion for violation of these terms. You may delete your account at any time through your account settings." },
  { title: "Changes to Terms", content: "We may modify these terms at any time. Continued use of the platform after changes constitutes acceptance. We will notify users of material changes via email." },
];

const TermsPage = () => {
  useDocumentMeta({
    title: "Terms of Service - More.ad",
    description: "Read the More.ad Terms of Service to understand the rules and guidelines for using our AI-powered ad generation platform.",
    ogUrl: "https://more.ad/terms",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container px-4">
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-center">
              Terms of <span className="gradient-text">Service</span>
            </h1>
            <p className="text-muted-foreground text-center mb-2">Last updated: March 8, 2026</p>
            <p className="text-muted-foreground text-center mb-12">
              Please read these terms carefully before using More.ad.
            </p>

            <div className="space-y-8">
              {sections.map((section, i) => (
                <div key={section.title}>
                  <h2 className="text-xl font-bold mb-2">{i + 1}. {section.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsPage;
