import { useState, useEffect } from "react";
import { AntreanPemeriksaanTable } from "./components/AntreanPemeriksaanTable";
import { RiwayatPemeriksaanTable } from "./components/RiwayatPemeriksaanTable";
import { PemeriksaanForm } from "./components/PemeriksaanForm";
import { AntreanPemeriksaan } from "./types";
import { Search, History, ArrowLeft } from "lucide-react";
import { Input } from "../../ui/components/elements/Input";
import { Button } from "../../ui/components/elements/Button";
import { useNavigation } from "../../logic/context/NavigationContext";
import { SickLeaveView } from "./components/SickLeaveView";
import { BirthCertificateView } from "./components/BirthCertificateView";
import { LabReferralView } from "./components/LabReferralView";

export default function PemeriksaanModule() {
  const { activeModule, setActiveModule, pendingPatient, clearPendingPatient, isPemeriksaanReadOnly, returnToModule } = useNavigation();
  
  // Initialize state from pendingPatient to avoid glitch
  const [selectedPatient, setSelectedPatient] = useState<AntreanPemeriksaan | null>(pendingPatient || null);
  const [isReadOnly, setIsReadOnly] = useState(pendingPatient ? isPemeriksaanReadOnly : false);
  const [activeView, setActiveView] = useState<"antrean" | "form" | "sick-leave" | "birth-certificate" | "lab-referral" | "history">(
    pendingPatient ? "form" : "antrean"
  );
  const [originView, setOriginView] = useState<"antrean" | "history">("antrean");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (pendingPatient) {
      clearPendingPatient();
    }
  }, [pendingPatient, clearPendingPatient]);

  const handleBack = () => {
    if (returnToModule) {
      setActiveModule(returnToModule);
    } else {
      setSelectedPatient(null);
      setIsReadOnly(false);
      setActiveView(originView);
    }
  };

  if (activeView === "form" && selectedPatient) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        <PemeriksaanForm 
          patient={selectedPatient} 
          isReadOnly={isReadOnly}
          onBack={handleBack} 
          onSickLeave={() => setActiveView("sick-leave")}
          onBirthCertificate={() => setActiveView("birth-certificate")}
          onLabReferral={() => setActiveView("lab-referral")}
        />
      </div>
    );
  }

  if (activeView === "sick-leave" && selectedPatient) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        <SickLeaveView 
          patient={selectedPatient}
          onBack={() => setActiveView("form")}
        />
      </div>
    );
  }

  if (activeView === "birth-certificate" && selectedPatient) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        <BirthCertificateView 
          patient={selectedPatient}
          onBack={() => setActiveView("form")}
        />
      </div>
    );
  }

  if (activeView === "lab-referral" && selectedPatient) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        <LabReferralView 
          patient={selectedPatient}
          onBack={() => setActiveView("form")}
        />
      </div>
    );
  }

  if (activeView === "history") {
    return (
      <div className="space-y-[1.5rem] animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-[1rem]">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Riwayat Pemeriksaan</h1>
            <p className="text-gray-500">Daftar pemeriksaan yang telah selesai dilakukan.</p>
          </div>
          <div className="flex items-center gap-[1rem]">
            <Button 
              variant="outline" 
              onClick={() => setActiveView("antrean")}
              className="gap-[0.5rem]"
            >
              <ArrowLeft className="h-[1.125rem] w-[1.125rem]" />
              Kembali ke Antrean
            </Button>
            <div className="relative w-full md:w-[20rem]">
              <Search className="absolute left-[0.75rem] top-1/2 -translate-y-1/2 h-[1.125rem] w-[1.125rem] text-gray-400" />
              <Input 
                className="pl-[2.5rem]" 
                placeholder="Cari riwayat..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <RiwayatPemeriksaanTable 
            searchQuery={searchQuery}
            onDetail={(patient) => {
              setSelectedPatient(patient);
              setOriginView("history");
              setIsReadOnly(true);
              setActiveView("form");
            }} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-[1.5rem] animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[1rem]">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Antrian Pemeriksaan</h1>
          <p className="text-gray-500">Kelola antrian pasien yang menunggu pemeriksaan medis.</p>
        </div>
        <div className="flex items-center gap-[1rem]">
          <Button 
            variant="outline" 
            onClick={() => setActiveView("history")}
            className="gap-[0.5rem] border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            <History className="h-[1.125rem] w-[1.125rem]" />
            Riwayat
          </Button>
          <div className="relative w-full md:w-[20rem]">
            <Search className="absolute left-[0.75rem] top-1/2 -translate-y-1/2 h-[1.125rem] w-[1.125rem] text-gray-400" />
            <Input 
              className="pl-[2.5rem]" 
              placeholder="Cari pasien atau No RM..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <AntreanPemeriksaanTable 
          searchQuery={searchQuery}
          onPanggil={(patient) => {
            setSelectedPatient(patient);
            setOriginView("antrean");
            setActiveView("form");
          }} 
        />
      </div>
    </div>
  );
}
