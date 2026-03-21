import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import SampleAds from "@/components/landing/SampleAds";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import { useDocumentMeta, DEFAULT_TITLE, DEFAULT_DESCRIPTION } from "@/hooks/useDocumentMeta";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  useDocumentMeta({ title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, ogUrl: "https://more.ad" });

  // Redirect authenticated users to /app (handles OAuth callback landing on /)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          navigate("/app");
        }
      }
    );
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/app");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const el = document.querySelector(location.hash);
        el?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location.hash]);
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
