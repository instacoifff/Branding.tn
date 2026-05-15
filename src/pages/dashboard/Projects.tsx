import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { FolderOpen, Plus, Clock, CheckCircle2, Loader2, ChevronRight } from "lucide-react";
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

const statusColors = {
    onboarding: "bg-orange-500/10 text-orange-600",
    active: "bg-blue-500/10 text-blue-600",
    completed: "bg-green-500/10 text-green-600",
};

const Projects = () => {
    const { user } = useAuth();
    const { t } = useI18n();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    // Stage labels translated
    const stageLabels = ["Brief", "Concepts", "Refinement", "Finalisation", "Delivery"];

    useEffect(() => {
        const fetchProjects = async () => {
            if (!user) return;
            const { data, error } = await supabase
                .from("projects")
                .select("*")
                .eq("client_id", user.id)
                .order("updated_at", { ascending: false });
            if (error) console.error("Error fetching projects:", error);
            else setProjects(data || []);
            setLoading(false);
        };
        fetchProjects();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div>
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-8"
            >
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.projectsPage.title")}</h1>
                    <p className="text-muted-foreground mt-1">{t("dashboard.projectsPage.subtitle")}</p>
                </div>
                <Link
                    to="/builder"
                    className="flex items-center gap-2 bg-gradient-brand text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all shadow-brand"
                >
                    <Plus size={16} />
                    {t("dashboard.projectsPage.startProject")}
                </Link>
            </motion.div>

            {projects.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-card rounded-xl border border-border p-12 text-center"
                >
                    <FolderOpen size={40} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t("dashboard.projectsPage.noProjects")}</h3>
                    <p className="text-muted-foreground mb-6 text-sm">{t("dashboard.projectsPage.noProjectsDesc")}</p>
                    <Link
                        to="/builder"
                        className="inline-flex items-center gap-2 bg-gradient-brand text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-all shadow-brand"
                    >
                        <Plus size={16} />
                        {t("dashboard.projectsPage.startProject")}
                    </Link>
                </motion.div>
            ) : (
                <div className="grid gap-5">
                    {projects.map((project, i) => {
                        const statusColor = statusColors[project.status] ?? statusColors.onboarding;
                        const progressPct = (project.current_stage / 5) * 100;
                        return (
                            <Link
                                key={project.id}
                                to={`/dashboard/projects/${project.id}`}
                                className="block"
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                    
                                    <div className="flex items-start justify-between gap-4 mb-5">
                                        <div>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusColor} mb-2 inline-block`}>
                                                {t(`dashboard.status.${project.status}`) || project.status}
                                            </span>
                                            <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{project.title}</h3>
                                            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1.5">
                                                    <Clock size={13} />
                                                    {new Date(project.created_at).toLocaleDateString()}
                                                </span>
                                                <div className="w-1 h-1 rounded-full bg-border" />
                                                {project.deposit_paid ? (
                                                    <span className="flex items-center gap-1.5 text-green-600 font-medium">
                                                        <CheckCircle2 size={13} />
                                                        {t("dashboard.adminProjectDetail.depositPaid")}
                                                    </span>
                                                ) : (
                                                    <span className="text-orange-500 font-medium">Deposit Pending</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">{t("brief.total")}</p>
                                            <p className="text-lg font-black">{project.total_price.toLocaleString()} {t("common.tnd")}</p>
                                        </div>
                                    </div>

                                    <div className="mb-2">
                                        <div className="flex justify-between text-[11px] text-muted-foreground mb-2">
                                            <span className="font-semibold uppercase tracking-tight">
                                                {t("dashboard.projectsPage.stage")} {project.current_stage}: {stageLabels[project.current_stage - 1]}
                                            </span>
                                            <span className="font-bold">{Math.round(progressPct)}%</span>
                                        </div>
                                        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progressPct}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                                            />
                                        </div>
                                        <div className="flex justify-between mt-3 gap-1">
                                            {stageLabels.map((label, idx) => (
                                                <div key={label} className="flex flex-col items-center gap-1 flex-1">
                                                    <div className={`w-full h-1 rounded-full transition-all ${idx < project.current_stage ? "bg-primary" : "bg-muted"}`} />
                                                    <span className={`text-[9px] font-bold uppercase truncate w-full text-center ${idx < project.current_stage ? "text-primary" : "text-muted-foreground/50"}`}>
                                                        {label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-4 border-t border-border flex justify-end">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                                            MANAGE PROJECT <ChevronRight size={14} />
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Projects;
