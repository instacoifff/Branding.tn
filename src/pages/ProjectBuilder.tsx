import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, ArrowRight, Sparkles, Layers, Palette } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Service {
  id: string;
  icon: typeof Sparkles;
  title: string;
  description: string;
  price: number;
  features: string[];
}

const services: Service[] = [
  {
    id: "logo",
    icon: Sparkles,
    title: "Logo Design",
    description: "A distinctive, timeless logo with multiple concepts and revisions.",
    price: 1500,
    features: ["3 Initial Concepts", "Unlimited Revisions", "All File Formats", "Brand Guidelines"],
  },
  {
    id: "identity",
    icon: Layers,
    title: "Brand Identity",
    description: "Complete visual identity system for consistent brand presence.",
    price: 3500,
    features: ["Color Palette", "Typography System", "Business Cards", "Stationery Design", "Brand Book"],
  },
  {
    id: "social",
    icon: Palette,
    title: "Social Media Kit",
    description: "Platform-optimized templates for engaging social content.",
    price: 2000,
    features: ["Instagram Templates", "Facebook Covers", "LinkedIn Assets", "Story Templates", "Post Templates"],
  },
];

const ProjectBuilder = () => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );

  const total = services.filter((s) => selected.includes(s.id)).reduce((sum, s) => sum + s.price, 0);
  const deposit = Math.round(total * 0.3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
            <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
              Project Builder
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Build Your Package</h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm">
              Select the services you need. See real-time pricing and pay only 30% to get started.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-5 max-w-5xl mx-auto mb-10">
            {services.map((service, i) => {
              const isSelected = selected.includes(service.id);
              return (
                <motion.button
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => toggle(service.id)}
                  className={`relative text-left rounded-xl p-7 transition-all duration-200 border ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-brand"
                      : "border-border bg-card hover:border-primary/20 shadow-soft hover:shadow-card"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gradient-brand flex items-center justify-center"
                    >
                      <Check size={14} className="text-primary-foreground" />
                    </motion.div>
                  )}

                  <div className="w-11 h-11 rounded-xl bg-gradient-brand-subtle flex items-center justify-center mb-5">
                    <service.icon size={22} className="text-primary" />
                  </div>

                  <h3 className="text-lg font-semibold mb-1.5">{service.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                  <p className="text-2xl font-bold text-gradient mb-5">
                    {service.price.toLocaleString()} TND
                  </p>

                  <ul className="space-y-2">
                    {service.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check size={14} className="text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {selected.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="bg-card rounded-xl border border-border p-8 max-w-2xl mx-auto shadow-card"
              >
                <h3 className="text-lg font-semibold mb-5">Your Estimate</h3>

                <div className="space-y-3 mb-5">
                  {services.filter((s) => selected.includes(s.id)).map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{s.title}</span>
                      <span className="font-medium">{s.price.toLocaleString()} TND</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Total</span>
                    <span className="text-xl font-bold">{total.toLocaleString()} TND</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-primary text-sm font-medium">30% Deposit to Start</span>
                    <span className="text-xl font-bold text-gradient">{deposit.toLocaleString()} TND</span>
                  </div>
                </div>

                <Link
                  to="/auth"
                  className="mt-7 w-full flex items-center justify-center gap-2 bg-gradient-brand text-primary-foreground py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-all shadow-brand"
                >
                  Start Project
                  <ArrowRight size={16} />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProjectBuilder;
