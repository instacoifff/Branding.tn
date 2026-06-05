import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { Search, Loader2, FolderOpen, Plus, ChevronRight, Clock, PlayCircle, CheckCircle2, RefreshCw, X, MoreVertical, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/i18n";
import { toast } from "sonner";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";

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

type ProfileOption = { id: string; full_name: string; };

const AllProjects = () => {
    const { t } = useI18n();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all");
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const [showAddModal, setShowAddModal] = useState(false);
    const [clients, setClients] = useState<ProfileOption[]>([]);
    const [creatives, setCreatives] = useState<ProfileOption[]>([]);

    const [newTitle, setNewTitle] = useState("");
    const [selectedClient, setSelectedClient] = useState("");
    const [selectedCreatives, setSelectedCreatives] = useState<string[]>([]);
    const [newPrice, setNewPrice] = useState("0");
    const [adding, setAdding] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchProjects = useCallback(async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true); else setLoading(true);
        let query = supabase
            .from("projects")
            .select("id, title, status, current_stage, total_price, deposit_paid, created_at, profiles!client_id(full_name, company)")
            .order("created_at", { ascending: false });

        if (filter !== "all") query = query.eq("status", filter);

        const { data } = await query;
        setProjects((data as any) || []);

        const [{ data: clientData }, { data: creativeData }] = await Promise.all([
            supabase.from("profiles").select("id, full_name").eq("role", "client"),
            supabase.from("profiles").select("id, full_name").eq("role", "creative")
        ]);
        setClients(clientData || []);
        setCreatives(creativeData || []);

        setLoading(false);
        setRefreshing(false);
    }, [filter]);

    useEffect(() => { fetchProjects(); }, [fetchProjects]);

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !selectedClient) {
            toast.error("Title and Client are required.");
            return;
        }
        setAdding(true);
        const { data: newProject, error } = await supabase.from("projects").insert({
            title: newTitle.trim(),
            client_id: selectedClient,
            total_price: parseFloat(newPrice) || 0,
            status: "onboarding",
            current_stage: 1
        }).select("id").single();
        
        if (error) {
            toast.error("Failed to create project");
        } else if (newProject) {
            if (selectedCreatives.length > 0) {
                const creativeInserts = selectedCreatives.map(id => ({
                    project_id: newProject.id,
                    creative_id: id
                }));
                await supabase.from("project_creatives").insert(creativeInserts);
            }
            toast.success("Project created successfully");
            setShowAddModal(false);
            setNewTitle(""); setSelectedClient(""); setSelectedCreatives([]); setNewPrice("0");
            fetchProjects(true);
        }
        setAdding(false);
    };

    const toggleCreativeSelection = (id: string) => {
        setSelectedCreatives(prev => 
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const handleDeleteProject = async (projectId: string) => {
        setDeletingId(projectId);
        const { error } = await supabase.from("projects").delete().eq("id", projectId);
        if (error) {
            toast.error("Failed to delete project");
        } else {
            toast.success("Project deleted successfully");
            setProjects(prev => prev.filter(p => p.id !== projectId));
        }
        setDeletingId(null);
    };

    const updateProjectStatus = async (projectId: string, newStatus: Project["status"]) => {
        const { error } = await supabase.from("projects").update({ status: newStatus }).eq("id", projectId);
        if (error) {
            toast.error("Failed to update status");
        } else {
            setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: newStatus } : p));
            toast.success(`Project marked as ${newStatus}`);
        }
    };

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
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-brand"
                        >
                            <Plus size={15} /> New Project
                        </button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-6">
                    <div className="flex gap-1 bg-muted/50 p-1 rounded-xl border border-border overflow-x-auto max-w-full">
                        {FILTER_TABS.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${filter === tab.key ? "bg-card shadow-sm text-foreground border border-border" : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {tab.label}
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filter === tab.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                    <div className="relative flex-1 min-w-0 max-w-xs sm:ml-auto">
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
                    className="bg-card rounded-2xl border border-border shadow-sm overflow-x-auto">
                    <div className="min-w-[900px]">
                        <div className="grid grid-cols-[2fr_1.5fr_120px_100px_100px_100px] gap-4 px-6 py-3 bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <span>{t("dashboard.adminProjects.project")}</span>
                            <span>{t("dashboard.adminProjects.client")}</span>
                            <span>{t("dashboard.adminProjects.status")}</span>
                            <span>Stage</span>
                            <span>Price</span>
                            <span className="text-right">Actions</span>
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
                                        className="grid grid-cols-[2fr_1.5fr_120px_100px_100px_100px] gap-4 px-6 py-4 border-b border-border last:border-0 hover:bg-muted/20 transition-colors items-center"
                                    >
                                        <Link to={`/dashboard/admin/projects/${project.id}`} className="flex items-center gap-3 min-w-0 group">
                                            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                                <span className="text-sm font-bold">
                                                    {project.title.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{project.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(project.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </Link>

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

                                        <div>
                                            <div className="relative group/status">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border cursor-pointer transition-all ${cfg.className}`}>
                                                    <StatusIcon size={11} />
                                                    {cfg.label}
                                                </span>
                                                <div className="absolute top-full left-0 mt-1 hidden group-hover/status:block z-20 bg-card border border-border rounded-lg shadow-xl overflow-hidden py-1">
                                                    {(["onboarding", "active", "completed"] as const).map(s => (
                                                        <button 
                                                            key={s} 
                                                            onClick={() => updateProjectStatus(project.id, s)}
                                                            className="w-full text-left px-4 py-1.5 text-[10px] font-bold uppercase hover:bg-muted transition-colors whitespace-nowrap"
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold uppercase text-muted-foreground">
                                                {STAGE_LABELS[project.current_stage - 1] || `Stage ${project.current_stage}`}
                                            </p>
                                            <div className="w-16 bg-muted h-1 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full transition-all duration-700"
                                                    style={{ width: `${progressPct}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm font-bold">
                                                {project.total_price.toLocaleString()} TND
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-end gap-2">
                                            <Link to={`/dashboard/admin/projects/${project.id}`}>
                                                <button className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                                                    <ChevronRight size={14} />
                                                </button>
                                            </Link>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <button className="w-8 h-8 rounded-lg border border-destructive/20 text-destructive flex items-center justify-center hover:bg-destructive hover:text-white transition-all">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will permanently remove <strong>{project.title}</strong> and all associated files and messages.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteProject(project.id)} className="bg-destructive hover:bg-destructive/90">
                                                            {deletingId === project.id ? <Loader2 size={14} className="animate-spin" /> : "Delete Project"}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Footer count */}
                    <div className="px-6 py-3 border-t border-border bg-muted/20">
                        <p className="text-xs text-muted-foreground">
                            Showing <span className="font-semibold text-foreground">{filtered.length}</span> of <span className="font-semibold text-foreground">{projects.length}</span> projects
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Add Project Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
                                <h3 className="font-bold">Create New Project</h3>
                                <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-lg transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Project Name *</label>
                                    <input required value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                                        className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="E.g. Branding Refresh" />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assign Client *</label>
                                    <select required value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}
                                        className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none">
                                        <option value="">Select a Client</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assign Creatives</label>
                                    <div className="bg-muted/30 border border-border rounded-xl p-2 max-h-40 overflow-y-auto space-y-1">
                                        {creatives.map(c => {
                                            const isSelected = selectedCreatives.includes(c.id);
                                            return (
                                                <div 
                                                    key={c.id} 
                                                    onClick={() => toggleCreativeSelection(c.id)}
                                                    className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                                                        isSelected ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-foreground"
                                                    }`}
                                                >
                                                    {c.full_name}
                                                    {isSelected && <CheckCircle2 size={16} />}
                                                </div>
                                            );
                                        })}
                                        {creatives.length === 0 && (
                                            <p className="text-xs text-muted-foreground p-2 text-center">No creatives found</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Project Price (TND)</label>
                                    <input type="number" min="0" value={newPrice} onChange={(e) => setNewPrice(e.target.value)}
                                        className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                                </div>

                                <div className="pt-4">
                                    <button disabled={adding} type="submit"
                                        className="w-full bg-primary text-primary-foreground py-3 rounded-xl text-sm font-bold shadow-brand flex justify-center items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all">
                                        {adding ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} /> Create Project</>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AllProjects;
