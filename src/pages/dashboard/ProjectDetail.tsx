import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft, Clock, CheckCircle2, FileText, Download, Loader2,
    FolderOpen, PlayCircle, CheckSquare, Image, Film, Archive, FileCode2,
    MessageSquare
} from "lucide-react";
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
    services_selected?: { id: string; title: string; price: number }[];
};

type FileRow = {
    id: string;
    file_name: string;
    file_url: string;
    type: "concept" | "final";
    uploaded_at: string;
};

type Task = {
    id: string;
    title: string;
    description: string | null;
    status: "todo" | "doing" | "done";
};

const STATUS_COLORS = {
    onboarding: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    active: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    completed: "bg-green-500/10 text-green-600 border-green-500/20",
};

const TASK_STATUS_CONFIG = {
    todo: { label: "To Do", icon: Clock, cls: "bg-muted text-muted-foreground" },
    doing: { label: "In Progress", icon: PlayCircle, cls: "bg-blue-500/10 text-blue-600" },
    done: { label: "Done", icon: CheckSquare, cls: "bg-green-500/10 text-green-600" },
};

const STAGE_LABELS = ["Brief", "Concepts", "Refinement", "Finalisation", "Delivery"];

function getFileIcon(name: string) {
    const ext = name.split(".").pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext)) return Image;
    if (["mp4", "mov", "avi", "webm"].includes(ext)) return Film;
    if (["zip", "rar", "tar", "gz"].includes(ext)) return Archive;
    if (["html", "css", "js", "ts", "jsx", "tsx", "json"].includes(ext)) return FileCode2;
    return FileText;
}

