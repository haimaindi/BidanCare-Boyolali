import { cn } from "../../../logic/utils/cn";
import { useState, useMemo } from "react";
import { AntreanPemeriksaan } from "../types";
import { Button } from "../../../ui/components/elements/Button";
import { Input } from "../../../ui/components/elements/Input";
import { FormGroup } from "../../../ui/components/common/FormGroup";
import { Printer, ArrowLeft, FileText, CheckSquare, Square, Hash, Check } from "lucide-react";
import { dummyPatients } from "../../master-rekam-medis/data/dummy";

interface LabReferralViewProps {
  patient: AntreanPemeriksaan;
  onBack: () => void;
}

const LAB_TEST_CATEGORIES = [
  {
    name: "HEMATOLOGI",
    tests: ["Darah Lengkap", "LED", "Golongan Darah", "Leukosit", "Hb", "Ht", "Trombosit", "Gambaran Darah Tepi"]
  },
  {
    name: "KIMIA DARAH",
    tests: [
      "HbA1c", "LDL", "SGPT", "Choliresterise", 
      "GDS", "Trigliserid", "Bilirubin Total", "Kalium", 
      "GD 2PP", "Ureum", "Bilirubin Direct", "Natrium", 
      "GDP", "Kreatinin", "Bilirubin Indirect", "Kalsium", 
      "Kolesterol", "SGOT", "Albumin", "Asam Urat", "HDL"
    ]
  },
  {
    name: "IMUNOLOGI",
    tests: ["HbsAg", "HIV", "Sifilis", "HAV", "IgG/IgM dengue", "Reumatoid Factor", "Asto", "IgG/IgM S.Typhi", "Widal Test"]
  },
  {
    name: "PASITOLOGI / MIKROBIOLOGI",
    tests: ["Malaria Mikroskopik", "BTA Sputum", "Rapid Test Malaria", "Pewarnaan Gram"]
  },
  {
    name: "UNRALISA",
    tests: ["Unralisa Lengkap", "Protein Urine", "Tes Kehamilan"]
  },
  {
    name: "FAECES",
    tests: ["Faeces lengkap"]
  },
  {
    name: "RAPID TES COVID",
    tests: ["Antibody", "Antigen"]
  }
];

