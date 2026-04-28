import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
    FileText, Download, Trash2, Loader2, Shield, Search,
    Image, Archive, Film, FileCode2, RefreshCw, Upload, X
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";

type VaultFile = {
    id: string;
    file_name: string;
    file_url: string;
    file_size?: number;
    type: "concept" | "final";
    uploaded_at: string;
    projects: { id: string; title: string; profiles: { full_name: string | null } | null } | null;
};

const TYPE_COLORS = {
    concept: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    final: "bg-green-500/10 text-green-600 border-green-500/20",
};

function getFileIcon(fileName: string) {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext)) return Image;
    if (["mp4", "mov", "avi", "webm"].includes(ext)) return Film;
    if (["zip", "rar", "tar", "gz"].includes(ext)) return Archive;
    if (["html", "css", "js", "ts", "jsx", "tsx", "json"].includes(ext)) return FileCode2;
    return FileText;
}

function formatFileSize(bytes?: number) {
    if (!bytes) return null;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const SkeletonRow = () => (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-border last:border-0">
        <div className="w-9 h-9 rounded-lg bg-muted animate-pulse shrink-0" />
        <div className="flex-1 space-y-2">
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            <div className="h-3 w-28 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
        <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
        <div className="h-8 w-20 bg-muted rounded-lg animate-pulse" />
    </div>
);

const FilesVault = () => {
    const { t } = useI18n();
    const [files, setFiles] = useState<VaultFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<"all" | "concept" | "final">("all");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fetchFiles = useCallback(async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true); else setLoading(true);
        const { data, error } = await supabase
            .from("files")
            .select("*, projects(id, title, profiles!client_id(full_name))")
            .order("uploaded_at", { ascending: false });

        if (error) toast.error(t("common.error"));
        else setFiles(data || []);
        setLoading(false);
        setRefreshing(false);
    }, [t]);

    useEffect(() => { fetchFiles(); }, [fetchFiles]);

    const handleDelete = async (fileId: string) => {
        setDeletingId(fileId);
        const { error } = await supabase.from("files").delete().eq("id", fileId);
        if (error) {
            toast.error(t("dashboard.adminFiles.errorDelete"));
        } else {
            toast.success(t("dashboard.adminFiles.toastDeleted"));
            setFiles(prev => prev.filter(f => f.id !== fileId));
        }
        setDeletingId(null);
    };

    const filtered = files.filter(f => {
        const matchesSearch =
            f.file_name.toLowerCase().includes(search.toLowerCase()) ||
            f.projects?.title?.toLowerCase().includes(search.toLowerCase()) ||
            f.projects?.profiles?.full_name?.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === "all" || f.type === typeFilter;
        return matchesSearch && matchesType;
    });

    return (
        <div>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.adminFiles.title")}</h1>
                        <p className="text-muted-foreground mt-1">{t("dashboard.adminFiles.subtitle")}</p>
                    </div>
                    <button
                        onClick={() => fetchFiles(true)}
                        disabled={refreshing}
                        className="p-2 rounded-lg border border-border hover:bg-muted transition-colors self-end md:self-auto"
                        title="Refresh"
                    >
                        <RefreshCw size={15} className={refreshing ? "animate-spin text-primary" : "text-muted-foreground"} />
                    </button>
                </div>

                {/* Search + filter */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                        <input
                            type="text"
                            placeholder={t("common.search")}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-8 pr-4 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-full"
                        />
                    </div>
                    {/* Type filter pills */}
                    <div className="flex gap-1 bg-muted/50 p-1 rounded-xl border border-border">
                        {(["all", "concept", "final"] as const).map(type => (
                            <button key={type} onClick={() => setTypeFilter(type)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${typeFilter === type ? "bg-card shadow-sm text-foreground border border-border" : "text-muted-foreground hover:text-foreground"}`}>
                                {type === "all" ? "All Files" : type}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                    { label: "Total Files", value: files.length, color: "text-foreground" },
                    { label: "Concepts", value: files.filter(f => f.type === "concept").length, color: "text-purple-600" },
                    { label: "Finals", value: files.filter(f => f.type === "final").length, color: "text-green-600" },
                ].map(stat => (
                    <div key={stat.label} className="bg-card rounded-xl border border-border p-4 text-center">
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
                </div>
            ) : filtered.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-card rounded-2xl border border-border p-16 text-center shadow-sm">
                    <Shield size={40} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t("dashboard.adminFiles.noFiles")}</h3>
                    <p className="text-sm text-muted-foreground">Upload files from a project's detail page.</p>
                </motion.div>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    {/* Table header */}
                    <div className="grid grid-cols-[2fr_1.5fr_1fr_100px_90px_110px] gap-3 px-6 py-3 bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <span>{t("dashboard.adminFiles.fileName")}</span>
                        <span>{t("dashboard.adminFiles.project")}</span>
                        <span>{t("dashboard.adminProjects.client")}</span>
                        <span>{t("dashboard.adminFiles.type")}</span>
                        <span>{t("dashboard.adminFiles.uploaded")}</span>
                        <span className="text-right">{t("dashboard.adminProjects.actions")}</span>
                    </div>

                    <AnimatePresence>
                        {filtered.map((file, i) => {
                            const FileIcon = getFileIcon(file.file_name);
                            const isImg = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(
                                file.file_name.split(".").pop()?.toLowerCase() || ""
                            );

                            return (
                                <motion.div
                                    key={file.id}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: i * 0.025 }}
                                    className="grid grid-cols-[2fr_1.5fr_1fr_100px_90px_110px] gap-3 px-6 py-4 border-b border-border last:border-0 hover:bg-muted/20 transition-colors items-center"
                                >
                                    {/* File name */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-lg bg-muted/50 border border-border flex items-center justify-center shrink-0">
                                            <FileIcon size={16} className="text-muted-foreground" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-sm truncate">{file.file_name}</p>
                                            {file.file_size && (
                                                <p className="text-xs text-muted-foreground">{formatFileSize(file.file_size)}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Project */}
                                    <div className="truncate">
                                        {file.projects ? (
                                            <a
                                                href={`/dashboard/admin/projects/${file.projects.id}`}
                                                className="text-sm text-primary hover:underline font-medium truncate"
                                            >
                                                {file.projects.title}
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">—</span>
                                        )}
                                    </div>

                                    {/* Client */}
                                    <span className="text-sm text-muted-foreground truncate">
                                        {file.projects?.profiles?.full_name || "—"}
                                    </span>

                                    {/* Type badge */}
                                    <div>
                                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${TYPE_COLORS[file.type]}`}>
                                            {file.type}
                                        </span>
                                    </div>

                                    {/* Date */}
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(file.uploaded_at).toLocaleDateString()}
                                    </span>

                                    {/* Actions */}
                                    <div className="flex items-center justify-end gap-2">
                                        {isImg && (
                                            <button
                                                onClick={() => setPreviewUrl(file.file_url)}
                                                className="p-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
                                                title="Preview"
                                            >
                                                <Image size={13} className="text-muted-foreground" />
                                            </button>
                                        )}
                                        <a
                                            href={file.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
                                            title="Download"
                                        >
                                            <Download size={13} className="text-muted-foreground" />
                                        </a>
                                        {deletingId === file.id ? (
                                            <div className="p-1.5">
                                                <Loader2 size={13} className="animate-spin text-destructive" />
                                            </div>
                                        ) : (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <button className="p-1.5 rounded-lg border border-destructive/30 hover:bg-destructive/10 transition-colors" title="Delete">
                                                        <Trash2 size={13} className="text-destructive" />
                                                    </button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete file?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to permanently delete <strong>{file.file_name}</strong>? This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(file.id)}
                                                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Footer */}
                    <div className="px-6 py-3 border-t border-border bg-muted/20">
                        <p className="text-xs text-muted-foreground">
                            Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
                            <span className="font-semibold text-foreground">{files.length}</span> files
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Image Preview Modal */}
            <AnimatePresence>
                {previewUrl && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                        onClick={() => setPreviewUrl(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <img src={previewUrl} alt="Preview" className="max-h-[85vh] max-w-full object-contain" />
                            <button
                                onClick={() => setPreviewUrl(null)}
                                className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FilesVault;
