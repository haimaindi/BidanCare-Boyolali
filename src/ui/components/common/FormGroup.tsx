import { LabelHTMLAttributes, ReactNode, forwardRef } from "react";
import { cn } from "../../../logic/utils/cn";
import { tokens } from "../../styles/tokens";

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        tokens.colors.text.base,
        className
      )}
      {...props}
    />
  )
);
Label.displayName = "Label";

interface FormGroupProps {
  id: string;
  label: string;
  children: ReactNode;
  error?: string;
  className?: string;
  required?: boolean;
}

export function FormGroup({ id, label, children, error, className, required }: FormGroupProps) {
  return (
    <div className={cn("flex flex-col space-y-[0.5rem]", className)}>
      <Label htmlFor={id} className="flex items-center gap-[0.25rem]">
        {label}
        {required && <span className="text-xs font-normal text-rose-500">* (Wajib diisi)</span>}
      </Label>
      {children}
      {error && <span className="text-sm font-medium text-rose-500">{error}</span>}
    </div>
  );
}
