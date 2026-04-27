import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import {
    Search, Loader2, FolderOpen, Plus, ChevronRight,
    Clock, PlayCircle, CheckCircle2, Filter, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/i18n";

type Project = {
    id: string;
    title: string;
    status: "onboarding" | "active" | "completed";
    current_stage: number;
    total_price: number;
    deposit_paid: boolean;
    created_at: string;
    profiles: { full_name: string; company: string | null } | null;
};

const STATUS_CONFIG = {
    onboarding: { label: "Onboarding", icon: Clock, className: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
    active: { label: "Active", icon: PlayCircle, className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    completed: { label: "Completed", icon: CheckCircle2, className: "bg-green-500/10 text-green-600 border-green-500/20" },
} as const;

const STAGE_LABELS = ["Brief", "Concepts", "Refinement", "Finalisation", "Delivery"];

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const SkeletonRow = () => (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-border last:border-0">
        <div className="w-9 h-9 rounded-lg bg-muted animate-pulse shrink-0" />
        <div className="flex-1 space-y-2">
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            <div className="h-3 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-5 w-20 bg-muted rounded-full animate-pulse" />
        <div className="h-3 w-16 bg-muted rounded animate-pulse" />
        <div className="h-7 w-14 bg-muted rounded-lg animate-pulse" />
    </div>
);

const AllProjects = () => {
    const { t } = useI18n();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all");
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const fetchProjects = useCallback(async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true); else setLoading(true);
        let query = supabase
            .from("projects")
            .select("id, title, status, current_stage, total_price, deposit_paid, created_at, profiles(full_name, company)")
            .order("created_at", { ascending: false });

        if (filter !== "all") query = query.eq("status", filter);

        const { data } = await query;
        setProjects(data || []);
        setLoading(false);
        setRefreshing(false);
    }, [filter]);

    useEffect(() => { fetchProjects(); }, [fetchProjects]);

    const filtered = projects.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.profiles?.company?.toLowerCase().includes(search.toLowerCase())
    );

    const FILTER_TABS = [
        { key: "all", label: "All", count: projects.length },
        { key: "onboarding", label: "Onboarding", count: projects.filter(p => p.status === "onboarding").length },
        { key: "active", label: "Active", count: projects.filter(p => p.status === "active").length },
        { key: "completed", label: "Completed", count: projects.filter(p => p.status === "completed").length },
    ];

    return (
        <div>
            {/* Header */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.adminProjects.title")}</h1>
                        <p className="text-muted-foreground mt-1">{t("dashboard.adminProjects.subtitle")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fetchProjects(true)}
                            disabled={refreshing}
                            className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw size={15} className={refreshing ? "animate-spin text-primary" : "text-muted-foreground"} />
                        </button>
                        <Link to="/dashboard/admin">
                            <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all">
                                <Plus size={15} /> New Project
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Filter + Search bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-6">
                    {/* Filter tabs */}
                    <div className="flex gap-1 bg-muted/50 p-1 rounded-xl border border-border">
                        {FILTER_TABS.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === tab.key ? "bg-card shadow-sm text-foreground border border-border" : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {tab.label}
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filter === tab.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                    {/* Search */}
                    <div className="relative flex-1 min-w-0 max-w-xs ml-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                        <input
                            type="text"
                            placeholder="Search by name or client…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-8 pr-4 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-full"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Content */}
            {loading ? (
                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
                </div>
            ) : filtered.length === 0 ? (
                <motion.div variants={fadeUp} initial="hidden" animate="show"
                    className="bg-card rounded-2xl border border-border p-16 text-center shadow-sm">
                    <FolderOpen size={40} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-1">{t("dashboard.adminProjects.noProjects")}</h3>
                    <p className="text-sm text-muted-foreground">No projects match your current filters.</p>
                </motion.div>
            ) : (
                <motion.div variants={fadeUp} initial="hidden" animate="show"
                    className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    {/* Table header */}
                    <div className="grid grid-cols-[2fr_1.5fr_120px_100px_100px_52px] gap-4 px-6 py-3 bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <span>{t("dashboard.adminProjects.project")}</span>
                        <span>{t("dashboard.adminProjects.client")}</span>
                        <span>{t("dashboard.adminProjects.status")}</span>
                        <span>Stage</span>
                        <span>Price</span>
                        <span />
                    </div>

                    <AnimatePresence>
                        {filtered.map((project, i) => {
                            const cfg = STATUS_CONFIG[project.status];
                            const StatusIcon = cfg.icon;
                            const progressPct = (project.current_stage / 5) * 100;

                            return (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="grid grid-cols-[2fr_1.5fr_120px_100px_100px_52px] gap-4 px-6 py-4 border-b border-border last:border-0 hover:bg-muted/20 transition-colors items-center"
                                >
                                    {/* Project */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                            <span className="text-primary text-sm font-bold">
                                                {project.title.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-sm truncate">{project.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(project.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Client */}
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {project.profiles?.full_name || "—"}
                                        </p>
                                        {project.profiles?.company && (
                                            <p className="text-xs text-muted-foreground truncate">
                                                {project.profiles.company}
                                            </p>
                                        )}
                                    </div>

                                    {/* Status badge */}
                                    <div>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.className}`}>
                                            <StatusIcon size={11} />
                                            {cfg.label}
                                        </span>
                                    </div>

                                    {/* Stage + mini progress bar */}
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium">
                                            {STAGE_LABELS[project.current_stage - 1] || `Stage ${project.current_stage}`}
                                        </p>
                                        <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all duration-700"
                                                style={{ width: `${progressPct}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div>
                                        <p className="text-sm font-semibold">
                                            {project.total_price.toLocaleString()} TND
                                        </p>
                                        {project.deposit_paid ? (
                                            <span className="text-[10px] text-green-600 font-medium">Deposit ✓</span>
                                        ) : (
                                            <span className="text-[10px] text-orange-500 font-medium">Pending</span>
                                        )}
                                    </div>

                                    {/* Action */}
                                    <Link to={`/dashboard/admin/projects/${project.id}`}>
                                        <button className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                                            <ChevronRight size={15} />
                                        </button>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Footer count */}
                    <div className="px-6 py-3 border-t border-border bg-muted/20">
                        <p className="text-xs text-muted-foreground">
                            Showing <span className="font-semibold text-foreground">{filtered.length}</span> of <span className="font-semibold text-foreground">{projects.length}</span> projects
                        </p>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default AllProjects;
