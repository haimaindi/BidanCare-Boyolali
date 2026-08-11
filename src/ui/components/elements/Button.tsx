import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../../logic/utils/cn";
import { tokens } from "../../styles/tokens";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: cn(tokens.colors.primary.base, tokens.colors.text.inverse, tokens.colors.primary.hover),
      secondary: cn(tokens.colors.surface.subtle, tokens.colors.text.base, "hover:bg-gray-100 border", tokens.colors.border.base),
      outline: cn("border", tokens.colors.border.base, tokens.colors.text.base, "hover:bg-gray-50"),
      ghost: cn("hover:bg-gray-100", tokens.colors.text.base),
    };

    const sizes = {
      sm: "h-[2rem] px-[0.75rem] text-sm",
      md: "h-[2.5rem] px-[1rem] py-[0.5rem]",
      lg: "h-[3rem] px-[1.5rem] text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], tokens.radii.base, className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
