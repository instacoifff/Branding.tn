import { Link } from "react-router-dom";
import { Twitter, Linkedin, Instagram, Facebook } from "lucide-react";

const FOOTER_LINKS = {
  Services: [
    { label: "Logo Design", to: "/builder" },
    { label: "Brand Identity", to: "/builder" },
    { label: "Social Media Kit", to: "/builder" },
    { label: "Project Builder", to: "/builder" },
  ],
  Company: [
    { label: "About Us", to: "/" },
    { label: "Our Work", to: "/" },
    { label: "Pricing", to: "/builder" },
    { label: "Contact", to: "/" },
  ],
  Client: [
    { label: "Sign In", to: "/auth" },
    { label: "Dashboard", to: "/dashboard" },
    { label: "My Projects", to: "/dashboard/projects" },
    { label: "My Files", to: "/dashboard/files" },
  ],
};

const SOCIAL = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
];

const Footer = () => (
  <footer className="border-t border-border pt-16 pb-8 bg-background">
    <div className="max-w-6xl mx-auto px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
        {/* Brand column */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-brand">
              <span className="font-bold text-[13px] text-primary-foreground">B</span>
            </div>
            <span className="text-base font-semibold text-foreground">
              branding<span className="text-primary">.tn</span>
            </span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed mb-5">
            Premium branding agency based in Tunisia. Crafting identities that stand the test of time.
          </p>
          <div className="flex gap-3">
            {SOCIAL.map(({ icon: Icon, href, label }) => (
              <a key={label} href={href} aria-label={label}
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all">
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(FOOTER_LINKS).map(([title, links]) => (
          <div key={title}>
            <p className="text-foreground text-sm font-semibold mb-4">{title}</p>
            <ul className="space-y-3">
              {links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-muted-foreground text-sm hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border pt-7 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm">© 2026 branding.tn — All rights reserved.</p>
        <div className="flex gap-5 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
