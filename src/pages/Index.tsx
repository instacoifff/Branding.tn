import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Zap, CheckCircle, Star, Sparkles, PenTool, Image, Share2 } from "lucide-react";
import { useI18n } from "@/i18n";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ── Trusted partner logo replacements — text-based for demo ── */
const TRUSTED_LOGOS = [
  "Decathlon", "Toyota", "AXA", "KPMG", "L'Oréal", "Nestlé",
];

/* ── Stats ── */
const STATS = [
  { value: "500+", label: "Projects Delivered" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "120+", label: "Happy Clients" },
  { value: "7 days", label: "Average Turnaround" },
];

/* ── Services bento grid ── */
const SERVICES = [
  {
    icon: PenTool,
    title: "Logo Design",
    desc: "Timeless marks that define identity. Multiple concepts, unlimited revisions, all file formats.",
    tags: ["Vector Files", "Brand Book", "Unlimited Revisions"],
    col: "lg:col-span-2",
    price: "From 1,200 TND",
  },
  {
    icon: Image,
    title: "Brand Identity",
    desc: "Complete visual systems — from color palettes to typography — that tell your brand story consistently.",
    tags: ["Color Palette", "Typography", "Stationery"],
    col: "lg:col-span-1",
    price: "From 2,800 TND",
  },
  {
    icon: Share2,
    title: "Social Media Kit",
    desc: "Scroll-stopping assets designed for every major platform. Ready to post from day one.",
    tags: ["Instagram", "LinkedIn", "Story Templates"],
    col: "lg:col-span-1",
    price: "From 800 TND",
  },
];

/* ── Why Us ── */
const REASONS = [
  { emoji: "⚡", title: "7-Day Delivery", desc: "Get your brand assets fast without sacrificing quality." },
  { emoji: "🎨", title: "Pixel-Perfect Craft", desc: "Every detail intentional — nothing left to chance." },
  { emoji: "🔒", title: "Full Ownership", desc: "You own every file, every vector, forever — no strings." },
  { emoji: "🔄", title: "Unlimited Revisions", desc: "We iterate until you're 100% satisfied. No extra cost." },
  { emoji: "🌍", title: "Bilingual Agency", desc: "We work seamlessly in French & English, based in Tunisia." },
  { emoji: "📊", title: "Client Dashboard", desc: "Track your project progress, files, and status in real time." },
];

/* ── Testimonials ── */
const TESTIMONIALS = [
  {
    quote: "Branding.tn elevated our entire visual identity. The team is fast, precise, and genuinely creative.",
    name: "Sarra Mansour",
    role: "CEO, Artisan Tunisia",
    avatar: "S",
  },
  {
    quote: "We rebranded in under 2 weeks. The logo, palette, and brand book exceeded every expectation.",
    name: "Karim El Haj",
    role: "Co-Founder, NovaTech",
    avatar: "K",
  },
  {
    quote: "Professional, fast, bilingual. Exactly what a growing Tunisian company needs from a branding partner.",
    name: "Leila Brahmi",
    role: "Marketing Director, Sahel Retail",
    avatar: "L",
  },
];

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

