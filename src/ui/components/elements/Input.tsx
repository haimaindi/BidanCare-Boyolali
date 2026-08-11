import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "../../../logic/utils/cn";
import { tokens } from "../../styles/tokens";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-[2.5rem] w-full border bg-transparent px-[0.75rem] py-[0.5rem] text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
          tokens.radii.base,
          tokens.colors.border.base,
          tokens.colors.text.base,
          error ? "border-rose-500 focus-visible:ring-rose-500" : "focus-visible:ring-purple-700",
          (props.type === "date" || props.type === "datetime-local") && "relative pl-[2.25rem] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-[0.5rem] [&::-webkit-calendar-picker-indicator]:w-[1.25rem] [&::-webkit-calendar-picker-indicator]:h-[1.25rem] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100",
          className
        )}
        onClick={(e) => {
          if ((props.type === "date" || props.type === "datetime-local") && e.currentTarget.showPicker) {
            try { e.currentTarget.showPicker(); } catch(err) {}
          }
          if (props.onClick) props.onClick(e);
        }}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
