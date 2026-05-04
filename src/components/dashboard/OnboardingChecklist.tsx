import { motion } from "framer-motion";
import { CheckCircle2, Circle, FileText, CreditCard, Palette, Phone, Sparkles, PartyPopper } from "lucide-react";
import { useState, useEffect } from "react";

type OnboardingProject = {
  id: string;
  title: string;
  deposit_paid: boolean;
  brief_submitted: boolean;
  brand_guidelines_uploaded: boolean;
  kickoff_scheduled: boolean;
};

type OnboardingChecklistProps = {
  project: OnboardingProject;
  onAction?: (action: string, projectId: string) => void;
};

const CHECKLIST_ITEMS = [
  {
    key: "brief_submitted" as const,
    label: "Submit Project Brief",
    description: "Share your creative vision and goals",
    icon: FileText,
    actionLabel: "Complete Brief",
    actionRoute: "/brief",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    key: "deposit_paid" as const,
    label: "Pay 30% Deposit",
    description: "Activate your project and start the creative process",
    icon: CreditCard,
    actionLabel: "Pay Now",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    key: "brand_guidelines_uploaded" as const,
    label: "Upload Brand Guidelines",
    description: "Logos, color codes, fonts, and brand assets",
    icon: Palette,
    actionLabel: "Upload Files",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    key: "kickoff_scheduled" as const,
    label: "Schedule Kickoff Call",
    description: "Meet your creative team and align on the vision",
    icon: Phone,
    actionLabel: "Schedule",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
];

const OnboardingChecklist = ({ project, onAction }: OnboardingChecklistProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  const completedCount = CHECKLIST_ITEMS.filter(
    (item) => project[item.key]
  ).length;
  const totalCount = CHECKLIST_ITEMS.length;
  const progressPct = Math.round((completedCount / totalCount) * 100);
  const isAllComplete = completedCount === totalCount;

  useEffect(() => {
    if (isAllComplete) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isAllComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-purple-500/[0.02] pointer-events-none" />

      {/* Header */}
      <div className="relative px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
              <Sparkles size={15} className="text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Getting Started
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {project.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground">{progressPct}%</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className={`h-full rounded-full transition-colors duration-500 ${
              isAllComplete
                ? "bg-gradient-to-r from-green-400 to-emerald-500"
                : "bg-gradient-to-r from-primary to-purple-500"
            }`}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          {completedCount} of {totalCount} steps completed
        </p>
      </div>

      {/* Checklist items */}
      <div className="px-4 pb-4 space-y-1">
        {CHECKLIST_ITEMS.map((item, idx) => {
          const isDone = project[item.key];
          const ItemIcon = item.icon;
          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + idx * 0.06 }}
              className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 ${
                isDone
                  ? "bg-muted/30"
                  : "hover:bg-muted/50 cursor-pointer"
              }`}
              onClick={() => !isDone && onAction?.(item.key, project.id)}
            >
              {/* Check icon */}
              <div className="shrink-0">
                {isDone ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <CheckCircle2
                      size={20}
                      className="text-green-500"
                      strokeWidth={2.5}
                    />
                  </motion.div>
                ) : (
                  <Circle
                    size={20}
                    className="text-muted-foreground/40 group-hover:text-primary/60 transition-colors"
                    strokeWidth={1.5}
                  />
                )}
              </div>

              {/* Step icon */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                  isDone ? "opacity-50" : item.bgColor
                }`}
              >
                <ItemIcon size={14} className={isDone ? "text-muted-foreground" : item.color} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium transition-all ${
                    isDone
                      ? "line-through text-muted-foreground"
                      : "text-foreground"
                  }`}
                >
                  {item.label}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {item.description}
                </p>
              </div>

              {/* Action hint */}
              {!isDone && (
                <span className="text-[10px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {item.actionLabel} →
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Completion celebration */}
      {isAllComplete && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 p-4 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <PartyPopper size={16} className="text-green-500" />
            <span className="text-sm font-semibold text-green-600">
              All set!
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            You're all onboarded — your creative team is hard at work!
          </p>
        </motion.div>
      )}

      {/* Confetti particles */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 1,
                x: "50%",
                y: "50%",
                scale: 0,
              }}
              animate={{
                opacity: 0,
                x: `${20 + Math.random() * 60}%`,
                y: `${Math.random() * 100}%`,
                scale: 1,
                rotate: Math.random() * 360,
              }}
              transition={{
                duration: 1.5 + Math.random(),
                delay: Math.random() * 0.3,
                ease: "easeOut",
              }}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: [
                  "#10b981",
                  "#8b5cf6",
                  "#3b82f6",
                  "#f59e0b",
                  "#ef4444",
                  "#ec4899",
                ][i % 6],
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default OnboardingChecklist;