export default function Index() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background text-foreground bg-grid-lines overflow-x-hidden">
      <Navbar />

      {/* ══════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════ */}
      <section className="relative flex flex-col items-center justify-center text-center pt-40 pb-28 px-6">
        {/* Background blobs */}
        <div className="blob-blue absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] opacity-60 pointer-events-none" />
        <div className="blob-purple absolute top-20 left-1/2 -translate-x-1/2 translate-x-24 w-[500px] h-[400px] opacity-50 pointer-events-none" />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-5xl mx-auto"
        >
          {/* Badge */}
          <div className="badge-pill mx-auto mb-8">
            <Sparkles size={12} className="text-blue-400" />
            Premium Branding Agency · Tunisia
          </div>

          {/* Main headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-[76px] font-semibold leading-[1.07] tracking-tight mb-7">
            <span className="headline-gradient">We Build Brands</span>
            <br />
            <span className="text-foreground">That Actually Matter</span>
          </h1>

          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            From strategy to execution — we craft premium brand identities that elevate businesses across Tunisia and beyond. Fast. Precise. Unforgettable.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link to="/builder">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="btn-blue flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-[15px]">
                Start Your Project <ArrowRight size={16} />
              </motion.button>
            </Link>
            <Link to="/auth">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="btn-outline-white flex items-center gap-2 px-7 py-3.5 rounded-xl text-[15px]">
                View Client Portal
              </motion.button>
            </Link>
          </div>

          {/* Dashboard preview screenshot placeholder — dark glass panel */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative max-w-4xl mx-auto"
          >
            <div className="glass-card p-1 shadow-brand">
              <div className="bg-card rounded-[14px] border border-border aspect-[16/9] flex items-center justify-center overflow-hidden">
                {/* Simulated dashboard UI */}
                <div className="w-full h-full p-6 grid grid-cols-3 gap-3">
                  {/* Sidebar sim */}
                  <div className="col-span-1 flex flex-col gap-2">
                    <div className="h-8 rounded-lg bg-muted/50 mb-2" />
                    {[80, 60, 70, 50, 65].map((w, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-md bg-muted shrink-0" />
                        <div className={`h-3 rounded-full bg-muted`} style={{ width: `${w}%` }} />
                      </div>
                    ))}
                  </div>
                  {/* Content sim */}
                  <div className="col-span-2 flex flex-col gap-3">
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Projects", color: "bg-blue-500/20", val: "24" },
                        { label: "Revenue", color: "bg-green-500/20", val: "48K TND" },
                        { label: "Clients", color: "bg-purple-500/20", val: "18" },
                      ].map((c) => (
                        <div key={c.label} className={`${c.color} rounded-xl p-3 border border-border`}>
                          <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
                          <p className="text-base font-bold text-foreground">{c.val}</p>
                        </div>
                      ))}
                    </div>
                    {/* Chart sim */}
                    <div className="flex-1 rounded-xl bg-muted/20 border border-border p-3 flex items-end gap-1.5">
                      {[30, 55, 40, 70, 50, 85, 60, 90, 75, 95, 80, 100].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t" style={{ height: `${h * 0.7}%`, background: i === 11 ? "#1B70FF" : "currentColor", opacity: i === 11 ? 1 : 0.2 }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Glow below */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-blue-900/20 blur-3xl rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          TRUSTED BY / LOGO CLOUD
      ══════════════════════════════════════════ */}
      <section className="py-16 border-t border-border">
        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center gap-8">
          <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
            Trusted by forward-thinking businesses
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10">
            {TRUSTED_LOGOS.map((name) => (
              <span key={name} className="logo-mono text-foreground/70 text-base font-semibold tracking-tight">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS STRIP
      ══════════════════════════════════════════ */}
      <section className="py-16 border-t border-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <motion.div
                key={s.value}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-center"
              >
                <p className="text-4xl lg:text-5xl font-semibold text-foreground mb-2">{s.value}</p>
                <p className="text-muted-foreground text-sm">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SERVICES — BENTO GRID
      ══════════════════════════════════════════ */}
      <section className="py-24 border-t border-border">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-14">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">What We Do</p>
            <h2 className="text-4xl lg:text-5xl font-semibold text-foreground mb-4">One agency.<br />All your brand needs.</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">From a single logo to your entire visual identity system — we deliver end-to-end branding that converts.</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-4">
            {SERVICES.map((svc, i) => (
              <motion.div
                key={svc.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card p-7 flex flex-col gap-5 ${svc.col}`}
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <svc.icon size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{svc.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{svc.desc}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {svc.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-muted border border-border text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-primary text-sm font-semibold">{svc.price}</span>
                  <Link to="/builder">
                    <button className="text-xs btn-outline-white px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      Get started <ArrowRight size={11} />
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          WHY US — FEATURE GRID
      ══════════════════════════════════════════ */}
      <section className="py-24 border-t border-border">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-14">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Why Choose Us</p>
            <h2 className="text-4xl lg:text-5xl font-semibold text-foreground mb-4">Built different.<br />By design.</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">We combine speed, precision, and genuine creative care into every project.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {REASONS.map((r, i) => (
              <motion.div
                key={r.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="glass-card p-6 border border-border"
              >
                <span className="text-2xl mb-4 block">{r.emoji}</span>
                <h3 className="text-base font-semibold text-foreground mb-2">{r.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section className="py-24 border-t border-border">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-14">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">What clients say</p>
            <h2 className="text-4xl lg:text-5xl font-semibold text-foreground">Trusted. Loved. Proven.</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 flex flex-col gap-5 border border-border"
              >
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, si) => (
                    <Star key={si} size={14} className="text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-semibold">{t.name}</p>
                    <p className="text-muted-foreground text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA SECTION
      ══════════════════════════════════════════ */}
      <section className="py-28 border-t border-border">
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <div className="blob-blue absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-40 pointer-events-none" />
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="relative z-10">
            <div className="badge-pill mx-auto mb-8 border-border">
              <Zap size={12} className="text-primary" /> Start in under 5 minutes
            </div>
            <h2 className="text-4xl lg:text-[60px] font-semibold leading-tight text-foreground mb-6">
              Ready to build your<br />
              <span className="headline-gradient">dream brand?</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">
              Use our interactive project builder. See real-time pricing, choose your services, and get started with just a 30% deposit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/builder">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="btn-blue flex items-center gap-2 px-8 py-4 rounded-xl text-base">
                  Launch Project Builder <ArrowRight size={17} />
                </motion.button>
              </Link>
              <Link to="/auth">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="btn-outline-white flex items-center gap-2 px-8 py-4 rounded-xl text-base">
                  <CheckCircle size={17} /> Sign In to Your Portal
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
