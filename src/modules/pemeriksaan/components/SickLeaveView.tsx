import { useState, useEffect, useMemo } from "react";
import { AntreanPemeriksaan } from "../types";
import { Button } from "../../../ui/components/elements/Button";
import { Input } from "../../../ui/components/elements/Input";
import { FormGroup } from "../../../ui/components/common/FormGroup";
import { Printer, ArrowLeft, FileText, Hash, Calendar } from "lucide-react";
import { dummyPatients } from "../../master-rekam-medis/data/dummy";

interface SickLeaveViewProps {
  patient: AntreanPemeriksaan;
  onBack: () => void;
}

export function SickLeaveView({ patient, onBack }: SickLeaveViewProps) {
  // Find full patient data for address/occupation
  const fullPatientData = useMemo(() => {
    return dummyPatients.find(p => p.noRm === patient.noRm);
  }, [patient.noRm]);

  // Auto-generate No Surat
  const generateNoSurat = () => {
    const d = new Date();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    return `${random}/SKS/${romanMonths[month - 1]}/${year}`;
  };

  const [noSurat, setNoSurat] = useState(generateNoSurat());
  const [tanggalAwal, setTanggalAwal] = useState(new Date().toISOString().split("T")[0]);
  const [tanggalAkhir, setTanggalAkhir] = useState("");
  const [lamaHari, setLamaHari] = useState("1");
  const [pekerjaan, setPekerjaan] = useState(fullPatientData?.pekerjaan || "");
  const [alamat, setAlamat] = useState(fullPatientData?.alamat || "");

  const todayStr = useMemo(() => {
    const d = new Date();
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }, []);

  const formatShortDate = (dateStr: string) => {
    if (!dateStr) return "...";
    const d = new Date(dateStr);
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  // Auto-calculate lamaHari when dates change
  useEffect(() => {
    if (tanggalAwal && tanggalAkhir) {
      const start = new Date(tanggalAwal);
      const end = new Date(tanggalAkhir);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays > 0) {
        setLamaHari(diffDays.toString());
      }
    }
  }, [tanggalAwal, tanggalAkhir]);

  // Auto-calculate tanggalAkhir when lamaHari changes
  const handleLamaHariChange = (val: string) => {
    setLamaHari(val);
    const days = parseInt(val);
    if (!isNaN(days) && tanggalAwal) {
      const start = new Date(tanggalAwal);
      const end = new Date(start);
      end.setDate(start.getDate() + (days - 1));
      setTanggalAkhir(end.toISOString().split("T")[0]);
    }
  };

  const handlePrint = async () => {
    try {
      const { saveSuratSakit } = await import('../../../logic/services/suratService.js');
      await saveSuratSakit({
        id: noSurat,
        pemeriksaanId: patient.id,
        patientName: patient.nama,
        patientAge: patient.usia,
        patientJob: pekerjaan,
        patientAddress: alamat,
        startDate: tanggalAwal,
        endDate: tanggalAkhir,
        durationDays: parseInt(lamaHari) || 1,
        doctorName: "Analia Dyah Setyawati, S.Keb.bdn"
      });
    } catch (e) {}
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 -m-[1.5rem] p-[1.5rem] min-h-[calc(100vh-4rem)]">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-[2rem] print:hidden">
        <div className="flex items-center gap-[1.5rem]">
          <Button variant="ghost" onClick={onBack} className="gap-[0.5rem]">
            <ArrowLeft className="h-[1.25rem] w-[1.25rem]" />
            Kembali ke Pemeriksaan
          </Button>
          <div className="h-[2rem] w-[1px] bg-gray-300" />
          <div>
            <h1 className="text-[1.25rem] font-bold text-gray-900">Surat Keterangan Sakit</h1>
            <p className="text-[0.875rem] text-gray-500">Buat dan cetak surat izin istirahat pasien.</p>
          </div>
        </div>
        <Button variant="primary" onClick={handlePrint} className="gap-[0.5rem] h-[3rem] px-[1.5rem]">
          <Printer className="h-[1.25rem] w-[1.25rem]" />
          Cetak Surat (PDF)
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-[2rem] flex-1">
        {/* Editor Side */}
        <div className="xl:col-span-4 space-y-[1.5rem] print:hidden">
          <div className="bg-white p-[1.5rem] rounded-xl border border-gray-200 shadow-sm space-y-[1.5rem]">
            <h3 className="text-[1rem] font-bold text-gray-900 flex items-center gap-[0.5rem]">
              <FileText className="h-[1.25rem] w-[1.25rem] text-purple-600" />
              Editor Surat
            </h3>

            <FormGroup id="noSurat" label="No Surat">
              <div className="relative">
                <Hash className="absolute left-[0.75rem] top-1/2 -translate-y-1/2 h-[1rem] w-[1rem] text-gray-400" />
                <Input 
                  className="pl-[2.25rem]" 
                  value={noSurat} 
                  onChange={(e) => setNoSurat(e.target.value)} 
                />
              </div>
            </FormGroup>

            <div className="grid grid-cols-2 gap-[1rem]">
              <FormGroup id="tglAwal" label="Tanggal Mulai">
                <Input 
                  type="date" 
                  value={tanggalAwal} 
                  onChange={(e) => setTanggalAwal(e.target.value)} 
                />
              </FormGroup>
              <FormGroup id="lamaHari" label="Lama (Hari)">
                <Input 
                  type="number" 
                  min="1" 
                  value={lamaHari} 
                  onChange={(e) => handleLamaHariChange(e.target.value)} 
                />
              </FormGroup>
            </div>

            <FormGroup id="tglAkhir" label="Hingga Tanggal">
              <Input 
                type="date" 
                value={tanggalAkhir} 
                onChange={(e) => setTanggalAkhir(e.target.value)} 
              />
            </FormGroup>

            <FormGroup id="pekerjaan" label="Pekerjaan Pasien">
              <Input 
                placeholder="Pekerjaan..." 
                value={pekerjaan} 
                onChange={(e) => setPekerjaan(e.target.value)} 
              />
            </FormGroup>

            <FormGroup id="alamat" label="Alamat Pasien">
              <Input 
                placeholder="Alamat lengkap..." 
                value={alamat} 
                onChange={(e) => setAlamat(e.target.value)} 
              />
            </FormGroup>

            <div className="pt-[1rem] border-t border-gray-100">
              <p className="text-[0.75rem] text-gray-500 italic leading-relaxed">
                * Data identitas nama, umur, dan jenis kelamin diambil otomatis dari rekam medis pasien.
              </p>
            </div>
          </div>
        </div>

        {/* Preview Side */}
        <div className="xl:col-span-8 flex flex-col">
          <div className="bg-white border border-gray-200 shadow-lg rounded-sm p-[3rem] min-h-[50rem] flex flex-col font-serif text-[#000] mx-auto w-full max-w-[21cm] certificate-view-area">
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                body * { visibility: hidden; }
                .certificate-view-area, .certificate-view-area * { visibility: visible; }
                .certificate-view-area {
                  position: fixed;
                  left: 0;
                  top: 0;
                  width: 21cm;
                  height: 29.7cm;
                  margin: 0;
                  padding: 2cm;
                  border: none;
                  box-shadow: none;
                  visibility: visible !important;
                }
                @page { size: A4; margin: 0; }
              }
            `}} />

            {/* Header Content */}
            <div className="relative mb-[2rem] border-b-[6px] border-double border-black pb-[1.5rem]">
              <div className="absolute left-0 top-0 w-[5rem] h-[5rem] flex items-center justify-center">
                <img src="/Logo TPMB.png" alt="Logo TPMB" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <div className="absolute right-0 top-0 w-[5rem] h-[5rem] flex items-center justify-center">
                <img src="/Logo Bidan Delima.png" alt="Logo Bidan Delima" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              
              <div className="text-center px-[6rem]">
                <h2 className="text-[1.5rem] font-bold uppercase leading-tight">Praktek Mandiri Bidan</h2>
                <h1 className="text-[1.75rem] font-black leading-tight mb-[0.25rem]">Analia Dyah setyawati, S.Keb.bdn</h1>
                <p className="text-[1rem] font-bold">No. SIPB: 503.5/00706/SIPBM/4.14/III/2022</p>
                <p className="text-[1rem]">Sukorejo 2/3 Sukorame, Musuk, Boyolali</p>
              </div>
            </div>

            {/* Title Section */}
            <div className="text-center mb-[3rem]">
              <h3 className="text-[1.25rem] font-bold uppercase underline tracking-[0.1em] mb-[0.5rem]">SURAT KETERANGAN SAKIT / ISTIRAHAT</h3>
              <p className="text-[1.125rem] font-medium">No : {noSurat || "..................................................."}</p>
            </div>

            {/* Body Section */}
            <div className="space-y-[2rem] text-[1.125rem] leading-[2]">
              <p>Yang bertanda tangan dibawah ini menerangkan bahwa :</p>
              
              <div className="grid grid-cols-[10rem_1rem_1fr] gap-y-[1rem]">
                <div className="font-bold">Nama</div>
                <div>:</div>
                <div className="font-bold uppercase tracking-wide">{patient.nama}</div>

                <div className="font-bold">Umur</div>
                <div>:</div>
                <div className="flex items-center justify-between pr-[4rem]">
                  <span>{patient.usia}</span>
                  <div className="flex items-center gap-[1rem]">
                    <span className="font-bold">Jenis Kelamin</span>
                    <span>: {patient.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}</span>
                  </div>
                </div>

                <div className="font-bold">Pekerjaan</div>
                <div>:</div>
                <div>{pekerjaan || "..................................................."}</div>

                <div className="font-bold">Alamat</div>
                <div>:</div>
                <div>{alamat || "..................................................."}</div>
              </div>

              <div className="mt-[3rem] text-justify">
                <p>
                  Berhubungan dengan kesehatan badannya yang bersangkutan perlu diberikan istirahat selama{" "}
                  <span className="font-bold underline px-[0.5rem]">{lamaHari || "..."}</span> hari, 
                  dari tanggal <span className="font-bold px-[0.5rem]">{formatShortDate(tanggalAwal)}</span>{" "}
                  s/d <span className="font-bold px-[0.5rem]">{formatShortDate(tanggalAkhir) || "...................."}</span>
                </p>
              </div>

              <p className="mt-[2rem]">Harap yang berkepentingan maklum, Terima Kasih.</p>
            </div>

            {/* Footer Section */}
            <div className="mt-auto flex flex-col items-end pt-[4rem]">
              <div className="text-center w-[18rem]">
                <p className="mb-[1rem]">Boyolali, {todayStr}</p>
                <p className="font-bold mb-[7rem]">Bidan</p>
                
                <p className="font-bold underline text-[1.125rem]">Analia Dyah Setyawati, S.Keb.bdn</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
