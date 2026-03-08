import Logo from "@/components/Logo";
import { Twitter, Instagram, Linkedin, Github } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const linkSections = [
    {
      title: "Product",
      items: [
        { label: "Features", to: "/#features" },
        { label: "Pricing", to: "/#pricing" },
        { label: "How it Works", to: "/#how-it-works" },
        { label: "FAQ", to: "/#faq" },
      ],
    },
    {
      title: "Company",
      items: [
        { label: "About", to: "/about" },
        { label: "Blog", to: "/blog" },
        { label: "Contact", to: "/contact" },
      ],
    },
    {
      title: "Legal",
      items: [
        { label: "Privacy", to: "/privacy" },
        { label: "Terms", to: "/terms" },
      ],
    },
  ];

  return (
    <footer className="py-16 border-t border-border">
      <div className="container px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Logo size="md" showTagline />
            <div className="flex items-center gap-4 mt-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="GitHub">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {linkSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} More.ad. All rights reserved.
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
