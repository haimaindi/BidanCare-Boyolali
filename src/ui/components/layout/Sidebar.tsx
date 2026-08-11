import { cn } from "../../../logic/utils/cn";
import { tokens } from "../../styles/tokens";
import { Users, FileText, Calendar, Settings, Globe, Monitor, Pill, Package, Database, ChevronDown, ClipboardCheck, DollarSign, MessageSquare, LogOut, User, ShoppingBag, BarChart3, TrendingUp, Users2, Layers } from "lucide-react"; // minimal icons
import { useState } from "react";
import { useAuth } from "../../../logic/context/AuthContext";

interface SidebarProps {
  isOpenMobile: boolean;
  isCollapsed: boolean;
  activeModule: string;
  onNavigate: (module: string) => void;
}

export function Sidebar({ isOpenMobile, isCollapsed, activeModule, onNavigate }: SidebarProps) {
  const { user, hasPermission, logout } = useAuth();
  const [isMasterOpen, setIsMasterOpen] = useState(true);
  const [isLaporanOpen, setIsLaporanOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const canPendaftaran = hasPermission("Pendaftaran");
  const canReport = hasPermission("Report");
  const canPemeriksaan = hasPermission("Pemeriksaan");
  const canCashier = hasPermission("Cashier");
  const canFarmasi = hasPermission("Farmasi");
  const canMaster = hasPermission("Master Data");
  const canDokumen = hasPermission("Dokumen");

  const navItems = [
    ...(canPendaftaran ? [{ id: "offline", label: "Pendaftaran", icon: FileText }] : []), // Pendaftaran -> Pendaftaran
    ...(canPendaftaran || canReport ? [{ id: "pasien", label: "Rekam Medis", icon: FileText }] : []), // Rekam Medis
    ...(canPemeriksaan ? [{ id: "antrean-pemeriksaan", label: "Pemeriksaan", icon: ClipboardCheck }] : []),
  ];
  
  const [isFarmasiOpen, setIsFarmasiOpen] = useState(true);
  const farmasiItems = canFarmasi ? [
    { id: "loket-obat", label: "Loket Obat", icon: ShoppingBag },
    { id: "obat", label: "Manajemen Obat", icon: Pill },
    { id: "bhp", label: "Managemen BHP", icon: Package },
  ] : [];
  
  const middleItems = [
    ...(canCashier ? [{ id: "kasir", label: "Kasir", icon: DollarSign }] : []),
    ...(canPendaftaran ? [{ id: "follow-up", label: "Follow Up & Reminder", icon: MessageSquare }] : []),
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex flex-col border-r bg-white transition-all duration-300 lg:static lg:translate-x-0",
        isCollapsed ? "lg:w-[4.5rem]" : "lg:w-[16rem]",
        "w-[16rem]", // Default width for mobile
        tokens.colors.border.base,
        isOpenMobile ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="flex-1 overflow-y-auto py-[1.5rem] px-[1rem] overflow-x-hidden scrollbar-hide">
        <nav className="space-y-[0.25rem]">
          {navItems.map((item) => (
            <a
              key={item.id}
              href="#"
              onClick={(e) => { e.preventDefault(); onNavigate(item.id); }}
              className={cn(
                "flex items-center gap-[0.75rem] rounded-md px-[1rem] py-[0.5rem] text-sm font-medium transition-colors whitespace-nowrap",
                isCollapsed ? "lg:px-[0.5rem] lg:justify-center" : "",
                item.id === activeModule
                  ? cn(tokens.colors.primary.light, tokens.colors.primary.text)
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="h-[1.25rem] w-[1.25rem] shrink-0" />
              <span className={cn(isCollapsed ? "lg:hidden" : "block")}>{item.label}</span>
            </a>
          ))}

          {/* Farmasi Menu Group */}
          <div className="pt-[1rem]">
            {canFarmasi && !isCollapsed && (
              <button 
                onClick={() => setIsFarmasiOpen(!isFarmasiOpen)}
                className="flex w-full items-center justify-between px-[1rem] py-[0.5rem] text-xs font-semibold uppercase tracking-wider text-purple-700 hover:text-purple-800 transition-colors"
              >
                <div className="flex items-center gap-[0.5rem]">
                  <ShoppingBag className="h-[0.875rem] w-[0.875rem]" />
                  <span>Farmasi</span>
                </div>
                <ChevronDown className={cn("h-[0.75rem] w-[0.75rem] transition-transform", !isFarmasiOpen && "-rotate-90")} />
              </button>
            )}
            {isCollapsed && <div className="mx-auto h-px w-[2rem] bg-gray-100 my-[0.5rem]" />}
            
            {canFarmasi && (isFarmasiOpen || isCollapsed) && (
              <div className="space-y-[0.25rem]">
                {farmasiItems.map(item => (
                  <a
                    key={item.id}
                    href="#"
                    onClick={(e) => { e.preventDefault(); onNavigate(item.id); }}
                    className={cn(
                      "flex items-center gap-[0.75rem] rounded-md px-[1rem] py-[0.5rem] text-sm font-medium transition-colors whitespace-nowrap",
                      isCollapsed ? "lg:px-[0.5rem] lg:justify-center" : "pl-[1rem]",
                      activeModule === item.id
                        ? cn(tokens.colors.primary.light, tokens.colors.primary.text)
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <item.icon className="h-[1.25rem] w-[1.25rem] shrink-0" />
                    <span className={cn(isCollapsed ? "lg:hidden" : "block")}>{item.label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
          
          <div className="pt-[1rem]">
             {middleItems.map((item) => (
              <a
                key={item.id}
                href="#"
                onClick={(e) => { e.preventDefault(); onNavigate(item.id); }}
                className={cn(
                  "flex items-center gap-[0.75rem] rounded-md px-[1rem] py-[0.5rem] text-sm font-medium transition-colors whitespace-nowrap mb-[0.25rem]",
                  isCollapsed ? "lg:px-[0.5rem] lg:justify-center" : "",
                  item.id === activeModule
                    ? cn(tokens.colors.primary.light, tokens.colors.primary.text)
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="h-[1.25rem] w-[1.25rem] shrink-0" />
                <span className={cn(isCollapsed ? "lg:hidden" : "block")}>{item.label}</span>
              </a>
            ))}
          </div>
          
          {/* Laporan Induk Menu Group */}
          <div className="pt-[1rem]">
            {canReport && !isCollapsed && (
              <button 
                onClick={() => setIsLaporanOpen(!isLaporanOpen)}
                className="flex w-full items-center justify-between px-[1rem] py-[0.5rem] text-xs font-semibold uppercase tracking-wider text-purple-700 hover:text-purple-800 transition-colors"
              >
                <div className="flex items-center gap-[0.5rem]">
                  <BarChart3 className="h-[0.875rem] w-[0.875rem]" />
                  <span>Laporan</span>
                </div>
                <ChevronDown className={cn("h-[0.75rem] w-[0.75rem] transition-transform", !isLaporanOpen && "-rotate-90")} />
              </button>
            )}
            {isCollapsed && <div className="mx-auto h-px w-[2rem] bg-gray-100 my-[0.5rem]" />}
            
            {canReport && (isLaporanOpen || isCollapsed) && (
              <div className="space-y-[0.25rem]">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onNavigate("laporan-keuangan"); }}
                  className={cn(
                    "flex items-center gap-[0.75rem] rounded-md px-[1rem] py-[0.5rem] text-sm font-medium transition-colors whitespace-nowrap",
                    isCollapsed ? "lg:px-[0.5rem] lg:justify-center" : "pl-[1rem]",
                    activeModule === "laporan-keuangan"
                      ? cn(tokens.colors.primary.light, tokens.colors.primary.text)
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  title={isCollapsed ? "Laporan Keuangan" : undefined}
                >
                  <DollarSign className="h-[1.25rem] w-[1.25rem] shrink-0" />
                  <span className={cn(isCollapsed ? "lg:hidden" : "block")}>Keuangan</span>
                </a>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onNavigate("laporan-pasien"); }}
                  className={cn(
                    "flex items-center gap-[0.75rem] rounded-md px-[1rem] py-[0.5rem] text-sm font-medium transition-colors whitespace-nowrap",
                    isCollapsed ? "lg:px-[0.5rem] lg:justify-center" : "pl-[1rem]",
                    activeModule === "laporan-pasien"
                      ? cn(tokens.colors.primary.light, tokens.colors.primary.text)
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  title={isCollapsed ? "Laporan Data Pasien" : undefined}
                >
                  <Users2 className="h-[1.25rem] w-[1.25rem] shrink-0" />
                  <span className={cn(isCollapsed ? "lg:hidden" : "block")}>Pasien</span>
                </a>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onNavigate("laporan-obat-bhp"); }}
                  className={cn(
                    "flex items-center gap-[0.75rem] rounded-md px-[1rem] py-[0.5rem] text-sm font-medium transition-colors whitespace-nowrap",
                    isCollapsed ? "lg:px-[0.5rem] lg:justify-center" : "pl-[1rem]",
                    activeModule === "laporan-obat-bhp"
                      ? cn(tokens.colors.primary.light, tokens.colors.primary.text)
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  title={isCollapsed ? "Laporan Obat & BHP" : undefined}
                >
                  <Layers className="h-[1.25rem] w-[1.25rem] shrink-0" />
                  <span className={cn(isCollapsed ? "lg:hidden" : "block")}>Obat & BHP</span>
                </a>
              </div>
            )}
          </div>

          {/* Master Menu Group */}
          <div className="pt-[1rem]">
            {canMaster && !isCollapsed && (
              <button 
                onClick={() => setIsMasterOpen(!isMasterOpen)}
                className="flex w-full items-center justify-between px-[1rem] py-[0.5rem] text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span>Master Data</span>
                <ChevronDown className={cn("h-[0.75rem] w-[0.75rem] transition-transform", !isMasterOpen && "-rotate-90")} />
              </button>
            )}
            {isCollapsed && <div className="mx-auto h-px w-[2rem] bg-gray-100 my-[0.5rem]" />}
            
            {canMaster && (isMasterOpen || isCollapsed) && (
              <div className="space-y-[0.25rem]">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onNavigate("master-kb"); }}
                  className={cn(
                    "flex items-center gap-[0.75rem] rounded-md px-[1rem] py-[0.5rem] text-sm font-medium transition-colors whitespace-nowrap",
                    isCollapsed ? "lg:px-[0.5rem] lg:justify-center" : "pl-[1rem]",
                    activeModule === "master-kb"
                      ? cn(tokens.colors.primary.light, tokens.colors.primary.text)
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  title={isCollapsed ? "Master KB" : undefined}
                >
                  <Database className="h-[1.25rem] w-[1.25rem] shrink-0" />
                  <span className={cn(isCollapsed ? "lg:hidden" : "block")}>Master KB</span>
                </a>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onNavigate("master-imunisasi"); }}
                  className={cn(
                    "flex items-center gap-[0.75rem] rounded-md px-[1rem] py-[0.5rem] text-sm font-medium transition-colors whitespace-nowrap",
                    isCollapsed ? "lg:px-[0.5rem] lg:justify-center" : "pl-[1rem]",
                    activeModule === "master-imunisasi"
                      ? cn(tokens.colors.primary.light, tokens.colors.primary.text)
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  title={isCollapsed ? "Master Imunisasi" : undefined}
                >
                  <Database className="h-[1.25rem] w-[1.25rem] shrink-0" />
                  <span className={cn(isCollapsed ? "lg:hidden" : "block")}>Master Imunisasi</span>
                </a>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onNavigate("master-layanan-lain"); }}
                  className={cn(
                    "flex items-center gap-[0.75rem] rounded-md px-[1rem] py-[0.5rem] text-sm font-medium transition-colors whitespace-nowrap",
                    isCollapsed ? "lg:px-[0.5rem] lg:justify-center" : "pl-[1rem]",
                    activeModule === "master-layanan-lain"
                      ? cn(tokens.colors.primary.light, tokens.colors.primary.text)
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  title={isCollapsed ? "Master Layanan Lain" : undefined}
                >
                  <Database className="h-[1.25rem] w-[1.25rem] shrink-0" />
                  <span className={cn(isCollapsed ? "lg:hidden" : "block")}>Master Layanan Lain</span>
                </a>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onNavigate("master-puskesmas"); }}
                  className={cn(
                    "flex items-center gap-[0.75rem] rounded-md px-[1rem] py-[0.5rem] text-sm font-medium transition-colors whitespace-nowrap",
                    isCollapsed ? "lg:px-[0.5rem] lg:justify-center" : "pl-[1rem]",
                    activeModule === "master-puskesmas"
                      ? cn(tokens.colors.primary.light, tokens.colors.primary.text)
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  title={isCollapsed ? "Master Puskesmas" : undefined}
                >
                  <Database className="h-[1.25rem] w-[1.25rem] shrink-0" />
                  <span className={cn(isCollapsed ? "lg:hidden" : "block")}>Master Puskesmas</span>
                </a>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onNavigate("master-harga-dasar"); }}
                  className={cn(
                    "flex items-center gap-[0.75rem] rounded-md px-[1rem] py-[0.5rem] text-sm font-medium transition-colors whitespace-nowrap",
                    isCollapsed ? "lg:px-[0.5rem] lg:justify-center" : "pl-[1rem]",
                    activeModule === "master-harga-dasar"
                      ? cn(tokens.colors.primary.light, tokens.colors.primary.text)
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  title={isCollapsed ? "Master Harga Dasar" : undefined}
                >
                  <DollarSign className="h-[1.25rem] w-[1.25rem] shrink-0" />
                  <span className={cn(isCollapsed ? "lg:hidden" : "block")}>Master Harga Dasar</span>
                </a>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onNavigate("master-broadcast"); }}
                  className={cn(
                    "flex items-center gap-[0.75rem] rounded-md px-[1rem] py-[0.5rem] text-sm font-medium transition-colors whitespace-nowrap",
                    isCollapsed ? "lg:px-[0.5rem] lg:justify-center" : "pl-[1rem]",
                    activeModule === "master-broadcast"
                      ? cn(tokens.colors.primary.light, tokens.colors.primary.text)
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  title={isCollapsed ? "Master Broadcast" : undefined}
                >
                  <MessageSquare className="h-[1.25rem] w-[1.25rem] shrink-0" />
                  <span className={cn(isCollapsed ? "lg:hidden" : "block")}>Master Broadcast</span>
                </a>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onNavigate("master-user"); }}
                  className={cn(
                    "flex items-center gap-[0.75rem] rounded-md px-[1rem] py-[0.5rem] text-sm font-medium transition-colors whitespace-nowrap",
                    isCollapsed ? "lg:px-[0.5rem] lg:justify-center" : "pl-[1rem]",
                    activeModule === "master-user"
                      ? cn(tokens.colors.primary.light, tokens.colors.primary.text)
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  title={isCollapsed ? "Master User" : undefined}
                >
                  <Users className="h-[1.25rem] w-[1.25rem] shrink-0" />
                  <span className={cn(isCollapsed ? "lg:hidden" : "block")}>Master User</span>
                </a>
              </div>
            )}
          </div>

          <div className="pt-[1rem] pb-[2rem]">
            {canPendaftaran && <a
              href="#"
              onClick={(e) => { e.preventDefault(); onNavigate("pengaturan"); }}
              className={cn(
                "flex items-center gap-[0.75rem] rounded-md px-[1rem] py-[0.5rem] text-sm font-medium transition-colors whitespace-nowrap",
                isCollapsed ? "lg:px-[0.5rem] lg:justify-center" : "",
                activeModule === "pengaturan"
                  ? cn(tokens.colors.primary.light, tokens.colors.primary.text)
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
              title={isCollapsed ? "Pengaturan" : undefined}
            >
              <Settings className="h-[1.25rem] w-[1.25rem] shrink-0" />
              <span className={cn(isCollapsed ? "lg:hidden" : "block")}>Pengaturan</span>
            </a>}
          </div>
        </nav>
      </div>

      <div className="group relative mt-auto p-[1rem]">
        {/* Logout Overlay on Hover/Click */}
        <div className="absolute inset-0 z-10 flex translate-y-2 items-center justify-center bg-white/80 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 backdrop-blur-[2px]">
          <button
            onClick={() => logout()}
            className="flex items-center gap-[0.5rem] rounded-full bg-rose-600 px-[1.25rem] py-[0.5rem] text-xs font-bold text-white shadow-lg shadow-rose-200 hover:bg-rose-700 active:scale-95 transition-all"
          >
            <LogOut className="h-[0.875rem] w-[0.875rem]" />
            LOGOUT
          </button>
        </div>
        
        <div 
          className={cn(
            "flex w-full items-center gap-[0.75rem] transition-all p-[0.5rem] rounded-lg",
            isCollapsed ? "lg:justify-center lg:px-0" : ""
          )}
        >
          <div className={cn("text-left overflow-hidden", isCollapsed ? "lg:hidden" : "block")}>
            <p className="text-[0.875rem] font-black text-gray-900 truncate leading-none mb-[0.25rem]">{user?.nama}</p>
            <p className="text-[0.625rem] text-gray-400 font-bold uppercase tracking-wider">{user?.jenisUser}</p>
          </div>
        </div>

        {!isCollapsed && (
          <div className="mt-[0.5rem] text-center  pt-[0.5rem]">
            <p className="text-[0.625rem] font-bold text-black uppercase tracking-tighter">
              &copy; 2026 Maindi
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
