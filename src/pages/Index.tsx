import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Layers, Palette, Zap, Heart, Shield, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useI18n } from "@/i18n";

/* ─── Shared entrance variants ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.7, delay },
});

const Index = () => {
  const { t } = useI18n();

  const services = [
    {
      icon: Sparkles,
      title: t("home.service1Title"),
      description: t("home.service1Desc"),
      number: "01",
    },
    {
      icon: Layers,
      title: t("home.service2Title"),
      description: t("home.service2Desc"),
      number: "02",
    },
    {
      icon: Palette,
      title: t("home.service3Title"),
      description: t("home.service3Desc"),
      number: "03",
    },
  ];

  const stats = [
    { value: "200+", label: t("home.stat1") },
    { value: "50+", label: t("home.stat2") },
    { value: "98%", label: t("home.stat3") },
  ];

  const reasons = [
    { icon: Zap, title: t("home.reason1Title"), desc: t("home.reason1Desc") },
    { icon: Heart, title: t("home.reason2Title"), desc: t("home.reason2Desc") },
    { icon: Shield, title: t("home.reason3Title"), desc: t("home.reason3Desc") },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ════════════════════════════════════════════
                HERO — dark, editorial, one perfect glow
            ════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden bg-[hsl(250_20%_6%)] px-6">

        {/* Single centered radial glow — understated */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 60%, hsl(270 80% 55% / 0.18) 0%, transparent 70%)",
          }}
        />

        {/* Dot-grid on dark bg */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">

          {/* Status badge */}
          <motion.div {...fadeIn(0.05)} className="mb-9">
            <span className="inline-flex items-center gap-2 border border-white/10 bg-white/5 text-white/60 text-xs font-medium px-4 py-1.5 rounded-full tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t("home.badge")}
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            {...fadeUp(0.15)}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.25rem] font-black leading-[1.02] tracking-[-0.04em] text-white mb-7"
          >
            {t("home.heroTitle1")}
            <br />
            <span className="text-gradient-animate">{t("home.heroTitle2")}</span>
          </motion.h1>

          {/* Sub-copy */}
          <motion.p
            {...fadeUp(0.3)}
            className="text-base md:text-lg text-white/45 max-w-xl mx-auto leading-relaxed mb-12 font-light"
          >
            {t("home.heroSubtitle")}
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            {...fadeUp(0.42)}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5"
          >
            <Link
              to="/builder"
              className="group inline-flex items-center gap-2.5 bg-gradient-brand text-white px-7 py-3.5 rounded-xl text-sm font-semibold shadow-brand hover:opacity-90 transition-opacity"
            >
              {t("home.startProject")}
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/builder"
              className="group inline-flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white/90 transition-colors px-5 py-3.5 rounded-xl border border-white/10 hover:border-white/20"
            >
              {t("home.viewServices")}
              <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform opacity-60" />
            </Link>
          </motion.div>
        </div>

        {/* Bottom fade out */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </section>

      {/* ════════════════════════════════════════════
                STATS — clean numbers, no decoration
            ════════════════════════════════════════════ */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto divide-x divide-border">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center px-4"
              >
                <p className="text-3xl md:text-4xl font-black text-gradient mb-1.5">{stat.value}</p>
                <p className="text-xs text-muted-foreground font-medium tracking-wide">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
                SERVICES — numbered, editorial layout
            ════════════════════════════════════════════ */}
      <section className="py-24 bg-dot-pattern">
        <div className="container mx-auto px-6 max-w-5xl">

          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="flex items-end justify-between mb-14 flex-wrap gap-4"
          >
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-[0.18em] mb-3">{t("home.whatWeDo")}</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">{t("home.ourServices")}</h2>
            </div>
            <Link
              to="/builder"
              className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              {t("home.viewServices")} <ArrowUpRight size={14} />
            </Link>
          </motion.div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-5">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="glow-card p-7 flex flex-col group"
              >
                {/* Number */}
                <span className="text-[10px] font-black text-primary/40 tracking-[0.2em] uppercase mb-6">{service.number}</span>

                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                  <service.icon size={19} className="text-primary" />
                </div>

                {/* Text */}
                <h3 className="text-base font-bold mb-2.5">{service.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{service.description}</p>

                {/* Learn more */}
                <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-primary/60 group-hover:text-primary transition-colors">
                  {t("home.startProject")} <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
                WHY US — clean alternating highlights
            ════════════════════════════════════════════ */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="text-center mb-14"
          >
            <p className="text-xs font-bold text-primary uppercase tracking-[0.18em] mb-3">{t("home.whyChooseUs")}</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">{t("home.builtDifferent")}</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {reasons.map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.55 }}
                className="glow-card p-7 group text-center"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center mx-auto mb-5 group-hover:bg-gradient-brand transition-all duration-300">
                  <r.icon size={18} className="text-primary group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-bold mb-2.5">{r.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
                CTA — dark stripe, one action, confident
            ════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden"
          style={{ background: "hsl(250 20% 6%)" }}
        >
          {/* Single glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 70% at 50% 100%, hsl(270 80% 55% / 0.22) 0%, transparent 65%)",
            }}
          />

          <div className="relative z-10 py-20 px-10 md:px-20 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-[1.05] mb-5">
              {t("home.ctaTitle")}
            </h2>
            <p className="text-white/40 mb-10 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
              {t("home.ctaSubtitle")}
            </p>
            <Link
              to="/builder"
              className="group inline-flex items-center gap-2.5 bg-gradient-brand text-white px-8 py-3.5 rounded-xl text-sm font-semibold shadow-brand hover:opacity-90 transition-opacity"
            >
              {t("home.launchBuilder")}
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
