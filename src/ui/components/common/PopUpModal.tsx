import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../../logic/utils/cn";
import { motion, AnimatePresence } from "motion/react";

interface PopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string; // e.g., 'max-w-2xl'
}

export function PopUpModal({ isOpen, onClose, title, children, footer, maxWidth = "max-w-2xl" }: PopUpModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[1rem] md:p-[2rem]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-xl bg-white shadow-2xl",
              maxWidth
            )}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b px-[1.5rem] py-[1.25rem]">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-full p-[0.5rem] text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-[1.25rem] w-[1.25rem]" />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-[1.5rem]">
              {children}
            </div>

            {/* Fixed Footer */}
            {footer && (
              <div className="shrink-0 border-t bg-gray-50/50 px-[1.5rem] py-[1rem]">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
