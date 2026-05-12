import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Zap, CheckCircle, Star, Sparkles, PenTool, Image, Share2, Shield, Clock, Users, Award, TrendingUp, Heart } from "lucide-react";
import { useI18n } from "@/i18n";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ── Services with real mockups ── */
const SERVICES = [
  {
    icon: PenTool,
    title: "Logo Design",
    desc: "Your logo is the first thing customers see — and the last thing they forget. We craft timeless, versatile marks that work at every size, on every surface, and in every context.",
    tags: ["3 Unique Concepts", "Unlimited Revisions", "All Vector Formats", "Brand Mark + Wordmark"],
    col: "lg:col-span-2",
    price: "From €450",
    image: "/images/logo-mockup.png",
    stat: "94% of first impressions are design-related",
  },
  {
    icon: Image,
    title: "Brand Identity",
    desc: "A logo alone isn't a brand. We build complete visual systems — color palettes, typography, stationery, and brand guidelines — so every touchpoint tells the same story.",
    tags: ["Color System", "Typography", "Stationery Suite", "Brand Guidelines PDF"],
    col: "lg:col-span-1",
    price: "From €1,200",
    image: "/images/brand-identity-mockup.png",
    stat: "Consistent branding increases revenue by 23%",
  },
  {
    icon: Share2,
    title: "Social Media Kit",
    desc: "Stop blending in. We design scroll-stopping social templates that turn followers into customers — ready to post from day one across every platform.",
    tags: ["Instagram Feed + Stories", "LinkedIn Banners", "Facebook Covers", "Editable Templates"],
    col: "lg:col-span-1",
    price: "From €350",
    image: "/images/social-media-mockup.png",
    stat: "Posts with branded visuals get 3x more engagement",
  },
];

/* ── Why Us — with persuasion logic ── */
const REASONS = [
  { emoji: "⚡", title: "7-Day Delivery", desc: "While other agencies take weeks, we deliver your complete brand in just 7 business days. Speed without sacrifice." },
  { emoji: "🎨", title: "Pixel-Perfect Craft", desc: "Every curve, every color, every detail is intentional. We don't do 'good enough' — we do exceptional." },
  { emoji: "🔒", title: "100% Ownership", desc: "Every file, every vector, every asset is yours forever. No licensing fees. No strings attached. Full commercial rights." },
  { emoji: "🔄", title: "Unlimited Revisions", desc: "We iterate until you're genuinely thrilled. Not just satisfied — thrilled. Revisions are free and unlimited." },
  { emoji: "🌍", title: "FR + EN Bilingual", desc: "Based in Tunisia, serving the world. We work fluently in both French and English — zero friction." },
  { emoji: "📊", title: "Live Client Portal", desc: "Track every stage of your project in real time. Upload files, review concepts, approve deliverables — all in one place." },
];

/* ── Process steps ── */
const PROCESS = [
  { step: "01", title: "Tell Us Your Vision", desc: "Use our interactive project builder to select services and submit your creative brief. Takes under 5 minutes.", icon: "💡" },
  { step: "02", title: "We Design & Iterate", desc: "Our creative team gets to work immediately. You'll receive concepts within 72 hours, then we refine together.", icon: "🎨" },
  { step: "03", title: "Review & Approve", desc: "Use your personal dashboard to review deliverables, request changes, and approve finals — all in one place.", icon: "✅" },
  { step: "04", title: "Launch Your Brand", desc: "Download all files in every format you need. Your brand is ready to go live — and we're here if you need us.", icon: "🚀" },
];

/* ── Testimonials ── */
const TESTIMONIALS = [
  {
    quote: "We went from a DIY logo to a complete premium identity in just 10 days. Our clients now treat us differently — the brand commands respect.",
    name: "Sarra Mansour",
    role: "CEO, Artisan Tunisia",
    avatar: "S",
    result: "3x more client inquiries",
  },
  {
    quote: "The dashboard alone sold me. Being able to see progress, approve files, and chat with the team in one place — no other agency offers this.",
    name: "Karim El Haj",
    role: "Co-Founder, NovaTech",
    avatar: "K",
    result: "Rebranded in 2 weeks",
  },
  {
    quote: "Bilingual, professional, and incredibly fast. We needed Arabic + French + English brand assets and they delivered everything flawlessly.",
    name: "Leila Brahmi",
    role: "Marketing Director, Sahel Retail",
    avatar: "L",
    result: "98% brand consistency score",
  },
];

