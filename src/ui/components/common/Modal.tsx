import { ReactNode, useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "../../../logic/utils/cn";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, footer, className }: ModalProps) {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      document.body.style.overflow = "hidden";
    } else {
      setTimeout(() => setIsRendered(false), 200);
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen && !isRendered) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 transition-opacity duration-200",
          isOpen ? "opacity-100" : "opacity-0"
        )} 
        onClick={onClose}
      />
      <div 
        className={cn(
          "w-full rounded-lg bg-white shadow-xl relative z-10 transition-all duration-200 overflow-hidden flex flex-col max-h-[90vh]",
          className || "max-w-md",
          isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
        )}
      >
        <div className="flex items-center justify-between border-b px-[1.5rem] py-[1rem] shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-[1.5rem] overflow-y-auto">
          {children}
        </div>
        {footer && (
          <div className="border-t bg-gray-50/50 px-[1.5rem] py-[0.75rem] shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
