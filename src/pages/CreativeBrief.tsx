import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";

const CreativeBrief = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ company: "", industry: "", description: "", audience: "", style: "", references: "" });
  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
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

          <motion.form
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onSubmit={handleSubmit}
            className="bg-card rounded-xl border border-border p-7 shadow-card space-y-5"
          >
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Company Name</label>
                <input value={form.company} onChange={(e) => update("company", e.target.value)} placeholder="Your Company" className={inputClass} />
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

            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-gradient-brand text-primary-foreground py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-all shadow-brand">
              Submit Brief & Continue
              <ArrowRight size={16} />
            </button>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default CreativeBrief;
