import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, CheckCircle, Star, Sparkles, PenTool, Image, Share2, Shield, TrendingUp, ArrowUpRight, Play, Zap } from "lucide-react";
import { useI18n } from "@/i18n";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRef } from "react";

/* ── Services ── */
const SERVICES = [
  {
    icon: PenTool, title: "Logo Design",
    desc: "Your logo is the handshake before the conversation. We craft timeless, versatile marks that work at every size, on every surface, in every context.",
    tags: ["3 Unique Concepts", "Unlimited Revisions", "All Vector Formats", "Brand Mark + Wordmark"],
    price: "€450", image: "/images/logo-mockup.png",
    stat: "94% of first impressions are design-related",
  },
  {
    icon: Image, title: "Brand Identity",
    desc: "A logo alone isn't a brand. We build complete visual systems — color, type, stationery, and a guidelines PDF — so every touchpoint is unmistakable.",
    tags: ["Color System", "Typography", "Stationery Suite", "Brand Guidelines"],
    price: "€1,200", image: "/images/brand-identity-mockup.png",
    stat: "Consistent branding increases revenue by 23%",
  },
  {
    icon: Share2, title: "Social Media Kit",
    desc: "Stop blending in. Scroll-stopping templates that turn followers into customers — ready to post across every platform from day one.",
    tags: ["Instagram Feed + Stories", "LinkedIn", "Facebook", "Editable Templates"],
    price: "€350", image: "/images/social-media-mockup.png",
    stat: "Branded posts get 3× more engagement",
  },
];

/* ── Process ── */
const PROCESS = [
  { n: "01", title: "Tell us your vision", desc: "Select services, set your budget, and submit a creative brief — takes 5 minutes.", icon: "💡" },
  { n: "02", title: "We design & iterate", desc: "First concepts in 72 hours. We refine together until every pixel is perfect.", icon: "🎨" },
  { n: "03", title: "Review & approve", desc: "Use your private dashboard to review, comment, and approve deliverables.", icon: "✅" },
  { n: "04", title: "Launch your brand", desc: "Download production-ready files in every format. Your brand is live.", icon: "🚀" },
];

/* ── Testimonials ── */
const TESTIMONIALS = [
  { quote: "We went from a DIY logo to a premium identity in 10 days. Clients treat us differently now — the brand commands respect.", name: "Sarra M.", role: "CEO, Artisan Tunisia", result: "3× client inquiries" },
  { quote: "The dashboard alone sold me. Seeing progress, approving files, chatting with the team — all in one place. No other agency offers this.", name: "Karim E.", role: "Co-Founder, NovaTech", result: "Rebranded in 2 weeks" },
  { quote: "Bilingual, precise, and ridiculously fast. We needed FR + EN brand assets and they nailed everything on the first round.", name: "Leila B.", role: "Marketing Dir., Sahel Retail", result: "98% brand consistency" },
];

/* ── Why us ── */
const REASONS = [
  { emoji: "⚡", title: "7-Day Delivery", desc: "While other agencies take weeks, we deliver your complete brand in 7 business days." },
  { emoji: "🔄", title: "Unlimited Revisions", desc: "We iterate until you're genuinely thrilled — not just satisfied. Always free." },
  { emoji: "🔒", title: "100% Ownership", desc: "Every file, vector, and asset is yours forever. Full commercial rights." },
  { emoji: "📊", title: "Live Dashboard", desc: "Track progress, approve concepts, upload files — all from your personal portal." },
  { emoji: "🌍", title: "FR + EN Bilingual", desc: "Based in Tunisia, serving globally. Zero language friction." },
  { emoji: "🛡️", title: "Money-Back Guarantee", desc: "Not happy? Full refund. We've never had to use it — but it's there." },
];

const fadeUp = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } } };
const stagger = { show: { transition: { staggerChildren: 0.06 } } };

