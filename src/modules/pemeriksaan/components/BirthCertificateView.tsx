import { useState, useEffect, useMemo } from "react";
import { AntreanPemeriksaan } from "../types";
import { Button } from "../../../ui/components/elements/Button";
import { Input } from "../../../ui/components/elements/Input";
import { FormGroup } from "../../../ui/components/common/FormGroup";
import { Printer, ArrowLeft, FileText, Hash, Clock, User, Users } from "lucide-react";
import { dummyPatients } from "../../master-rekam-medis/data/dummy";

interface BirthCertificateViewProps {
  patient: AntreanPemeriksaan;
  onBack: () => void;
}

export function BirthCertificateView({ patient, onBack }: BirthCertificateViewProps) {
  const fullPatientData = useMemo(() => {
    return dummyPatients.find(p => p.noRm === patient.noRm);
  }, [patient.noRm]);

  const generateNoSurat = () => {
    const d = new Date();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    return `${random}/SKL/${romanMonths[month - 1]}/${year}`;
  };

  const [noSurat, setNoSurat] = useState(generateNoSurat());
  const [hari, setHari] = useState(() => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return days[new Date().getDay()];
  });
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [pukul, setPukul] = useState("00:00");
  
  const [namaBayi, setNamaBayi] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("Perempuan");
  const [jenisKelahiran, setJenisKelahiran] = useState("Tunggal");
  const [kelahiranKe, setKelahiranKe] = useState("1");
  const [beratLahir, setBeratLahir] = useState("3000");
  const [panjangBadan, setPanjangBadan] = useState("50");

  const [namaIbu, setNamaIbu] = useState(fullPatientData?.nama || "");
  const [umurIbu, setUmurIbu] = useState(fullPatientData?.usia?.split(" ")[0] || "");
  const [pekerjaanIbu, setPekerjaanIbu] = useState(fullPatientData?.pekerjaan || "");
  const [nikIbu, setNikIbu] = useState(fullPatientData?.nik || "");

  const [namaAyah, setNamaAyah] = useState("");
  const [umurAyah, setUmurAyah] = useState("");
  const [pekerjaanAyah, setPekerjaanAyah] = useState("");
  const [nikAyah, setNikAyah] = useState("");

  const [alamat, setAlamat] = useState(fullPatientData?.alamat || "");
  const [kecamatan, setKecamatan] = useState("Musuk");
  const [kabupatenKota, setKabupatenKota] = useState("Boyolali");

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

  const handlePrint = async () => {
    try {
      const { saveSuratKeteranganLahir } = await import('../../../logic/services/suratService.js');
      await saveSuratKeteranganLahir({
        id: noSurat,
        pemeriksaanId: patient.id,
        motherName: namaIbu,
        motherAge: umurIbu,
        motherJob: pekerjaanIbu,
        motherAddress: alamat,
        fatherName: namaAyah,
        fatherAge: umurAyah,
        fatherJob: pekerjaanAyah,
        babyName: namaBayi,
        babyGender: jenisKelamin,
        babyWeight: parseFloat(beratLahir) || 0,
        babyLength: parseFloat(panjangBadan) || 0,
        birthDate: tanggal,
        birthTime: pukul,
        birthType: jenisKelahiran,
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
            <h1 className="text-[1.25rem] font-bold text-gray-900">Surat Keterangan Lahir</h1>
            <p className="text-[0.875rem] text-gray-500">Buat dan cetak surat keterangan lahir bayi.</p>
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
          <div className="bg-white p-[1.5rem] rounded-xl border border-gray-200 shadow-sm space-y-[1.5rem] h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar">
            <h3 className="text-[1rem] font-bold text-gray-900 flex items-center gap-[0.5rem]">
              <FileText className="h-[1.25rem] w-[1.25rem] text-purple-600" />
              Editor Surat Lahir
            </h3>

            <FormGroup id="noSurat" label="No Surat">
              <Input value={noSurat} onChange={(e) => setNoSurat(e.target.value)} />
            </FormGroup>

            <div className="grid grid-cols-2 gap-[1rem]">
              <FormGroup id="hari" label="Hari">
                <Input value={hari} onChange={(e) => setHari(e.target.value)} />
              </FormGroup>
              <FormGroup id="tanggal" label="Tanggal">
                <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
              </FormGroup>
            </div>

            <FormGroup id="pukul" label="Pukul (WIB)">
              <Input type="time" value={pukul} onChange={(e) => setPukul(e.target.value)} />
            </FormGroup>

            <div className="h-[1px] bg-gray-100 my-[0.5rem]" />
            <h4 className="text-[0.875rem] font-bold text-gray-700 uppercase tracking-wider">Data Bayi</h4>
            
            <FormGroup id="namaBayi" label="Nama Bayi">
              <Input placeholder="Diberi nama..." value={namaBayi} onChange={(e) => setNamaBayi(e.target.value)} />
            </FormGroup>

            <div className="grid grid-cols-2 gap-[1rem]">
              <FormGroup id="jk" label="Jenis Kelamin">
                <Input value={jenisKelamin} onChange={(e) => setJenisKelamin(e.target.value)} />
              </FormGroup>
              <FormGroup id="jenisKelahiran" label="Jenis Kelahiran">
                <Input value={jenisKelahiran} onChange={(e) => setJenisKelahiran(e.target.value)} />
              </FormGroup>
            </div>

            <div className="grid grid-cols-3 gap-[1rem]">
              <FormGroup id="kelKe" label="Kelahiran Ke">
                <Input type="number" value={kelahiranKe} onChange={(e) => setKelahiranKe(e.target.value)} />
              </FormGroup>
              <FormGroup id="berat" label="Berat (gr)">
                <Input type="number" value={beratLahir} onChange={(e) => setBeratLahir(e.target.value)} />
              </FormGroup>
              <FormGroup id="panjang" label="Panjang (cm)">
                <Input type="number" value={panjangBadan} onChange={(e) => setPanjangBadan(e.target.value)} />
              </FormGroup>
            </div>

            <div className="h-[1px] bg-gray-100 my-[0.5rem]" />
            <h4 className="text-[0.875rem] font-bold text-gray-700 uppercase tracking-wider">Identitas Orang Tua</h4>
            
            <div className="space-y-[1rem] p-[1rem] bg-purple-50 rounded-lg">
              <FormGroup id="namaIbu" label="Nama Ibu">
                <Input value={namaIbu} onChange={(e) => setNamaIbu(e.target.value)} />
              </FormGroup>
              <div className="grid grid-cols-2 gap-[1rem]">
                <FormGroup id="umurIbu" label="Umur Ibu">
                  <Input value={umurIbu} onChange={(e) => setUmurIbu(e.target.value)} />
                </FormGroup>
                <FormGroup id="nikIbu" label="NIK Ibu">
                  <Input value={nikIbu} onChange={(e) => setNikIbu(e.target.value)} />
                </FormGroup>
              </div>
              <FormGroup id="pekIbu" label="Pekerjaan Ibu">
                <Input value={pekerjaanIbu} onChange={(e) => setPekerjaanIbu(e.target.value)} />
              </FormGroup>
            </div>

            <div className="space-y-[1rem] p-[1rem] bg-blue-50 rounded-lg">
              <FormGroup id="namaAyah" label="Nama Ayah">
                <Input value={namaAyah} onChange={(e) => setNamaAyah(e.target.value)} />
              </FormGroup>
              <div className="grid grid-cols-2 gap-[1rem]">
                <FormGroup id="umurAyah" label="Umur Ayah">
                  <Input value={umurAyah} onChange={(e) => setUmurAyah(e.target.value)} />
                </FormGroup>
                <FormGroup id="nikAyah" label="NIK Ayah">
                  <Input value={nikAyah} onChange={(e) => setNikAyah(e.target.value)} />
                </FormGroup>
              </div>
              <FormGroup id="pekAyah" label="Pekerjaan Ayah">
                <Input value={pekerjaanAyah} onChange={(e) => setPekerjaanAyah(e.target.value)} />
              </FormGroup>
            </div>

            <div className="h-[1px] bg-gray-100 my-[0.5rem]" />
            <h4 className="text-[0.875rem] font-bold text-gray-700 uppercase tracking-wider">Alamat</h4>
            
            <FormGroup id="alamat" label="Alamat">
              <Input value={alamat} onChange={(e) => setAlamat(e.target.value)} />
            </FormGroup>
            <div className="grid grid-cols-2 gap-[1rem]">
              <FormGroup id="kec" label="Kecamatan">
                <Input value={kecamatan} onChange={(e) => setKecamatan(e.target.value)} />
              </FormGroup>
              <FormGroup id="kab" label="Kab/Kota">
                <Input value={kabupatenKota} onChange={(e) => setKabupatenKota(e.target.value)} />
              </FormGroup>
            </div>
          </div>
        </div>

        {/* Preview Side */}
        <div className="xl:col-span-8 flex flex-col">
          <div className="bg-white border border-gray-200 shadow-lg rounded-sm p-[2.5rem] min-h-[50rem] flex flex-col font-serif text-[#000] mx-auto w-full max-w-[21cm] birth-certificate-area">
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                body * { visibility: hidden; }
                .birth-certificate-area, .birth-certificate-area * { visibility: visible; }
                .birth-certificate-area {
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
              <h3 className="text-[1.25rem] font-bold uppercase underline tracking-[0.1em] mb-[0.25rem]">KETERANGAN LAHIR</h3>
              <p className="text-[1rem] font-medium">No. : {noSurat || "..................................................."}</p>
            </div>

            {/* Body Section */}
            <div className="text-[1rem] leading-[1.6] space-y-[1rem]">
              <p>
                Yang bertanda tangan di bawah ini menerangkan bahwa pada hari ini{" "}
                <span className="font-bold underline px-[0.25rem]">{hari}</span>, tanggal{" "}
                <span className="font-bold underline px-[0.25rem]">{formatShortDate(tanggal)}</span> pukul{" "}
                <span className="font-bold underline px-[0.25rem]">{pukul || "..... : ....."}</span> WIB telah lahir seorang bayi:
              </p>
              
              <div className="grid grid-cols-[10rem_1rem_1fr] gap-y-[0.5rem] pl-[1.5rem]">
                <div className="font-medium">Jenis Kelamin</div>
                <div>:</div>
                <div className="font-bold uppercase underline">{jenisKelamin}</div>

                <div className="font-medium">Jenis Kelahiran</div>
                <div>:</div>
                <div className="font-bold underline">{jenisKelahiran}</div>

                <div className="font-medium">Kelahiran ke</div>
                <div>:</div>
                <div className="font-bold underline">{kelahiranKe}</div>

                <div className="font-medium">Berat Lahir</div>
                <div>:</div>
                <div className="font-bold underline">{beratLahir} gram</div>

                <div className="font-medium">Panjang Badan</div>
                <div>:</div>
                <div className="font-bold underline">{panjangBadan} cm</div>
              </div>

              <p className="font-medium italic">Di Bidan Analia Dyah Setyawati, S.keb.bdn</p>

              <div className="border border-black p-[0.75rem] flex items-center">
                <span className="font-bold mr-[2rem] w-[8rem]">Diberi nama</span>
                <span className="mr-[0.5rem] font-bold">:</span>
                <span className="font-black text-[1.125rem] uppercase tracking-wider">{namaBayi || "................................................................................"}</span>
              </div>

              <div className="space-y-[0.75rem]">
                <p className="font-bold underline uppercase text-[0.875rem]">Identitas Orang Tua:</p>
                
                <div className="grid grid-cols-[8rem_0.5rem_1fr_4rem_0.5rem_4rem_4rem] gap-y-[0.4rem] items-center text-[0.9375rem]">
                  <div className="font-medium">Nama Ibu</div>
                  <div>:</div>
                  <div className="font-bold">{namaIbu}</div>
                  <div className="font-medium">Umur</div>
                  <div>:</div>
                  <div className="font-bold">{umurIbu}</div>
                  <div className="font-medium">Tahun</div>

                  <div className="font-medium">Pekerjaan</div>
                  <div>:</div>
                  <div className="col-span-5 font-bold">{pekerjaanIbu}</div>

                  <div className="font-medium">NIK</div>
                  <div>:</div>
                  <div className="col-span-5 font-bold tracking-widest">{nikIbu}</div>

                  <div className="font-medium">Nama Ayah</div>
                  <div>:</div>
                  <div className="font-bold">{namaAyah}</div>
                  <div className="font-medium">Umur</div>
                  <div>:</div>
                  <div className="font-bold">{umurAyah}</div>
                  <div className="font-medium">Tahun</div>

                  <div className="font-medium">Pekerjaan</div>
                  <div>:</div>
                  <div className="col-span-5 font-bold">{pekerjaanAyah}</div>

                  <div className="font-medium">NIK</div>
                  <div>:</div>
                  <div className="col-span-5 font-bold tracking-widest">{nikAyah}</div>

                  <div className="font-medium">Alamat</div>
                  <div>:</div>
                  <div className="col-span-5 font-bold">{alamat}</div>

                  <div className="font-medium">Kecamatan</div>
                  <div>:</div>
                  <div className="col-span-5 font-bold">{kecamatan}</div>

                  <div className="font-medium">Kab / Kota</div>
                  <div>:</div>
                  <div className="col-span-5 font-bold">{kabupatenKota}</div>
                </div>
              </div>
            </div>

            {/* Footer Section */}
            <div className="mt-auto pt-[2rem]">
              <div className="flex justify-end mb-[0.5rem]">
                <p className="w-[15rem] text-center">Boyolali, {todayStr}</p>
              </div>
              <div className="grid grid-cols-3 text-center text-[0.875rem] font-bold">
                <div>Saksi I</div>
                <div>Saksi II</div>
                <div>Penolong Persalinan</div>
              </div>
              <div className="grid grid-cols-3 text-center mt-[4.5rem]">
                <div className="px-[1rem] border-b border-black border-dotted mx-[1.5rem]">...................................</div>
                <div className="px-[1rem] border-b border-black border-dotted mx-[1.5rem]">...................................</div>
                <div className="px-[1rem] border-b border-black border-dotted mx-[1.5rem]">Analia Dyah Setyawati, S.Keb.bdn</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
