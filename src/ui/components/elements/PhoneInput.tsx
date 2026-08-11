import React, { forwardRef } from "react";
import { cn } from "../../../logic/utils/cn";
import { tokens } from "../../styles/tokens";

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, onChange, error, ...props }, ref) => {
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, "");
      // Simple formatting for display: 08x xxx xxx xxx
      const formatted = val.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
      onChange(formatted);
    };

    return (
      <div className="relative">
        <input
          ref={ref}
          type="tel"
          value={value}
          onChange={handlePhoneChange}
          className={cn(
            "flex h-[2.5rem] w-full border bg-transparent px-[0.75rem] py-[0.5rem] text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
            tokens.radii.base,
            tokens.colors.border.base,
            tokens.colors.text.base,
            error ? "border-rose-500 focus-visible:ring-rose-500" : "focus-visible:ring-purple-700",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";
