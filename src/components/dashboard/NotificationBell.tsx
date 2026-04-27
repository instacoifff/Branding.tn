import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Bell } from "lucide-react";

type Notification = {
    id: string;
    title: string;
    body: string | null;
    read: boolean;
    created_at: string;
};

const NotificationBell = () => {
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

    const handleOpen = () => {
        setOpen((v) => !v);
        if (!open && unread > 0) markAllRead();
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
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
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
                            {unread === 0 && notifications.length > 0 && (
                                <span className="text-xs text-muted-foreground">All read</span>
                            )}
                        </div>

                        <div className="max-h-72 overflow-y-auto divide-y divide-border">
                            {notifications.length === 0 ? (
                                <div className="p-6 text-center text-sm text-muted-foreground">
                                    <Bell size={24} className="mx-auto mb-2 opacity-40" />
                                    No notifications yet
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div key={n.id} className={`px-4 py-3 ${!n.read ? "bg-primary/5" : ""}`}>
                                        <p className="text-sm font-medium leading-snug">{n.title}</p>
                                        {n.body && <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>}
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            {new Date(n.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
