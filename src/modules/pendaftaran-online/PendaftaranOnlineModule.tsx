import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { Card, CardContent } from "../../ui/components/common/Card";
import { Button } from "../../ui/components/elements/Button";
import { tokens } from "../../ui/styles/tokens";
import { cn } from "../../logic/utils/cn";
import { PendaftaranOnlineForm } from "./components/PendaftaranOnlineForm";

export function PendaftaranOnlineModule() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  return (
    <div className="mx-auto max-w-4xl space-y-[2rem]">
      <div className="text-center">
        <h2 className={cn(tokens.typography.h1, tokens.colors.text.base, "mb-[0.5rem]")}>
          Pendaftaran Mandiri Pasien
        </h2>
        <p className={tokens.colors.text.muted}>
          Silakan isi form di bawah ini dengan lengkap untuk mengambil nomor antrean.
        </p>
      </div>

      {isSubmitted ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-[4rem] text-center">
            <CheckCircle className="mb-[1rem] h-[4rem] w-[4rem] text-emerald-500" />
            <h3 className="mb-[0.5rem] text-xl font-bold text-gray-900">Pendaftaran Berhasil!</h3>
            <p className="mb-[2rem] text-gray-600">
              Silakan datang ke klinik sesuai estimasi waktu dan lakukan check-in kepada petugas pendaftaran.
            </p>
            <div className="mb-[2rem] rounded-lg border-2 border-dashed border-purple-200 bg-purple-50 p-[1.5rem]">
              <p className="text-sm text-gray-500">Nomor Antrean Anda</p>
              <p className="text-4xl font-bold text-purple-700">C-005</p>
              <p className="mt-[0.5rem] text-sm font-medium text-gray-700">Estimasi Kunjungan: Hari ini, 10:30</p>
            </div>
            <Button variant="outline" onClick={() => setIsSubmitted(false)}>Daftar Pasien Lain</Button>
          </CardContent>
        </Card>
      ) : (
        <PendaftaranOnlineForm onSubmitSuccess={() => setIsSubmitted(true)} />
      )}
    </div>
  );
}
