import { ReactNode } from "react";
import { tokens } from "../../styles/tokens";
import { cn } from "../../../logic/utils/cn";
import { Menu, Activity } from "lucide-react"; // Minimal icon usage as requested

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className={cn("sticky top-0 z-30 flex h-[4rem] items-center border-b px-[1.5rem] bg-white", tokens.colors.border.base)}>
      {onMenuToggle && (
        <button
          onClick={onMenuToggle}
          className="mr-[1rem] p-[0.5rem] text-gray-500 hover:text-gray-900 focus:outline-none"
        >
          <Menu className="h-[1.25rem] w-[1.25rem]" />
        </button>
      )}
      <div className="flex flex-col flex-1 items-center justify-center">
        <h1 className={cn(tokens.typography.h2, tokens.colors.text.base, "leading-tight")}>
          Bidan<span className={tokens.colors.primary.text}>Care</span>
        </h1>
        <p className="text-[0.625rem] font-bold tracking-widest text-neutral-400 uppercase">
          TPMB Analia Boyolali
        </p>
      </div>
    </header>
  );
}
