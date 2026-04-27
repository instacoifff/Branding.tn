import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, CheckCircle2, FileText, Download, Loader2, FolderOpen } from "lucide-react";
import { useI18n } from "@/i18n";

type Project = {
    id: string;
    title: string;
    status: "onboarding" | "active" | "completed";
    current_stage: number;
    total_price: number;
    deposit_paid: boolean;
    created_at: string;
    updated_at: string;
};

type FileRow = {
    id: string;
    file_name: string;
    file_url: string;
    type: "concept" | "final";
    uploaded_at: string;
};

const statusColors = {
    onboarding: "bg-orange-500/10 text-orange-600",
    active: "bg-blue-500/10 text-blue-600",
    completed: "bg-green-500/10 text-green-600",
};

const stageLabels = ["Brief", "Concepts", "Refinement", "Finalisation", "Delivery"];

const ProjectDetail = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const { t } = useI18n();

    const [project, setProject] = useState<Project | null>(null);
    const [files, setFiles] = useState<FileRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !id) return;
            const { data: proj } = await supabase
                .from("projects")
                .select("*")
                .eq("id", id)
                .eq("client_id", user.id)
                .single();

            const { data: fileData } = await supabase
                .from("files")
                .select("*")
                .eq("project_id", id)
                .order("uploaded_at", { ascending: false });

            setProject(proj || null);
            setFiles(fileData || []);
            setLoading(false);
        };
        fetchData();
    }, [user, id]);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

    if (!project) return (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
            <FolderOpen size={40} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">Project not found</h3>
            <Link to="/dashboard/projects" className="text-sm text-primary hover:underline">
                {t("dashboard.projectDetailPage.back")}
            </Link>
        </div>
    );

    const progressPct = (project.current_stage / 5) * 100;
    const statusColor = statusColors[project.status] ?? statusColors.onboarding;

    return (
        <div>
            {/* Back link */}
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <Link
                    to="/dashboard/projects"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                >
                    <ArrowLeft size={14} />
                    {t("dashboard.projectDetailPage.back")}
                </Link>
            </motion.div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* ── Main ── */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card rounded-2xl border border-border p-6 shadow-sm"
                    >
                        <div className="flex items-start justify-between gap-4 mb-5">
                            <div>
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor} mb-2 inline-block`}>
                                    {t(`dashboard.status.${project.status}`)}
                                </span>
                                <h1 className="text-2xl font-bold tracking-tight">{project.title}</h1>
                                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1.5">
                                    <Clock size={13} />
                                    {new Date(project.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            {project.deposit_paid ? (
                                <span className="flex items-center gap-1.5 text-sm text-green-600 bg-green-500/10 px-3 py-1.5 rounded-full shrink-0">
                                    <CheckCircle2 size={14} />
                                    {t("dashboard.projectDetailPage.depositPaid")}
                                </span>
                            ) : (
                                <span className="text-sm text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-full shrink-0">
                                    {t("dashboard.projectDetailPage.depositPending")}
                                </span>
                            )}
                        </div>

                        {/* Progress */}
                        <div>
                            <div className="flex justify-between text-xs text-muted-foreground mb-2">
                                <span>
                                    {t("dashboard.projectDetailPage.stage")} {project.current_stage} {t("dashboard.projectDetailPage.of")} 5: {stageLabels[project.current_stage - 1]}
                                </span>
                                <span>{Math.round(progressPct)}% {t("dashboard.projectDetailPage.complete")}</span>
                            </div>
                            <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPct}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="bg-primary h-full rounded-full"
                                />
                            </div>
                            <div className="flex justify-between mt-2.5">
                                {stageLabels.map((label, idx) => (
                                    <div key={label} className="flex flex-col items-center gap-1">
                                        <div className={`w-2 h-2 rounded-full ${idx < project.current_stage ? "bg-primary" : "bg-muted-foreground/30"}`} />
                                        <span className={`text-[10px] font-medium ${idx < project.current_stage ? "text-primary" : "text-muted-foreground"}`}>
                                            {label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Files card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b border-border">
                            <h2 className="font-semibold">{t("dashboard.projectDetailPage.files")}</h2>
                        </div>

                        {files.length === 0 ? (
                            <div className="p-10 text-center">
                                <FolderOpen size={32} className="mx-auto text-muted-foreground mb-3" />
                                <p className="text-sm text-muted-foreground">{t("dashboard.projectDetailPage.noFiles")}</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm text-left">
                                <tbody className="divide-y divide-border">
                                    {files.map((file) => (
                                        <tr key={file.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <FileText size={15} className="text-muted-foreground shrink-0" />
                                                    <span className="font-medium">{file.file_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${file.type === "final" ? "bg-green-500/10 text-green-600" : "bg-purple-500/10 text-purple-600"}`}>
                                                    {file.type === "final" ? t("dashboard.filesPage.final") : t("dashboard.filesPage.concept")}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground text-xs">
                                                {new Date(file.uploaded_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <a
                                                    href={file.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-primary hover:underline text-xs font-medium"
                                                >
                                                    <Download size={13} />
                                                    {t("common.download")}
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </motion.div>
                </div>

                {/* ── Sidebar ── */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-card rounded-2xl border border-border p-6 shadow-sm"
                    >
                        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                            {t("dashboard.projectDetailPage.payment")}
                        </h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">{t("dashboard.projectDetailPage.total")}</span>
                                <span className="text-base font-bold">{project.total_price.toLocaleString()} TND</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">{t("dashboard.projectDetailPage.deposit")}</span>
                                <span className="text-sm font-medium">{(project.total_price * 0.3).toLocaleString()} TND</span>
                            </div>
                            <div className="border-t border-border pt-3">
                                {project.deposit_paid ? (
                                    <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                                        <CheckCircle2 size={14} />
                                        {t("dashboard.projectDetailPage.depositPaid")}
                                    </div>
                                ) : (
                                    <p className="text-sm text-orange-500">{t("dashboard.projectDetailPage.depositPending")}</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;
