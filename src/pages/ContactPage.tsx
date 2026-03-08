import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ContactPage = () => {
  const [sending, setSending] = useState(false);

  useDocumentMeta({
    title: "Contact More.ad - Get in Touch",
    description: "Have questions about More.ad? Contact our team for support, partnerships, or feedback. We'd love to hear from you.",
    ogUrl: "https://more-ad.lovable.app/contact",
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Message sent! We'll get back to you soon.");
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-5 gap-10">
            <motion.div
              className="md:col-span-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <form onSubmit={handleSubmit} className="glass gradient-border rounded-2xl p-8 space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help?" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Tell us more..." rows={5} required />
                </div>
                <Button type="submit" variant="gradient" className="w-full" disabled={sending}>
                  {sending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </motion.div>

            <motion.div
              className="md:col-span-2 space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="glass gradient-border rounded-2xl p-6">
                <Mail className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-bold mb-1">Email Us</h3>
                <p className="text-muted-foreground text-sm">support@more-ad.com</p>
              </div>
              <div className="glass gradient-border rounded-2xl p-6">
                <MessageSquare className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-bold mb-1">Live Chat</h3>
                <p className="text-muted-foreground text-sm">Available Mon–Fri, 9am–6pm UTC</p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
