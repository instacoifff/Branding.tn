import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  FileText, 
  User, 
  Calendar,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DeliverableReviewOverlay from "@/components/dashboard/DeliverableReviewOverlay";

type Project = {
  id: string;
  title: string;
  status: "onboarding" | "active" | "completed";
  current_stage: number;
  total_price: number;
  client_id: string;
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
};

const STAGE_LABELS = ["Brief", "Concepts", "Refinement", "Finalisation", "Delivery"];

export default function AdminProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "deliverables" | "team">("overview");

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from("projects")
        .select("*, profiles!client_id(full_name, email, avatar_url)")
        .eq("id", id)
        .single();

      if (!error && data) {
        setProject(data as Project);
      }
      setLoading(false);
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4 opacity-20" />
        <h2 className="text-xl font-bold">Project not found</h2>
        <Link to="/dashboard/admin/projects" className="text-primary hover:underline mt-4 inline-block">
          Back to all projects
        </Link>
      </div>
    );
  }

  const progressPct = (project.current_stage / 5) * 100;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-8">
        <Link to="/dashboard/admin/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Projects
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                project.status === 'completed' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                project.status === 'active' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                'bg-orange-500/10 text-orange-600 border-orange-500/20'
              }`}>
                {project.status}
              </span>
              <span className="text-muted-foreground text-xs flex items-center gap-1">
                <Calendar size={12} />
                Started {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{project.title}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* <DeliverableReviewOverlay projectId={project.id} /> */}
            <Link to="/dashboard/admin/inbox">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all shadow-brand">
                <MessageSquare size={16} />
                Open Chat
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Project Status & Client */}
        <div className="lg:col-span-2 space-y-8">
          {/* Progress Card */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold flex items-center gap-2">
                <TrendingUp size={18} className="text-primary" />
                Project Progress
              </h3>
              <span className="text-sm font-bold text-primary">{progressPct}%</span>
            </div>
            
            <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-8">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                className="absolute top-0 left-0 h-full bg-primary rounded-full"
              />
            </div>
            
            <div className="grid grid-cols-5 gap-2">
              {STAGE_LABELS.map((label, i) => {
                const stepNum = i + 1;
                const isComplete = stepNum < project.current_stage;
                const isActive = stepNum === project.current_stage;
                
                return (
                  <div key={label} className="text-center space-y-2">
                    <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center border-2 transition-all ${
                      isComplete ? "bg-primary border-primary text-primary-foreground" :
                      isActive ? "bg-primary/10 border-primary text-primary animate-pulse" :
                      "bg-muted border-border text-muted-foreground"
                    }`}>
                      {isComplete ? <CheckCircle2 size={16} /> : <span className="text-xs font-bold">{stepNum}</span>}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-tight block truncate px-1 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details Tabs */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="flex border-b border-border bg-muted/30">
              {[
                { id: "overview", label: "Overview", icon: FileText },
                { id: "deliverables", label: "Files", icon: FileText },
                { id: "team", label: "Creative Team", icon: User },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all relative ${
                    activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="p-8 min-h-[300px]">
              <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Financials</h4>
                        <div className="p-4 rounded-xl bg-muted/50 border border-border">
                          <p className="text-xs text-muted-foreground mb-1">Total Project Value</p>
                          <p className="text-2xl font-bold">{project.total_price.toLocaleString()} TND</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Timeline</h4>
                        <div className="p-4 rounded-xl bg-muted/50 border border-border flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Clock size={20} />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Est. Completion</p>
                            <p className="text-sm font-bold">14 Days Remaining</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {activeTab === "deliverables" && (
                  <motion.div
                    key="deliverables"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <FileText className="text-muted-foreground opacity-20" size={32} />
                    </div>
                    <h4 className="font-bold">Deliverables management coming soon</h4>
                    <p className="text-sm text-muted-foreground max-w-xs mt-2">
                      Upload and manage concepts directly from this tab. Use the "Project Action" button to upload now.
                    </p>
                  </motion.div>
                )}

                {activeTab === "team" && (
                  <motion.div
                    key="team"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <p className="text-sm text-muted-foreground">Designers and creatives assigned to this project.</p>
                    <div className="p-4 rounded-xl border border-dashed border-border flex items-center justify-center text-sm text-muted-foreground">
                      No creatives assigned yet
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Column: Client & Actions */}
        <div className="space-y-8">
          {/* Client Card */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <User size={18} className="text-primary" />
              Client Information
            </h3>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                {project.profiles?.avatar_url ? (
                  <img src={project.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-primary">{project.profiles?.full_name?.charAt(0)}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-bold truncate">{project.profiles?.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{project.profiles?.email}</p>
              </div>
            </div>
            
            <button className="w-full py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-2">
              View Client Profile
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
            <h3 className="font-bold mb-2">Quick Actions</h3>
            <button className="w-full py-3 rounded-xl bg-muted font-bold text-sm hover:bg-muted/80 transition-colors">
              Update Project Status
            </button>
            <button className="w-full py-3 rounded-xl bg-muted font-bold text-sm hover:bg-muted/80 transition-colors">
              Assign Creative
            </button>
            <button className="w-full py-3 rounded-xl border border-destructive/20 text-destructive font-bold text-sm hover:bg-destructive/5 transition-colors">
              Archive Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
