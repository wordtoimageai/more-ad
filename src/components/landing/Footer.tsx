import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import { Twitter, Instagram, Linkedin, Github } from "lucide-react";

const Footer = () => {
  const links = {
    product: ["Features", "Pricing", "API", "Integrations"],
    company: ["About", "Blog", "Careers", "Press"],
    resources: ["Documentation", "Help Center", "Community", "Status"],
    legal: ["Privacy", "Terms", "Security", "Cookies"],
  };

  return (
    <footer className="py-16 border-t border-border">
      <div className="container px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Logo Column */}
          <div className="col-span-2 md:col-span-1">
            <Logo size="md" showTagline />
            <div className="flex items-center gap-4 mt-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-semibold mb-4 capitalize">{category}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a 
                      href="#" 
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2024 More.ad. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm">
            Made with ❤️ for creators everywhere
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
