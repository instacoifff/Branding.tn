import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
    ArrowLeft,
    Loader2,
    Save,
    Upload,
    FileText,
    Trash2,
    CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n";

type Project = {
    id: string;
    title: string;
    status: "onboarding" | "active" | "completed";
    current_stage: number;
    total_price: number;
    deposit_paid: boolean;
    created_at: string;
    profiles: { full_name: string | null; company: string | null } | null;
};

type FileRow = {
    id: string;
    file_name: string;
    file_url: string;
    type: "concept" | "final";
    uploaded_at: string;
};

const stageLabels = ["Brief", "Concepts", "Refinement", "Finalisation", "Delivery"];

const AdminProjectDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useI18n();

    const [project, setProject] = useState<Project | null>(null);
    const [files, setFiles] = useState<FileRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

    // Editable fields
    const [status, setStatus] = useState<Project["status"]>("onboarding");
    const [stage, setStage] = useState(1);
    const [depositPaid, setDepositPaid] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            const { data: proj, error: projErr } = await supabase
                .from("projects")
                .select("*, profiles(full_name, company)")
                .eq("id", id)
                .single();

            if (projErr || !proj) {
                toast.error(t("common.error"));
                navigate("/dashboard/admin/projects");
                return;
            }

            setProject(proj);
            setStatus(proj.status);
            setStage(proj.current_stage);
            setDepositPaid(proj.deposit_paid);

            const { data: fileData } = await supabase
                .from("files")
                .select("*")
                .eq("project_id", id)
                .order("uploaded_at", { ascending: false });

            setFiles(fileData || []);
            setLoading(false);
        };

        fetchData();
    }, [id, navigate]);

    const handleSave = async () => {
        if (!id) return;
        setSaving(true);
        const { error } = await supabase
            .from("projects")
            .update({ status, current_stage: stage, deposit_paid: depositPaid, updated_at: new Date().toISOString() })
            .eq("id", id);

        if (error) {
            toast.error(t("dashboard.adminProjectDetail.errorSave"));
        } else {
            toast.success(t("dashboard.adminProjectDetail.toastSaved"));
            setProject((prev) => prev ? { ...prev, status, current_stage: stage, deposit_paid: depositPaid } : prev);
        }
        setSaving(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileType: "concept" | "final") => {
        const file = e.target.files?.[0];
        if (!file || !id) return;
        setUploading(true);

        // Upload to Supabase Storage
        const filePath = `projects/${id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
            .from("project-files")
            .upload(filePath, file);

        if (uploadError) {
            toast.error(t("dashboard.adminProjectDetail.errorUpload"));
            setUploading(false);
            return;
        }

        // Get public URL
        const { data: urlData } = supabase.storage.from("project-files").getPublicUrl(filePath);
        const publicUrl = urlData.publicUrl;

        // Insert into files table
        const { data: newFile, error: insertError } = await supabase
            .from("files")
            .insert({ project_id: id, file_name: file.name, file_url: publicUrl, type: fileType })
            .select()
            .single();

        if (insertError) {
            toast.error(t("dashboard.adminProjectDetail.errorUpload"));
        } else {
            toast.success(t("dashboard.adminProjectDetail.toastUploaded"));
            setFiles((prev) => [newFile, ...prev]);
        }
        setUploading(false);
        e.target.value = "";
    };

    const handleDeleteFile = async (fileId: string) => {
        if (!confirm(t("dashboard.adminProjectDetail.deleteConfirm"))) return;
        setDeletingFileId(fileId);
        const { error } = await supabase.from("files").delete().eq("id", fileId);
        if (error) {
            toast.error(t("dashboard.adminProjectDetail.errorDelete"));
        } else {
            toast.success(t("dashboard.adminProjectDetail.toastDeleted"));
            setFiles((prev) => prev.filter((f) => f.id !== fileId));
        }
        setDeletingFileId(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!project) return null;

    const progressPct = (stage / 5) * 100;

    return (
        <div>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <Link
                    to="/dashboard/admin/projects"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                    <ArrowLeft size={15} />
                    {t("dashboard.adminProjectDetail.back")}
                </Link>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
                        <p className="text-muted-foreground mt-1">
                            Client: <span className="text-foreground font-medium">{project.profiles?.full_name || "Unknown"}</span>
                            {project.profiles?.company && (
                                <> · <span>{project.profiles.company}</span></>
                            )}
                        </p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-gradient-brand text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all shadow-brand disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                        {saving ? t("dashboard.adminProjectDetail.saving") : t("dashboard.adminProjectDetail.saveChanges")}
                    </button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Edit Panel */}
                <div className="lg:col-span-1 space-y-5">
                    {/* Status */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">{t("dashboard.adminProjectDetail.status")}</h2>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as Project["status"])}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="onboarding">{t("dashboard.status.onboarding")}</option>
                            <option value="active">{t("dashboard.status.active")}</option>
                            <option value="completed">{t("dashboard.status.completed")}</option>
                        </select>
                    </motion.div>

                    {/* Stage */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.05 } }} className="bg-card rounded-xl border border-border p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">{t("dashboard.adminProjectDetail.stage")}</h2>
                        <div className="space-y-2">
                            {stageLabels.map((label, idx) => (
                                <button
                                    key={label}
                                    onClick={() => setStage(idx + 1)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${stage === idx + 1
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }`}
                                >
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${idx + 1 < stage ? "bg-primary text-primary-foreground" :
                                        idx + 1 === stage ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                                        }`}>
                                        {idx + 1 < stage ? <CheckCircle2 size={12} /> : idx + 1}
                                    </span>
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div className="mt-4">
                            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                                <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1.5">{Math.round(progressPct)}% complete</p>
                        </div>
                    </motion.div>

                    {/* Deposit */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.1 } }} className="bg-card rounded-xl border border-border p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Payment</h2>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Total: {project.total_price.toLocaleString()} TND</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Deposit (30%): {(project.total_price * 0.3).toLocaleString()} TND</p>
                            </div>
                            <button
                                onClick={() => setDepositPaid(!depositPaid)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${depositPaid ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    }`}
                            >
                                <CheckCircle2 size={13} />
                                {depositPaid ? t("dashboard.adminProjectDetail.yes") : t("dashboard.adminProjectDetail.depositPaid")}
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Right: Files */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Upload */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.05 } }} className="bg-card rounded-xl border border-border p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">{t("dashboard.adminProjectDetail.uploadFile")}</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-5 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                                <Upload size={20} className="text-muted-foreground" />
                                <span className="text-sm font-medium">{t("dashboard.adminProjectDetail.concept")}</span>
                                <span className="text-xs text-muted-foreground">PNG, PDF, AI, etc.</span>
                                <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, "concept")} disabled={uploading} />
                            </label>
                            <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-5 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                                <Upload size={20} className="text-muted-foreground" />
                                <span className="text-sm font-medium">{t("dashboard.adminProjectDetail.final")}</span>
                                <span className="text-xs text-muted-foreground">PNG, PDF, AI, etc.</span>
                                <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, "final")} disabled={uploading} />
                            </label>
                        </div>
                        {uploading && (
                            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                                <Loader2 size={14} className="animate-spin" />
                                {t("dashboard.adminProjectDetail.uploading")}
                            </div>
                        )}
                    </motion.div>

                    {/* File List */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.1 } }} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-border">
                            <h2 className="text-sm font-semibold">{t("dashboard.adminProjectDetail.files")} ({files.length})</h2>
                        </div>
                        {files.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-sm">{t("dashboard.adminProjectDetail.noFiles")}</div>
                        ) : (
                            <div className="divide-y divide-border">
                                {files.map((file) => (
                                    <div key={file.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/20 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <FileText size={16} className="text-muted-foreground shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium">{file.file_name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    <span className={`capitalize font-medium ${file.type === "final" ? "text-green-600" : "text-purple-600"}`}>{file.type}</span>
                                                    {" · "}
                                                    {new Date(file.uploaded_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline font-medium">
                                                Download
                                            </a>
                                            {deletingFileId === file.id ? (
                                                <Loader2 size={13} className="animate-spin text-destructive" />
                                            ) : (
                                                <button onClick={() => handleDeleteFile(file.id)} className="text-xs text-destructive hover:underline font-medium">
                                                    <Trash2 size={13} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AdminProjectDetail;
