import { useState } from "react";
import { Card } from "../../ui/components/common/Card";
import { Button } from "../../ui/components/elements/Button";
import { Plus, Search, ArrowLeft } from "lucide-react";
import { Input } from "../../ui/components/elements/Input";
import { Patient, VisitLog } from "./types";
import { PatientTable } from "./components/PatientTable";
import { PatientForm } from "./components/PatientForm";
import { PatientDetailView } from "./components/PatientDetailView";
import { PatientVisitLogsView } from "./components/PatientVisitLogsView";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useNavigation } from "../../logic/context/NavigationContext";
import { useMasterRekamMedis } from "../../logic/hooks/useMasterRekamMedis";

const MySwal = withReactContent(Swal);

export function MasterRekamMedisModule() {
  const { jumpToPemeriksaan } = useNavigation();
  const {
    patients,
    loading,
    addPatient,
    editPatient,
    getPatientVisits,
    reload,
  } = useMasterRekamMedis({ strategy: 'full' });

  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<"list" | "detail" | "form" | "visit-logs">("list");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientLogs, setPatientLogs] = useState<VisitLog[]>([]);

  const handleViewLog = (log: VisitLog) => {
    if (!selectedPatient) return;
    
    const patientData = {
      id: selectedPatient.id,
      noAntrean: "LOG-" + log.id,
      nama: selectedPatient.nama,
      panggilan: selectedPatient.panggilan,
      noRm: selectedPatient.noRm,
      jenisLayanan: log.layanan,
      usia: "Unknown",
      status: "Selesai",
      waktuRegistrasi: log.tanggalKunjungan
    };
    
    jumpToPemeriksaan(patientData, true, "pasien");
  };

  const filteredPatients = patients.filter(p => 
    p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.noRm.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nik.includes(searchTerm)
  );

  const handleAddPatient = async (data: Partial<Patient>) => {
    await addPatient(data as Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>);
    setView("list");
    MySwal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Data pasien baru telah didaftarkan.',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleEditPatient = async (data: Partial<Patient>) => {
    if (data.id) {
      await editPatient(data.id, data);
    }
    setView("list");
    setSelectedPatient(null);
    MySwal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Data pasien telah diperbarui.',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleDeletePatient = (id: string) => {
    MySwal.fire({
      title: 'Apakah Anda yakin?',
      text: "Data pasien dan rekam medisnya akan dihapus secara permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await reload();
        setView("list");
        setSelectedPatient(null);
        MySwal.fire(
          'Dihapus!',
          'Data pasien telah berhasil dihapus.',
          'success'
        );
      }
    });
  };

  const handleOpenVisitLogs = async (patient: Patient) => {
    const visits = await getPatientVisits(patient.id);
    setPatientLogs(visits);
    setView("visit-logs");
  };

  // Render List View
  if (view === "list") {
    return (
      <div className="space-y-[1.5rem] animate-in fade-in duration-300">
        <div className="flex flex-col gap-[1rem] md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Master Rekam Medis</h1>
            <p className="text-gray-500">Pusat data pasien dan riwayat kunjungan medis terintegrasi.</p>
          </div>
          <Button onClick={() => { setSelectedPatient(null); setView("form"); }} className="w-full md:w-auto">
            <Plus className="mr-[0.5rem] h-[1rem] w-[1rem]" />
            Daftarkan Pasien Baru
          </Button>
        </div>

        <Card>
          <div className="mb-[1.5rem] flex flex-col gap-[1rem] md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-[0.75rem] top-1/2 h-[1rem] w-[1rem] -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Cari Nama, No. RM, atau NIK..."
                className="pl-[2.5rem]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading && filteredPatients.length === 0 ? (
            <div className="p-[2rem] text-center text-sm text-gray-500">Memuat data rekam medis...</div>
          ) : (
            <PatientTable 
              patients={filteredPatients}
              onView={(p) => { setSelectedPatient(p); setView("detail"); }}
              onEdit={(p) => { setSelectedPatient(p); setView("form"); }}
              onDelete={handleDeletePatient}
            />
          )}
        </Card>
      </div>
    );
  }

  // Render Form View
  if (view === "form") {
    return (
      <div className="space-y-[1.5rem] animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-[1rem]">
          <Button variant="ghost" onClick={() => setView("list")} className="p-2 h-auto">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">
            {selectedPatient ? "Edit Data Pasien" : "Registrasi Pasien Baru"}
          </h1>
        </div>
        
        <Card className="max-w-[80rem] mx-auto p-[2rem]">
          <PatientForm 
            initialData={selectedPatient}
            onSubmit={selectedPatient ? handleEditPatient : handleAddPatient}
            onCancel={() => { setView("list"); setSelectedPatient(null); }}
          />
        </Card>
      </div>
    );
  }

  // Render Detail View
  if (view === "detail" && selectedPatient) {
    return (
      <PatientDetailView 
        patient={selectedPatient}
        onBack={() => { setView("list"); setSelectedPatient(null); }}
        onEdit={(p) => { setSelectedPatient(p); setView("form"); }}
        onDelete={handleDeletePatient}
        onViewLogs={() => handleOpenVisitLogs(selectedPatient)}
      />
    );
  }

  // Render Visit Logs View
  if (view === "visit-logs" && selectedPatient) {
    return (
      <PatientVisitLogsView 
        patient={selectedPatient}
        logs={patientLogs}
        onBack={() => setView("detail")}
        onViewLog={handleViewLog}
      />
    );
  }

  return null;
}
