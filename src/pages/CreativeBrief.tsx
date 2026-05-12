import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, CreditCard, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useI18n } from "@/i18n";
import { useStripeCheckout } from "@/hooks/use-stripe-checkout";

type SelectedService = { id: string; title: string; price: number };

const CreativeBrief = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const [form, setForm] = useState(() => {
    // Restore saved brief from localStorage (survives auth redirect)
    const saved = localStorage.getItem("draft_brief");
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return { company: "", industry: "", description: "", audience: "", style: "", references: "" };
  });
  const [loading, setLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Try sessionStorage first (fresh from builder), fallback to localStorage (after auth redirect)
    const rawServices = sessionStorage.getItem("builder_services") || localStorage.getItem("builder_services");
    const rawTotal = sessionStorage.getItem("builder_total") || localStorage.getItem("builder_total");
    if (rawServices) setSelectedServices(JSON.parse(rawServices));
    if (rawTotal) setTotal(Number(rawTotal));
    // Persist to localStorage so it survives auth redirect
    if (sessionStorage.getItem("builder_services")) {
      localStorage.setItem("builder_services", sessionStorage.getItem("builder_services")!);
      localStorage.setItem("builder_total", sessionStorage.getItem("builder_total") || "0");
    }
  }, []);

  // Auto-save form as user types (debounced via React state)
  const update = (field: string, value: string) => {
    setForm((prev: typeof form) => {
      const next = { ...prev, [field]: value };
      localStorage.setItem("draft_brief", JSON.stringify(next));
      return next;
    });
  };
  const deposit = Math.round(total * 0.3);

  const { startCheckout, loading: checkoutLoading } = useStripeCheckout();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      // Save return intent so auth page redirects back here
      localStorage.setItem("auth_redirect", "/brief");
      toast.info("Please sign in to submit your brief. Your progress is saved!");
      navigate("/auth");
      return;
    }

    if (!form.company.trim()) {
      toast.error(t("brief.errorNoCompany"));
      return;
    }

    setLoading(true);
    try {
      const { data: project, error } = await supabase.from("projects").insert({
        client_id: user.id,
        title: form.company.trim(),
        services_selected: selectedServices,
        creative_brief: {
          industry: form.industry,
          description: form.description,
          audience: form.audience,
          style: form.style,
          references: form.references,
        },
        total_price: total,
        deposit_paid: false,
        status: "onboarding",
        current_stage: 1,
      }).select().single();

      if (error) throw error;

      // Clear all draft data from both storages
      sessionStorage.removeItem("builder_services");
      sessionStorage.removeItem("builder_total");
      localStorage.removeItem("builder_services");
      localStorage.removeItem("builder_total");
      localStorage.removeItem("draft_brief");
      localStorage.removeItem("auth_redirect");

      toast.success(t("brief.toastSuccess"));

      // If there's a deposit to pay, redirect to Stripe Checkout
      if (deposit > 0 && project) {
        await startCheckout({
          projectId: project.id,
          amountCents: Math.round(deposit * 100), // TND→EUR approximate or use EUR directly
          currency: "eur",
          clientEmail: user.email || "",
          projectTitle: form.company.trim(),
        });
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || t("brief.errorSubmit"));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">{t("brief.step")}</span>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{t("brief.title")}</h1>
            <p className="text-muted-foreground text-sm">{t("brief.subtitle")}</p>
          </motion.div>

          {selectedServices.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6"
            >
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">{t("brief.yourPackage")}</p>
              <div className="space-y-1">
                {selectedServices.map((s) => (
                  <div key={s.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.title}</span>
                    <span className="font-medium">{s.price.toLocaleString()} {t("common.tnd")}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-primary/20 mt-3 pt-3 flex justify-between text-sm font-semibold">
                <span>{t("brief.total")}</span>
                <span>{total.toLocaleString()} {t("common.tnd")}</span>
              </div>
            </motion.div>
          )}

          <motion.form
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onSubmit={handleSubmit}
            className="bg-card rounded-xl border border-border p-7 shadow-card space-y-5"
          >
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t("brief.companyName")}</label>
                <input required value={form.company} onChange={(e) => update("company", e.target.value)} placeholder={t("brief.companyPlaceholder")} className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t("brief.industry")}</label>
                <input value={form.industry} onChange={(e) => update("industry", e.target.value)} placeholder={t("brief.industryPlaceholder")} className={inputClass} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("brief.description")}</label>
              <textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder={t("brief.descriptionPlaceholder")} rows={4} className={inputClass + " resize-none"} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("brief.audience")}</label>
              <input value={form.audience} onChange={(e) => update("audience", e.target.value)} placeholder={t("brief.audiencePlaceholder")} className={inputClass} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("brief.style")}</label>
              <input value={form.style} onChange={(e) => update("style", e.target.value)} placeholder={t("brief.stylePlaceholder")} className={inputClass} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("brief.references")}</label>
              <textarea value={form.references} onChange={(e) => update("references", e.target.value)} placeholder={t("brief.referencesPlaceholder")} rows={3} className={inputClass + " resize-none"} />
            </div>

            <div className="border-t border-border pt-5">
              <h3 className="text-base font-semibold mb-3">{t("brief.paymentTitle")}</h3>
              {deposit > 0 && (
                <p className="text-sm font-medium text-primary mb-3">
                  {t("brief.amountDue")} <span className="text-lg font-bold">€{deposit.toLocaleString()}</span>
                </p>
              )}
              <div className="bg-muted rounded-xl p-4 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard size={14} className="text-primary" />
                  <p className="text-xs font-medium text-foreground">Secure Online Payment via Stripe</p>
                </div>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <p>After submitting your brief, you'll be redirected to our secure payment page to complete your 30% deposit.</p>
                  <div className="flex items-center gap-1.5 text-[11px] mt-2">
                    <Shield size={11} className="text-green-500" />
                    <span className="text-green-600 font-medium">256-bit SSL encrypted • Visa, Mastercard, AMEX accepted</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || checkoutLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-brand text-primary-foreground py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-all shadow-brand disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(loading || checkoutLoading) ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
              {(loading || checkoutLoading) ? t("brief.submitting") : deposit > 0 ? `Submit Brief & Pay €${deposit.toLocaleString()}` : t("brief.submit")}
            </button>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default CreativeBrief;
