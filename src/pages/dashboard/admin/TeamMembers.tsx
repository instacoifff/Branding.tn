import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Users, Plus, Edit2, Trash2, Loader2, X, Save } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n";

type TeamMember = {
    id: string;
    name: string;
    role: string;
    bio: string | null;
    photo_url: string | null;
    created_at: string;
};

const emptyForm = { name: "", role: "", bio: "", photo_url: "" };

const TeamMembers = () => {
    const { t } = useI18n();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<TeamMember | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchMembers = async () => {
        const { data, error } = await supabase
            .from("team_members")
            .select("*")
            .order("created_at", { ascending: true });
        if (error) toast.error(t("common.error"));
        else setMembers(data ?? []);
        setLoading(false);
    };

    useEffect(() => { fetchMembers(); }, []);

    const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
    const openEdit = (m: TeamMember) => {
        setEditing(m);
        setForm({ name: m.name, role: m.role, bio: m.bio ?? "", photo_url: m.photo_url ?? "" });
        setModalOpen(true);
    };
    const closeModal = () => { setModalOpen(false); setEditing(null); };

    const handleSave = async () => {
        if (!form.name.trim() || !form.role.trim()) {
            toast.error("Name and role are required.");
            return;
        }
        setSaving(true);
        const payload = { name: form.name.trim(), role: form.role.trim(), bio: form.bio || null, photo_url: form.photo_url || null };
        const { error } = editing
            ? await supabase.from("team_members").update(payload).eq("id", editing.id)
            : await supabase.from("team_members").insert(payload);

        if (error) {
            toast.error(t("common.error"));
        } else {
            toast.success(editing ? "Team member updated." : "Team member added.");
            closeModal();
            fetchMembers();
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this team member?")) return;
        setDeletingId(id);
        const { error } = await supabase.from("team_members").delete().eq("id", id);
        if (error) toast.error(t("common.error"));
        else {
            toast.success("Deleted.");
            setMembers((prev) => prev.filter((m) => m.id !== id));
        }
        setDeletingId(null);
    };

    const inputClass = "w-full bg-muted/60 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/60 transition-all";

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
                    <p className="text-muted-foreground mt-1">Manage your creative team</p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 bg-gradient-brand text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-brand"
                >
                    <Plus size={16} /> Add Member
                </button>
            </motion.div>

            {members.length === 0 ? (
                <div className="bg-card rounded-xl border border-border p-12 text-center">
                    <Users size={40} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No team members yet</h3>
                    <p className="text-muted-foreground text-sm">Add your first team member to assign them to projects.</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {members.map((m, i) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                {m.photo_url ? (
                                    <img src={m.photo_url} alt={m.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gradient-brand flex items-center justify-center shrink-0 shadow-brand">
                                        <span className="text-base font-bold text-primary-foreground">{m.name[0]?.toUpperCase()}</span>
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="font-semibold truncate">{m.name}</p>
                                    <p className="text-xs text-primary font-medium capitalize">{m.role}</p>
                                </div>
                            </div>
                            {m.bio && <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">{m.bio}</p>}
                            <div className="flex gap-2 mt-auto">
                                <button onClick={() => openEdit(m)} className="flex items-center gap-1.5 text-xs font-medium border border-border px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
                                    <Edit2 size={12} /> Edit
                                </button>
                                {deletingId === m.id ? (
                                    <Loader2 size={14} className="animate-spin text-destructive ml-2 self-center" />
                                ) : (
                                    <button onClick={() => handleDelete(m.id)} className="flex items-center gap-1.5 text-xs font-medium text-destructive border border-destructive/20 px-3 py-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                                        <Trash2 size={12} /> Delete
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {modalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 10 }}
                            className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                                <h2 className="font-semibold text-base">{editing ? "Edit Team Member" : "Add Team Member"}</h2>
                                <button onClick={closeModal} className="text-muted-foreground hover:text-foreground transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name *</label>
                                    <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Meriem Ben Ali" className={inputClass} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role *</label>
                                    <input value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} placeholder="e.g. Senior Designer" className={inputClass} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bio</label>
                                    <textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} placeholder="Short intro..." rows={3} className={inputClass + " resize-none"} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Photo URL</label>
                                    <input value={form.photo_url} onChange={(e) => setForm((f) => ({ ...f, photo_url: e.target.value }))} placeholder="https://..." className={inputClass} />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button onClick={closeModal} className="flex-1 border border-border text-foreground py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                                        Cancel
                                    </button>
                                    <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-gradient-brand text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-brand disabled:opacity-50">
                                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                        {saving ? "Saving..." : "Save"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TeamMembers;
