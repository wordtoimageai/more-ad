import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { motion } from "framer-motion";

const sections = [
  { title: "Information We Collect", content: "We collect information you provide directly, such as your name, email address, and any content you submit through our platform. We also collect usage data including pages visited, features used, and device information to improve our services." },
  { title: "How We Use Your Information", content: "We use your information to provide and improve our services, communicate with you about your account, send product updates, and ensure the security of our platform. We do not sell your personal data to third parties." },
  { title: "Data Storage & Security", content: "Your data is stored securely using industry-standard encryption. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, or destruction." },
  { title: "Cookies & Tracking", content: "We use essential cookies to maintain your session and preferences. Analytics cookies help us understand how our platform is used. You can manage cookie preferences through your browser settings." },
  { title: "Third-Party Services", content: "We may use third-party services for analytics, payment processing, and AI model inference. These providers are bound by their own privacy policies and our data processing agreements." },
  { title: "Your Rights", content: "You have the right to access, correct, or delete your personal data. You may also request data portability or restrict processing. Contact us at privacy@more-ad.com to exercise these rights." },
  { title: "Changes to This Policy", content: "We may update this privacy policy from time to time. We will notify you of significant changes by email or through a notice on our platform. Continued use of the service constitutes acceptance of the updated policy." },
];

const PrivacyPage = () => {
  useDocumentMeta({
    title: "Privacy Policy - More.ad",
    description: "Read More.ad's privacy policy to understand how we collect, use, and protect your personal information.",
    ogUrl: "https://more.ad/privacy",
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
              Privacy <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-muted-foreground text-center mb-2">Last updated: March 8, 2026</p>
            <p className="text-muted-foreground text-center mb-12">
              Your privacy matters to us. This policy explains how More.ad handles your data.
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

export default PrivacyPage;
