import { InputHTMLAttributes, forwardRef, useState, useRef, useEffect } from "react";
import { cn } from "../../../logic/utils/cn";
import { tokens } from "../../styles/tokens";

export interface ComboBoxOption {
  label: string;
  value: string;
}

export interface ComboBoxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  options: (string | ComboBoxOption)[];
  value: string;
  onChange: (val: string) => void;
  error?: boolean;
}

export const ComboBox = forwardRef<HTMLInputElement, ComboBoxProps>(
  ({ className, options, value, onChange, error, placeholder, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    const normalizedOptions: ComboBoxOption[] = (options || []).map(opt => 
      typeof opt === "string" ? { label: opt, value: opt } : opt
    );

    useEffect(() => {
      const selectedOption = normalizedOptions.find(o => o.value === value);
      if (selectedOption) {
        setSearchTerm(selectedOption.label);
      } else if (!value) {
        setSearchTerm("");
      }
    }, [value, options]);

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
          // Reset search term to current selection label if closing
          const selectedOption = normalizedOptions.find(o => o.value === value);
          setSearchTerm(selectedOption ? selectedOption.label : "");
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [value, normalizedOptions]);

    const filteredOptions = normalizedOptions.filter(opt => 
      (opt.label || "").toLowerCase().includes((searchTerm || "").toLowerCase())
    );

    return (
      <div className="relative" ref={containerRef}>
        <input
          ref={ref}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            // Optional: if user clears it, trigger onChange("")
            if (!e.target.value) onChange("");
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
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
        {isOpen && (
          <div className="absolute top-[100%] z-50 mt-[0.25rem] max-h-[15rem] w-full overflow-y-auto rounded-md border border-gray-200 bg-white py-[0.25rem] shadow-md">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "cursor-pointer px-[0.75rem] py-[0.5rem] text-sm hover:bg-purple-50 hover:text-purple-700",
                    opt.value === value && "bg-purple-50 text-purple-700 font-semibold"
                  )}
                  onClick={() => {
                    onChange(opt.value);
                    setSearchTerm(opt.label);
                    setIsOpen(false);
                  }}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="px-[0.75rem] py-[0.5rem] text-sm text-gray-400 italic">
                Tidak ditemukan
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);
ComboBox.displayName = "ComboBox";
