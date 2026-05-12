import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight, Sparkles, Layers, Palette, Globe, FileText, Camera, Shield, Clock, Star, Zap, TrendingUp, Gift } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useI18n } from "@/i18n";

/* ── Service tiers ── */
const SERVICES = [
  {
    id: "logo",
    icon: Sparkles,
    title: "Logo Design",
    description: "A distinctive, timeless logo crafted through strategy. Multiple concepts, unlimited revisions, all production-ready formats.",
    price: 450,
    originalPrice: 600,
    popular: false,
    features: ["3 Unique Concepts", "Unlimited Revisions", "All Vector Formats (AI, EPS, SVG, PDF)", "Primary + Secondary Variations", "Black & White Versions", "Favicon & Social Icon"],
    deliveryDays: 5,
    image: "/images/logo-mockup.png",
  },
  {
    id: "identity",
    icon: Layers,
    title: "Full Brand Identity",
    description: "Complete visual identity system — logo, colors, typography, stationery, and a comprehensive brand guidelines document.",
    price: 1200,
    originalPrice: 1800,
    popular: true,
    features: ["Everything in Logo Design", "Strategic Color Palette", "Typography System (2 Fonts)", "Business Card Design", "Letterhead & Envelope", "Brand Guidelines PDF (20+ pages)", "Email Signature Template"],
    deliveryDays: 7,
    image: "/images/brand-identity-mockup.png",
  },
  {
    id: "social",
    icon: Palette,
    title: "Social Media Kit",
    description: "Platform-optimized templates that stop the scroll. Cohesive, on-brand content ready to post from day one.",
    price: 350,
    originalPrice: 500,
    popular: false,
    features: ["10 Instagram Feed Templates", "5 Instagram Story Templates", "LinkedIn Banner + Post Templates", "Facebook Cover + Post Templates", "Editable Canva / Figma Files", "Content Calendar Template"],
    deliveryDays: 5,
    image: "/images/social-media-mockup.png",
  },
];

