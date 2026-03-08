import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import SampleAds from "@/components/landing/SampleAds";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import { useDocumentMeta, DEFAULT_TITLE, DEFAULT_DESCRIPTION } from "@/hooks/useDocumentMeta";

const Index = () => {
  useDocumentMeta({ title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, ogUrl: "https://more-ad.lovable.app" });
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <HowItWorks />
      <SampleAds />
      <Features />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
