import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight, Sparkles, Layers, Palette } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useI18n } from "@/i18n";

const ProjectBuilder = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const navigate = useNavigate();
  const { t } = useI18n();

  const services = [
    {
      id: "logo",
      icon: Sparkles,
      title: t("builder.service1Title"),
      description: t("builder.service1Desc"),
      price: 1500,
      features: [t("builder.service1F1"), t("builder.service1F2"), t("builder.service1F3"), t("builder.service1F4")],
    },
    {
      id: "identity",
      icon: Layers,
      title: t("builder.service2Title"),
      description: t("builder.service2Desc"),
      price: 3500,
      features: [t("builder.service2F1"), t("builder.service2F2"), t("builder.service2F3"), t("builder.service2F4"), t("builder.service2F5")],
    },
    {
      id: "social",
      icon: Palette,
      title: t("builder.service3Title"),
      description: t("builder.service3Desc"),
      price: 2000,
      features: [t("builder.service3F1"), t("builder.service3F2"), t("builder.service3F3"), t("builder.service3F4"), t("builder.service3F5")],
    },
  ];

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );

  const total = services.filter((s) => selected.includes(s.id)).reduce((sum, s) => sum + s.price, 0);
  const deposit = Math.round(total * 0.3);

  const handleStartProject = () => {
    const selectedServices = services
      .filter((s) => selected.includes(s.id))
      .map(({ id, title, price }) => ({ id, title, price }));
    sessionStorage.setItem("builder_services", JSON.stringify(selectedServices));
    sessionStorage.setItem("builder_total", String(total));
    navigate("/brief");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
            <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
              {t("builder.badge")}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t("builder.title")}</h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm">
              {t("builder.subtitle")}
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
                  className={`relative text-left rounded-xl p-7 transition-all duration-200 border ${isSelected
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
                    {service.price.toLocaleString()} {t("common.tnd")}
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
                <h3 className="text-lg font-semibold mb-5">{t("builder.estimate")}</h3>

                <div className="space-y-3 mb-5">
                  {services.filter((s) => selected.includes(s.id)).map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{s.title}</span>
                      <span className="font-medium">{s.price.toLocaleString()} {t("common.tnd")}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">{t("builder.total")}</span>
                    <span className="text-xl font-bold">{total.toLocaleString()} {t("common.tnd")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-primary text-sm font-medium">{t("builder.deposit")}</span>
                    <span className="text-xl font-bold text-gradient">{deposit.toLocaleString()} {t("common.tnd")}</span>
                  </div>
                </div>

                <button
                  onClick={handleStartProject}
                  className="mt-7 w-full flex items-center justify-center gap-2 bg-gradient-brand text-primary-foreground py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-all shadow-brand"
                >
                  {t("builder.startProject")}
                  <ArrowRight size={16} />
                </button>
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