export function LabReferralView({ patient, onBack }: LabReferralViewProps) {
  const fullPatientData = useMemo(() => {
    return dummyPatients.find(p => p.noRm === patient.noRm);
  }, [patient.noRm]);

  const [noSurat, setNoSurat] = useState(() => {
    const d = new Date();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    return `${random}/SPL/${romanMonths[month - 1]}/${year}`;
  });

  const [pekerjaan, setPekerjaan] = useState(fullPatientData?.pekerjaan || "");
  const [alamat, setAlamat] = useState(fullPatientData?.alamat || "");
  const [selectedTests, setSelectedTests] = useState<string[]>([]);

  const todayStr = useMemo(() => {
    const d = new Date();
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }, []);

  const toggleTest = (test: string) => {
    setSelectedTests(prev => 
      prev.includes(test) ? prev.filter(t => t !== test) : [...prev, test]
    );
  };

  const handlePrint = async () => {
    try {
      const { saveSuratPengantarLab } = await import('../../../logic/services/suratService.js');
      await saveSuratPengantarLab({
        id: noSurat,
        pemeriksaanId: patient.id,
        patientName: patient.nama,
        patientAge: patient.usia,
        patientGender: patient.jenisKelamin,
        patientAddress: alamat,
        clinicalDiagnosis: "", // Add field if needed
        labTests: selectedTests,
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
            <h1 className="text-[1.25rem] font-bold text-gray-900">Surat Pengantar Laboratorium</h1>
            <p className="text-[0.875rem] text-gray-500">Pilih jenis pemeriksaan lab yang diperlukan.</p>
          </div>
        </div>
        <Button variant="primary" onClick={handlePrint} className="gap-[0.5rem] h-[3rem] px-[1.5rem]">
          <Printer className="h-[1.25rem] w-[1.25rem]" />
          Cetak Surat (PDF)
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-[2rem] flex-1">
        {/* Editor Side */}
        <div className="xl:col-span-5 space-y-[1.5rem] print:hidden">
          <div className="bg-white p-[1.5rem] rounded-xl border border-gray-200 shadow-sm space-y-[1.5rem] h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar">
            <h3 className="text-[1rem] font-bold text-gray-900 flex items-center gap-[0.5rem] sticky top-0 bg-white pb-[1rem] z-10 border-b border-gray-100">
              <CheckSquare className="h-[1.25rem] w-[1.25rem] text-purple-600" />
              Pilih Pemeriksaan
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.5rem]">
              <div className="space-y-[1rem]">
                <FormGroup id="noSurat" label="No Surat">
                  <Input value={noSurat} onChange={(e) => setNoSurat(e.target.value)} />
                </FormGroup>
                <FormGroup id="pekerjaan" label="Pekerjaan Pasien">
                  <Input value={pekerjaan} onChange={(e) => setPekerjaan(e.target.value)} />
                </FormGroup>
              </div>
              <div className="space-y-[1rem]">
                <FormGroup id="alamat" label="Alamat Pasien">
                  <Input value={alamat} onChange={(e) => setAlamat(e.target.value)} />
                </FormGroup>
              </div>
            </div>

            <div className="space-y-[2rem] pt-[1rem]">
              {LAB_TEST_CATEGORIES.map((category) => (
                <div key={category.name} className="space-y-[0.75rem]">
                  <h4 className="text-[0.875rem] font-bold text-purple-700 bg-purple-50 px-[0.75rem] py-[0.4rem] rounded-md inline-block">
                    {category.name}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[0.5rem]">
                    {category.tests.map((test) => (
                      <label 
                        key={test} 
                        className="flex items-center gap-[0.75rem] p-[0.75rem] border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                      >
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={selectedTests.includes(test)}
                          onChange={() => toggleTest(test)}
                        />
                        {selectedTests.includes(test) ? (
                          <CheckSquare className="h-[1.25rem] w-[1.25rem] text-purple-600 fill-purple-50" />
                        ) : (
                          <Square className="h-[1.25rem] w-[1.25rem] text-gray-300 group-hover:text-purple-300" />
                        )}
                        <span className={selectedTests.includes(test) ? "text-gray-900 font-medium" : "text-gray-600"}>
                          {test}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Side */}
        <div className="xl:col-span-7 flex flex-col">
          <div className="bg-white border border-gray-200 shadow-lg rounded-sm p-[2.5rem] min-h-[50rem] flex flex-col font-serif text-[#000] mx-auto w-full max-w-[21cm] lab-referral-area">
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                body * { visibility: hidden; }
                .lab-referral-area, .lab-referral-area * { visibility: visible; }
                .lab-referral-area {
                  position: fixed;
                  left: 0;
                  top: 0;
                  width: 21cm;
                  height: 29.7cm;
                  margin: 0;
                  padding: 1.5cm;
                  border: none;
                  box-shadow: none;
                  visibility: visible !important;
                }
                @page { size: A4; margin: 0; }
              }
            `}} />

            {/* Header Content */}
            <div className="relative mb-[1.5rem] border-b-[5px] border-double border-black pb-[1rem]">
              <div className="absolute left-0 top-0 w-[5rem] h-[5rem] flex items-center justify-center">
                <img src="/Logo TPMB.png" alt="Logo TPMB" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <div className="absolute right-0 top-0 w-[5rem] h-[5rem] flex items-center justify-center">
                <img src="/Logo Bidan Delima.png" alt="Logo Bidan Delima" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              
              <div className="text-center px-[6rem]">
                <h2 className="text-[1.25rem] font-bold uppercase leading-tight">Praktek Mandiri Bidan</h2>
                <h1 className="text-[1.5rem] font-black leading-tight mb-[0.25rem]">Analia Dyah setyawati, S.Keb.bdn</h1>
                <p className="text-[0.875rem] font-bold">No. SIPB: 503.5/00706/SIPBM/4.14/III/2022</p>
                <p className="text-[0.875rem]">Sukorejo 2/3 Sukorame, Musuk, Boyolali</p>
              </div>
            </div>

            {/* Title Section */}
            <div className="text-center mb-[1.5rem]">
              <h3 className="text-[1.125rem] font-bold uppercase underline tracking-[0.1em] mb-[0.25rem]">SURAT PENGANTAR LABORATORIUM</h3>
              <p className="text-[0.875rem] font-medium">No. : {noSurat || "..................................................."}</p>
            </div>

            {/* Patient Identity */}
            <div className="text-[1rem] leading-[1.6] space-y-[0.5rem] mb-[1.5rem]">
              <p>Mohon untuk dilakukan pemeriksaan laboraturium kepada pasien :</p>
              <div className="grid grid-cols-[8rem_0.5rem_1fr] gap-x-[1rem]">
                <div className="font-medium">Nama</div>
                <div>:</div>
                <div className="font-bold uppercase">{patient.nama}</div>

                <div className="font-medium">Umur</div>
                <div>:</div>
                <div className="grid grid-cols-[1fr_8rem_0.5rem_1fr]">
                  <div>{patient.usia}</div>
                  <div className="font-medium">Pekerjaan</div>
                  <div>:</div>
                  <div>{pekerjaan || "................."}</div>
                </div>

                <div className="font-medium">Alamat</div>
                <div>:</div>
                <div>{alamat}</div>
              </div>
              <p className="pt-[0.5rem]">Atas kerjasamanya kami mengucapkan banyak terimakasih.</p>
            </div>

            {/* Lab Tests Checklist Table */}
            <div className="border-[1.5px] border-black flex-1 flex flex-col overflow-hidden">
              {LAB_TEST_CATEGORIES.map((category, idx) => (
                <div key={category.name} className={idx !== 0 ? "border-t-[1.5px] border-black" : ""}>
                  <div className="bg-gray-100 border-b border-black px-[0.75rem] py-[0.25rem] font-black text-[0.875rem]">
                    {category.name}
                  </div>
                  <div className="grid grid-cols-2 p-[0.75rem] gap-y-[0.25rem]">
                    {category.tests.map((test) => (
                      <div key={test} className="flex items-center gap-[0.5rem] text-[0.875rem]">
                        <div className={cn("w-[1.25rem] h-[1.25rem] border-[1.5px] border-black flex items-center justify-center flex-shrink-0 transition-all", selectedTests.includes(test) ? "bg-black text-white" : "bg-white")}>
                          {selectedTests.includes(test) && <Check className="w-[1rem] h-[1rem]" strokeWidth={4} />}
                        </div>
                        <span className={selectedTests.includes(test) ? "font-bold" : ""}>{test}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Section */}
            <div className="mt-[1.5rem] flex flex-col items-end">
              <div className="text-center w-[15rem]">
                <p className="mb-[0.5rem]">Boyolali, {todayStr}</p>
                <p className="font-bold mb-[4.5rem]">Bidan</p>
                
                <p className="font-bold underline text-[1rem]">Analia Dyah Setyawati, S.Keb.bdn</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
