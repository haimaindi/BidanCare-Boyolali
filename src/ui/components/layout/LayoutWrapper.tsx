import { ReactNode, useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface LayoutWrapperProps {
  children: ReactNode;
  activeModule: string;
  onNavigate: (module: string) => void;
}

export function LayoutWrapper({ children, activeModule, onNavigate }: LayoutWrapperProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleMenuToggle = () => {
    // If we're on mobile (window width < 1024), toggle mobile sidebar
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-white">
      <Header onMenuToggle={handleMenuToggle} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isOpenMobile={isMobileSidebarOpen} 
          isCollapsed={isSidebarCollapsed} 
          activeModule={activeModule}
          onNavigate={(m) => {
            onNavigate(m);
            setIsMobileSidebarOpen(false);
          }}
        />
        {/* Overlay for mobile sidebar */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 z-10 bg-black/20 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
        <main className="flex-1 overflow-y-auto bg-neutral-50/50 p-[1.5rem] md:p-[2rem]">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
