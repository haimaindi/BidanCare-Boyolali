/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { LayoutWrapper } from "./ui/components/layout/LayoutWrapper";
import { PendaftaranOfflineModule } from "./modules/pendaftaran-offline/PendaftaranOfflineModule";
import { PendaftaranOnlineModule } from "./modules/pendaftaran-online/PendaftaranOnlineModule";
import { MonitorAntreanModule } from "./modules/monitor-antrean/MonitorAntreanModule";
import { ObatModule } from "./modules/obat/ObatModule";
import { BhpModule } from "./modules/bhp/BhpModule";
import { MasterKbModule } from "./modules/master-kb/MasterKbModule";
import { MasterImunisasiModule } from "./modules/master-imunisasi/MasterImunisasiModule";
import { MasterLayananLainModule } from "./modules/master-layanan-lain/MasterLayananLainModule";
import { MasterPuskesmasModule } from "./modules/master-puskesmas/MasterPuskesmasModule";
import { MasterRekamMedisModule } from "./modules/master-rekam-medis/MasterRekamMedisModule";
import MasterUserModule from "./modules/master-user/MasterUserModule";
import MasterHargaDasarModule from "./modules/master-harga-dasar/MasterHargaDasarModule";
import PemeriksaanModule from "./modules/pemeriksaan/PemeriksaanModule";
import LoketObatModule from "./modules/loket-obat/LoketObatModule";
import { KasirModule } from "./modules/kasir/KasirModule";
import { MasterBroadcastModule } from "./modules/master-broadcast/MasterBroadcastModule";
import { PengaturanModule } from "./modules/pengaturan/PengaturanModule";
import { FollowUpModule } from "./modules/follow-up/FollowUpModule";
import { LaporanModule } from "./modules/laporan/LaporanModule";

import { NavigationProvider, useNavigation } from "./logic/context/NavigationContext";
import { ViewportProvider } from "./logic/context/ViewportContext";

function AppContent() {
  const { activeModule, setActiveModule } = useNavigation();

  return (
    <LayoutWrapper activeModule={activeModule} onNavigate={setActiveModule}>
      {activeModule === "offline" && <PendaftaranOfflineModule />}
      {activeModule === "online" && <PendaftaranOnlineModule />}
      {activeModule === "monitor" && <MonitorAntreanModule />}
      {activeModule === "antrean-pemeriksaan" && <PemeriksaanModule />}
      {activeModule === "loket-obat" && <LoketObatModule />}
      {activeModule === "kasir" && <KasirModule />}
      {activeModule === "follow-up" && <FollowUpModule />}
      {activeModule === "obat" && <ObatModule />}
      {activeModule === "bhp" && <BhpModule />}
      {activeModule === "laporan-keuangan" && (
        <LaporanModule initialDomain="keuangan" onDomainChange={(d) => setActiveModule(`laporan-${d}`)} />
      )}
      {activeModule === "laporan-pasien" && (
        <LaporanModule initialDomain="pasien" onDomainChange={(d) => setActiveModule(`laporan-${d}`)} />
      )}
      {activeModule === "laporan-obat-bhp" && (
        <LaporanModule initialDomain="obat-bhp" onDomainChange={(d) => setActiveModule(`laporan-${d}`)} />
      )}
      {activeModule === "laporan" && (
        <LaporanModule initialDomain="keuangan" onDomainChange={(d) => setActiveModule(`laporan-${d}`)} />
      )}
      {activeModule === "master-kb" && <MasterKbModule />}
      {activeModule === "master-imunisasi" && <MasterImunisasiModule />}
      {activeModule === "master-layanan-lain" && <MasterLayananLainModule />}
      {activeModule === "master-puskesmas" && <MasterPuskesmasModule />}
      {activeModule === "master-harga-dasar" && <MasterHargaDasarModule />}
      {activeModule === "master-broadcast" && <MasterBroadcastModule />}
      {activeModule === "master-user" && <MasterUserModule />}
      {activeModule === "pasien" && <MasterRekamMedisModule />}
      {activeModule === "pengaturan" && <PengaturanModule />}
      {["jadwal"].includes(activeModule) && (
        <div className="flex h-[50vh] items-center justify-center text-gray-500">
          Halaman sedang dalam pengembangan.
        </div>
      )}
    </LayoutWrapper>
  );
}

import { AuthProvider, useAuth } from "./logic/context/AuthContext";
import { LoginModule } from "./modules/auth/LoginModule";

function MainApp() {
  const { user } = useAuth();
  
  if (!user) {
    return <LoginModule />;
  }
  
  return (
    <NavigationProvider initialModule="offline">
      <AppContent />
    </NavigationProvider>
  );
}

export default function App() {
  return (
    <ViewportProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ViewportProvider>
  );
}
