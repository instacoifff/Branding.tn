import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Layers, Palette, Zap, Heart, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const services = [
  {
    icon: Sparkles,
    title: "Logo Design",
    description: "Distinctive marks that capture your brand's essence and stand the test of time.",
  },
  {
    icon: Layers,
    title: "Brand Identity",
    description: "Complete visual systems — from typography to color palettes — that tell your story.",
  },
  {
    icon: Palette,
    title: "Social Media Kit",
    description: "Scroll-stopping templates and assets designed for every major platform.",
  },
];

const stats = [
  { value: "200+", label: "Projects Delivered" },
  { value: "50+", label: "Happy Clients" },
  { value: "98%", label: "Satisfaction Rate" },
];

const reasons = [
  { icon: Zap, title: "Fast Turnaround", desc: "Get your brand assets delivered within days, not weeks." },
  { icon: Heart, title: "Crafted with Care", desc: "Every pixel is intentional. Every detail matters to us." },
  { icon: Shield, title: "Full Ownership", desc: "You own everything we create. All files, all rights, forever." },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        {/* Gradient blob decorations */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-brand opacity-[0.06] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-1.5 rounded-full text-xs font-medium mb-8"
          >
            <Sparkles size={14} className="text-primary" />
            Creative Agency · Tunisia
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6"
          >
            We Build Brands
            <br />
            <span className="text-gradient">That Matter</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed"
          >
            From strategy to execution, we craft premium brand experiences
            that elevate businesses across Tunisia and beyond.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              to="/builder"
              className="group flex items-center gap-2 bg-gradient-brand text-primary-foreground px-7 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-all shadow-brand"
            >
              Start Your Project
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/builder"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-6 py-3 rounded-xl border border-border hover:border-primary/30"
            >
              View Services
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-extrabold text-gradient">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
              What We Do
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Our Services</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-hover p-7 group cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-brand-subtle flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <service.icon size={22} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
              Why Choose Us
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Built Different</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {reasons.map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-7"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-brand-subtle flex items-center justify-center mb-5 mx-auto">
                  <r.icon size={22} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{r.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-brand rounded-2xl p-12 md:p-16 text-center max-w-4xl mx-auto shadow-brand"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Build Your Brand?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto text-sm md:text-base">
              Use our interactive project builder to select services, see pricing, and get started in minutes.
            </p>
            <Link
              to="/builder"
              className="inline-flex items-center gap-2 bg-background text-foreground px-7 py-3 rounded-xl text-sm font-medium hover:bg-background/90 transition-all"
            >
              Launch Project Builder
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
