import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, RotateCcw, Loader2, FileText, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type DeliverableFile = {
  id: string;
  file_name: string;
  file_url: string;
  type: string;
  deliverable_status: "pending" | "approved" | "revision_requested" | null;
  revision_note: string | null;
  reviewed_at: string | null;
};

type DeliverableReviewOverlayProps = {
  file: DeliverableFile;
  projectTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted: (fileId: string, action: string, note?: string) => void;
};

function getFilePreviewType(fileName: string): "image" | "video" | "other" {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext)) return "image";
  if (["mp4", "mov", "avi", "webm"].includes(ext)) return "video";
  return "other";
}

const DeliverableReviewOverlay = ({
  file,
  projectTitle,
  isOpen,
  onClose,
  onReviewSubmitted,
}: DeliverableReviewOverlayProps) => {
  const [action, setAction] = useState<"approve" | "revise" | null>(null);
  const [revisionNote, setRevisionNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pins, setPins] = useState<{x: number, y: number}[]>([]);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (action !== "revise") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPins([...pins, { x, y }]);
  };

  const previewType = getFilePreviewType(file.file_name);

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setSubmitting(true);

    const reviewAction = action === "approve" ? "approved" : "revision_requested";

    const { error } = await supabase.from("file_reviews").insert({
      file_id: file.id,
      reviewer_id: user.id,
      action: reviewAction,
      note: action === "revise" ? revisionNote.trim() || null : null,
    });

    if (error) {
      toast.error("Failed to submit review");
      console.error(error);
    } else {
      toast.success(
        action === "approve"
          ? "Deliverable approved! ✅"
          : "Revision request sent to the team 🔄"
      );
      onReviewSubmitted(file.id, reviewAction, action === "revise" ? revisionNote.trim() : undefined);
    }

    setSubmitting(false);
    setAction(null);
    setRevisionNote("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl max-h-[90vh] bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Deliverable Review
                </p>
                <h3 className="text-sm font-bold text-foreground mt-0.5">
                  {file.file_name}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {projectTitle}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Preview Area */}
            <div className="flex-1 overflow-auto bg-muted/20 flex items-center justify-center p-6 min-h-[250px] relative">
              {previewType === "image" ? (
                <div 
                  className={`relative inline-block ${action === 'revise' ? 'cursor-crosshair' : ''}`}
                  onClick={handleImageClick}
                >
                  <img
                    src={file.file_url}
                    alt={file.file_name}
                    className="max-h-[50vh] max-w-full object-contain rounded-lg shadow-lg"
                  />
                  {pins.map((pin, idx) => (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      key={idx}
                      className="absolute w-6 h-6 -ml-3 -mt-3 bg-orange-500 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[10px] text-white font-bold pointer-events-none"
                      style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                    >
                      {idx + 1}
                    </motion.div>
                  ))}
                  {action === "revise" && pins.length === 0 && (
                    <div className="absolute inset-x-0 bottom-4 text-center pointer-events-none">
                      <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">Click anywhere on the image to drop a pin</span>
                    </div>
                  )}
                </div>
              ) : previewType === "video" ? (
                <video
                  src={file.file_url}
                  controls
                  className="max-h-[50vh] max-w-full rounded-lg shadow-lg"
                />
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto mb-4">
                    <FileText size={28} className="text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    {file.file_name}
                  </p>
                  <a
                    href={file.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Open file <ExternalLink size={10} />
                  </a>
                </div>
              )}
            </div>

            {/* Status banner if already reviewed */}
            {file.deliverable_status && file.deliverable_status !== "pending" && (
              <div
                className={`px-6 py-3 text-sm font-medium flex items-center gap-2 ${
                  file.deliverable_status === "approved"
                    ? "bg-green-500/10 text-green-600 border-t border-green-500/20"
                    : "bg-orange-500/10 text-orange-600 border-t border-orange-500/20"
                }`}
              >
                {file.deliverable_status === "approved" ? (
                  <>
                    <CheckCircle2 size={14} /> Approved
                    {file.reviewed_at && (
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(file.reviewed_at).toLocaleDateString()}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <RotateCcw size={14} /> Revision Requested
                    {file.revision_note && (
                      <span className="text-xs ml-2 font-normal">
                        — "{file.revision_note}"
                      </span>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Action area — only for pending deliverables */}
            {file.deliverable_status === "pending" && (
              <div className="px-6 py-5 border-t border-border bg-card shrink-0">
                {!action ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setAction("approve")}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 text-green-600 border border-green-500/20 text-sm font-semibold hover:bg-green-500/20 transition-all"
                    >
                      <CheckCircle2 size={16} /> Approve
                    </button>
                    <button
                      onClick={() => setAction("revise")}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-500/10 text-orange-600 border border-orange-500/20 text-sm font-semibold hover:bg-orange-500/20 transition-all"
                    >
                      <RotateCcw size={16} /> Request Revision
                    </button>
                  </div>
                ) : action === "approve" ? (
                  <div className="space-y-3">
                    <p className="text-sm text-foreground font-medium">
                      Confirm approval for{" "}
                      <span className="text-green-600">"{file.file_name}"</span>?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setAction(null)}
                        className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {submitting ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={14} />
                        )}
                        {submitting ? "Submitting..." : "Confirm Approval"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-foreground font-medium">
                      What changes are needed?
                    </p>
                    <textarea
                      value={revisionNote}
                      onChange={(e) => setRevisionNote(e.target.value)}
                      placeholder="Describe the revisions needed — e.g., 'Please adjust the color palette to be warmer...'"
                      className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 resize-none"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setAction(null);
                          setRevisionNote("");
                        }}
                        className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
                      >
                        {submitting ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <RotateCcw size={14} />
                        )}
                        {submitting ? "Sending..." : "Send Revision Request"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeliverableReviewOverlay;
