import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Instagram } from "lucide-react";
import { navItems, services } from "@/data/site";

const Footer = () => (
  <footer className="border-t border-border mt-32">
    <div className="container-studio py-16 grid gap-12 md:grid-cols-4">
      <div className="md:col-span-2 space-y-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary text-primary-foreground">
            ◆
          </span>
          <span>Studio</span>
        </Link>
        <p className="text-muted-foreground max-w-sm">
          A modern, tech-driven creative studio delivering high-quality digital products and visual experiences.
        </p>
        <div className="flex gap-3 pt-2">
          {[Twitter, Github, Linkedin, Instagram].map((Icon, i) => (
            <a
              key={i}
              href="#"
              aria-label="social"
              className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            >
              <Icon size={16} />
            </a>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-display text-sm font-semibold mb-4">Navigate</h4>
        <ul className="space-y-2">
          {navItems.map((i) => (
            <li key={i.to}>
              <Link to={i.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {i.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-display text-sm font-semibold mb-4">Services</h4>
        <ul className="space-y-2">
          {services.map((s) => (
            <li key={s.slug}>
              <Link
                to={`/services/${s.slug}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {s.title.split(" / ")[0]}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
    <div className="border-t border-border">
      <div className="container-studio py-6 flex flex-col md:flex-row justify-between gap-3 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Studio. All rights reserved.</p>
        <p>Designed & built with intention.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
