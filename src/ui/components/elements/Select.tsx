import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "../../../logic/utils/cn";
import { tokens } from "../../styles/tokens";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "flex h-[2.5rem] w-full border bg-transparent px-[0.75rem] py-[0.5rem] text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
          tokens.radii.base,
          tokens.colors.border.base,
          tokens.colors.text.base,
          error ? "border-rose-500 focus-visible:ring-rose-500" : "focus-visible:ring-purple-700",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";