const ProjectDetail = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const { t } = useI18n();

    const [project, setProject] = useState<Project | null>(null);
    const [files, setFiles] = useState<FileRow[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !id) return;
            const [{ data: proj }, { data: fileData }, { data: taskData }] = await Promise.all([
                supabase.from("projects").select("*").eq("id", id).eq("client_id", user.id).single(),
                supabase.from("files").select("*").eq("project_id", id).order("uploaded_at", { ascending: false }),
                supabase.from("tasks").select("id, title, description, status").eq("project_id", id).order("created_at"),
            ]);

            setProject(proj || null);
            setFiles(fileData || []);
            setTasks(taskData || []);
            setLoading(false);
        };
        fetchData();

        // Real-time subscription for tasks updates
        const channel = supabase
            .channel(`project_detail_${id}`)
            .on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter: `project_id=eq.${id}` }, payload => {
                if (payload.eventType === "UPDATE") {
                    setTasks(prev => prev.map(t => t.id === payload.new.id ? { ...t, ...payload.new } as Task : t));
                } else if (payload.eventType === "INSERT") {
                    setTasks(prev => [...prev, payload.new as Task]);
                } else if (payload.eventType === "DELETE") {
                    setTasks(prev => prev.filter(t => t.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user, id]);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

    if (!project) return (
        <div className="bg-card rounded-2xl border border-border p-12 text-center shadow-sm">
            <FolderOpen size={40} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Project not found</h3>
            <Link to="/dashboard/projects" className="text-sm text-primary hover:underline">
                {t("dashboard.projectDetailPage.back")}
            </Link>
        </div>
    );

    const progressPct = (project.current_stage / 5) * 100;
    const tasksDone = tasks.filter(t => t.status === "done").length;
    const tasksPct = tasks.length > 0 ? Math.round((tasksDone / tasks.length) * 100) : 0;

    return (
        <div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <Link to="/dashboard/projects"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
                    <ArrowLeft size={14} /> {t("dashboard.projectDetailPage.back")}
                </Link>
            </motion.div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* ── Main ── */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header card */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                        <div className="flex items-start justify-between gap-4 mb-5">
                            <div>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border mb-2 inline-block capitalize ${STATUS_COLORS[project.status]}`}>
                                    {t(`dashboard.status.${project.status}`)}
                                </span>
                                <h1 className="text-2xl font-bold tracking-tight">{project.title}</h1>
                                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1.5">
                                    <Clock size={13} />
                                    Started {new Date(project.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            {project.deposit_paid ? (
                                <span className="flex items-center gap-1.5 text-sm text-green-600 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full shrink-0">
                                    <CheckCircle2 size={14} /> {t("dashboard.projectDetailPage.depositPaid")}
                                </span>
                            ) : (
                                <span className="text-sm text-orange-500 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full shrink-0">
                                    {t("dashboard.projectDetailPage.depositPending")}
                                </span>
                            )}
                        </div>

                        {/* Stage progress */}
                        <div>
                            <div className="flex justify-between text-xs text-muted-foreground mb-2">
                                <span>
                                    {t("dashboard.projectDetailPage.stage")} {project.current_stage} {t("dashboard.projectDetailPage.of")} 5: <span className="font-semibold text-foreground">{STAGE_LABELS[project.current_stage - 1]}</span>
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
                            <div className="flex justify-between mt-3">
                                {STAGE_LABELS.map((label, idx) => (
                                    <div key={label} className="flex flex-col items-center gap-1">
                                        <div className={`w-2.5 h-2.5 rounded-full border-2 transition-all ${idx < project.current_stage ? "bg-primary border-primary" : "bg-background border-muted-foreground/30"}`} />
                                        <span className={`text-[10px] font-medium hidden sm:block ${idx < project.current_stage ? "text-primary" : "text-muted-foreground"}`}>
                                            {label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Services ordered */}
                    {project.services_selected && project.services_selected.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                            className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden p-6 mt-6">
                            <h2 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">{t("brief.yourPackage") || "Services Ordered"}</h2>
                            <div className="space-y-2">
                                {project.services_selected.map(service => (
                                    <div key={service.id} className="flex justify-between items-center text-sm border-b border-border pb-2 last:border-0 last:pb-0">
                                        <span className="font-medium">{service.title}</span>
                                        <span className="text-muted-foreground">{service.price.toLocaleString()} TND</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Tasks card — read-only for client */}
                    {tasks.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                            className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                                <h2 className="font-semibold">Project Tasks</h2>
                                <div className="flex items-center gap-3">
                                    <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${tasksPct}%` }} />
                                    </div>
                                    <span className="text-xs text-muted-foreground">{tasksDone}/{tasks.length} done</span>
                                </div>
                            </div>
                            <div className="divide-y divide-border">
                                {tasks.map(task => {
                                    const cfg = TASK_STATUS_CONFIG[task.status];
                                    const TaskIcon = cfg.icon;
                                    return (
                                        <div key={task.id} className="px-6 py-4 flex items-center gap-4">
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cfg.cls}`}>
                                                <TaskIcon size={13} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                                                    {task.title}
                                                </p>
                                                {task.description && (
                                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.description}</p>
                                                )}
                                            </div>
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${cfg.cls}`}>
                                                {cfg.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* Files card */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
                        className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                            <h2 className="font-semibold">{t("dashboard.projectDetailPage.files")}</h2>
                            <span className="text-xs text-muted-foreground">{files.length} file{files.length !== 1 ? "s" : ""}</span>
                        </div>

                        {files.length === 0 ? (
                            <div className="p-10 text-center">
                                <FolderOpen size={32} className="mx-auto text-muted-foreground mb-3" />
                                <p className="text-sm text-muted-foreground">{t("dashboard.projectDetailPage.noFiles")}</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {files.map(file => {
                                    const FileIcon = getFileIcon(file.file_name);
                                    return (
                                        <div key={file.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/20 transition-colors">
                                            <div className="w-8 h-8 rounded-lg bg-muted/50 border border-border flex items-center justify-center shrink-0">
                                                <FileIcon size={14} className="text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{file.file_name}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(file.uploaded_at).toLocaleDateString()}</p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${file.type === "final" ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-purple-500/10 text-purple-600 border-purple-500/20"}`}>
                                                {file.type}
                                            </span>
                                            <a href={file.file_url} target="_blank" rel="noopener noreferrer"
                                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shrink-0">
                                                <Download size={13} />
                                            </a>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* ── Sidebar ── */}
                <div className="space-y-6">
                    {/* Payment info */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                        className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                            {t("dashboard.projectDetailPage.payment")}
                        </h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">{t("dashboard.projectDetailPage.total")}</span>
                                <span className="text-lg font-bold">{project.total_price.toLocaleString()} TND</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">{t("dashboard.projectDetailPage.deposit")} (30%)</span>
                                <span className="font-medium">{(project.total_price * 0.3).toLocaleString()} TND</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Remaining</span>
                                <span className="font-medium">{(project.total_price * 0.7).toLocaleString()} TND</span>
                            </div>
                            <div className="border-t border-border pt-3">
                                {project.deposit_paid ? (
                                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                                        <CheckCircle2 size={14} /> {t("dashboard.projectDetailPage.depositPaid")}
                                    </div>
                                ) : (
                                    <p className="text-sm text-orange-500">{t("dashboard.projectDetailPage.depositPending")}</p>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick contact */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                            Need Help?
                        </h2>
                        <p className="text-sm text-muted-foreground mb-4">
                            Have a question about your project? Our team is ready to help.
                        </p>
                        <a href="mailto:hello@branding.tn"
                            className="flex items-center justify-center gap-2 w-full border border-border rounded-xl py-2.5 text-sm font-medium hover:bg-muted transition-colors">
                            <MessageSquare size={14} /> Contact Us
                        </a>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;
