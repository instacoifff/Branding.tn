import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
    ArrowLeft, Loader2, FileText, CheckCircle2,
    Clock, PlayCircle, Eye, Send, Download
} from "lucide-react";
import { useI18n } from "@/i18n";
import { useAuth } from "@/contexts/AuthContext";

type Project = {
    id: string; title: string; status: "onboarding" | "active" | "completed";
    current_stage: number; total_price: number; deposit_paid: boolean;
};

export default function ProjectDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useI18n();
    const { profile: userProfile } = useAuth();

    const [project, setProject] = useState<Project | null>(null);
    const [files, setFiles] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState("");
    const [sendingMsg, setSendingMsg] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, []);

    const fetchData = useCallback(async () => {
        if (!id) return;
        try {
            const [{ data: proj }, { data: fileData }, { data: msgData }] = await Promise.all([
                supabase.from("projects").select("*").eq("id", id).single(),
                supabase.from("files").select("*").eq("project_id", id).order("uploaded_at", { ascending: false }),
                supabase.from("project_messages").select("*, profiles(full_name, avatar_url)").eq("project_id", id).order("created_at", { ascending: true }),
            ]);

            if (!proj) {
                navigate("/dashboard/projects");
                return;
            }

            setProject(proj as Project);
            setFiles(fileData ?? []);
            setMessages(msgData ?? []);
            setLoading(false);
            setTimeout(scrollToBottom, 100);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    }, [id, navigate, scrollToBottom]);

    useEffect(() => {
        fetchData();
        const channel = supabase.channel(`client_project_v2_${id}`)
            .on("postgres_changes", { event: "*", schema: "public", table: "project_messages", filter: `project_id=eq.${id}` }, fetchData)
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [id, fetchData]);

    if (loading) return <div className="flex h-[400px] items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;
    if (!project) return null;

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div>
                <Link to="/dashboard/projects" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft size={14} /> Back to Projects
                </Link>
                <h1 className="text-3xl font-bold mt-2">{project.title}</h1>
                <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase border border-primary/20">{project.status}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
                        <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Progress</h2>
                        <div className="space-y-3">
                            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                <div className="bg-primary h-full transition-all" style={{ width: `${(project.current_stage / 5) * 100}%` }} />
                            </div>
                            <p className="text-xs font-medium text-muted-foreground text-center">Stage {project.current_stage} of 5</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
                        <h2 className="text-lg font-bold">Project Files</h2>
                        <div className="divide-y divide-border">
                            {files.map(f => (
                                <div key={f.id} className="flex items-center justify-between py-3.5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                            <FileText size={16} className="text-muted-foreground" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium truncate max-w-[200px]">{f.file_name}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase">{f.type}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a href={f.file_url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-muted rounded-lg transition-colors">
                                            <Eye size={16} className="text-muted-foreground" />
                                        </a>
                                        <a href={f.file_url} download className="p-2 hover:bg-muted rounded-lg transition-colors">
                                            <Download size={16} className="text-muted-foreground" />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-card rounded-2xl border border-border shadow-sm h-[450px] flex flex-col overflow-hidden">
                        <div className="px-6 py-4 border-b border-border font-bold bg-muted/20">Chat with the Team</div>
                        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/5">
                            {messages.map(m => (
                                <div key={m.id} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 border border-primary/20">
                                        {m.profiles?.full_name?.charAt(0)}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold">{m.profiles?.full_name}</span>
                                            <span className="text-[10px] text-muted-foreground">{new Date(m.created_at).toLocaleTimeString()}</span>
                                        </div>
                                        <div className="bg-muted px-4 py-2 rounded-2xl rounded-tl-none text-sm border border-border/50">{m.message}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <form className="p-4 border-t border-border flex gap-2 bg-card" onSubmit={async (e) => {
                            e.preventDefault();
                            if (!newMessage.trim()) return;
                            setSendingMsg(true);
                            await supabase.from("project_messages").insert({ project_id: id, sender_id: userProfile?.id, message: newMessage });
                            setNewMessage("");
                            setSendingMsg(false);
                            fetchData();
                        }}>
                            <input className="flex-1 bg-muted/50 border border-border px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." />
                            <button type="submit" disabled={sendingMsg} className="bg-primary text-primary-foreground p-2.5 rounded-xl shadow-brand hover:opacity-90 transition-all disabled:opacity-50">
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
