import React, { useState, useEffect } from "react";
import { LaporanKeuanganView } from "./components/LaporanKeuanganView";
import { LaporanPasienView } from "./components/LaporanPasienView";
import { LaporanObatBhpView } from "./components/LaporanObatBhpView";
import { DollarSign, Users, Pill } from "lucide-react";
import { tokens } from "../../ui/styles/tokens";
import { cn } from "../../logic/utils/cn";

export type LaporanDomain = "keuangan" | "pasien" | "obat-bhp";

interface LaporanModuleProps {
  initialDomain?: LaporanDomain;
  onDomainChange?: (domain: LaporanDomain) => void;
}

export function LaporanModule({ initialDomain = "keuangan", onDomainChange }: LaporanModuleProps) {
  const [activeDomain, setActiveDomain] = useState<LaporanDomain>(initialDomain);

  useEffect(() => {
    setActiveDomain(initialDomain);
  }, [initialDomain]);

  const handleDomainSelect = (domain: LaporanDomain) => {
    setActiveDomain(domain);
    if (onDomainChange) {
      onDomainChange(domain);
    }
  };

  return (
    <div className="space-y-[1.5rem]">
      {/* Header */}
      <div className="flex flex-col gap-[0.5rem] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={cn(tokens.typography.h1, "text-gray-900 font-bold")}>
            Modul Laporan
          </h1>
          <p className="text-sm text-gray-500">
            Laporan analitis domain Keuangan, Data Pasien, serta Stok Obat & BHP.
          </p>
        </div>
      </div>

      {/* Domain Navigation Sub-Header Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-[1.5rem]" aria-label="Domains">
          {[
            {
              id: "keuangan",
              name: "Laporan Keuangan",
              icon: DollarSign,
              description: "Pendapatan, Piutang, & Metode Pembayaran",
            },
            {
              id: "pasien",
              name: "Laporan Data Pasien",
              icon: Users,
              description: "Kunjungan, Demografi, & Rekam Medis",
            },
            {
              id: "obat-bhp",
              name: "Laporan Obat & BHP",
              icon: Pill,
              description: "Stok Berjalan, Margin & Jurnal Inventaris",
            },
          ].map((domain) => {
            const Icon = domain.icon;
            const isActive = activeDomain === domain.id;
            return (
              <button
                key={domain.id}
                onClick={() => handleDomainSelect(domain.id as LaporanDomain)}
                className={cn(
                  "flex items-center gap-[0.5rem] whitespace-nowrap border-b-2 py-[0.875rem] px-[0.25rem] text-sm font-semibold transition-colors",
                  isActive
                    ? "border-purple-700 text-purple-700"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                )}
              >
                <Icon className={cn("h-[1.125rem] w-[1.125rem]", isActive ? "text-purple-700" : "text-gray-400")} />
                <span>{domain.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Active Domain View Content */}
      <div className="pt-[0.5rem]">
        {activeDomain === "keuangan" && <LaporanKeuanganView />}
        {activeDomain === "pasien" && <LaporanPasienView />}
        {activeDomain === "obat-bhp" && <LaporanObatBhpView />}
      </div>
    </div>
  );
}
