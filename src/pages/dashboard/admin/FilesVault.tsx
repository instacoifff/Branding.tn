import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { FileText, Download, Trash2, Loader2, Shield, Search } from "lucide-react";
import { toast } from "sonner";

type VaultFile = {
    id: string;
    file_name: string;
    file_url: string;
    type: "concept" | "final";
    uploaded_at: string;
    projects: { title: string; profiles: { full_name: string | null } | null } | null;
};

const typeConfig = {
    concept: { label: "Concept", color: "bg-purple-500/10 text-purple-600" },
    final: { label: "Final", color: "bg-green-500/10 text-green-600" },
};

const FilesVault = () => {
    const [files, setFiles] = useState<VaultFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchFiles = async () => {
        const { data, error } = await supabase
            .from("files")
            .select("*, projects(title, profiles(full_name))")
            .order("uploaded_at", { ascending: false });

        if (error) {
            console.error("Error fetching files:", error);
            toast.error("Failed to load files.");
        } else {
            setFiles(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const handleDelete = async (fileId: string) => {
        if (!confirm("Are you sure you want to delete this file?")) return;
        setDeletingId(fileId);
        const { error } = await supabase.from("files").delete().eq("id", fileId);
        if (error) {
            toast.error("Failed to delete file: " + error.message);
        } else {
            toast.success("File deleted.");
            setFiles((prev) => prev.filter((f) => f.id !== fileId));
        }
        setDeletingId(null);
    };

    const filtered = files.filter(
        (f) =>
            f.file_name.toLowerCase().includes(search.toLowerCase()) ||
            f.projects?.title?.toLowerCase().includes(search.toLowerCase()) ||
            f.projects?.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
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
                    <h1 className="text-3xl font-bold tracking-tight">Files Vault</h1>
                    <p className="text-muted-foreground mt-1">
                        All files across every client project.
                    </p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                        type="text"
                        placeholder="Search files, projects, clients..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-full md:w-72"
                    />
                </div>
            </motion.div>

            {filtered.length === 0 ? (
                <div className="bg-card rounded-xl border border-border p-12 text-center">
                    <Shield size={40} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Files Found</h3>
                    <p className="text-muted-foreground text-sm">
                        {search ? "Try a different search term." : "No files have been uploaded yet."}
                    </p>
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
                                <th className="px-6 py-4">File Name</th>
                                <th className="px-6 py-4">Project</th>
                                <th className="px-6 py-4">Client</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Uploaded</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtered.map((file) => {
                                const type = typeConfig[file.type] ?? typeConfig.concept;
                                return (
                                    <tr key={file.id} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2.5">
                                                <FileText size={16} className="text-muted-foreground shrink-0" />
                                                <span className="font-medium">{file.file_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {file.projects?.title || "—"}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {file.projects?.profiles?.full_name || "—"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${type.color}`}>
                                                {type.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {new Date(file.uploaded_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <a
                                                    href={file.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                                                >
                                                    <Download size={14} />
                                                    Download
                                                </a>
                                                {deletingId === file.id ? (
                                                    <Loader2 size={14} className="animate-spin text-destructive" />
                                                ) : (
                                                    <button
                                                        onClick={() => handleDelete(file.id)}
                                                        className="inline-flex items-center gap-1 text-destructive hover:underline font-medium"
                                                    >
                                                        <Trash2 size={14} />
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div className="px-6 py-3 border-t border-border text-xs text-muted-foreground">
                        {filtered.length} file{filtered.length !== 1 ? "s" : ""} found
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default FilesVault;
