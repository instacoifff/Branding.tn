import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
    ArrowLeft, Loader2, Save, Upload, FileText, Trash2, CheckCircle2,
    Plus, X, Clock, PlayCircle, CheckSquare, MessageSquare, Send
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Project = {
    id: string; title: string; status: "onboarding" | "active" | "completed";
    current_stage: number; total_price: number; deposit_paid: boolean;
    client_id: string;
    creative_id: string | null;
    creative_brief?: { industry?: string; description?: string; audience?: string; style?: string; references?: string; };
    created_at: string; services_selected?: any[];
    profiles: { full_name: string | null; company: string | null } | null;
};
type FileRow = { id: string; file_name: string; file_url: string; type: "concept" | "final"; uploaded_at: string; };
type Task = { id: string; title: string; description: string | null; status: "todo" | "doing" | "done"; assigned_to: string | null; };
type TeamMember = { id: string; name: string; role: string; };

type ProjectMessage = {
    id: string;
    sender_id: string;
    message: string;
    created_at: string;
    profiles?: { full_name: string; avatar_url: string };
};

const STAGE_LABELS = ["Brief", "Concepts", "Refinement", "Finalisation", "Delivery"];
const TASK_STATUS_CYCLE: Record<Task["status"], Task["status"]> = { todo: "doing", doing: "done", done: "todo" };
const TASK_STATUS_COLORS: Record<Task["status"], string> = {
    todo: "bg-muted text-muted-foreground",
    doing: "bg-blue-500/10 text-blue-600",
    done: "bg-green-500/10 text-green-600",
};
const TASK_STATUS_ICONS: Record<Task["status"], React.ReactNode> = {
    todo: <Clock size={11} />, doing: <PlayCircle size={11} />, done: <CheckSquare size={11} />,
};

const AdminProjectDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useI18n();

    const [project, setProject] = useState<Project | null>(null);
    const [files, setFiles] = useState<FileRow[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
    const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
    const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

    const [status, setStatus] = useState<Project["status"]>("onboarding");
    const [stage, setStage] = useState(1);
    const [depositPaid, setDepositPaid] = useState(false);
    const [creativeId, setCreativeId] = useState<string>("");

    const [creatives, setCreatives] = useState<{ id: string; full_name: string }[]>([]);

    // Messaging state
    const [messages, setMessages] = useState<ProjectMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [sendingMsg, setSendingMsg] = useState(false);

    // New task form state
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDesc, setTaskDesc] = useState("");
    const [taskAssignee, setTaskAssignee] = useState("");
    const [addingTask, setAddingTask] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            const [{ data: proj, error: projErr }, { data: fileData }, { data: taskData }, { data: teamData }, { data: creativesData }, { data: msgData }] =
                await Promise.all([
                    supabase.from("projects").select("*, profiles(full_name, company)").eq("id", id).single(),
                    supabase.from("files").select("*").eq("project_id", id).order("uploaded_at", { ascending: false }),
                    supabase.from("tasks").select("*").eq("project_id", id).order("created_at", { ascending: true }),
                    supabase.from("team_members").select("id, name, role").order("name"),
                    supabase.from("profiles").select("id, full_name").eq("role", "creative"),
                    supabase.from("project_messages").select("*, profiles(full_name, avatar_url)").eq("project_id", id).order("created_at", { ascending: true }),
                ]);

            if (projErr || !proj) { toast.error(t("common.error")); navigate("/dashboard/admin/projects"); return; }
            // client_id comes from the project row itself — no secondary lookup needed
            setProject(proj as Project); setStatus(proj.status); setStage(proj.current_stage); setDepositPaid(proj.deposit_paid);
            if (proj.creative_id) setCreativeId(proj.creative_id);
            setFiles(fileData ?? []); setTasks(taskData ?? []); setTeamMembers(teamData ?? []);
            setCreatives((creativesData as any) ?? []);
            setMessages((msgData as any) ?? []);
            setLoading(false);
        };
        fetchData();

        const msgChannel = supabase.channel(`admin_project_detail_${id}`)
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "project_messages", filter: `project_id=eq.${id}` }, async payload => {
                const { data: profile } = await supabase.from("profiles").select("full_name, avatar_url").eq("id", payload.new.sender_id).single();
                setMessages(prev => {
                    if (prev.some(m => m.id === payload.new.id)) return prev;
                    return [...prev, { ...payload.new, profiles: profile } as any];
                });
            }).subscribe();

        return () => { supabase.removeChannel(msgChannel); };
    }, [id, navigate]);

    const handleSave = async () => {
        if (!id) return;
        const { error } = await supabase
            .from("projects")
            .update({ status, current_stage: stage, deposit_paid: depositPaid, creative_id: creativeId || null, updated_at: new Date().toISOString() })
            .eq("id", id);

        if (error) {
            toast.error(t("dashboard.adminProjectDetail.errorSave"));
        } else {
            toast.success(t("dashboard.adminProjectDetail.toastSaved"));
            setProject((prev) => prev ? { ...prev, status, current_stage: stage, deposit_paid: depositPaid, creative_id: creativeId || null } : prev);

            // Use client_id directly from the project row — reliable, no secondary lookup
            if (project?.client_id) {
                try {
                    await supabase.from("notifications").insert({
                        user_id: project.client_id,
                        title: `Your project "${project.title}" has been updated`,
                        body: `Status: ${status} · Stage: ${stage}/5`,
                    });
                } catch { /* non-critical — don't block save */ }
            }
        }
        setSaving(false);
    };


    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileType: "concept" | "final") => {
        const file = e.target.files?.[0];
        if (!file || !id) return;
        setUploading(true);
        const filePath = `projects/${id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from("project-files").upload(filePath, file);
        if (uploadError) { toast.error(t("dashboard.adminProjectDetail.errorUpload")); setUploading(false); return; }
        const { data: urlData } = supabase.storage.from("project-files").getPublicUrl(filePath);
        const { data: newFile, error: insertError } = await supabase.from("files")
            .insert({ project_id: id, file_name: file.name, file_url: urlData.publicUrl, type: fileType })
            .select().single();
        if (insertError) { toast.error(t("dashboard.adminProjectDetail.errorUpload")); }
        else { toast.success(t("dashboard.adminProjectDetail.toastUploaded")); setFiles((prev) => [newFile, ...prev]); }
        setUploading(false); e.target.value = "";
    };

    const handleDeleteFile = async (fileId: string) => {
        setDeletingFileId(fileId);
        const { error } = await supabase.from("files").delete().eq("id", fileId);
        if (error) toast.error(t("dashboard.adminProjectDetail.errorDelete"));
        else { toast.success(t("dashboard.adminProjectDetail.toastDeleted")); setFiles((prev) => prev.filter((f) => f.id !== fileId)); }
        setDeletingFileId(null);
    };

    const handleAddTask = async () => {
        if (!taskTitle.trim() || !id) return;
        setAddingTask(true);
        const { data: newTask, error } = await supabase.from("tasks")
            .insert({ project_id: id, title: taskTitle.trim(), description: taskDesc || null, status: "todo", assigned_to: taskAssignee || null })
            .select().single();
        if (error) { toast.error(t("common.error")); }
        else {
            setTasks((prev) => [...prev, newTask]);
            setTaskTitle(""); setTaskDesc(""); setTaskAssignee(""); setShowTaskForm(false);
            toast.success("Task added.");
        }
        setAddingTask(false);
    };

    const handleTaskStatusToggle = async (task: Task) => {
        const newStatus = TASK_STATUS_CYCLE[task.status];
        setUpdatingTaskId(task.id);
        await supabase.from("tasks").update({ status: newStatus }).eq("id", task.id);
        setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: newStatus } : t));
        setUpdatingTaskId(null);
    };

    const handleDeleteTask = async (taskId: string) => {
        setDeletingTaskId(taskId);
        const { error } = await supabase.from("tasks").delete().eq("id", taskId);
        if (error) toast.error(t("common.error"));
        else setTasks((prev) => prev.filter((t) => t.id !== taskId));
        setDeletingTaskId(null);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!newMessage.trim() || !currentUser || !id) return;
        setSendingMsg(true);
        const { error } = await supabase.from("project_messages").insert({
            project_id: id,
            sender_id: currentUser.id,
            message: newMessage.trim(),
        });
        if (error) { toast.error("Failed to send message"); }
        else { setNewMessage(""); }
        setSendingMsg(false);
    };

    if (loading) return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Skeleton Header */}
            <div className="flex justify-between items-start">
                <div className="space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-10 w-32 rounded-lg" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Skeleton Controls Column */}
                <div className="lg:col-span-1 space-y-5">
                    <Skeleton className="h-32 w-full rounded-xl" />
                    <Skeleton className="h-40 w-full rounded-xl" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                </div>
                {/* Skeleton Tasks Column */}
                <div className="lg:col-span-2 space-y-5">
                    <Skeleton className="h-64 w-full rounded-xl" />
                    <Skeleton className="h-48 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
    if (!project) return null;

    const progressPct = (stage / 5) * 100;
    const inputClass = "w-full bg-muted/60 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all";

    return (
        <div>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <Link to="/dashboard/admin/projects" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                    <ArrowLeft size={15} /> {t("dashboard.adminProjectDetail.back")}
                </Link>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
                        <p className="text-muted-foreground mt-1">
                            {t("dashboard.adminProjectDetail.client")}: <span className="text-foreground font-medium">{project.profiles?.full_name || "Unknown"}</span>
                            {project.profiles?.company && <> · <span>{project.profiles.company}</span></>}
                        </p>
                    </div>
                    <button onClick={handleSave} disabled={saving}
                        className="flex items-center gap-2 bg-gradient-brand text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all shadow-brand disabled:opacity-50">
                        {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                        {saving ? t("dashboard.adminProjectDetail.saving") : t("dashboard.adminProjectDetail.saveChanges")}
                    </button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-5">
                    {/* Delegation */}
                    <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
                        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Delegate Creative</h2>
                        <select value={creativeId} onChange={(e) => setCreativeId(e.target.value)} className={inputClass}>
                            <option value="">Unassigned</option>
                            {creatives.map((c) => (
                                <option key={c.id} value={c.id}>{c.full_name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status */}
                    <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
                        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t("dashboard.adminProjectDetail.status")}</h2>
                        <select value={status} onChange={(e) => setStatus(e.target.value as Project["status"])} className={inputClass}>
                            <option value="onboarding">{t("dashboard.status.onboarding")}</option>
                            <option value="active">{t("dashboard.status.active")}</option>
                            <option value="completed">{t("dashboard.status.completed")}</option>
                        </select>
                    </div>
                    {/* Stage */}
                    <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
                        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t("dashboard.adminProjectDetail.stage")}</h2>
                        <div className="space-y-1.5">
                            {STAGE_LABELS.map((label, idx) => (
                                <button key={label} onClick={() => setStage(idx + 1)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${stage === idx + 1 ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${idx + 1 < stage ? "bg-primary text-primary-foreground" : idx + 1 === stage ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                                        {idx + 1 < stage ? <CheckCircle2 size={12} /> : idx + 1}
                                    </span>
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div className="mt-3">
                            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                                <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1.5">{Math.round(progressPct)}% {t("dashboard.adminProjectDetail.complete")}</p>
                        </div>
                    </div>
                    {/* Payment */}
                    <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
                        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t("dashboard.adminProjectDetail.payment")}</h2>
                        <div className="space-y-2 text-sm mb-3">
                            <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-semibold">{project.total_price.toLocaleString()} TND</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Deposit (30%)</span><span className="font-medium">{(project.total_price * 0.3).toLocaleString()} TND</span></div>
                        </div>
                        <button onClick={() => setDepositPaid(!depositPaid)}
                            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${depositPaid ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                            <CheckCircle2 size={14} />
                            {depositPaid ? t("dashboard.adminProjectDetail.depositPaidLabel") : t("dashboard.adminProjectDetail.depositPaid")}
                        </button>
                    </div>
                </div>

                {/* Right: Tasks + Files */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Manage Project Assignment */}
                    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Team Delegation</h2>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <select
                                value={creativeId || ""}
                                onChange={(e) => setCreativeId(e.target.value)}
                                className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">No Creative Assigned (Open Project)</option>
                                {creatives.map((c) => (
                                    <option key={c.id} value={c.id}>{c.full_name}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="shrink-0 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : "Save Assignment"}
                            </button>
                        </div>
                    </div>

                    {/* Client Brief */}
                    {project.creative_brief && (
                        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                            <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Client Strategy Debrief</h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-primary">Industry</p>
                                    <p className="text-sm font-medium">{project.creative_brief.industry || "—"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-primary">Target Audience</p>
                                    <p className="text-sm font-medium">{project.creative_brief.audience || "—"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-primary">Design Style</p>
                                    <p className="text-sm font-medium">{project.creative_brief.style || "—"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-primary">References</p>
                                    <p className="text-sm font-medium">{project.creative_brief.references || "—"}</p>
                                </div>
                                <div className="space-y-1 sm:col-span-2 mt-2 pt-2 border-t border-border/50">
                                    <p className="text-xs font-semibold text-primary">General Description</p>
                                    <p className="text-sm">{project.creative_brief.description || "—"}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tasks Section */}
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                            <h2 className="text-sm font-semibold">Tasks <span className="ml-1.5 text-xs text-muted-foreground">({tasks.length})</span></h2>
                            <button onClick={() => setShowTaskForm((v) => !v)} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                                {showTaskForm ? <><X size={12} /> Cancel</> : <><Plus size={12} /> Add Task</>}
                            </button>
                        </div>

                        <AnimatePresence>
                            {showTaskForm && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden border-b border-border">
                                    <div className="p-4 space-y-3">
                                        <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Task title *" className={inputClass} />
                                        <input value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} placeholder="Description (optional)" className={inputClass} />
                                        <select value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)} className={inputClass}>
                                            <option value="">Assign to... (optional)</option>
                                            {teamMembers.map((m) => <option key={m.id} value={m.id}>{m.name} — {m.role}</option>)}
                                        </select>
                                        <button onClick={handleAddTask} disabled={addingTask || !taskTitle.trim()}
                                            className="flex items-center gap-2 bg-gradient-brand text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all shadow-brand disabled:opacity-50">
                                            {addingTask ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                                            {addingTask ? "Adding..." : "Add Task"}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {tasks.length === 0 ? (
                            <EmptyState
                                title="No tasks created"
                                description="Kick off the project by adding actionable tasks for your team."
                                className="border-0 shadow-none rounded-none rounded-b-xl"
                            />
                        ) : (
                            <div className="divide-y divide-border">
                                {tasks.map((task) => (
                                    <div key={task.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/20 transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>{task.title}</p>
                                            {task.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.description}</p>}
                                            {task.assigned_to && (
                                                <p className="text-xs text-primary/70 mt-0.5">
                                                    → {teamMembers.find((m) => m.id === task.assigned_to)?.name ?? "team member"}
                                                </p>
                                            )}
                                        </div>
                                        <button onClick={() => handleTaskStatusToggle(task)} disabled={updatingTaskId === task.id}
                                            className={`shrink-0 flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all ${TASK_STATUS_COLORS[task.status]}`}>
                                            {updatingTaskId === task.id ? <Loader2 size={11} className="animate-spin" /> : TASK_STATUS_ICONS[task.status]}
                                            <span className="capitalize">{task.status}</span>
                                        </button>
                                        {deletingTaskId === task.id ? (
                                            <Loader2 size={13} className="animate-spin text-destructive" />
                                        ) : (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <button className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
                                                        <Trash2 size={13} />
                                                    </button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete task?</AlertDialogTitle>
                                                        <AlertDialogDescription>This will permanently remove "{task.title}". This cannot be undone.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteTask(task.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Files upload */}
                    <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
                        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">{t("dashboard.adminProjectDetail.uploadFile")}</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {(["concept", "final"] as const).map((type) => (
                                <label key={type} className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-5 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                                    <Upload size={20} className="text-muted-foreground" />
                                    <span className="text-sm font-medium capitalize">{type}</span>
                                    <span className="text-xs text-muted-foreground">PNG, PDF, AI, etc.</span>
                                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, type)} disabled={uploading} />
                                </label>
                            ))}
                        </div>
                        {uploading && (
                            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                                <Loader2 size={14} className="animate-spin" />{t("dashboard.adminProjectDetail.uploading")}
                            </div>
                        )}
                    </div>

                    {/* File list */}
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-border">
                            <h2 className="text-sm font-semibold">{t("dashboard.adminProjectDetail.files")} ({files.length})</h2>
                        </div>
                        {files.length === 0 ? (
                            <EmptyState
                                title="No files uploaded"
                                description="You haven't uploaded any presentations or concepts yet."
                                className="border-0 shadow-none rounded-none rounded-b-xl"
                            />
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
                                                    {" · "}{new Date(file.uploaded_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline font-medium">
                                                {t("dashboard.adminProjectDetail.download")}
                                            </a>
                                            {deletingFileId === file.id ? (
                                                <Loader2 size={13} className="animate-spin text-destructive" />
                                            ) : (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <button className="text-muted-foreground hover:text-destructive transition-colors">
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete file?</AlertDialogTitle>
                                                            <AlertDialogDescription>Permanently delete "{file.file_name}"? This cannot be undone.</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteFile(file.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Discussion / Project Messages --- */}
            <div className="mt-6 border border-border bg-card shadow-sm rounded-xl overflow-hidden flex flex-col" style={{ height: "450px" }}>
                <div className="px-5 py-4 border-b border-border flex items-center justify-between shadow-sm z-10 shrink-0">
                    <div className="flex items-center gap-2">
                        <MessageSquare size={16} className="text-primary" />
                        <h2 className="text-sm font-semibold">{t("brief.discussion") || "Project Discussion"}</h2>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-muted/10">
                    {messages.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground my-8">No messages yet. Send a note to the client or creative.</p>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.profiles?.full_name && project?.profiles?.full_name && msg.profiles.full_name !== project.profiles.full_name; // Rough heuristic, Admins sending vs clients. Realistically check IDs, but since we are Admin, ANY message that isn't the client could be us/our team. Let's do it clean:
                            return (
                                <div key={msg.id} className="flex gap-3">
                                    <Avatar className="h-8 w-8 border border-border shrink-0">
                                        <AvatarImage src={msg.profiles?.avatar_url || ""} />
                                        <AvatarFallback>{msg.profiles?.full_name?.charAt(0) || "?"}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col items-start">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[11px] font-medium text-muted-foreground">{msg.profiles?.full_name || "Unknown User"}</span>
                                            <span className="text-[10px] text-muted-foreground/60">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="px-4 py-2.5 rounded-2xl text-sm max-w-[90%] whitespace-pre-wrap bg-card border border-border rounded-tl-none">
                                            {msg.message}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="p-4 bg-card border-t border-border shrink-0">
                    <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                        <textarea
                            className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                            placeholder="Type your message..."
                            rows={1}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || sendingMsg}
                            className="bg-primary text-primary-foreground h-[46px] w-[46px] rounded-xl flex items-center justify-center shrink-0 hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {sendingMsg ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminProjectDetail;
