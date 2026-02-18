import { motion } from "framer-motion";
import {
  FileText,
  Download,
  CheckCircle2,
  Clock,
  Circle,
  FolderOpen,
  Image,
  FileType,
} from "lucide-react";
import Navbar from "@/components/Navbar";

const roadmapSteps = [
  { id: 1, title: "Brief Received", status: "done" },
  { id: 2, title: "Concept Design", status: "done" },
  { id: 3, title: "Revisions", status: "current" },
  { id: 4, title: "Final Delivery", status: "upcoming" },
  { id: 5, title: "Project Complete", status: "upcoming" },
];

const currentStep = 3;
const progress = ((currentStep - 1) / (roadmapSteps.length - 1)) * 100;

const team = [
  { name: "Amira B.", role: "Creative Director", initials: "AB" },
  { name: "Yassine K.", role: "Brand Designer", initials: "YK" },
  { name: "Nour H.", role: "Motion Designer", initials: "NH" },
];

const tasks = {
  todo: [
    { title: "Finalize color palette", tag: "Design" },
    { title: "Create social templates", tag: "Social" },
  ],
  inProgress: [
    { title: "Logo revision v3", tag: "Logo" },
    { title: "Typography selection", tag: "Brand" },
  ],
  done: [
    { title: "Initial mood board", tag: "Research" },
    { title: "Logo concepts (3)", tag: "Logo" },
    { title: "Brand audit", tag: "Research" },
  ],
};

const files = [
  { name: "Logo_Final_v3.ai", type: "vector", size: "2.4 MB" },
  { name: "Brand_Guidelines.pdf", type: "document", size: "8.1 MB" },
  { name: "Social_Templates.zip", type: "archive", size: "15.3 MB" },
  { name: "Color_Palette.png", type: "image", size: "340 KB" },
];

const getFileIcon = (type: string) => {
  switch (type) {
    case "image": return Image;
    case "document": return FileText;
    default: return FileType;
  }
};

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />

      <div className="pt-28 pb-20">
        <div className="container mx-auto px-6">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
              Client Portal
            </span>
            <h1 className="text-3xl font-bold tracking-tight">Your Dashboard</h1>
          </motion.div>

          {/* Roadmap */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border border-border p-7 shadow-soft mb-6"
          >
            <h2 className="text-lg font-semibold mb-5">Project Roadmap</h2>
            <div className="relative h-2 bg-muted rounded-full mb-7">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.4 }}
                className="absolute left-0 top-0 h-full bg-gradient-brand rounded-full"
              />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {roadmapSteps.map((step) => (
                <div key={step.id} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    {step.status === "done" ? (
                      <CheckCircle2 size={22} className="text-primary" />
                    ) : step.status === "current" ? (
                      <div className="relative">
                        <Clock size={22} className="text-primary" />
                        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
                      </div>
                    ) : (
                      <Circle size={22} className="text-border" />
                    )}
                  </div>
                  <p className={`text-xs font-medium ${step.status === "upcoming" ? "text-muted-foreground/50" : "text-foreground"}`}>
                    {step.title}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Task Board */}
            <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
              <h2 className="text-lg font-semibold mb-4">Task Board</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {/* To Do */}
                <div className="bg-card rounded-xl border border-border p-4 shadow-soft">
                  <div className="flex items-center gap-2 mb-4">
                    <Circle size={14} className="text-muted-foreground" />
                    <span className="text-sm font-medium">To Do</span>
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded ml-auto">{tasks.todo.length}</span>
                  </div>
                  <div className="space-y-2.5">
                    {tasks.todo.map((task) => (
                      <div key={task.title} className="bg-muted/60 rounded-lg p-3">
                        <p className="text-sm mb-1.5">{task.title}</p>
                        <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium">{task.tag}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* In Progress */}
                <div className="bg-card rounded-xl border border-border p-4 shadow-soft">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock size={14} className="text-primary" />
                    <span className="text-sm font-medium">In Progress</span>
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded ml-auto">{tasks.inProgress.length}</span>
                  </div>
                  <div className="space-y-2.5">
                    {tasks.inProgress.map((task) => (
                      <div key={task.title} className="bg-muted/60 rounded-lg p-3 border-l-2 border-primary">
                        <p className="text-sm mb-1.5">{task.title}</p>
                        <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium">{task.tag}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Done */}
                <div className="bg-card rounded-xl border border-border p-4 shadow-soft">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 size={14} className="text-primary" />
                    <span className="text-sm font-medium">Completed</span>
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded ml-auto">{tasks.done.length}</span>
                  </div>
                  <div className="space-y-2.5">
                    {tasks.done.map((task) => (
                      <div key={task.title} className="bg-muted/60 rounded-lg p-3 opacity-60">
                        <p className="text-sm mb-1.5 line-through">{task.title}</p>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{task.tag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Sidebar: Team + Files */}
            <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h2 className="text-lg font-semibold mb-4">Your Team</h2>
              <div className="bg-card rounded-xl border border-border p-5 shadow-soft space-y-3.5">
                {team.map((member) => (
                  <div key={member.name} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-primary-foreground">{member.initials}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h2 className="text-lg font-semibold mb-4 mt-7 flex items-center gap-2">
                <FolderOpen size={18} className="text-primary" />
                File Vault
              </h2>
              <div className="bg-card rounded-xl border border-border p-5 shadow-soft space-y-2">
                {files.map((file) => {
                  const Icon = getFileIcon(file.type);
                  return (
                    <div
                      key={file.name}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/60 transition-colors group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-brand-subtle flex items-center justify-center shrink-0">
                        <Icon size={16} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.size}</p>
                      </div>
                      <Download size={15} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    </div>
                  );
                })}
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
