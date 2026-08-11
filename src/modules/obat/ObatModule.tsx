import { useState } from "react";
import { tokens } from "../../ui/styles/tokens";
import { cn } from "../../logic/utils/cn";
import { ObatMasukTable } from "./components/ObatMasukTable";
import { ObatKeluarTable } from "./components/ObatKeluarTable";
import { StokBerjalanTable } from "./components/StokBerjalanTable";
import { useManajemenObat } from "../../logic/hooks/useManajemenObat.js";

type Tab = "stok-berjalan" | "obat-masuk" | "obat-keluar";

export function ObatModule() {
  const [activeTab, setActiveTab] = useState<Tab>("stok-berjalan");
  const {
    stokBerjalan,
    setStokBerjalan,
    obatMasuk,
    setObatMasuk,
    obatKeluar,
    setObatKeluar,
    addObatMasuk,
    addObatKeluar,
    deleteObat,
  } = useManajemenObat();

  return (
    <div className="space-y-[2rem]">
      <div className="flex flex-col gap-[1rem] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className={cn(tokens.typography.h1, tokens.colors.text.base, "mb-[0.25rem]")}>
            Manajemen Obat
          </h2>
          <p className={tokens.colors.text.muted}>
            Kelola stok obat masuk, obat keluar, dan perbaikan stok.
          </p>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-[2rem]" aria-label="Tabs">
          {[
            { id: "stok-berjalan", name: "Stok Berjalan" },
            { id: "obat-masuk", name: "Obat Masuk" },
            { id: "obat-keluar", name: "Obat Keluar" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={cn(
                "whitespace-nowrap border-b-2 py-[1rem] px-[0.25rem] text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-purple-700 text-purple-700"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              )}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {activeTab === "stok-berjalan" && <StokBerjalanTable data={stokBerjalan} setData={setStokBerjalan} onDelete={deleteObat} />}
        {activeTab === "obat-masuk" && <ObatMasukTable data={obatMasuk} setData={setObatMasuk} stokBerjalan={stokBerjalan} setStokBerjalan={setStokBerjalan} onAddEntry={addObatMasuk} />}
        {activeTab === "obat-keluar" && <ObatKeluarTable data={obatKeluar} setData={setObatKeluar} stokBerjalan={stokBerjalan} setStokBerjalan={setStokBerjalan} onAddEntry={addObatKeluar} />}
      </div>
    </div>
  );
}
