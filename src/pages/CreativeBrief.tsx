import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, CreditCard, Shield, Upload, X, FileImage, FileText, File as FileIcon, Image as ImageIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useI18n } from "@/i18n";
import { useStripeCheckout } from "@/hooks/use-stripe-checkout";

type SelectedService = { id: string; title: string; price: number };
type InspirationFile = { name: string; size: number; type: string; preview?: string; file: File };

const MAX_FILES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
  "application/pdf",
  "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) return ImageIcon;
  if (type === "application/pdf") return FileText;
  return FileIcon;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const CreativeBrief = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem("draft_brief");
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return { company: "", industry: "", description: "", audience: "", style: "", references: "" };
  });
  const [inspirationFiles, setInspirationFiles] = useState<InspirationFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const rawServices = sessionStorage.getItem("builder_services") || localStorage.getItem("builder_services");
    const rawTotal = sessionStorage.getItem("builder_total") || localStorage.getItem("builder_total");
    if (rawServices) setSelectedServices(JSON.parse(rawServices));
    if (rawTotal) setTotal(Number(rawTotal));
    if (sessionStorage.getItem("builder_services")) {
      localStorage.setItem("builder_services", sessionStorage.getItem("builder_services")!);
      localStorage.setItem("builder_total", sessionStorage.getItem("builder_total") || "0");
    }
  }, []);

  const update = (field: string, value: string) => {
    setForm((prev: typeof form) => {
      const next = { ...prev, [field]: value };
      localStorage.setItem("draft_brief", JSON.stringify(next));
      return next;
    });
  };
  const deposit = Math.round(total * 0.3);

  const { startCheckout, loading: checkoutLoading } = useStripeCheckout();

  // ── File handling ──
  const addFiles = useCallback((fileList: FileList | File[]) => {
    const newFiles: InspirationFile[] = [];
    const files = Array.from(fileList);

    for (const file of files) {
      if (inspirationFiles.length + newFiles.length >= MAX_FILES) {
        toast.error(`Maximum ${MAX_FILES} files allowed`);
        break;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds 10MB limit`);
        continue;
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: unsupported format`);
        continue;
      }

      const entry: InspirationFile = { name: file.name, size: file.size, type: file.type, file };
      if (file.type.startsWith("image/")) {
        entry.preview = URL.createObjectURL(file);
      }
      newFiles.push(entry);
    }

    if (newFiles.length > 0) {
      setInspirationFiles((prev) => [...prev, ...newFiles]);
    }
  }, [inspirationFiles.length]);

  const removeFile = (index: number) => {
    setInspirationFiles((prev) => {
      const removed = prev[index];
      if (removed.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Drag & drop
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
  };

  // ── Upload files to Supabase ──
  const uploadInspirationFiles = async (projectId: string): Promise<{ name: string; url: string; type: string; size: number }[]> => {
    const uploaded: { name: string; url: string; type: string; size: number }[] = [];

    for (let i = 0; i < inspirationFiles.length; i++) {
      const f = inspirationFiles[i];
      setUploadProgress(`Uploading ${i + 1}/${inspirationFiles.length}: ${f.name}`);

      const ext = f.name.split(".").pop() || "bin";
      const safeName = `${Date.now()}_${i}.${ext}`;
      const filePath = `brief-attachments/${projectId}/${safeName}`;

      const { error } = await supabase.storage.from("project-files").upload(filePath, f.file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (error) {
        console.error("Upload error:", error);
        toast.error(`Failed to upload ${f.name}`);
        continue;
      }

      const { data: urlData } = supabase.storage.from("project-files").getPublicUrl(filePath);
      uploaded.push({ name: f.name, url: urlData.publicUrl, type: f.type, size: f.size });
    }

    setUploadProgress(null);
    return uploaded;
  };

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
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
      // Create project first (without attachments)
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
          attachments: [], // placeholder
        },
        total_price: total,
        deposit_paid: false,
        status: "onboarding",
        current_stage: 1,
      }).select().single();

      if (error) throw error;

      // Upload inspiration files and update project
      if (inspirationFiles.length > 0 && project) {
        const attachments = await uploadInspirationFiles(project.id);
        if (attachments.length > 0) {
          await supabase.from("projects").update({
            creative_brief: {
              industry: form.industry,
              description: form.description,
              audience: form.audience,
              style: form.style,
              references: form.references,
              attachments,
            },
          }).eq("id", project.id);
        }
      }

      // Clean up
      sessionStorage.removeItem("builder_services");
      sessionStorage.removeItem("builder_total");
      localStorage.removeItem("builder_services");
      localStorage.removeItem("builder_total");
      localStorage.removeItem("draft_brief");
      localStorage.removeItem("auth_redirect");
      // Release object URLs
      inspirationFiles.forEach((f) => { if (f.preview) URL.revokeObjectURL(f.preview); });

      toast.success(t("brief.toastSuccess"));

      if (deposit > 0 && project) {
        await startCheckout({
          projectId: project.id,
          amountCents: Math.round(deposit * 100),
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
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
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

            {/* ═══ INSPIRATION FILE UPLOAD ═══ */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Inspiration Files</label>
                <span className="text-xs text-muted-foreground">{inspirationFiles.length}/{MAX_FILES} files</span>
              </div>
              <p className="text-xs text-muted-foreground -mt-1">
                Upload logos you like, brand references, mood boards, PDFs — anything that helps us understand your vision.
              </p>

              {/* Drop zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30 hover:bg-muted/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ACCEPTED_TYPES.join(",")}
                  onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
                  className="hidden"
                />
                <Upload size={24} className={`mx-auto mb-2 ${isDragging ? "text-primary" : "text-muted-foreground/50"}`} />
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-primary">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Images (JPG, PNG, GIF, WebP, SVG) · Documents (PDF, DOC, PPT) · Max 10MB each
                </p>
              </div>

              {/* File previews */}
              <AnimatePresence>
                {inspirationFiles.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                    {inspirationFiles.map((f, i) => {
                      const Icon = getFileIcon(f.type);
                      return (
                        <motion.div key={`${f.name}-${i}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="relative group rounded-lg border border-border bg-muted overflow-hidden"
                        >
                          {/* Preview or icon */}
                          {f.preview ? (
                            <img src={f.preview} alt={f.name} className="w-full h-24 object-cover" />
                          ) : (
                            <div className="w-full h-24 flex items-center justify-center bg-muted">
                              <Icon size={28} className="text-muted-foreground/40" />
                            </div>
                          )}

                          {/* File info overlay */}
                          <div className="p-2">
                            <p className="text-xs font-medium text-foreground truncate">{f.name}</p>
                            <p className="text-[10px] text-muted-foreground">{formatFileSize(f.size)}</p>
                          </div>

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-destructive/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ═══ PAYMENT ═══ */}
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
              {uploadProgress
                ? uploadProgress
                : (loading || checkoutLoading)
                  ? t("brief.submitting")
                  : deposit > 0
                    ? `Submit Brief & Pay €${deposit.toLocaleString()}`
                    : t("brief.submit")}
            </button>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default CreativeBrief;