/* ── Add-ons ── */
const ADDONS = [
  { id: "website", icon: Globe, title: "Landing Page Design", price: 400, desc: "One-page website UI/UX design in Figma" },
  { id: "copywriting", icon: FileText, title: "Brand Copywriting", price: 200, desc: "Tagline, mission, vision, and brand voice guide" },
  { id: "photography", icon: Camera, title: "Product Photography", price: 300, desc: "8 styled product shots with editing" },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const ProjectBuilder = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const navigate = useNavigate();
  const { t } = useI18n();

  const toggle = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);

  const toggleAddon = (id: string) =>
    setSelectedAddons((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);

  const serviceTotal = useMemo(() => SERVICES.filter((s) => selected.includes(s.id)).reduce((sum, s) => sum + s.price, 0), [selected]);
  const addonTotal = useMemo(() => ADDONS.filter((a) => selectedAddons.includes(a.id)).reduce((sum, a) => sum + a.price, 0), [selectedAddons]);
  const total = serviceTotal + addonTotal;
  const savings = useMemo(() => SERVICES.filter((s) => selected.includes(s.id)).reduce((sum, s) => sum + (s.originalPrice - s.price), 0), [selected]);
  const deposit = Math.round(total * 0.3);
  const hasBundle = selected.length >= 2;

  const bundleDiscount = hasBundle ? Math.round(total * 0.1) : 0;
  const finalTotal = total - bundleDiscount;
  const finalDeposit = Math.round(finalTotal * 0.3);

  const handleStartProject = () => {
    const selectedServices = SERVICES
      .filter((s) => selected.includes(s.id))
      .map(({ id, title, price }) => ({ id, title, price }));
    const selectedAddonItems = ADDONS
      .filter((a) => selectedAddons.includes(a.id))
      .map(({ id, title, price }) => ({ id, title, price }));
    sessionStorage.setItem("builder_services", JSON.stringify([...selectedServices, ...selectedAddonItems]));
    sessionStorage.setItem("builder_total", String(finalTotal));
    navigate("/brief");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-32 pb-20">
        <div className="max-w-[1100px] mx-auto px-6">

          {/* ── Header ── */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/8 border border-primary/15 px-3.5 py-1.5 rounded-full mb-5">
              <Sparkles size={11} /> Interactive Project Builder
            </span>
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Build your brand package
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto text-base font-light">
              Select services, see real-time pricing, and start your project with just a 30% deposit. First concepts delivered in 72 hours.
            </p>
          </motion.div>

          {/* ── Trust strip ── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-6 mb-16 text-muted-foreground/50 text-xs">
            <span className="flex items-center gap-1.5"><Shield size={12} /> Money-back guarantee</span>
            <span className="flex items-center gap-1.5"><Clock size={12} /> 7-day delivery</span>
            <span className="flex items-center gap-1.5"><Star size={12} className="text-amber-400 fill-amber-400" /> 4.9/5 rating</span>
            <span className="flex items-center gap-1.5"><Zap size={12} /> Unlimited revisions</span>
          </motion.div>

          {/* ── Bundle banner ── */}
          <AnimatePresence>
            {!hasBundle && selected.length === 1 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="mb-8 rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] p-4 text-center">
                <p className="text-sm font-medium text-foreground">
                  <Gift size={14} className="inline text-amber-500 mr-1.5" />
                  Add a second service and get <span className="font-bold text-amber-600">10% off</span> your entire package!
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Service cards ── */}
          <div className="grid lg:grid-cols-3 gap-5 mb-12">
            {SERVICES.map((service, i) => {
              const isSelected = selected.includes(service.id);
              return (
                <motion.button
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => toggle(service.id)}
                  className={`relative text-left rounded-2xl p-7 transition-all duration-300 border group ${isSelected
                    ? "border-primary bg-primary/[0.03] shadow-brand ring-1 ring-primary/20"
                    : "border-border bg-card hover:border-primary/20 shadow-soft hover:shadow-card"
                  }`}
                >
                  {/* Popular badge */}
                  {service.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1 rounded-full shadow-brand">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Check */}
                  {isSelected && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="absolute top-4 right-4 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-brand">
                      <Check size={14} className="text-white" />
                    </motion.div>
                  )}

                  {/* Icon */}
                  <div className="w-11 h-11 rounded-xl bg-primary/8 border border-primary/12 flex items-center justify-center mb-5">
                    <service.icon size={20} className="text-primary" />
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-1.5">{service.title}</h3>
                  <p className="text-sm text-muted-foreground mb-5 leading-relaxed font-light">{service.description}</p>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-5">
                    <span className="text-3xl font-bold text-foreground">€{service.price}</span>
                    <span className="text-sm text-muted-foreground line-through">€{service.originalPrice}</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded-full uppercase">
                      Save €{service.originalPrice - service.price}
                    </span>
                  </div>

                  {/* Delivery */}
                  <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
                    <Clock size={11} /> Delivered in {service.deliveryDays} business days
                  </p>

                  {/* Features */}
                  <ul className="space-y-2.5">
                    {service.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA hint */}
                  <div className={`mt-6 py-2.5 rounded-xl text-center text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground group-hover:bg-primary/8 group-hover:text-primary"
                  }`}>
                    {isSelected ? "✓ Selected" : "Click to select"}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* ── Add-ons ── */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-12">
            <h3 className="text-lg font-semibold text-foreground mb-1">Boost your brand further</h3>
            <p className="text-sm text-muted-foreground mb-5 font-light">Optional add-ons to maximize your brand launch.</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {ADDONS.map((addon) => {
                const isOn = selectedAddons.includes(addon.id);
                return (
                  <button
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`text-left rounded-xl p-5 border transition-all duration-200 ${
                      isOn
                        ? "border-primary/30 bg-primary/[0.03] ring-1 ring-primary/15"
                        : "border-border bg-card hover:border-primary/15"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <addon.icon size={18} className={isOn ? "text-primary" : "text-muted-foreground"} />
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        isOn ? "bg-primary border-primary" : "border-border"
                      }`}>
                        {isOn && <Check size={12} className="text-white" />}
                      </div>
                    </div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">{addon.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2 font-light">{addon.desc}</p>
                    <p className="text-sm font-bold text-foreground">+€{addon.price}</p>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* ── Summary / CTA ── */}
          <AnimatePresence>
            {selected.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="bg-card rounded-2xl border border-border p-8 max-w-2xl mx-auto shadow-card"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Your Package</h3>
                  {hasBundle && (
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/15 px-3 py-1 rounded-full flex items-center gap-1">
                      <Gift size={11} /> Bundle: 10% OFF applied
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  {SERVICES.filter((s) => selected.includes(s.id)).map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <s.icon size={14} className="text-primary" /> {s.title}
                      </span>
                      <span className="font-medium text-foreground">€{s.price}</span>
                    </div>
                  ))}
                  {ADDONS.filter((a) => selectedAddons.includes(a.id)).map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <a.icon size={14} className="text-muted-foreground" /> {a.title}
                      </span>
                      <span className="font-medium text-foreground">€{a.price}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  {bundleDiscount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-emerald-600 font-medium">Bundle discount (10%)</span>
                      <span className="text-emerald-600 font-bold">-€{bundleDiscount}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Total</span>
                    <div className="text-right">
                      {bundleDiscount > 0 && <span className="text-sm text-muted-foreground line-through mr-2">€{total}</span>}
                      <span className="text-xl font-bold text-foreground">€{finalTotal}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-primary text-sm font-medium">30% deposit to start</span>
                    <span className="text-xl font-bold text-primary">€{finalDeposit}</span>
                  </div>
                </div>

                {/* Urgency */}
                <div className="mt-5 rounded-xl bg-amber-500/[0.04] border border-amber-500/12 p-3 text-center">
                  <p className="text-xs text-muted-foreground">
                    <Zap size={11} className="inline text-amber-500 mr-1" />
                    <span className="font-medium text-foreground">Limited availability</span> — we accept only 5 new projects per week to maintain quality.
                  </p>
                </div>

                <button
                  onClick={handleStartProject}
                  className="mt-6 w-full btn-blue flex items-center justify-center gap-2 py-4 rounded-xl text-[15px] font-semibold"
                >
                  <span>Continue to Creative Brief</span>
                  <ArrowRight size={16} />
                </button>

                <p className="text-center text-xs text-muted-foreground mt-3">
                  💳 Secure Stripe payment · 🔒 Full refund guarantee · ⚡ First concepts in 72h
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Empty state ── */}
          {selected.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <p className="text-muted-foreground text-sm">Select one or more services above to build your package →</p>
            </motion.div>
          )}

          {/* ── FAQ / Objection handling ── */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-20 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-foreground text-center mb-8">Frequently asked questions</h3>
            <div className="space-y-4">
              {[
                { q: "What if I'm not satisfied with the designs?", a: "We offer unlimited revisions on all services. If you're still not happy after revisions, we provide a full refund — no questions asked." },
                { q: "How does payment work?", a: "You only pay a 30% deposit upfront via secure Stripe checkout. The remaining 70% is due after you approve the final deliverables." },
                { q: "How fast will I receive my designs?", a: "First concepts are delivered within 72 hours. Full projects are completed within 5–7 business days depending on the scope." },
                { q: "Do I own the designs?", a: "Yes, 100%. You receive full commercial rights and ownership of all files, vectors, and assets we create for you." },
                { q: "Can I combine multiple services?", a: "Absolutely — and you'll save 10% when you bundle 2 or more services together. The discount is applied automatically." },
              ].map((faq, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-5">
                  <h4 className="text-sm font-semibold text-foreground mb-2">{faq.q}</h4>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProjectBuilder;