/* ── Trust logos ── */
const TRUST_LOGOS = ["Decathlon", "Toyota", "AXA", "KPMG", "L'Oréal", "Nestlé"];

/* ── Stats ── */
const STATS = [
  { value: "500+", label: "Projects Delivered", icon: Award },
  { value: "98%", label: "Client Satisfaction", icon: Heart },
  { value: "120+", label: "Happy Clients", icon: Users },
  { value: "7 days", label: "Average Delivery", icon: Clock },
];

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

export default function Index() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background text-foreground bg-grid-lines overflow-x-hidden">
      <Navbar />

      {/* ══════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════ */}
      <section className="relative flex flex-col items-center justify-center text-center pt-40 pb-28 px-6">
        <div className="blob-blue absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] opacity-60 pointer-events-none" />
        <div className="blob-purple absolute top-20 left-1/2 -translate-x-1/2 translate-x-24 w-[500px] h-[400px] opacity-50 pointer-events-none" />

        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.6 }} className="relative z-10 max-w-5xl mx-auto">
          <div className="badge-pill mx-auto mb-8">
            <Sparkles size={12} className="text-blue-400" />
            Premium Branding Agency · Tunisia 🇹🇳
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-[76px] font-semibold leading-[1.07] tracking-tight mb-7">
            <span className="headline-gradient">We Build Brands</span>
            <br />
            <span className="text-foreground">That Print Money</span>
          </h1>

          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-4">
            From strategy to execution — we craft premium brand identities that make businesses unforgettable. Fast. Precise. Revenue-generating.
          </p>

          {/* Social proof micro-stat */}
          <p className="text-sm text-primary font-medium mb-10">
            ⭐ Trusted by 120+ businesses across Tunisia & EMEA — 98% satisfaction rate
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link to="/builder">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="btn-blue flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-[15px]">
                Start Your Project — It's Free <ArrowRight size={16} />
              </motion.button>
            </Link>
            <Link to="/auth">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="btn-outline-white flex items-center gap-2 px-7 py-3.5 rounded-xl text-[15px]">
                View Client Portal
              </motion.button>
            </Link>
          </div>

          {/* Hero showcase image */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="relative max-w-4xl mx-auto">
            <div className="glass-card p-1.5 shadow-brand">
              <img src="/images/hero-showcase.png" alt="BrandingTN creative workspace showing brand design process" className="w-full rounded-[14px] border border-border" />
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-blue-900/20 blur-3xl rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          TRUST STRIP
      ══════════════════════════════════════════ */}
      <section className="py-16 border-t border-border">
        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center gap-8">
          <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
            Trusted by forward-thinking businesses
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10">
            {TRUST_LOGOS.map((name) => (
              <span key={name} className="logo-mono text-foreground/70 text-base font-semibold tracking-tight">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS
      ══════════════════════════════════════════ */}
      <section className="py-16 border-t border-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <motion.div key={s.value} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="text-center">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                  <s.icon size={18} className="text-primary" />
                </div>
                <p className="text-4xl lg:text-5xl font-semibold text-foreground mb-2">{s.value}</p>
                <p className="text-muted-foreground text-sm">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SERVICES — WITH REAL MOCKUPS
      ══════════════════════════════════════════ */}
      <section className="py-24 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-16">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Our Services</p>
            <h2 className="text-4xl lg:text-5xl font-semibold text-foreground mb-4">One agency.<br />All your brand needs.</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Every service includes unlimited revisions, all file formats, and a dedicated project dashboard.</p>
          </motion.div>

          <div className="space-y-8">
            {SERVICES.map((svc, i) => (
              <motion.div key={svc.title} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass-card overflow-hidden border border-border group hover:border-primary/30 transition-all duration-300">
                <div className={`grid ${i === 0 ? "lg:grid-cols-5" : "lg:grid-cols-2"} gap-0`}>
                  {/* Image */}
                  <div className={`${i === 0 ? "lg:col-span-3" : ""} relative overflow-hidden`}>
                    <img src={svc.image} alt={`${svc.title} mockup by BrandingTN`} className="w-full h-64 lg:h-80 object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    {/* Stat overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/90 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                        <TrendingUp size={11} /> {svc.stat}
                      </span>
                    </div>
                  </div>
                  {/* Content */}
                  <div className={`${i === 0 ? "lg:col-span-2" : ""} p-7 lg:p-8 flex flex-col justify-between`}>
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <svc.icon size={18} className="text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">{svc.title}</h3>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-5">{svc.desc}</p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {svc.tags.map((tag) => (
                          <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-muted border border-border text-muted-foreground flex items-center gap-1">
                            <CheckCircle size={10} className="text-green-500" /> {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-primary text-lg font-bold">{svc.price}</span>
                      <Link to="/builder">
                        <button className="btn-blue px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 font-semibold">
                          Get Started <ArrowRight size={14} />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS — PROCESS
      ══════════════════════════════════════════ */}
      <section className="py-24 border-t border-border">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-16">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-4xl lg:text-5xl font-semibold text-foreground mb-4">From brief to brand<br />in 4 simple steps</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">No phone calls needed. No back-and-forth emails. Everything happens in your personal dashboard.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROCESS.map((p, i) => (
              <motion.div key={p.step} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass-card p-6 border border-border relative group hover:border-primary/30 transition-all">
                <span className="text-[64px] font-black text-muted/30 absolute top-2 right-4 leading-none select-none group-hover:text-primary/10 transition-colors">{p.step}</span>
                <span className="text-3xl mb-4 block">{p.icon}</span>
                <h3 className="text-base font-semibold text-foreground mb-2 relative z-10">{p.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed relative z-10">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          WHY US — PERSUASION SECTION
      ══════════════════════════════════════════ */}
      <section className="py-24 border-t border-border">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-14">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Why Choose Us</p>
            <h2 className="text-4xl lg:text-5xl font-semibold text-foreground mb-4">Built different.<br />By design.</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Every detail is engineered to give you a competitive advantage. Here's what makes us different.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {REASONS.map((r, i) => (
              <motion.div key={r.title} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="glass-card p-6 border border-border hover:border-primary/25 transition-all group">
                <span className="text-2xl mb-4 block">{r.emoji}</span>
                <h3 className="text-base font-semibold text-foreground mb-2">{r.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{r.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Risk-reversal callout */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="mt-10 glass-card p-6 border border-green-500/20 bg-green-500/[0.03] flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
              <Shield size={22} className="text-green-500" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">100% Satisfaction Guarantee</h4>
              <p className="text-muted-foreground text-sm">If you're not completely happy with the final result, we'll revise it for free until you are — or give you a full refund. Zero risk.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section className="py-24 border-t border-border">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-14">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Client Results</p>
            <h2 className="text-4xl lg:text-5xl font-semibold text-foreground">Real brands. Real impact.</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass-card p-6 flex flex-col gap-5 border border-border hover:border-primary/20 transition-all">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, si) => (
                    <Star key={si} size={14} className="text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed flex-1">"{t.quote}"</p>
                {/* Result badge */}
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full w-fit">
                  <TrendingUp size={11} /> {t.result}
                </span>
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
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section className="py-28 border-t border-border">
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <div className="blob-blue absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-40 pointer-events-none" />
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="relative z-10">
            <div className="badge-pill mx-auto mb-8 border-border">
              <Zap size={12} className="text-primary" /> Start in under 5 minutes
            </div>
            <h2 className="text-4xl lg:text-[60px] font-semibold leading-tight text-foreground mb-6">
              Your competitors already<br />
              <span className="headline-gradient">have a brand. Do you?</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-4">
              Use our interactive project builder. See real-time pricing, choose your services, and launch your brand with just a 30% deposit.
            </p>
            <p className="text-sm text-muted-foreground mb-10">
              💳 Secure payment via Stripe · 🔒 Full refund guarantee · ⚡ First concepts in 72 hours
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
