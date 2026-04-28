import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/i18n";
import { toast } from "sonner";
import {
    Search, Loader2, Send, Clock, PlayCircle, CheckCircle2,
    MessageSquare, EyeOff, Paperclip, ChevronRight, Hash, FolderOpen,
    Zap, Link as LinkIcon
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Project = {
    id: string;
    title: string;
    status: string;
    current_stage: number;
    total_price: number;
    profiles?: { full_name: string; company: string; avatar_url: string };
    creative_profile?: { full_name: string; avatar_url: string };
    latest_message_time?: string;
};

type ProjectMessage = {
    id: string;
    sender_id: string;
    message: string;
    is_internal: boolean;
    created_at: string;
    profiles?: { full_name: string; avatar_url: string };
};

const Inbox = () => {
    const { t } = useI18n();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ProjectMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isInternal, setIsInternal] = useState(false);
    const [sendingMsg, setSendingMsg] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);

    // Canned Responses
    const [showCanned, setShowCanned] = useState(false);
    const cannedTemplates = [
        "Your first wireframes are uploaded! Please review the files vault.",
        "Can we schedule a quick call to discuss your creative brief?",
        "I've assigned a creative to your project. They will start shortly.",
        "Could you please clarify the main objective in the brief?",
        "Project is moving to the next stage!"
    ];

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initial Fetch
    useEffect(() => {
        const fetchProjects = async () => {
            const { data, error } = await supabase
                .from("projects")
                .select("id, title, status, current_stage, total_price, profiles!client_id(full_name, company, avatar_url), creative_profile:profiles!creative_id(full_name, avatar_url)")
                .order("created_at", { ascending: false });

            if (data) setProjects(data as any[]);
            setLoading(false);
        };
        fetchProjects();
    }, []);

    // Fetch Messages when active project changes
    useEffect(() => {
        if (!activeProjectId) return;
        const fetchMessages = async () => {
            setLoadingMessages(true);
            const { data } = await supabase
                .from("project_messages")
                .select("*, profiles(full_name, avatar_url)")
                .eq("project_id", activeProjectId)
                .order("created_at", { ascending: true });

            setMessages((data as any) || []);
            setLoadingMessages(false);
            scrollToBottom();
        };

        fetchMessages();

        const channel = supabase.channel(`inbox_${activeProjectId}`)
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "project_messages", filter: `project_id=eq.${activeProjectId}` }, async payload => {
                const { data: profile } = await supabase.from("profiles").select("full_name, avatar_url").eq("id", payload.new.sender_id).single();
                setMessages(prev => {
                    if (prev.some(m => m.id === payload.new.id)) return prev;
                    return [...prev, { ...payload.new, profiles: profile } as any];
                });
                scrollToBottom();
            }).subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [activeProjectId]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        if (!newMessage.trim() || !user || !activeProjectId) return;

        setSendingMsg(true);
        const { error } = await supabase.from("project_messages").insert({
            project_id: activeProjectId,
            sender_id: user.id,
            message: newMessage.trim(),
            is_internal: isInternal
        });

        if (error) { toast.error("Failed to send message"); }
        else { setNewMessage(""); setShowCanned(false); scrollToBottom(); }
        setSendingMsg(false);
    };

    const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setNewMessage(val);
        if (val.endsWith("/")) {
            setShowCanned(true);
        } else if (showCanned && !val.includes("/")) {
            setShowCanned(false);
        }
    };

    const insertTemplate = (text: string) => {
        // Replace the last slash with the template
        const parts = newMessage.split("/");
        parts.pop();
        setNewMessage((parts.join("/") + " " + text).trimStart());
        setShowCanned(false);
        inputRef.current?.focus();
    };

    // Derived states
    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.profiles?.full_name.toLowerCase().includes(search.toLowerCase())
    );

    const activeProject = projects.find(p => p.id === activeProjectId);

    return (
        <div className="h-[calc(100vh-100px)] flex bg-card border border-border rounded-2xl shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Left Pane: Conversation List */}
            <div className="w-80 shrink-0 border-r border-border flex flex-col bg-background/50">
                <div className="p-4 border-b border-border">
                    <h2 className="font-bold text-lg mb-3">Unified Inbox</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-8 pr-4 py-2 border border-border rounded-lg bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {loading ? (
                        <div className="p-6 text-center text-muted-foreground"><Loader2 size={24} className="animate-spin mx-auto" /></div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="p-6 text-center text-muted-foreground">
                            <MessageSquare className="mx-auto mb-2 opacity-50" size={24} />
                            <p className="text-sm">No active threads</p>
                        </div>
                    ) : (
                        filteredProjects.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setActiveProjectId(p.id)}
                                className={`w-full text-left p-4 border-b border-border transition-colors hover:bg-muted/50 ${activeProjectId === p.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
                            >
                                <div className="flex gap-3">
                                    <Avatar className="w-10 h-10 border border-border shadow-sm">
                                        <AvatarImage src={p.profiles?.avatar_url || ""} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                            {p.profiles?.full_name?.charAt(0) || "C"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <p className="font-semibold text-sm truncate">{p.profiles?.full_name || "Client"}</p>
                                            <span className="text-[10px] text-muted-foreground">Active</span>
                                        </div>
                                        <p className="text-xs font-medium text-foreground truncate">{p.title}</p>
                                        <p className="text-[11px] text-muted-foreground truncate mt-0.5 max-w-[180px]">
                                            Click to view thread
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Center Pane: The Thread */}
            <div className="flex-1 flex flex-col min-w-0 bg-background relative">
                {!activeProjectId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                        <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                        <h3 className="text-lg font-medium text-foreground">No Chat Selected</h3>
                        <p className="text-sm">Select a project from the left pane to view the discussion.</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="px-6 py-4 border-b border-border bg-card/50 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="font-bold">{activeProject?.title}</h3>
                                <p className="text-xs text-muted-foreground">Client: {activeProject?.profiles?.full_name}</p>
                            </div>
                            <Link to={`/dashboard/admin/projects/${activeProjectId}`}>
                                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-xs font-semibold hover:bg-muted/80 transition-colors">
                                    Open Project <ChevronRight size={14} />
                                </button>
                            </Link>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {loadingMessages ? (
                                <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
                            ) : messages.length === 0 ? (
                                <div className="text-center py-12">
                                    <FolderOpen className="mx-auto text-muted-foreground/30 mb-3" size={32} />
                                    <p className="text-sm font-medium">Thread is empty</p>
                                    <p className="text-xs text-muted-foreground mt-1">Start the conversation below.</p>
                                </div>
                            ) : (
                                messages.map((m) => {
                                    const isInternalMsg = m.is_internal;
                                    return (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={m.id} className={`flex gap-3 max-w-[85%] ${isInternalMsg ? "mr-auto ml-10" : ""}`}>
                                            {!isInternalMsg && (
                                                <Avatar className="w-8 h-8 shrink-0 mt-1">
                                                    <AvatarImage src={m.profiles?.avatar_url || ""} />
                                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{m.profiles?.full_name?.charAt(0) || "U"}</AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-foreground">
                                                        {isInternalMsg ? "INTERNAL NOTE" : (m.profiles?.full_name || "Unknown")}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <div className={`p-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed shadow-sm border ${isInternalMsg
                                                    ? "bg-orange-500/10 border-orange-500/20 text-orange-950 dark:text-orange-200"
                                                    : "bg-card border-border text-foreground"
                                                    }`}>
                                                    {m.message}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 bg-card/80 border-t border-border shrink-0 relative">
                            {/* Canned Responses Popover */}
                            <AnimatePresence>
                                {showCanned && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                        className="absolute bottom-full left-4 mb-2 w-80 bg-background border border-border shadow-2xl rounded-xl overflow-hidden z-20"
                                    >
                                        <div className="p-2 border-b border-border bg-muted/30">
                                            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider px-1">Quick Templates</p>
                                        </div>
                                        <div className="max-h-48 overflow-y-auto p-1">
                                            {cannedTemplates.map((t, i) => (
                                                <button
                                                    key={i} onClick={() => insertTemplate(t)}
                                                    className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-muted rounded-md transition-colors truncate"
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-3 flex items-center gap-1">Mode:</span>
                                <button onClick={() => setIsInternal(false)} className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all ${!isInternal ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                                    Client Reply
                                </button>
                                <button onClick={() => setIsInternal(true)} className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all ml-1 flex items-center gap-1 ${isInternal ? "bg-orange-500/20 text-orange-600" : "text-muted-foreground hover:bg-muted"}`}>
                                    <EyeOff size={12} /> Internal Note
                                </button>
                            </div>
                            <form onSubmit={handleSendMessage} className={`relative flex items-center rounded-xl border focus-within:ring-2 focus-within:ring-primary/20 transition-all ${isInternal ? "border-orange-500/50 bg-orange-500/5" : "border-border bg-background"}`}>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={newMessage}
                                    onChange={handleMessageChange}
                                    placeholder={isInternal ? "Type a private note for the team..." : "Reply to client..."}
                                    className="flex-1 bg-transparent px-4 py-3.5 text-sm focus:outline-none placeholder:text-muted-foreground"
                                    disabled={sendingMsg}
                                />
                                <button
                                    type="button"
                                    className="p-2 text-muted-foreground hover:text-foreground transition-colors mr-1"
                                    title="Attach File"
                                    onClick={() => inputRef.current?.focus()}
                                >
                                    <Paperclip size={18} />
                                </button>
                                <button
                                    type="submit"
                                    disabled={sendingMsg || !newMessage.trim()}
                                    className="p-2 m-1.5 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors shadow-sm"
                                >
                                    {sendingMsg ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                </button>
                            </form>
                            <p className="text-[10px] text-muted-foreground text-center mt-2">
                                Type <span className="font-mono bg-muted px-1 rounded">/</span> for quick templates.
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Right Pane: CRM Context Sidebar */}
            {activeProject && (
                <div className="w-72 shrink-0 border-l border-border bg-muted/10 p-5 overflow-y-auto no-scrollbar">
                    <h3 className="font-bold text-sm tracking-wide mb-5 flex items-center gap-2">
                        <Hash size={14} className="text-primary" /> Project CRM
                    </h3>

                    <div className="space-y-6">
                        {/* Status Card */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase">Current State</h4>
                            <div className="bg-card border border-border rounded-xl p-3 shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-medium">Stage {activeProject.current_stage}/5</span>
                                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-primary/10 text-primary">{activeProject.status}</span>
                                </div>
                                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${(activeProject.current_stage / 5) * 100}%` }} />
                                </div>
                            </div>
                        </div>

                        {/* Pipeline Bindings */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase">Stakeholders</h4>
                            <div className="bg-card border border-border rounded-xl p-3 shadow-sm space-y-3">
                                <div>
                                    <p className="text-[10px] text-muted-foreground mb-1">Client</p>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="w-6 h-6"><AvatarFallback className="text-[10px]">{activeProject.profiles?.full_name?.charAt(0)}</AvatarFallback></Avatar>
                                        <p className="text-xs font-semibold">{activeProject.profiles?.full_name}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground mb-1">Assigned Creative</p>
                                    <div className="flex items-center gap-2">
                                        {activeProject.creative_profile ? (
                                            <>
                                                <Avatar className="w-6 h-6"><AvatarImage src={activeProject.creative_profile.avatar_url} /><AvatarFallback className="text-[10px]">{activeProject.creative_profile.full_name?.charAt(0)}</AvatarFallback></Avatar>
                                                <p className="text-xs font-semibold">{activeProject.creative_profile.full_name}</p>
                                            </>
                                        ) : (
                                            <p className="text-xs text-orange-500 font-semibold bg-orange-500/10 px-2 py-1 rounded w-fit">Unassigned</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Financial Info */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase">Value</h4>
                            <div className="bg-card border border-border rounded-xl p-3 shadow-sm">
                                <p className="text-sm font-bold">{activeProject.total_price.toLocaleString()} TND</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inbox;
