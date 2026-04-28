import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft, Clock, CheckCircle2, FileText, Download, Loader2,
    FolderOpen, PlayCircle, CheckSquare, Image, Film, Archive, FileCode2,
    MessageSquare, Upload, Send
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    type: "concept" | "final" | "inspiration";
    uploaded_at: string;
};

type Task = {
    id: string;
    title: string;
    description: string | null;
    status: "todo" | "doing" | "done";
};

type ProjectMessage = {
    id: string;
    sender_id: string;
    message: string;
    created_at: string;
    profiles?: { full_name: string; avatar_url: string };
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
    const [messages, setMessages] = useState<ProjectMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [sendingMsg, setSendingMsg] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !id) return;
            const [{ data: proj }, { data: fileData }, { data: taskData }, { data: msgData }] = await Promise.all([
                supabase.from("projects").select("*").eq("id", id).eq("client_id", user.id).single(),
                supabase.from("files").select("*").eq("project_id", id).order("uploaded_at", { ascending: false }),
                supabase.from("tasks").select("id, title, description, status").eq("project_id", id).order("created_at"),
                supabase.from("project_messages").select("*, profiles(full_name, avatar_url)").eq("project_id", id).order("created_at", { ascending: true }),
            ]);

            setProject(proj || null);
            setFiles(fileData || []);
            setTasks(taskData || []);
            setMessages((msgData as any) || []);
            setLoading(false);
        };
        fetchData();

        // Real-time subscription for tasks updates
        const taskChannel = supabase
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
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "project_messages", filter: `project_id=eq.${id}` }, async payload => {
                // Fetch the profile associated with the new message
                const { data: profile } = await supabase.from("profiles").select("full_name, avatar_url").eq("id", payload.new.sender_id).single();
                setMessages(prev => {
                    // Prevent duplicates if we generated this message
                    if (prev.some(m => m.id === payload.new.id)) return prev;
                    return [...prev, { ...payload.new, profiles: profile } as any];
                });
            })
            .subscribe();

        return () => { supabase.removeChannel(taskChannel); };
    }, [user, id]);

    const handleInspirationUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !id) return;
        setUploading(true);
        const filePath = `projects/${id}/inspiration_${Date.now()}_${file.name}`;

        try {
            const { error: uploadError } = await supabase.storage.from("project-files").upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage.from("project-files").getPublicUrl(filePath);

            const { data: newFile, error: insertError } = await supabase.from("files")
                .insert({ project_id: id, file_name: `[Inspiration] ${file.name}`, file_url: urlData.publicUrl, type: "inspiration" })
                .select().single();

            if (insertError) throw insertError;

            // eslint-disable-next-line
            toast.success("Inspiration uploaded successfully!");
            setFiles(prev => [newFile as FileRow, ...prev]);
        } catch (error) {
            console.error("Upload error:", error);
            // eslint-disable-next-line
            toast.error("Failed to upload file.");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !id) return;
        setSendingMsg(true);
        const { error } = await supabase.from("project_messages").insert({
            project_id: id,
            sender_id: user.id,
            message: newMessage.trim(),
        });
        if (error) { toast.error("Failed to send message"); }
        else { setNewMessage(""); }
        setSendingMsg(false);
    };

    if (loading) return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <Skeleton className="h-4 w-24 mb-6" />
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-48 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-64 w-full rounded-2xl" />
                    <Skeleton className="h-40 w-full rounded-2xl" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-48 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                </div>
            </div>
        </div>
    );

    if (!project) return (
        <EmptyState
            title="Project not found"
            description="We couldn't locate this project. It may have been deleted."
            action={
                <Link to="/dashboard/projects" className="text-sm font-medium text-primary hover:underline">
                    {t("dashboard.projectDetailPage.back")}
                </Link>
            }
        />
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

                    {/* Inspiration Upload box -- only for early stages */}
                    {project.current_stage <= 2 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                            className="bg-card rounded-2xl border border-border mt-6 shadow-sm overflow-hidden p-6">
                            <h2 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Upload Inspirations</h2>
                            <p className="text-xs text-muted-foreground mb-4">Share moodboards or references to guide our creative team perfectly.</p>
                            <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-5 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                                <Upload size={20} className="text-muted-foreground" />
                                <span className="text-sm font-medium">Click to Upload</span>
                                <span className="text-xs text-muted-foreground">PNG, JPG, PDF, etc.</span>
                                <input type="file" className="hidden" onChange={handleInspirationUpload} disabled={uploading} accept="image/*,.pdf" />
                            </label>
                            {uploading && (
                                <div className="flex items-center gap-2 mt-3 text-sm text-primary font-medium">
                                    <Loader2 size={14} className="animate-spin" /> Uploading securely...
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Discussions / Internal Project Messaging */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
                        className="bg-card rounded-2xl border border-border mt-6 shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: "500px" }}>
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between shadow-sm z-10 shrink-0">
                            <div className="flex items-center gap-2">
                                <MessageSquare size={16} className="text-primary" />
                                <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">{t("brief.discussion") || "Project Discussion"}</h2>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/10">
                            {messages.length === 0 ? (
                                <p className="text-center text-sm text-muted-foreground my-8">No messages yet. Say hello to your team!</p>
                            ) : (
                                messages.map((msg) => {
                                    const isMe = msg.sender_id === user?.id;
                                    return (
                                        <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                                            <Avatar className="h-8 w-8 border border-border shrink-0">
                                                <AvatarImage src={msg.profiles?.avatar_url || ""} />
                                                <AvatarFallback>{msg.profiles?.full_name?.charAt(0) || "?"}</AvatarFallback>
                                            </Avatar>
                                            <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[11px] font-medium text-muted-foreground">{isMe ? "You" : msg.profiles?.full_name}</span>
                                                    <span className="text-[10px] text-muted-foreground/60">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[90%] whitespace-pre-wrap ${isMe ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-card border border-border rounded-tl-none"}`}>
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
                                    // Make Enter send message, Shift+Enter do newline
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
                    </motion.div>

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
                            <EmptyState
                                title="No files yet"
                                description={t("dashboard.projectDetailPage.noFiles")}
                                className="border-0 shadow-none rounded-none rounded-b-xl"
                            />
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
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${file.type === "final" ? "bg-green-500/10 text-green-600 border-green-500/20" : file.type === "concept" ? "bg-orange-500/10 text-orange-600 border-orange-500/20" : "bg-purple-500/10 text-purple-600 border-purple-500/20"}`}>
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
