import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  variant = "danger"
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
          dir="rtl"
        >
          {/* Header Theme Line */}
          <div className={`h-1.5 w-full ${variant === 'danger' ? 'bg-destructive' : variant === 'warning' ? 'bg-amber-500' : 'bg-primary'}`} />

          <div className="p-6">
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 mb-6 pt-2">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                variant === 'danger' ? 'bg-destructive/10 text-destructive' :
                variant === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                'bg-primary/10 text-primary'
              }`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2 mt-1">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{message}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 py-3 rounded-xl font-bold text-white transition-all shadow-lg hover:-translate-y-0.5 ${
                  variant === 'danger' ? 'bg-destructive hover:bg-destructive/90 shadow-destructive/20' :
                  variant === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' :
                  'bg-primary hover:bg-primary/90 shadow-primary/20'
                }`}
              >
                {confirmText}
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-bold text-foreground bg-muted hover:bg-muted/80 border border-border transition-colors"
              >
                {cancelText}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
