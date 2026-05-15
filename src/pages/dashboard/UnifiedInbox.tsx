import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/i18n";
import { 
    Search, 
    Send, 
    Paperclip, 
    MoreVertical, 
    FolderOpen, 
    MessageSquare, 
    Clock, 
    CheckCheck,
    Loader2,
    ChevronRight,
    Shield
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
    id: string;
    project_id: string;
    sender_id: string;
    message: string;
    created_at: string;
    is_internal: boolean;
    profiles: {
        full_name: string | null;
        avatar_url: string | null;
    } | null;
};

type Project = {
    id: string;
    title: string;
    client_id: string;
    creative_id: string | null;
    status: string;
    profiles?: {
        full_name: string | null;
        avatar_url: string | null;
    } | null;
};

export default function UnifiedInbox() {
    const { user, profile } = useAuth();
    const { t } = useI18n();
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sendingMsg, setSendingMsg] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isInternal, setIsInternal] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchProjects = async () => {
            if (!user || !profile) return;
            
            let query = supabase.from("projects").select("*, profiles!client_id(full_name, avatar_url)");
            
            if (profile.role === 'client') {
                query = query.eq("client_id", user.id);
            } else if (profile.role === 'creative') {
                query = query.eq("creative_id", user.id);
            }
            // Admin sees all

            const { data } = await query.order("updated_at", { ascending: false });
            setProjects(data || []);
            setLoadingProjects(false);
            
            if (data && data.length > 0) {
                setActiveProjectId(data[0].id);
            }
        };

        fetchProjects();
    }, [user, profile]);

    useEffect(() => {
        if (!activeProjectId) return;

        const fetchMessages = async () => {
            setLoadingMessages(true);
            const { data } = await supabase
                .from("project_messages")
                .select("*, profiles!sender_id(full_name, avatar_url)")
                .eq("project_id", activeProjectId)
                .order("created_at", { ascending: true });
            
            setMessages(data || []);
            setLoadingMessages(false);
            setTimeout(scrollToBottom, 100);
        };

        fetchMessages();

        const channel = supabase
            .channel(`project_chat_${activeProjectId}`)
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "project_messages", filter: `project_id=eq.${activeProjectId}` },
                (payload) => {
                    // Fetch profile for the new message
                    supabase
                        .from("profiles")
                        .select("full_name, avatar_url")
                        .eq("id", payload.new.sender_id)
                        .single()
                        .then(({ data: profileData }) => {
                            const newMsg = { ...payload.new, profiles: profileData } as Message;
                            setMessages((prev) => [...prev, newMsg]);
                            setTimeout(scrollToBottom, 50);
                        });
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [activeProjectId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeProjectId || !user) return;

        setSendingMsg(true);
        const { error } = await supabase.from("project_messages").insert({
            project_id: activeProjectId,
            sender_id: user.id,
            message: newMessage.trim(),
            is_internal: isInternal
        });

        if (!error) {
            setNewMessage("");
            if (isInternal) setIsInternal(false);
        }
        setSendingMsg(false);
    };

    const activeProject = projects.find(p => p.id === activeProjectId);

    const getCounterpart = (p: Project) => {
        if (profile?.role === 'client') return { name: "Branding.tn Team", avatar: null };
        return { name: p.profiles?.full_name || "Client", avatar: p.profiles?.avatar_url };
    };

    const filteredProjects = projects.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="h-[calc(100vh-120px)] flex bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            {/* Sidebar: Project List */}
            <div className="w-80 border-r border-border flex flex-col bg-muted/20">
                <div className="p-4 border-b border-border space-y-4">
                    <h2 className="font-bold text-lg">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                        <Input 
                            placeholder="Search chats..." 
                            className="pl-9 h-9 bg-background border-border"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    {loadingProjects ? (
                        <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="text-center py-12 px-4">
                            <MessageSquare className="mx-auto text-muted-foreground/30 mb-3" size={32} />
                            <p className="text-sm font-medium">No chats found</p>
                        </div>
                    ) : (
                        filteredProjects.map((p) => {
                            const counterpart = getCounterpart(p);
                            const isActive = p.id === activeProjectId;
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => setActiveProjectId(p.id)}
                                    className={`w-full p-4 flex gap-3 transition-all border-b border-border/50 text-left ${isActive ? "bg-background shadow-sm" : "hover:bg-background/50"}`}
                                >
                                    <Avatar className="w-10 h-10 border border-border">
                                        <AvatarImage src={counterpart.avatar || ""} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">{p.title.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <h3 className={`text-sm font-semibold truncate ${isActive ? "text-primary" : "text-foreground"}`}>{p.title}</h3>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">Active</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">{counterpart.name}</p>
                                    </div>
                                    {isActive && <div className="w-1 h-8 bg-primary rounded-full" />}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-background">
                {activeProjectId ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 border-b border-border px-6 flex items-center justify-between bg-card">
                            <div className="flex flex-col">
                                <h3 className="font-bold">{activeProject?.title}</h3>
                                <p className="text-xs text-muted-foreground">Chatting with {getCounterpart(activeProject!).name}</p>
                            </div>
                            <Link to={profile?.role === 'admin' ? `/dashboard/admin/projects/${activeProjectId}` : `/dashboard/projects/${activeProjectId}`}>
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
                                    const isMe = m.sender_id === user?.id;
                                    
                                    if (isInternalMsg && profile?.role === 'client') return null; // Clients don't see internal notes

                                    return (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={m.id} className={`flex gap-3 max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                                            <Avatar className="w-8 h-8 shrink-0 mt-1">
                                                <AvatarImage src={m.profiles?.avatar_url || ""} />
                                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{m.profiles?.full_name?.charAt(0) || "U"}</AvatarFallback>
                                            </Avatar>
                                            <div className={`space-y-1 flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                                <div className={`flex items-center gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                                                    <span className="text-xs font-bold text-foreground">
                                                        {isInternalMsg ? "INTERNAL NOTE" : (isMe ? "You" : (m.profiles?.full_name || "Unknown"))}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <div className={`p-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed shadow-sm border ${isInternalMsg
                                                    ? "bg-orange-500/10 border-orange-500/20 text-orange-950 dark:text-orange-200"
                                                    : isMe ? "bg-primary text-primary-foreground border-primary rounded-tr-none" : "bg-card border-border text-foreground rounded-tl-none"
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

                        {/* Input Area */}
                        <div className="p-4 border-t border-border bg-card">
                            <form onSubmit={handleSendMessage} className="space-y-3">
                                <div className="relative">
                                    <textarea 
                                        className="w-full bg-muted/50 border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none min-h-[100px]"
                                        placeholder={isInternal ? "Add an internal note..." : "Type your message..."}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                                            <Paperclip size={18} />
                                        </Button>
                                        {profile?.role !== 'client' && (
                                            <Button 
                                                type="button" 
                                                variant={isInternal ? "default" : "ghost"} 
                                                size="sm"
                                                onClick={() => setIsInternal(!isInternal)}
                                                className={`gap-1.5 ${isInternal ? "bg-orange-500 hover:bg-orange-600 text-white" : "text-muted-foreground"}`}
                                            >
                                                <Shield size={14} />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Internal Note</span>
                                            </Button>
                                        )}
                                    </div>
                                    <Button 
                                        type="submit" 
                                        disabled={sendingMsg || !newMessage.trim()}
                                        className="rounded-xl px-5 gap-2 shadow-brand"
                                    >
                                        {sendingMsg ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                        Send
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-muted/5">
                        <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
                            <MessageSquare size={32} />
                        </div>
                        <h3 className="text-xl font-bold">Select a conversation</h3>
                        <p className="text-muted-foreground text-sm max-w-xs mt-2">
                            Choose a project from the left sidebar to view messages and collaborate with the team.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
