const fs = require('fs');
let code = fs.readFileSync('src/ui/components/layout/Sidebar.tsx', 'utf-8');

// Add import 
code = code.replace(
  /import { useState } from "react";/,
  'import { useState } from "react";\nimport { useAuth } from "../../../logic/context/AuthContext";'
);

// inside Sidebar component
code = code.replace(
  /export function Sidebar\(\{ isOpenMobile, isCollapsed, activeModule, onNavigate \}: SidebarProps\) \{/,
  'export function Sidebar({ isOpenMobile, isCollapsed, activeModule, onNavigate }: SidebarProps) {\n  const { user, hasPermission, logout } = useAuth();'
);

// Permissions
code = code.replace(
  /const navItems = \[/,
  `const canPendaftaran = hasPermission("Pendaftaran");
  const canReport = hasPermission("Report");
  const canPemeriksaan = hasPermission("Pemeriksaan");
  const canCashier = hasPermission("Cashier");
  const canFarmasi = hasPermission("Farmasi");
  const canMaster = hasPermission("Master Data");
  const canDokumen = hasPermission("Dokumen");

  const navItems = [`
);

// Update nav items
code = code.replace(
  /\{ id: "offline", label: "Pendaftaran", icon: FileText \},/,
  '...(canPendaftaran ? [{ id: "offline", label: "Pendaftaran", icon: FileText }] : []), // Pendaftaran -> Pendaftaran'
);

code = code.replace(
  /\{ id: "pasien", label: "Rekam Medis", icon: FileText \},/,
  '...(canPendaftaran || canReport ? [{ id: "pasien", label: "Rekam Medis", icon: FileText }] : []), // Rekam Medis'
);

code = code.replace(
  /\{ id: "antrean-pemeriksaan", label: "Pemeriksaan", icon: ClipboardCheck \},/,
  '...(canPemeriksaan ? [{ id: "antrean-pemeriksaan", label: "Pemeriksaan", icon: ClipboardCheck }] : []),'
);

code = code.replace(
  /const farmasiItems = \[/,
  'const farmasiItems = canFarmasi ? ['
);
code = code.replace(
  /  \];\s+const middleItems = \[/g,
  '  ] : [];\n  \n  const middleItems = ['
);

code = code.replace(
  /\{ id: "kasir", label: "Kasir", icon: DollarSign \},/,
  '...(canCashier ? [{ id: "kasir", label: "Kasir", icon: DollarSign }] : []),'
);

code = code.replace(
  /\{ id: "follow-up", label: "Follow Up & Reminder", icon: MessageSquare \},/,
  '...(canPendaftaran ? [{ id: "follow-up", label: "Follow Up & Reminder", icon: MessageSquare }] : []),'
);

// Hide Master Data
code = code.replace(
  /\{!\isCollapsed && \(\s*<button\s*onClick=\{\(\) => setIsMasterOpen\(!isMasterOpen\)\}/,
  '{canMaster && !isCollapsed && (\n              <button \n                onClick={() => setIsMasterOpen(!isMasterOpen)}'
);

code = code.replace(
  /\{\(isMasterOpen \|\| isCollapsed\) && \(/,
  '{canMaster && (isMasterOpen || isCollapsed) && ('
);

// Hide Laporan
code = code.replace(
  /\{!\isCollapsed && \(\s*<button \s*onClick=\{\(\) => setIsLaporanOpen\(!isLaporanOpen\)\}/,
  '{canReport && !isCollapsed && (\n              <button \n                onClick={() => setIsLaporanOpen(!isLaporanOpen)}'
);

code = code.replace(
  /\{\(isLaporanOpen \|\| isCollapsed\) && \(/,
  '{canReport && (isLaporanOpen || isCollapsed) && ('
);

// Hide Farmasi button
code = code.replace(
  /\{!\isCollapsed && \(\s*<button \s*onClick=\{\(\) => setIsFarmasiOpen\(!isFarmasiOpen\)\}/,
  '{canFarmasi && !isCollapsed && (\n              <button \n                onClick={() => setIsFarmasiOpen(!isFarmasiOpen)}'
);
code = code.replace(
  /\{\(isFarmasiOpen \|\| isCollapsed\) && \(/,
  '{canFarmasi && (isFarmasiOpen || isCollapsed) && ('
);

// Hide Pengaturan
code = code.replace(
  /<div className="pt-\[1rem\] pb-\[2rem\]">\s*<a\s*href="#"\s*onClick=\{\(e\) => \{ e\.preventDefault\(\); onNavigate\("pengaturan"\); \}\}/,
  '<div className="pt-[1rem] pb-[2rem]">\n            {canPendaftaran && <a\n              href="#"\n              onClick={(e) => { e.preventDefault(); onNavigate("pengaturan"); }}'
);
code = code.replace(
  /<Settings className="h-\[1.25rem\] w-\[1.25rem\] shrink-0" \/>\s*<span className=\{cn\(isCollapsed \? "lg:hidden" : "block"\)\}>Pengaturan<\/span>\s*<\/a>\s*<\/div>/,
  '<Settings className="h-[1.25rem] w-[1.25rem] shrink-0" />\n              <span className={cn(isCollapsed ? "lg:hidden" : "block")}>Pengaturan</span>\n            </a>}\n          </div>'
);

// update user logout info
code = code.replace(
  /<p className="text-\[0.875rem\] font-black text-gray-900 truncate leading-none mb-\[0.25rem\]">Bdn. Siti Aminah<\/p>/,
  '<p className="text-[0.875rem] font-black text-gray-900 truncate leading-none mb-[0.25rem]">{user?.nama}</p>'
);
code = code.replace(
  /<p className="text-\[0.625rem\] text-gray-400 font-bold uppercase tracking-wider">Bidan Praktik<\/p>/,
  '<p className="text-[0.625rem] text-gray-400 font-bold uppercase tracking-wider">{user?.jenisUser}</p>'
);
code = code.replace(
  /onClick=\{\(\) => alert\("Logout\.\.\."\)\}/,
  'onClick={() => logout()}'
);


fs.writeFileSync('src/ui/components/layout/Sidebar.tsx', code);
