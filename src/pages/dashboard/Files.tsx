import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
    FileText, Download, FolderOpen, Image, Archive, Film, FileCode2,
    Search, X
} from "lucide-react";
import { useI18n } from "@/i18n";

type FileRow = {
    id: string;
    file_name: string;
    file_url: string;
    file_size?: number;
    type: "concept" | "final";
    uploaded_at: string;
    projects: { title: string; id: string } | null;
};

function getFileIcon(name: string) {
    const ext = name.split(".").pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext)) return { Icon: Image, color: "text-blue-400 bg-blue-500/10" };
    if (["mp4", "mov", "avi", "webm"].includes(ext)) return { Icon: Film, color: "text-purple-400 bg-purple-500/10" };
    if (["zip", "rar", "tar", "gz"].includes(ext)) return { Icon: Archive, color: "text-orange-400 bg-orange-500/10" };
    if (["html", "css", "js", "ts", "jsx", "tsx", "json"].includes(ext)) return { Icon: FileCode2, color: "text-green-400 bg-green-500/10" };
    return { Icon: FileText, color: "text-white/50 bg-white/[0.06]" };
}

function formatFileSize(bytes?: number) {
    if (!bytes) return null;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const SkeletonRow = () => (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-white/[0.04] animate-pulse">
        <div className="w-9 h-9 rounded-xl bg-white/[0.06] shrink-0" />
        <div className="flex-1 space-y-2">
            <div className="h-3.5 w-44 bg-white/[0.06] rounded" />
            <div className="h-2.5 w-24 bg-white/[0.04] rounded" />
        </div>
        <div className="h-5 w-14 bg-white/[0.06] rounded-full" />
        <div className="h-5 w-12 bg-white/[0.04] rounded-full" />
        <div className="h-8 w-8 bg-white/[0.06] rounded-lg" />
    </div>
);

const Files = () => {
    const { user } = useAuth();
    const { t } = useI18n();
    const [files, setFiles] = useState<FileRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<"all" | "concept" | "final">("all");

    useEffect(() => {
        const fetchFiles = async () => {
            if (!user) return;
            const { data } = await supabase
                .from("files")
                .select("*, projects!inner(id, title, client_id)")
                .eq("projects.client_id", user.id)
                .order("uploaded_at", { ascending: false });
            setFiles(data || []);
            setLoading(false);
        };
        fetchFiles();
    }, [user]);

    const filtered = files.filter(f => {
        const q = search.toLowerCase();
        const matchSearch = f.file_name.toLowerCase().includes(q) || (f.projects?.title || "").toLowerCase().includes(q);
        const matchType = typeFilter === "all" || f.type === typeFilter;
        return matchSearch && matchType;
    });

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-3xl font-semibold text-white tracking-tight mb-1">
                    {t("dashboard.filesPage.title")}
                </h1>
                <p className="text-white/35">{t("dashboard.filesPage.subtitle")}</p>
            </motion.div>

            {/* Controls */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="flex flex-col sm:flex-row gap-3 mb-6">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                    <input
                        type="text"
                        placeholder="Search files or projects…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#1B70FF]/30 focus:border-[#1B70FF]/40 transition-all"
                    />
                    {search && (
                        <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white transition-colors">
                            <X size={13} />
                        </button>
                    )}
                </div>

                {/* Type filter */}
                <div className="flex gap-1 bg-white/[0.04] border border-white/[0.08] rounded-xl p-1">
                    {(["all", "concept", "final"] as const).map(type => (
                        <button key={type} onClick={() => setTypeFilter(type)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${typeFilter === type
                                    ? type === "concept" ? "bg-purple-500/15 text-purple-400 border border-purple-500/25"
                                        : type === "final" ? "bg-green-500/15 text-green-400 border border-green-500/25"
                                            : "bg-white/10 text-white border border-white/15"
                                    : "text-white/30 hover:text-white/60"
                                }`}>
                            {type === "all" ? `All (${files.length})` : type}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Stats row */}
            {!loading && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                        { label: "Total", value: files.length, color: "text-white" },
                        { label: "Concepts", value: files.filter(f => f.type === "concept").length, color: "text-purple-400" },
                        { label: "Finals", value: files.filter(f => f.type === "final").length, color: "text-green-400" },
                    ].map(stat => (
                        <div key={stat.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
                            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                            <p className="text-xs text-white/30 mt-0.5">{stat.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                    {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
                </div>
            ) : filtered.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-16 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-5">
                        <FolderOpen size={22} className="text-white/20" />
                    </div>
                    <h3 className="text-base font-semibold text-white mb-1">
                        {search ? "No matching files" : t("dashboard.filesPage.noFiles")}
                    </h3>
                    <p className="text-sm text-white/30">
                        {search ? "Try a different search term." : t("dashboard.filesPage.noFilesDesc")}
                    </p>
                </motion.div>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                    {/* Table header */}
                    <div className="grid grid-cols-[2fr_1.5fr_90px_90px_48px] gap-3 px-5 py-3 bg-white/[0.02] border-b border-white/[0.06] text-[10px] font-semibold text-white/25 uppercase tracking-widest">
                        <span>{t("dashboard.filesPage.fileName")}</span>
                        <span>{t("dashboard.filesPage.project")}</span>
                        <span>{t("dashboard.filesPage.type")}</span>
                        <span>{t("dashboard.filesPage.uploaded")}</span>
                        <span />
                    </div>

                    <AnimatePresence>
                        {filtered.map((file, i) => {
                            const { Icon, color } = getFileIcon(file.file_name);
                            const typeBadge = file.type === "final"
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-purple-500/10 text-purple-400 border-purple-500/20";

                            return (
                                <motion.div key={file.id}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ delay: i * 0.025 }}
                                    className="grid grid-cols-[2fr_1.5fr_90px_90px_48px] gap-3 px-5 py-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors items-center group">
                                    {/* File */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                                            <Icon size={15} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{file.file_name}</p>
                                            {file.file_size && (
                                                <p className="text-xs text-white/25">{formatFileSize(file.file_size)}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Project */}
                                    <span className="text-sm text-white/40 truncate">{file.projects?.title || "—"}</span>

                                    {/* Type */}
                                    <div>
                                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border capitalize ${typeBadge}`}>
                                            {file.type}
                                        </span>
                                    </div>

                                    {/* Date */}
                                    <span className="text-xs text-white/25">{new Date(file.uploaded_at).toLocaleDateString()}</span>

                                    {/* Download */}
                                    <a href={file.file_url} target="_blank" rel="noopener noreferrer"
                                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/[0.08] hover:bg-[#1B70FF]/15 hover:border-[#1B70FF]/30 text-white/30 hover:text-[#6ba5ff] transition-all"
                                        title="Download">
                                        <Download size={13} />
                                    </a>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    <div className="px-5 py-3 border-t border-white/[0.04] bg-white/[0.01]">
                        <p className="text-xs text-white/20">
                            Showing <span className="text-white/50 font-semibold">{filtered.length}</span> of{" "}
                            <span className="text-white/50 font-semibold">{files.length}</span> files
                        </p>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Files;
