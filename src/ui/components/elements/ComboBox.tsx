import { InputHTMLAttributes, forwardRef, useState, useRef, useEffect } from "react";
import { cn } from "../../../logic/utils/cn";
import { tokens } from "../../styles/tokens";

export interface ComboBoxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  error?: boolean;
}

export const ComboBox = forwardRef<HTMLInputElement, ComboBoxProps>(
  ({ className, options, value, onChange, error, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = (options || []).filter(opt => 
      (opt || "").toLowerCase().includes((value || "").toLowerCase())
    );

    return (
      <div className="relative" ref={containerRef}>
        <input
          ref={ref}
          value={value || ""}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
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
        {isOpen && filteredOptions.length > 0 && (
          <div className="absolute top-[100%] z-50 mt-[0.25rem] max-h-[15rem] w-full overflow-y-auto rounded-md border border-gray-200 bg-white py-[0.25rem] shadow-md">
            {filteredOptions.map((opt, idx) => (
              <div
                key={idx}
                className="cursor-pointer px-[0.75rem] py-[0.5rem] text-sm hover:bg-purple-50 hover:text-purple-700"
                onClick={() => {
                  onChange(opt || "");
                  setIsOpen(false);
                }}
              >
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);
ComboBox.displayName = "ComboBox";
