import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, CheckCircle2, Clock, Palette, FolderOpen } from "lucide-react";
import { useI18n } from "@/i18n";

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
    tasks: Task[];
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

    useEffect(() => {
        const fetchMyTasks = async () => {
            if (!user) return;

            // Find team_member matching this user's profile name (best-effort)
            const { data: teamMembers } = await supabase
                .from("team_members")
                .select("id, name");

            // Find if any team member matches the user's email/name
            const myMember = teamMembers?.find(
                (m) =>
                    m.name.toLowerCase() === (profile?.full_name ?? "").toLowerCase()
            );

            if (!myMember) {
                setLoading(false);
                return;
            }

            const { data: tasks } = await supabase
                .from("tasks")
                .select("*, projects(id, title)")
                .eq("assigned_to", myMember.id)
                .order("created_at", { ascending: false });

            // Group by project
            const map: Record<string, GroupedProject> = {};
            (tasks ?? []).forEach((task: any) => {
                const pid = task.project_id;
                if (!map[pid]) {
                    map[pid] = { id: pid, title: task.projects?.title ?? pid, tasks: [] };
                }
                map[pid].tasks.push({
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    status: task.status,
                    project_id: task.project_id,
                });
            });

            setGrouped(Object.values(map));
            setLoading(false);
        };
        fetchMyTasks();
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

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                <div className="bg-card rounded-xl border border-border p-12 text-center">
                    <FolderOpen size={40} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No tasks assigned yet</h3>
                    <p className="text-muted-foreground text-sm">Ask an admin to assign tasks to your team member profile.</p>
                </div>
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
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CreativeOverview;
