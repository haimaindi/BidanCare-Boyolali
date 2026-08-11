import { useState } from "react";
import { PendaftaranForm } from "./components/PendaftaranForm";
import { AntreanTable } from "./components/AntreanTable";
import { BookingOnlineTable } from "./components/BookingOnlineTable";
import { MenungguCheckInTable } from "./components/MenungguCheckInTable";
import { RiwayatKunjunganTable } from "./components/RiwayatKunjunganTable";
import { tokens } from "../../ui/styles/tokens";
import { cn } from "../../logic/utils/cn";
import { Button } from "../../ui/components/elements/Button";
import { Plus, History, Globe, Clock, ArrowLeft } from "lucide-react";
import { usePendaftaran } from "../../logic/hooks/usePendaftaran";

export function PendaftaranOfflineModule() {
  const [view, setView] = useState<"table" | "form" | "booking" | "checkin" | "riwayat">("table");
  const [formSource, setFormSource] = useState<"table" | "booking">("table");
  const [editingAntrean, setEditingAntrean] = useState<any | null>(null);

  const { items: allItems } = usePendaftaran({ statusFilter: 'All' });

  const onlineCount = allItems.filter(i => i.sumberPendaftaran === 'Online' && i.status !== 'Batal').length;
  const checkInCount = allItems.filter(i => i.status === 'Menunggu Check-In').length;

  const getTitle = () => {
    switch (view) {
      case "table": return "Daftar Antrean";
      case "form": return editingAntrean ? "Edit Pendaftaran Pasien" : "Pendaftaran Pasien Baru";
      case "booking": return "Daftar Booking Online";
      case "checkin": return "Menunggu Check-In";
      case "riwayat": return "Riwayat Kunjungan";
    }
  };

  const getSubtitle = () => {
    switch (view) {
      case "table": return "Kelola antrean dan pendaftaran pasien.";
      case "form": return editingAntrean ? "Perbarui data pendaftaran pasien." : "Isi form pendaftaran pasien dengan lengkap.";
      case "booking": return "Data pasien yang mendaftar online dan perlu diverifikasi.";
      case "checkin": return "Daftar pasien online yang belum check-in.";
      case "riwayat": return "Daftar riwayat kunjungan pasien sebelumnya.";
    }
  };

  const handleBack = () => {
    if (view === "form" && formSource === "booking") {
      setView("booking");
      setFormSource("table");
    } else {
      setView("table");
      setEditingAntrean(null);
    }
  };

  const handleEdit = (item: any) => {
    setEditingAntrean(item);
    setView("form");
  };

  const handleProcessBooking = (item?: any) => {
    setFormSource("booking");
    if (item) {
      setEditingAntrean({
        nik: item.nik,
        namaPasien: item.nama,
        jenisPanggilan: item.panggilan || "Ny.",
        jenisLayanan: item.jenisLayanan,
        jenisPasien: "Lama",
        noRm: item.noRm,
        alamat: item.alamat,
        noWhatsapp: item.noWhatsapp,
      });
    }
    setView("form");
  };

  return (
    <div className="space-y-[2rem]">
      <div className="flex flex-col gap-[1rem] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-[1rem]">
          {view !== "table" && (
            <button 
              onClick={handleBack}
              className="flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-[1.25rem] w-[1.25rem]" />
            </button>
          )}
          <div>
            <h2 className={cn(tokens.typography.h1, tokens.colors.text.base, "mb-[0.25rem]")}>
              {getTitle()}
            </h2>
            <p className={tokens.colors.text.muted}>
              {getSubtitle()}
            </p>
          </div>
        </div>
        
        {view === "table" && (
          <div className="flex flex-wrap items-center gap-[0.75rem]">
            <Button variant="outline" className="gap-[0.5rem]" onClick={() => setView("riwayat")}>
              <History className="h-[1.25rem] w-[1.25rem]" />
              Riwayat
            </Button>
            <Button variant="outline" className="gap-[0.5rem] relative" onClick={() => setView("booking")}>
              <Globe className="h-[1.25rem] w-[1.25rem]" />
              Booking Online
              {onlineCount > 0 && (
                <span className="absolute -top-[0.5rem] -right-[0.5rem] flex h-[1.25rem] w-[1.25rem] items-center justify-center rounded-full bg-rose-500 text-[0.625rem] font-bold text-white shadow-sm ring-2 ring-white">
                  {onlineCount}
                </span>
              )}
            </Button>
            <Button variant="outline" className="gap-[0.5rem] relative" onClick={() => setView("checkin")}>
              <Clock className="h-[1.25rem] w-[1.25rem]" />
              Menunggu Check-In
              {checkInCount > 0 && (
                <span className="absolute -top-[0.5rem] -right-[0.5rem] flex h-[1.25rem] w-[1.25rem] items-center justify-center rounded-full bg-amber-500 text-[0.625rem] font-bold text-white shadow-sm ring-2 ring-white">
                  {checkInCount}
                </span>
              )}
            </Button>
            <Button variant="primary" className="gap-[0.5rem]" onClick={() => { setFormSource("table"); setEditingAntrean(null); setView("form"); }}>
              <Plus className="h-[1.25rem] w-[1.25rem]" />
              Tambah
            </Button>
          </div>
        )}
      </div>

      <div>
        {view === "table" && <AntreanTable onEdit={handleEdit} />}
        {view === "form" && <PendaftaranForm onCancel={handleBack} initialData={editingAntrean} />}
        {view === "booking" && <BookingOnlineTable onProcess={handleProcessBooking} />}
        {view === "checkin" && <MenungguCheckInTable />}
        {view === "riwayat" && <RiwayatKunjunganTable />}
      </div>
    </div>
  );
}
