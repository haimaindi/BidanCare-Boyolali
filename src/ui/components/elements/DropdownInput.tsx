import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "../../../logic/utils/cn";
import { tokens } from "../../styles/tokens";

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownInputProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
  disabled?: boolean;
  searchable?: boolean;
}

export function DropdownInput({
  options,
  value,
  onChange,
  placeholder = "Pilih opsi...",
  className,
  error,
  disabled,
  searchable = false,
}: DropdownInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropUp, setDropUp] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // Max height for dropdown is max-h-[12.5rem] (200px) + possible search box (approx 50px)
      const dropdownHeight = searchable ? 250 : 200; 
      
      if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
        setDropUp(true);
      } else {
        setDropUp(false);
      }
    }
  }, [isOpen, searchable]);

  const filteredOptions = searchable
    ? options.filter((opt) => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex h-[2.5rem] w-full items-center justify-between border bg-white px-[0.75rem] py-[0.5rem] text-sm transition-colors focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50",
          tokens.radii.base,
          tokens.colors.border.base,
          tokens.colors.text.base,
          error ? "border-rose-500 focus:ring-rose-500" : "focus:ring-purple-700",
          isOpen && !error && "ring-1 ring-purple-700 border-purple-700"
        )}
      >
        <span className={cn("truncate", !selectedOption && "text-gray-400")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn("ml-[0.5rem] h-[1rem] w-[1rem] shrink-0 text-gray-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            "absolute z-50 w-full overflow-hidden rounded-lg border bg-white shadow-xl transition-all duration-200",
            dropUp ? "bottom-full mb-[0.5rem]" : "top-full mt-[0.5rem]"
          )}
        >
          {searchable && (
            <div className="border-b p-[0.5rem]">
              <div className="relative">
                <Search className="absolute left-[0.5rem] top-1/2 h-[0.875rem] w-[0.875rem] -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-200 py-[0.375rem] pl-[1.75rem] pr-[0.5rem] text-sm focus:border-purple-500 focus:outline-none"
                  placeholder="Cari..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}
          <div className="max-h-[12.5rem] overflow-y-auto py-[0.25rem]">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={cn(
                    "flex w-full items-center px-[0.75rem] py-[0.5rem] text-left text-sm transition-colors hover:bg-purple-50 hover:text-purple-700",
                    value === option.value && "bg-purple-50 font-medium text-purple-700"
                  )}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="px-[0.75rem] py-[1rem] text-center text-xs text-gray-500">
                Data tidak ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
