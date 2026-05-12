import { Link } from "react-router-dom";
import { ArrowUpRight, Mail } from "lucide-react";

const FOOTER_LINKS = {
  Services: [
    { label: "Logo Design", to: "/builder" },
    { label: "Brand Identity", to: "/builder" },
    { label: "Social Media Kit", to: "/builder" },
    { label: "Project Builder", to: "/builder" },
  ],
  Company: [
    { label: "About Us", to: "/" },
    { label: "Portfolio", to: "/" },
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
  { label: "Instagram", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "Behance", href: "#" },
  { label: "Twitter / X", href: "#" },
];

const Footer = () => (
  <footer className="relative border-t border-border bg-muted/30">
    {/* Glow line */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

    <div className="max-w-[1200px] mx-auto px-6 pt-20 pb-8">
      {/* Top CTA */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-16 pb-16 border-b border-border">
        <div>
          <h3 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-2">
            Ready to stand out?
          </h3>
          <p className="text-muted-foreground text-sm max-w-md">
            Join 120+ businesses that chose BrandingTN to craft their premium identity.
          </p>
        </div>
        <Link to="/builder">
          <button className="btn-blue px-7 py-3.5 rounded-xl text-sm font-semibold flex items-center gap-2 shrink-0">
            <span>Start Your Project</span> <ArrowUpRight size={15} />
          </button>
        </Link>
      </div>

      {/* Links grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="font-black text-[14px] text-white">B</span>
            </div>
            <span className="text-[15px] font-semibold text-foreground">
              branding<span className="text-primary">.tn</span>
            </span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-xs">
            Premium branding agency based in Tunisia. We craft identities that command attention, build trust, and drive revenue.
          </p>
          <a href="mailto:hello@branding.tn" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <Mail size={13} /> hello@branding.tn
          </a>
        </div>

        {Object.entries(FOOTER_LINKS).map(([title, links]) => (
          <div key={title}>
            <p className="text-muted-foreground/60 text-[11px] font-semibold uppercase tracking-[0.15em] mb-5">{title}</p>
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

      {/* Bottom */}
      <div className="border-t border-border pt-7 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-muted-foreground/60 text-xs">
          © {new Date().getFullYear()} branding.tn — All rights reserved. Crafted in Tunisia 🇹🇳
        </p>
        <div className="flex items-center gap-6">
          {SOCIAL.map((s) => (
            <a key={s.label} href={s.href} className="text-muted-foreground/50 text-xs hover:text-foreground transition-colors">
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