export default function Index() {
  const { t } = useI18n();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-[#06080f] text-white noise-overlay overflow-x-hidden">
      <Navbar />

      {/* ═══════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-20">
        {/* Ambient glow orbs */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.12)_0%,transparent_60%)]" />
          <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(139,92,246,0.1)_0%,transparent_60%)]" />
        </div>
        {/* Grid */}
        <div className="absolute inset-0 bg-grid-lines opacity-40" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="badge-pill mx-auto mb-10">
            <Sparkles size={11} /> Tunisia's #1 Branding Studio
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
            className="text-[clamp(2.5rem,7vw,5.5rem)] font-semibold leading-[1.05] tracking-[-0.03em] mb-8"
            style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
            <span className="headline-gradient">We build brands</span>
            <br />
            <span className="text-white/90">that print money.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-white/40 text-lg sm:text-xl max-w-[600px] mx-auto leading-relaxed mb-6 font-light">
            Premium brand identities — strategy, design, and delivery — in 7 days flat. Trusted by 120+ businesses across EMEA.
          </motion.p>

          {/* Social proof */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-1 mb-12">
            {[...Array(5)].map((_, i) => <Star key={i} size={13} className="text-amber-400 fill-amber-400" />)}
            <span className="text-white/35 text-sm ml-2">4.9/5 from 120+ clients</span>
          </motion.div>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-24">
            <Link to="/builder">
              <button className="btn-blue flex items-center gap-2.5 px-8 py-4 rounded-2xl text-[15px] font-semibold">
                <span>Start Your Project</span> <ArrowRight size={16} />
              </button>
            </Link>
            <Link to="/auth">
              <button className="btn-outline-white flex items-center gap-2 px-8 py-4 rounded-2xl text-[15px]">
                Client Portal
              </button>
            </Link>
          </motion.div>

          {/* Hero image */}
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.8, duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative max-w-[1000px] mx-auto">
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] shadow-epic image-shine">
              <img src="/images/hero-showcase.png" alt="BrandingTN creative workspace" className="w-full" />
              {/* Bottom gradient fade */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#06080f] to-transparent" />
            </div>
            {/* Glow underneath */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-blue-500/8 blur-[80px] rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          LOGO MARQUEE
      ═══════════════════════════════════════════ */}
      <section className="py-12 border-y border-white/[0.03] overflow-hidden">
        <p className="text-center text-white/20 text-[11px] font-medium uppercase tracking-[0.2em] mb-8">
          Trusted by forward-thinking companies
        </p>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#06080f] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#06080f] to-transparent z-10" />
          <div className="marquee-track">
            {[...Array(2)].map((_, setIdx) => (
              <div key={setIdx} className="flex items-center gap-16 px-8">
                {["Decathlon", "Toyota", "AXA", "KPMG", "L'Oréal", "Nestlé", "Tunisair", "Ooredoo"].map((name) => (
                  <span key={`${setIdx}-${name}`} className="text-white/15 text-lg font-semibold tracking-tight whitespace-nowrap select-none">
                    {name}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          STATS
      ═══════════════════════════════════════════ */}
      <section className="py-24">
        <div className="max-w-[1000px] mx-auto px-6">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "500+", label: "Projects shipped", color: "from-blue-500/20 to-blue-600/5" },
              { value: "98%", label: "Client satisfaction", color: "from-emerald-500/20 to-emerald-600/5" },
              { value: "120+", label: "Happy clients", color: "from-violet-500/20 to-violet-600/5" },
              { value: "7 days", label: "Avg. delivery", color: "from-amber-500/20 to-amber-600/5" },
            ].map((s) => (
              <motion.div key={s.value} variants={fadeUp}
                className="relative rounded-2xl border border-white/[0.04] p-6 text-center overflow-hidden group hover:border-white/[0.08] transition-all">
                <div className={`absolute inset-0 bg-gradient-to-b ${s.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <p className="text-3xl md:text-4xl font-bold text-white/90 mb-1.5 relative z-10">{s.value}</p>
                <p className="text-white/30 text-xs font-medium uppercase tracking-wider relative z-10">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SERVICES
      ═══════════════════════════════════════════ */}
      <section className="py-24">
        <div className="max-w-[1100px] mx-auto px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-20">
            <p className="text-blue-400/80 text-xs font-semibold uppercase tracking-[0.2em] mb-4">What We Create</p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-5" style={{ fontFamily: "'Outfit', sans-serif" }}>
              One agency. Every brand need.
            </h2>
            <p className="text-white/35 text-base max-w-lg mx-auto font-light">
              Each service includes unlimited revisions, all file formats, and your own project dashboard.
            </p>
          </motion.div>

          <div className="space-y-6">
            {SERVICES.map((svc, i) => (
              <motion.div key={svc.title} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="group rounded-3xl border border-white/[0.04] overflow-hidden hover:border-white/[0.08] transition-all duration-500 bg-white/[0.01]">
                <div className={`grid ${i === 0 ? "lg:grid-cols-5" : "lg:grid-cols-2"} gap-0`}>
                  {/* Image */}
                  <div className={`${i === 0 ? "lg:col-span-3" : ""} relative overflow-hidden`}>
                    <img src={svc.image} alt={svc.title} className="w-full h-72 lg:h-[340px] object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#06080f] via-[#06080f]/30 to-transparent" />
                    <div className="absolute bottom-5 left-5">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/70 bg-white/[0.08] backdrop-blur-md px-3 py-1.5 rounded-full border border-white/[0.06]">
                        <TrendingUp size={10} /> {svc.stat}
                      </span>
                    </div>
                  </div>
                  {/* Content */}
                  <div className={`${i === 0 ? "lg:col-span-2" : ""} p-8 lg:p-10 flex flex-col justify-between`}>
                    <div>
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/15 to-indigo-500/15 border border-blue-500/10 flex items-center justify-center">
                          <svc.icon size={17} className="text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white/90">{svc.title}</h3>
                      </div>
                      <p className="text-white/35 text-sm leading-relaxed mb-6 font-light">{svc.desc}</p>
                      <div className="flex flex-wrap gap-2 mb-8">
                        {svc.tags.map((tag) => (
                          <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/45 flex items-center gap-1">
                            <CheckCircle size={9} className="text-emerald-400/70" /> {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white/20 text-xs uppercase tracking-wider">Starting at</span>
                        <p className="text-2xl font-bold text-white/90">{svc.price}</p>
                      </div>
                      <Link to="/builder">
                        <button className="btn-blue px-6 py-3 rounded-xl text-sm flex items-center gap-2 font-semibold">
                          <span>Get Started</span> <ArrowRight size={14} />
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

      {/* ═══════════════════════════════════════════
          PROCESS
      ═══════════════════════════════════════════ */}
      <section className="py-24">
        <div className="max-w-[1000px] mx-auto px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-20">
            <p className="text-blue-400/80 text-xs font-semibold uppercase tracking-[0.2em] mb-4">How It Works</p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-5" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Brief to brand in 4 steps.
            </h2>
            <p className="text-white/35 text-base max-w-lg mx-auto font-light">
              No calls needed. No email chains. Everything happens in your dashboard.
            </p>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROCESS.map((p, i) => (
              <motion.div key={p.n} variants={fadeUp}
                className="relative rounded-2xl border border-white/[0.04] p-7 group hover:border-white/[0.08] transition-all duration-400 bg-white/[0.01] hover:bg-white/[0.02]">
                <span className="text-[72px] font-black text-white/[0.03] absolute top-0 right-3 leading-none select-none group-hover:text-blue-500/[0.06] transition-colors duration-500">
                  {p.n}
                </span>
                <span className="text-3xl mb-5 block">{p.icon}</span>
                <h3 className="text-[15px] font-semibold text-white/85 mb-2">{p.title}</h3>
                <p className="text-white/30 text-sm leading-relaxed font-light">{p.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          WHY US
      ═══════════════════════════════════════════ */}
      <section className="py-24">
        <div className="max-w-[1000px] mx-auto px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-16">
            <p className="text-blue-400/80 text-xs font-semibold uppercase tracking-[0.2em] mb-4">Why BrandingTN</p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Built different. By design.
            </h2>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {REASONS.map((r) => (
              <motion.div key={r.title} variants={fadeUp}
                className="rounded-2xl border border-white/[0.04] p-6 hover:border-white/[0.08] transition-all bg-white/[0.01] hover:bg-white/[0.02] group">
                <span className="text-2xl mb-4 block group-hover:scale-110 transition-transform origin-left">{r.emoji}</span>
                <h3 className="text-[15px] font-semibold text-white/85 mb-2">{r.title}</h3>
                <p className="text-white/30 text-sm leading-relaxed font-light">{r.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Guarantee */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="mt-8 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.02] p-6 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center shrink-0">
              <Shield size={24} className="text-emerald-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white/85 mb-1">100% Satisfaction Guarantee</h4>
              <p className="text-white/35 text-sm font-light">Not thrilled with the result? We revise for free until you are — or full refund. Zero risk for you.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════ */}
      <section className="py-24">
        <div className="max-w-[1000px] mx-auto px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-16">
            <p className="text-blue-400/80 text-xs font-semibold uppercase tracking-[0.2em] mb-4">Client Results</p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Real brands. Real impact.
            </h2>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t) => (
              <motion.div key={t.name} variants={fadeUp}
                className="rounded-2xl border border-white/[0.04] p-7 flex flex-col gap-5 bg-white/[0.01] hover:border-white/[0.08] hover:bg-white/[0.02] transition-all">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-white/45 text-sm leading-relaxed flex-1 font-light">"{t.quote}"</p>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400/80 bg-emerald-500/[0.06] border border-emerald-500/10 px-2.5 py-1 rounded-full w-fit">
                  <TrendingUp size={10} /> {t.result}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/15 flex items-center justify-center text-blue-400 font-bold text-xs">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-medium">{t.name}</p>
                    <p className="text-white/25 text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════ */}
      <section className="py-32 relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[400px] bg-[radial-gradient(ellipse,rgba(59,130,246,0.08)_0%,transparent_70%)]" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <div className="badge-pill mx-auto mb-10">
              <Zap size={11} /> Start in under 5 minutes
            </div>
            <h2 className="text-4xl md:text-[56px] font-semibold leading-[1.1] tracking-tight mb-7" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Your competitors already
              <br />
              <span className="headline-gradient">have a brand. Do you?</span>
            </h2>
            <p className="text-white/35 text-base max-w-md mx-auto mb-5 font-light">
              Real-time pricing. Interactive project builder. First concepts in 72 hours. Only 30% deposit to start.
            </p>
            <p className="text-white/20 text-xs mb-12">
              💳 Secure Stripe payments · 🔒 Full refund guarantee · ⚡ 7-day delivery
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/builder">
                <button className="btn-blue flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-semibold">
                  <span>Launch Project Builder</span> <ArrowRight size={17} />
                </button>
              </Link>
              <Link to="/auth">
                <button className="btn-outline-white flex items-center gap-2 px-8 py-4 rounded-2xl text-base">
                  <CheckCircle size={17} /> Sign In
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
