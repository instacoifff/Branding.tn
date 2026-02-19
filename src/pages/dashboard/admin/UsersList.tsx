import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Users, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n";

type Profile = {
    id: string;
    full_name: string | null;
    company: string | null;
    role: "client" | "admin" | "creative";
    avatar_url: string | null;
    created_at: string;
};

const roleColors = {
    client: "bg-blue-500/10 text-blue-600",
    admin: "bg-red-500/10 text-red-600",
    creative: "bg-purple-500/10 text-purple-600",
};

const UsersList = () => {
    const { t } = useI18n();
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

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
            toast.error(t("dashboard.adminUsers.errorRoleUpdate"));
        } else {
            toast.success(t("dashboard.adminUsers.toastRoleUpdated"));
            setUsers((prev) =>
                prev.map((u) => (u.id === userId ? { ...u, role: newRole as Profile["role"] } : u))
            );
        }
        setUpdatingId(null);
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
                        placeholder={t("dashboard.adminUsers.search")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-full md:w-72"
                    />
                </div>
            </motion.div>

            {filtered.length === 0 ? (
                <div className="bg-card rounded-xl border border-border p-12 text-center">
                    <Users size={40} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t("dashboard.adminUsers.noUsers")}</h3>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
                >
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                            <tr>
                                <th className="px-6 py-4">{t("dashboard.adminUsers.user")}</th>
                                <th className="px-6 py-4">{t("dashboard.adminUsers.company")}</th>
                                <th className="px-6 py-4">{t("dashboard.adminUsers.role")}</th>
                                <th className="px-6 py-4">{t("dashboard.adminUsers.joined")}</th>
                                <th className="px-6 py-4 text-right">{t("dashboard.adminUsers.changeRole")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtered.map((user) => (
                                <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt={user.full_name || ""} className="w-8 h-8 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                                                    {user.full_name?.[0]?.toUpperCase() || "?"}
                                                </div>
                                            )}
                                            <span className="font-medium">{user.full_name || "—"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{user.company || "—"}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${roleColors[user.role] || roleColors.client}`}>
                                            {t(`dashboard.adminUsers.roles.${user.role}`) || user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {updatingId === user.id ? (
                                            <Loader2 size={16} className="animate-spin ml-auto text-primary" />
                                        ) : (
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className="px-2 py-1 border border-border rounded-lg bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            >
                                                <option value="client">{t("dashboard.adminUsers.roles.client")}</option>
                                                <option value="admin">{t("dashboard.adminUsers.roles.admin")}</option>
                                                <option value="creative">{t("dashboard.adminUsers.roles.creative")}</option>
                                            </select>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="px-6 py-3 border-t border-border text-xs text-muted-foreground">
                        {filtered.length} {filtered.length !== 1 ? t("dashboard.adminUsers.countUsers") : t("dashboard.adminUsers.countUser")}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default UsersList;
