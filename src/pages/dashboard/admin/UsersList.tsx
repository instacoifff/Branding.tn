import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Users, Loader2, Search, Trash2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";

type Profile = {
    id: string;
    full_name: string | null;
    company: string | null;
    role: "client" | "admin" | "creative";
    avatar_url: string | null;
    created_at: string;
};

const roleColors = {
    client: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    admin: "bg-red-500/10 text-red-600 border-red-500/20",
    creative: "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

const UsersList = () => {
    const { t } = useI18n();
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchUsers = async () => {
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching users:", error);
            toast.error(t("common.error"));
        } else {
            setUsers(data || []);
        }
        setLoading(false);
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleRoleChange = async (userId: string, newRole: string) => {
        setUpdatingId(userId);
        const { error } = await supabase
            .from("profiles")
            .update({ role: newRole })
            .eq("id", userId);

        if (error) {
            toast.error("Failed to update user role");
        } else {
            toast.success(`Role updated to ${newRole}`);
            setUsers((prev) =>
                prev.map((u) => (u.id === userId ? { ...u, role: newRole as Profile["role"] } : u))
            );
        }
        setUpdatingId(null);
    };

    const handleDeleteUser = async (userId: string) => {
        setDeletingId(userId);
        // Note: This only deletes the profile. Auth deletion requires Admin SDK or a specific edge function.
        // For now we delete the profile record.
        const { error } = await supabase.from("profiles").delete().eq("id", userId);
        
        if (error) {
            toast.error("Could not delete user profile");
        } else {
            toast.success("User profile removed");
            setUsers(prev => prev.filter(u => u.id !== userId));
        }
        setDeletingId(null);
    };

    const filtered = users.filter(
        (u) =>
            u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            u.company?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div>
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
            >
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.adminUsers.title")}</h1>
                    <p className="text-muted-foreground mt-1">{t("dashboard.adminUsers.subtitle")}</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                        type="text"
                        placeholder="Search by name or company…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-full md:w-80 shadow-sm"
                    />
                </div>
            </motion.div>

            {filtered.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-16 text-center shadow-sm">
                    <Users size={40} className="mx-auto text-muted-foreground mb-4 opacity-20" />
                    <h3 className="text-lg font-semibold mb-2">{t("dashboard.adminUsers.noUsers")}</h3>
                    <p className="text-sm text-muted-foreground">Try adjusting your search criteria.</p>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-muted/30 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Company</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Joined</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                <AnimatePresence>
                                    {filtered.map((user) => (
                                        <motion.tr 
                                            key={user.id} 
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className="hover:bg-muted/10 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                                        {user.avatar_url ? (
                                                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="font-bold text-primary text-xs">{user.full_name?.[0]?.toUpperCase() || "?"}</span>
                                                        )}
                                                    </div>
                                                    <span className="font-bold text-foreground truncate max-w-[150px]">{user.full_name || "—"}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground font-medium">{user.company || "—"}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${roleColors[user.role] || roleColors.client}`}>
                                                        {user.role}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground text-xs font-medium">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-3">
                                                    {updatingId === user.id ? (
                                                        <Loader2 size={16} className="animate-spin text-primary" />
                                                    ) : (
                                                        <select
                                                            value={user.role}
                                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                            className="px-2 py-1.5 border border-border rounded-lg bg-muted/30 text-[10px] font-bold uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:bg-muted/50 transition-all"
                                                        >
                                                            <option value="client">Client</option>
                                                            <option value="admin">Admin</option>
                                                            <option value="creative">Creative</option>
                                                        </select>
                                                    )}
                                                    
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <button className="p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-all opacity-0 group-hover:opacity-100">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                                                                    <ShieldAlert size={20} /> Remove User?
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to remove <strong>{user.full_name}</strong>? This will delete their profile information.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-destructive hover:bg-destructive/90">
                                                                    {deletingId === user.id ? <Loader2 size={14} className="animate-spin" /> : "Delete Profile"}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 border-t border-border bg-muted/20 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        {filtered.length} total users found
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default UsersList;
