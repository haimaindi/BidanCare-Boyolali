import { Billing } from "../types";
import { tokens } from "../../../ui/styles/tokens";
import { formatDate } from "../../../logic/utils/dateFormatter";

interface InvoicePrintProps {
  billing: Billing;
}

export function InvoicePrint({ billing }: InvoicePrintProps) {
  const date = formatDate(new Date());

  return (
    <div className="p-[2rem] bg-white text-gray-900 font-sans max-w-[21cm] mx-auto border" id="printable-invoice">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-gray-900 pb-[1rem] mb-[2rem]">
        <div className="flex gap-[1rem] items-center">
          <img src="/Logo Bidan Delima.png" alt="Logo" className="w-[4rem] h-[4rem] object-contain" referrerPolicy="no-referrer" />
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wider">TPMB ANALIA BOYOLALI</h1>
            <p className="text-sm text-gray-600">Sukorejo 2/3 Sukorame, Musuk, Boyolali</p>
            <p className="text-sm text-gray-600">No. SIPB: 503.5/00706/SIPBM/4.14/III/2022</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold">No. Invoice: {billing.id}</p>
          <p className="text-sm">Tanggal: {date}</p>
        </div>
      </div>

      {/* Patient Info */}
      <div className="mb-[2rem]">
        <h2 className="text-lg font-bold border-b mb-[0.5rem]">Data Pasien</h2>
        <div className="grid grid-cols-2 gap-[1rem] text-sm">
          <div>
            <span className="text-gray-500">ID Kunjungan:</span>
            <p className="font-medium">{billing.visitId}</p>
          </div>
          <div>
            <span className="text-gray-500">Nama Pasien:</span>
            <p className="font-medium">{billing.patientName}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full mb-[2rem] border-collapse">
        <thead>
          <tr className="bg-gray-100 border-y border-gray-300">
            <th className="py-[0.5rem] px-[1rem] text-left text-sm font-bold uppercase">Deskripsi Layanan</th>
            <th className="py-[0.5rem] px-[1rem] text-right text-sm font-bold uppercase">Jumlah</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          <tr>
            <td className="py-[0.75rem] px-[1rem] text-sm">Biaya Dasar Layanan</td>
            <td className="py-[0.75rem] px-[1rem] text-sm text-right">Rp {billing.baseServiceFee.toLocaleString()}</td>
          </tr>
          <tr>
            <td className="py-[0.75rem] px-[1rem] text-sm">Obat-obatan</td>
            <td className="py-[0.75rem] px-[1rem] text-sm text-right">Rp {billing.medicinePrice.toLocaleString()}</td>
          </tr>
          <tr>
            <td className="py-[0.75rem] px-[1rem] text-sm">Bahan Habis Pakai (BHP)</td>
            <td className="py-[0.75rem] px-[1rem] text-sm text-right">Rp {billing.bhpPrice.toLocaleString()}</td>
          </tr>
          {billing.otherServicePrice > 0 && (
            <tr>
              <td className="py-[0.75rem] px-[1rem] text-sm">Layanan Tambahan</td>
              <td className="py-[0.75rem] px-[1rem] text-sm text-right">Rp {billing.otherServicePrice.toLocaleString()}</td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-900">
            <td className="py-[1rem] px-[1rem] text-lg font-bold">TOTAL TAGIHAN</td>
            <td className="py-[1rem] px-[1rem] text-lg font-bold text-right text-purple-700">Rp {billing.totalBill.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>

      {/* Footer */}
      <div className="grid grid-cols-2 mt-[4rem] text-sm">
        <div className="space-y-[0.5rem]">
          <p className="font-bold underline">Catatan:</p>
          <p className="italic text-gray-500">Terima kasih atas kunjungan Anda. Semoga lekas sembuh.</p>
        </div>
        <div className="text-center ml-auto w-[200px]">
          <p>Petugas Kasir,</p>
          <div className="h-[4rem]"></div>
          <p className="font-bold border-t border-gray-900 pt-[0.25rem]">Bdn. Siti Aminah</p>
        </div>
      </div>

      <style type="text/css" media="print">
        {`
          body * { visibility: hidden; }
          #printable-invoice, #printable-invoice * { visibility: visible; }
          #printable-invoice { position: absolute; left: 0; top: 0; width: 100%; border: none; }
        `}
      </style>
    </div>
  );
}
