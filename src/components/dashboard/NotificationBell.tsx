import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Bell } from "lucide-react";

import { useNavigate } from "react-router-dom";

type Notification = {
    id: string;
    title: string;
    body: string | null;
    read: boolean;
    created_at: string;
    reference_type: string | null;
    reference_id: string | null;
};

function NotificationBell() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const unread = notifications.filter((n) => !n.read).length;

    const fetchNotifications = async () => {
        if (!user) return;
        const { data } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(20);
        setNotifications(data ?? []);
    };

    useEffect(() => {
        fetchNotifications();
        // Subscribe to realtime inserts
        if (!user) return;
        const channel = supabase
            .channel("notifications-bell")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
                () => fetchNotifications()
            )
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [user]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const markAllRead = async () => {
        if (!user || unread === 0) return;
        await supabase
            .from("notifications")
            .update({ read: true })
            .eq("user_id", user.id)
            .eq("read", false);
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const markAsRead = async (id: string) => {
        if (!user) return;
        await supabase
            .from("notifications")
            .update({ read: true })
            .eq("id", id);
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    };

    const handleOpen = () => {
        setOpen((v) => !v);
    };

    const navigate = useNavigate();

    const getNotificationLink = (n: Notification) => {
        if (!n.reference_id || !n.reference_type) return null;
        
        if (n.reference_type === 'project') {
            if (user?.user_metadata?.role === 'admin') {
                return `/dashboard/admin/projects/${n.reference_id}`;
            } else if (user?.user_metadata?.role === 'creative') {
                return `/dashboard/creative`; // Creatives use the overview dashboard
            } else {
                return `/dashboard/projects/${n.reference_id}`; // Client
            }
        }
        return null;
    };

    const handleNotificationClick = (n: Notification) => {
        if (!n.read) {
            markAsRead(n.id);
        }
        setOpen(false);
        const link = getNotificationLink(n);
        if (link) {
            navigate(link);
        }
    };

    return (
        <div className="relative shrink-0" ref={ref}>
            <button
                onClick={handleOpen}
                className="relative w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Notifications"
            >
                <Bell size={16} />
                {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                        {unread > 9 ? "9+" : unread}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden"
                    >
                        <div className="px-4 py-3.5 border-b border-border flex items-center justify-between">
                            <h3 className="text-sm font-semibold">Notifications</h3>
                            {unread > 0 ? (
                                <button onClick={markAllRead} className="text-xs text-primary hover:underline font-medium">
                                    Mark all as read
                                </button>
                            ) : notifications.length > 0 ? (
                                <span className="text-xs text-muted-foreground">All read</span>
                            ) : null}
                        </div>

                        <div className="max-h-72 overflow-y-auto divide-y divide-border">
                            {notifications.length === 0 ? (
                                <div className="p-6 text-center text-sm text-muted-foreground">
                                    <Bell size={24} className="mx-auto mb-2 opacity-40" />
                                    No notifications yet
                                </div>
                            ) : (
                                notifications.map((n) => {
                                    const link = getNotificationLink(n);
                                    
                                    const content = (
                                        <div className="flex gap-3 relative">
                                            {!n.read && (
                                                <div className="absolute -left-1 top-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                            )}
                                            <div className="flex-1">
                                                <p className={`text-sm leading-snug ${!n.read ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
                                                    {n.title}
                                                </p>
                                                {n.body && <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>}
                                                <p className="text-[10px] text-muted-foreground mt-1">
                                                    {new Date(n.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    );

                                    return (
                                        <div
                                            key={n.id}
                                            onClick={() => handleNotificationClick(n)}
                                            className={`px-4 py-3 transition-colors ${link ? 'cursor-pointer hover:bg-muted/50' : 'cursor-pointer hover:bg-muted/30'} ${!n.read ? "bg-primary/5" : ""}`}
                                        >
                                            {content}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
