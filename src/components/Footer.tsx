import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Instagram } from "lucide-react";
import { navItems } from "@/data/site";
import { useStudio } from "@/store/StudioStore";

const Footer = () => {
  const { state } = useStudio();
  const { brand, contact } = state.settings;
  const socials = [
    { Icon: Twitter, href: contact.socials.twitter },
    { Icon: Github, href: contact.socials.github },
    { Icon: Linkedin, href: contact.socials.linkedin },
    { Icon: Instagram, href: contact.socials.instagram },
  ].filter((s) => !!s.href);

  return (
    <footer className="border-t border-border mt-32">
      <div className="container-studio py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary text-primary-foreground"></span>
            <span>{brand.studioName}</span>
          </Link>
          <p className="text-muted-foreground max-w-sm">{brand.tagline}</p>
          <div className="flex gap-3 pt-2">
            {socials.map(({ Icon, href }, i) => (
              <a key={i} href={href} target="_blank" rel="noreferrer" aria-label="social"
                className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors">
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
                <Link to={i.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{i.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold mb-4">Services</h4>
          <ul className="space-y-2">
            {state.services.map((s) => (
              <li key={s.slug}>
                <Link to={`/services/${s.slug}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {s.title.split(" / ")[0]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-studio py-6 flex flex-col md:flex-row justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {brand.legalName ?? brand.studioName}. All rights reserved.</p>
          <p>Designed & built with intention.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
