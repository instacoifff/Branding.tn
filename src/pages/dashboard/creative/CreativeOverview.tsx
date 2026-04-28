import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, CheckCircle2, Clock, Palette, FolderOpen, MessageSquare, Send } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useI18n } from "@/i18n";
import { toast } from "sonner";

type Task = {
    id: string;
    title: string;
    description: string | null;
    status: "todo" | "doing" | "done";
    project_id: string;
    project?: { title: string };
};

type GroupedProject = {
    id: string;
    title: string;
    creative_brief?: any;
    tasks: Task[];
    messages: ProjectMessage[];
};

type ProjectMessage = {
    id: string;
    sender_id: string;
    project_id: string;
    message: string;
    created_at: string;
    profiles?: { full_name: string; avatar_url: string };
};

const STATUS_LABELS: Record<Task["status"], string> = {
    todo: "To Do",
    doing: "In Progress",
    done: "Done",
};
const STATUS_COLORS: Record<Task["status"], string> = {
    todo: "bg-muted text-muted-foreground",
    doing: "bg-blue-500/10 text-blue-600",
    done: "bg-green-500/10 text-green-600",
};

const CreativeOverview = () => {
    const { user, profile } = useAuth();
    const { t } = useI18n();
    const [grouped, setGrouped] = useState<GroupedProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Messaging states map since there are multiple projects on this page
    const [newMessages, setNewMessages] = useState<Record<string, string>>({});
    const [sendingMsg, setSendingMsg] = useState(false);

    useEffect(() => {
        const fetchMyProjects = async () => {
            if (!user) return;

            const { data: projects } = await supabase
                .from("projects")
                .select("id, title, creative_brief, tasks(*), project_messages(*, profiles(full_name, avatar_url))")
                .eq("creative_id", user.id)
                .order("created_at", { ascending: false });

            const mapped: GroupedProject[] = (projects || []).map((p: any) => ({
                id: p.id,
                title: p.title,
                creative_brief: p.creative_brief,
                tasks: p.tasks || [],
                messages: p.project_messages?.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) || []
            }));

            // Fallback: Also get tasks directly assigned to team_member (legacy logic)
            const { data: teamMembers } = await supabase.from("team_members").select("id, name");
            const myMember = teamMembers?.find((m) => m.name.toLowerCase() === (profile?.full_name ?? "").toLowerCase());

            if (myMember) {
                const { data: tasks } = await supabase.from("tasks").select("*, projects(id, title, creative_brief)").eq("assigned_to", myMember.id);
                // Also get messages for these legacy task projects just in case
                if (tasks && tasks.length > 0) {
                    const legacyProjIds = [...new Set(tasks.map(t => t.project_id))];
                    const { data: rawMessages } = await supabase.from("project_messages").select("*, profiles(full_name, avatar_url)").in("project_id", legacyProjIds).order("created_at", { ascending: true });
                    const safeMsgs = rawMessages || [];

                    (tasks || []).forEach((t: any) => {
                        const existing = mapped.find(p => p.id === t.project_id);
                        if (!existing && t.projects) {
                            mapped.push({
                                id: t.project_id,
                                title: t.projects.title,
                                creative_brief: t.projects.creative_brief,
                                tasks: [t],
                                messages: safeMsgs.filter(m => m.project_id === t.project_id) as any
                            });
                        } else if (existing && !existing.tasks.find(tk => tk.id === t.id)) {
                            existing.tasks.push(t);
                        }
                    });
                }
            }

            setGrouped(mapped);
            setLoading(false);
        };
        fetchMyProjects();

        const channel = supabase.channel(`creative_tasks_${user.id}`)
            .on("postgres_changes", { event: "UPDATE", schema: "public", table: "tasks" }, payload => {
                setGrouped(prev => {
                    const cloned = [...prev];
                    for (const g of cloned) {
                        const idx = g.tasks.findIndex(t => t.id === payload.new.id);
                        if (idx !== -1) {
                            g.tasks[idx] = { ...g.tasks[idx], ...payload.new } as Task;
                            break;
                        }
                    }
                    return cloned;
                });
            })
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "project_messages" }, async payload => {
                const { data: profile } = await supabase.from("profiles").select("full_name, avatar_url").eq("id", payload.new.sender_id).single();
                setGrouped(prev => {
                    const cloned = [...prev];
                    const gIdx = cloned.findIndex(g => g.id === payload.new.project_id);
                    if (gIdx !== -1) {
                        const exists = cloned[gIdx].messages.some(m => m.id === payload.new.id);
                        if (!exists) {
                            cloned[gIdx] = {
                                ...cloned[gIdx],
                                messages: [...cloned[gIdx].messages, { ...payload.new, profiles: profile } as any]
                            };
                        }
                    }
                    return cloned;
                });
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user, profile]);

    const handleStatusCycle = async (task: Task) => {
        const next: Record<Task["status"], Task["status"]> = { todo: "doing", doing: "done", done: "todo" };
        const newStatus = next[task.status];
        setUpdatingId(task.id);
        await supabase.from("tasks").update({ status: newStatus }).eq("id", task.id);
        setGrouped((prev) =>
            prev.map((pg) => ({
                ...pg,
                tasks: pg.tasks.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)),
            }))
        );
        setUpdatingId(null);
    };

    const handleSendMessage = async (e: React.FormEvent, projectId: string) => {
        e.preventDefault();
        const msg = newMessages[projectId] || "";
        if (!msg.trim() || !user) return;
        setSendingMsg(true);
        const { error } = await supabase.from("project_messages").insert({
            project_id: projectId,
            sender_id: user.id,
            message: msg.trim(),
        });
        if (error) { toast.error("Failed to send message"); }
        else {
            setNewMessages(prev => ({ ...prev, [projectId]: "" }));
        }
        setSendingMsg(false);
    };

    if (loading) return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-xl" />
                <Skeleton className="h-8 w-48" />
            </div>
            <Skeleton className="h-4 w-64 mt-2" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <div className="space-y-6">
                <Skeleton className="h-48 w-full rounded-2xl" />
                <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
        </div>
    );

    const totalTasks = grouped.reduce((sum, g) => sum + g.tasks.length, 0);
    const doneTasks = grouped.reduce((sum, g) => sum + g.tasks.filter((t) => t.status === "done").length, 0);

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-brand">
                        <Palette size={18} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
                </div>
                <p className="text-muted-foreground mt-1">
                    Welcome back, {profile?.full_name ?? "Creative"} 👋 — {doneTasks}/{totalTasks} tasks complete
                </p>
            </motion.div>

            {/* Progress bar */}
            {totalTasks > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 bg-card rounded-xl border border-border p-5 shadow-sm">
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>Overall Progress</span>
                        <span>{Math.round((doneTasks / totalTasks) * 100)}%</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(doneTasks / totalTasks) * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="bg-primary h-full rounded-full"
                        />
                    </div>
                </motion.div>
            )}

            {grouped.length === 0 ? (
                <EmptyState
                    title="No tasks assigned yet"
                    description="Kick back and relax! An admin will assign tasks to your profile soon."
                />
            ) : (
                <div className="space-y-6">
                    {grouped.map((pg, gi) => (
                        <motion.div
                            key={pg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: gi * 0.1 }}
                            className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                                <h2 className="font-semibold">{pg.title}</h2>
                                <span className="text-xs text-muted-foreground">{pg.tasks.filter((t) => t.status === "done").length}/{pg.tasks.length} done</span>
                            </div>

                            {pg.creative_brief && (
                                <div className="bg-muted/10 border-b border-border p-5">
                                    <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Client Strategy Debrief</h3>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-muted-foreground">Industry</p>
                                            <p className="text-sm">{pg.creative_brief.industry || "—"}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-muted-foreground">Target Audience</p>
                                            <p className="text-sm">{pg.creative_brief.audience || "—"}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-muted-foreground">Style</p>
                                            <p className="text-sm">{pg.creative_brief.style || "—"}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-muted-foreground">References</p>
                                            <p className="text-sm">{pg.creative_brief.references || "—"}</p>
                                        </div>
                                        <div className="space-y-1 sm:col-span-2">
                                            <p className="text-xs font-semibold text-muted-foreground">Description</p>
                                            <p className="text-sm">{pg.creative_brief.description || "—"}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="p-4 space-y-3">
                                {pg.tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="flex items-center gap-4 bg-muted/40 rounded-xl px-4 py-3 group"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                                                {task.title}
                                            </p>
                                            {task.description && (
                                                <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.description}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleStatusCycle(task)}
                                            disabled={updatingId === task.id}
                                            className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${STATUS_COLORS[task.status]}`}
                                        >
                                            {updatingId === task.id ? (
                                                <Loader2 size={12} className="animate-spin" />
                                            ) : task.status === "done" ? (
                                                <CheckCircle2 size={12} />
                                            ) : (
                                                <Clock size={12} />
                                            )}
                                            {STATUS_LABELS[task.status]}
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Discussion Panel */}
                            <div className="border-t border-border bg-card flex flex-col" style={{ height: "300px" }}>
                                <div className="px-6 py-3 border-b border-border bg-muted/10">
                                    <h3 className="text-sm font-semibold flex items-center gap-2">
                                        <MessageSquare size={14} className="text-primary" /> Team Discussion
                                    </h3>
                                </div>
                                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-muted/5">
                                    {pg.messages?.length === 0 ? (
                                        <p className="text-center text-sm text-muted-foreground my-8">No messages. Introduce yourself to the client.</p>
                                    ) : (
                                        pg.messages?.map((msg) => {
                                            const isMe = msg.sender_id === user?.id;
                                            return (
                                                <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                                                    <Avatar className="h-8 w-8 border border-border shrink-0">
                                                        <AvatarImage src={msg.profiles?.avatar_url || ""} />
                                                        <AvatarFallback>{msg.profiles?.full_name?.charAt(0) || "?"}</AvatarFallback>
                                                    </Avatar>
                                                    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[11px] font-medium text-muted-foreground">{isMe ? "You" : msg.profiles?.full_name || "Unknown"}</span>
                                                            <span className="text-[10px] text-muted-foreground/60">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                        <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[90%] whitespace-pre-wrap flex-wrap break-words ${isMe ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-card border border-border rounded-tl-none"}`}>
                                                            {msg.message}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                                <div className="p-4 bg-card border-t border-border shrink-0">
                                    <form onSubmit={(e) => handleSendMessage(e, pg.id)} className="flex items-end gap-2">
                                        <textarea
                                            className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none min-h-[46px]"
                                            placeholder="Type your message..."
                                            rows={1}
                                            value={newMessages[pg.id] || ""}
                                            onChange={(e) => setNewMessages(prev => ({ ...prev, [pg.id]: e.target.value }))}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage(e, pg.id);
                                                }
                                            }}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!(newMessages[pg.id]?.trim()) || sendingMsg}
                                            className="bg-primary text-primary-foreground h-[46px] w-[46px] rounded-xl flex items-center justify-center shrink-0 hover:bg-primary/90 transition-colors disabled:opacity-50"
                                        >
                                            {sendingMsg ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CreativeOverview;
