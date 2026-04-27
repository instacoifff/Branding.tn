import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, FolderOpen, PlayCircle, ArrowRight, Plus, Sparkles, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { useI18n } from "@/i18n";

type Project = {
  id: string;
  title: string;
  status: "onboarding" | "active" | "completed";
  current_stage: number;
  total_price: number;
  deposit_paid: boolean;
  created_at: string;
  updated_at: string;
};

const STATUS_CFG = {
  onboarding: { icon: Clock, cls: "bg-orange-500/10 text-orange-400 border-orange-500/20", label: "Onboarding" },
  active: { icon: PlayCircle, cls: "bg-[#1B70FF]/10 text-[#6ba5ff] border-[#1B70FF]/20", label: "Active" },
  completed: { icon: CheckCircle2, cls: "bg-green-500/10 text-green-400 border-green-500/20", label: "Completed" },
};

const STAGE_LABELS = ["Brief", "Concepts", "Refinement", "Finalisation", "Delivery"];

const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

const SkeletonCard = () => (
  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 animate-pulse">
    <div className="flex justify-between mb-5">
      <div className="space-y-2">
        <div className="h-3 w-16 bg-white/10 rounded-full" />
        <div className="h-5 w-48 bg-white/10 rounded" />
      </div>
      <div className="h-8 w-20 bg-white/10 rounded-lg" />
    </div>
    <div className="h-1.5 bg-white/10 rounded-full" />
  </div>
);

const Overview = () => {
  const { user, profile } = useAuth();
  const { t } = useI18n();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("client_id", user.id)
        .order("updated_at", { ascending: false });
      setProjects(data || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const activeCount = projects.filter(p => p.status === "active").length;
  const completedCount = projects.filter(p => p.status === "completed").length;

  return (
    <div className="max-w-5xl mx-auto">
      {/* ── Hero greeting ── */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-10">
        <div className="badge-pill mb-4">
          <Sparkles size={12} className="text-blue-400" />
          Client Dashboard
        </div>
        <h1 className="text-4xl font-semibold text-white tracking-tight mb-2">
          {t("dashboard.welcome")},&nbsp;
          <span className="headline-gradient">
            {profile?.full_name?.split(" ")[0] || "there"}
          </span> 👋
        </h1>
        <p className="text-white/40 text-base">
          Here's a real-time view of your active projects with branding.tn.
        </p>
      </motion.div>

      {/* ── KPI cards ── */}
      {!loading && (
        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
          initial="hidden" animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10"
        >
          {[
            { label: "Total Projects", value: projects.length, icon: FolderOpen, color: "text-white" },
            { label: "Active", value: activeCount, icon: TrendingUp, color: "text-[#6ba5ff]" },
            { label: "Completed", value: completedCount, icon: CheckCircle2, color: "text-green-400" },
          ].map(stat => (
            <motion.div key={stat.label} variants={fadeUp}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center gap-2.5 mb-2">
                <stat.icon size={14} className={stat.color} />
                <p className="text-xs font-medium text-white/40">{stat.label}</p>
              </div>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ── Project list ── */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <motion.div variants={fadeUp} initial="hidden" animate="show"
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-5">
            <FolderOpen size={24} className="text-white/20" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{t("dashboard.noProjects")}</h3>
          <p className="text-white/35 text-sm mb-7">{t("dashboard.projectsPage.noProjectsDesc")}</p>
          <Link to="/builder">
            <button className="btn-blue inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold">
              <Plus size={14} /> {t("dashboard.startProject")}
            </button>
          </Link>
        </motion.div>
      ) : (
        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          initial="hidden" animate="show"
          className="space-y-4"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-white/30 uppercase tracking-widest">Your Projects</p>
            <Link to="/dashboard/projects" className="text-xs text-[#6ba5ff] hover:underline flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {projects.map(project => {
            const cfg = STATUS_CFG[project.status];
            const StatusIcon = cfg.icon;
            const pct = Math.round((project.current_stage / 5) * 100);
            return (
              <motion.div key={project.id} variants={fadeUp}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all p-6 group">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#1B70FF]/10 border border-[#1B70FF]/20 flex items-center justify-center shrink-0">
                      <span className="text-[#6ba5ff] font-bold text-sm">
                        {project.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border mb-1.5 ${cfg.cls}`}>
                        <StatusIcon size={10} />{cfg.label}
                      </span>
                      <h3 className="text-base font-semibold text-white">{project.title}</h3>
                      <p className="text-xs text-white/30 flex items-center gap-1 mt-0.5">
                        <Clock size={11} /> {new Date(project.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Link to={`/dashboard/projects/${project.id}`}>
                    <button className="flex items-center gap-1.5 text-xs font-medium text-white/30 hover:text-white border border-white/10 hover:border-white/25 px-3 py-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                      View <ArrowRight size={11} />
                    </button>
                  </Link>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-[11px] text-white/25 mb-2">
                    <span>Stage {project.current_stage}/5 · {STAGE_LABELS[project.current_stage - 1]}</span>
                    <span className="font-semibold text-white/50">{pct}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                      className="h-full bg-[#1B70FF] rounded-full"
                    />
                  </div>
                  <div className="flex justify-between mt-3">
                    {STAGE_LABELS.map((label, idx) => (
                      <div key={label} className="flex flex-col items-center gap-1">
                        <div className={`w-2 h-2 rounded-full transition-all ${idx < project.current_stage ? "bg-[#1B70FF]" : "bg-white/10"}`} />
                        <span className={`text-[9px] hidden sm:block ${idx < project.current_stage ? "text-[#6ba5ff]" : "text-white/20"}`}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default Overview;
