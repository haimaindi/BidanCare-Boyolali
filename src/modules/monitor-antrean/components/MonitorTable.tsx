import { Card, CardContent } from "../../../ui/components/common/Card";
import { Badge } from "../../../ui/components/elements/Badge";
import { usePendaftaran } from "../../../logic/hooks/usePendaftaran.js";

export function MonitorTable() {
  const { items, loading } = usePendaftaran();
  let activeQueue = 1;

  const activeMonitorItems = items.filter(
    (p) => p.status === "Menunggu" || p.status === "Diperiksa"
  );

  const formatDateTimeString = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
    } catch {
      return dateStr;
    }
  };

  const getLayananBadgeClasses = (layanan: string) => {
    if (layanan.includes("AnteNatal")) return "bg-pink-100 text-pink-700";
    if (layanan.includes("Post Natal")) return "bg-purple-100 text-purple-700";
    if (layanan === "Umum") return "bg-blue-100 text-blue-700";
    if (layanan === "KB") return "bg-emerald-100 text-emerald-700";
    if (layanan === "Imunisasi") return "bg-amber-100 text-amber-700";
    if (layanan === "Persalinan") return "bg-rose-100 text-rose-700";
    return "bg-gray-100 text-gray-700";
  };

  const getLayananText = (layanan: string) => {
    if (layanan.includes("AnteNatal")) return "AnteNatal";
    if (layanan.includes("Post Natal")) return "Post Natal";
    return layanan;
  };

  return (
    <Card className="h-full">
      <CardContent className="pt-[1.5rem]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-lg whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-[1rem] px-[1rem] font-medium text-gray-500 text-center">Urutan</th>
                <th className="pb-[1rem] px-[1rem] font-medium text-gray-500 text-center">Jenis Layanan</th>
                <th className="pb-[1rem] px-[1rem] font-medium text-gray-500 text-center">Nama Pasien</th>
                <th className="pb-[1rem] px-[1rem] font-medium text-gray-500 text-center">Jenis Kelamin</th>
                <th className="pb-[1rem] px-[1rem] font-medium text-gray-500 text-center">Waktu Check In</th>
                <th className="pb-[1rem] px-[1rem] font-medium text-gray-500 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeMonitorItems.map((pasien) => {
                const currentQueueNumber = activeQueue++;
                return (
                  <tr key={pasien.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-[1.5rem] px-[1rem] font-medium text-gray-900 text-center">
                      <div className="text-3xl font-bold text-purple-700">{currentQueueNumber}</div>
                      <div className="text-sm text-gray-500 mt-[0.25rem]">{pasien.noAntrean}</div>
                    </td>
                    <td className="py-[1.5rem] px-[1rem] text-center">
                      <span className={`inline-flex items-center rounded-full px-[1rem] py-[0.5rem] text-sm font-semibold ${getLayananBadgeClasses(pasien.jenisLayanan)}`}>
                        {getLayananText(pasien.jenisLayanan)}
                      </span>
                    </td>
                    <td className="py-[1.5rem] px-[1rem] text-center text-gray-900 font-semibold text-xl">{pasien.panggilan} {pasien.nama}</td>
                    <td className="py-[1.5rem] px-[1rem] text-center text-gray-600">{pasien.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}</td>
                    <td className="py-[1.5rem] px-[1rem] text-center text-gray-600">
                      <div className="font-medium text-gray-800">{formatDateTimeString(pasien.waktuRegistrasi)}</div>
                      <div className="mt-[0.5rem]">
                        <Badge variant={pasien.sumberPendaftaran === "Online" ? "success" : "default"} className="px-[0.5rem] py-[0.25rem]">
                          {pasien.sumberPendaftaran}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-[1.5rem] px-[1rem] text-center">
                      <Badge
                        variant={
                          pasien.status === "Diperiksa"
                            ? "warning"
                            : "default"
                        }
                        className="text-sm px-[0.75rem] py-[0.25rem]"
                      >
                        {pasien.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
