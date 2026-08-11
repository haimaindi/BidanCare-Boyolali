const fs = require('fs');
let code = fs.readFileSync('src/ui/components/layout/Sidebar.tsx', 'utf-8');

// Update navItems
const oldNavItems = `  const navItems = [
    { id: "offline", label: "Pendaftaran Offline", icon: FileText },
    { id: "online", label: "Pendaftaran Online", icon: Globe },
    { id: "monitor", label: "Monitor Antrean", icon: Monitor },
    { id: "antrean-pemeriksaan", label: "Antrian Pemeriksaan", icon: ClipboardCheck },
    { id: "loket-obat", label: "Loket Obat", icon: ShoppingBag },
    { id: "kasir", label: "Kasir", icon: DollarSign },
    { id: "follow-up", label: "Follow Up & Reminder", icon: MessageSquare },
    { id: "obat", label: "Manajemen Obat", icon: Pill },
    { id: "bhp", label: "Manajemen BHP", icon: Package },
    { id: "pasien", label: "Rekam Medis", icon: FileText },
  ];`;

const newNavItems = `  const navItems = [
    { id: "offline", label: "Pendaftaran", icon: FileText },
    { id: "pasien", label: "Rekam Medis", icon: FileText },
    { id: "antrean-pemeriksaan", label: "Pemeriksaan", icon: ClipboardCheck },
  ];
  
  const [isFarmasiOpen, setIsFarmasiOpen] = useState(true);
  const farmasiItems = [
    { id: "loket-obat", label: "Loket Obat", icon: ShoppingBag },
    { id: "obat", label: "Manajemen Obat", icon: Pill },
    { id: "bhp", label: "Manajemen BHP", icon: Package },
  ];
  
  const middleItems = [
    { id: "kasir", label: "Kasir", icon: DollarSign },
    { id: "follow-up", label: "Follow Up & Reminder", icon: MessageSquare },
  ];`;

code = code.replace(oldNavItems, newNavItems);

// Ensure isFarmasiOpen state is added to the component.
// I did add it in newNavItems.

// Now replace the Laporan Induk Menu Group to also include the Farmasi group and middleItems
const oldLaporanGroup = `          {/* Laporan Induk Menu Group */}`;
const newLaporanGroup = `          {/* Farmasi Menu Group */}
          <div className="pt-[1rem]">
            {!isCollapsed && (
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
            
            {(isFarmasiOpen || isCollapsed) && (
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
          
          {/* Laporan Induk Menu Group */}`;

code = code.replace(oldLaporanGroup, newLaporanGroup);

// Update Laporan Keuangan, Laporan Pasien, Laporan Obat & BHP -> Keuangan, Pasien, Obat & BHP
code = code.replace(/>Laporan Keuangan</g, ">Keuangan<");
code = code.replace(/>Laporan Pasien</g, ">Pasien<");
code = code.replace(/>Laporan Obat & BHP</g, ">Obat & BHP<");

// Update Master Data items order. Currently they are:
// Master KB, Master Imunisasi, Master Layanan Lain, Master Puskesmas, Master Harga Dasar, Master Broadcast, Master User
// Let me verify if they are all present and in what order. I'll just leave them as they are since they match the requested list!
// Request: a. Master KB b. Master Imunisasi c. Master Layanan Lain d. Master Puskesmas e. Master Harga Dasar f. Master Broadcast g. Master User
// If I check the file, they are already exactly in that order! 

// Update footer border. The request is: "Kemudian untuk footer hilangkan bg border hitam atas footer itu (cek gambar)"
// Look for `<div className="group relative mt-auto border-t bg-gray-50/50 p-[1rem]">`
// We'll remove `border-t` and `bg-gray-50/50`? Wait, the user said "hilangkan bg border hitam atas footer itu" -> remove `border-t border-gray-100` ? No, "hilangkan bg border hitam atas footer itu" maybe `border-t`. 
// Let's remove `border-t` from that `div` and also from the `mt-[0.5rem] text-center border-t border-gray-100 pt-[0.5rem]`.
code = code.replace(/<div className="group relative mt-auto border-t bg-gray-50\/50 p-\[1rem\]">/g, '<div className="group relative mt-auto p-[1rem]">');
code = code.replace(/border-t border-gray-100/g, '');

fs.writeFileSync('src/ui/components/layout/Sidebar.tsx', code);
