import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { FolderOpen, Plus, Clock, CheckCircle2, Loader2 } from "lucide-react";
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
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between gap-4 mb-5">
                                    <div>
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor} mb-2 inline-block`}>
                                            {t(`dashboard.status.${project.status}`) || project.status}
                                        </span>
                                        <h3 className="text-xl font-semibold">{project.title}</h3>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Clock size={13} />
                                                {new Date(project.created_at).toLocaleDateString()}
                                            </span>
                                            {project.deposit_paid ? (
                                                <span className="flex items-center gap-1 text-green-600">
                                                    <CheckCircle2 size={13} />
                                                    {t("dashboard.adminProjectDetail.depositPaid")}
                                                </span>
                                            ) : (
                                                <span className="text-orange-500">{t("dashboard.adminProjectDetail.no")}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs text-muted-foreground">{t("brief.total")}</p>
                                        <p className="text-lg font-bold">{project.total_price.toLocaleString()} {t("common.tnd")}</p>
                                    </div>
                                </div>

                                <div className="mb-2">
                                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                                        <span>
                                            {t("dashboard.projectsPage.stage")} {project.current_stage}: {stageLabels[project.current_stage - 1]}
                                        </span>
                                        <span>{Math.round(progressPct)}%</span>
                                    </div>
                                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-primary h-full rounded-full transition-all duration-700"
                                            style={{ width: `${progressPct}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-2">
                                        {stageLabels.map((label, idx) => (
                                            <span
                                                key={label}
                                                className={`text-[10px] font-medium ${idx < project.current_stage ? "text-primary" : "text-muted-foreground"}`}
                                            >
                                                {label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Projects;
