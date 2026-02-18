import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type SelectedService = { id: string; title: string; price: number };

const CreativeBrief = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ company: "", industry: "", description: "", audience: "", style: "", references: "" });
  const [loading, setLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Read builder data from sessionStorage
    const rawServices = sessionStorage.getItem("builder_services");
    const rawTotal = sessionStorage.getItem("builder_total");
    if (rawServices) setSelectedServices(JSON.parse(rawServices));
    if (rawTotal) setTotal(Number(rawTotal));
  }, []);

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));
  const deposit = Math.round(total * 0.3);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to submit a brief.");
      navigate("/auth");
      return;
    }

    if (!form.company.trim()) {
      toast.error("Please enter your company name.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("projects").insert({
        client_id: user.id,
        title: form.company.trim(),
        services_selected: selectedServices,
        total_price: total,
        deposit_paid: false,
        status: "onboarding",
        current_stage: 1,
      });

      if (error) throw error;

      // Clear sessionStorage after successful submission
      sessionStorage.removeItem("builder_services");
      sessionStorage.removeItem("builder_total");

      toast.success("Brief submitted! Your project has been created. 🎉");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit brief. Please try again.");
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
            <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">Step 2</span>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Creative Brief</h1>
            <p className="text-muted-foreground text-sm">Tell us about your brand so we can start creating.</p>
          </motion.div>

          {/* Selected services summary */}
          {selectedServices.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6"
            >
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Your Package</p>
              <div className="space-y-1">
                {selectedServices.map((s) => (
                  <div key={s.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.title}</span>
                    <span className="font-medium">{s.price.toLocaleString()} TND</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-primary/20 mt-3 pt-3 flex justify-between text-sm font-semibold">
                <span>Total</span>
                <span>{total.toLocaleString()} TND</span>
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
                <label className="text-sm font-medium">Company Name *</label>
                <input required value={form.company} onChange={(e) => update("company", e.target.value)} placeholder="Your Company" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Industry</label>
                <input value={form.industry} onChange={(e) => update("industry", e.target.value)} placeholder="e.g. Technology, Fashion" className={inputClass} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Project Description</label>
              <textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="What are you looking to create?" rows={4} className={inputClass + " resize-none"} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Target Audience</label>
              <input value={form.audience} onChange={(e) => update("audience", e.target.value)} placeholder="Who is your target market?" className={inputClass} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Style Preferences</label>
              <input value={form.style} onChange={(e) => update("style", e.target.value)} placeholder="Modern, Classic, Playful, Bold..." className={inputClass} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Brand References</label>
              <textarea value={form.references} onChange={(e) => update("references", e.target.value)} placeholder="Any brands or designs you admire?" rows={3} className={inputClass + " resize-none"} />
            </div>

            <div className="border-t border-border pt-5">
              <h3 className="text-base font-semibold mb-3">Payment — 30% Deposit</h3>
              {deposit > 0 && (
                <p className="text-sm font-medium text-primary mb-3">
                  Amount due: <span className="text-lg font-bold">{deposit.toLocaleString()} TND</span>
                </p>
              )}
              <div className="bg-muted rounded-xl p-4 mb-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Bank Transfer Details:</p>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Bank:</span> <span className="font-medium">BIAT Tunisia</span></p>
                  <p><span className="text-muted-foreground">Account:</span> <span className="font-medium">XX XXX XXXXXXX XX</span></p>
                  <p><span className="text-muted-foreground">IBAN:</span> <span className="font-medium">TN59 XXXX XXXX XXXX XXXX XX</span></p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Complete your bank transfer and upload a receipt. Our team will confirm within 24 hours.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-brand text-primary-foreground py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-all shadow-brand disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {loading ? "Submitting..." : "Submit Brief & Continue"}
            </button>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default CreativeBrief;
