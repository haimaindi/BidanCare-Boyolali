import { useState } from "react";
import { tokens } from "../../ui/styles/tokens";
import { cn } from "../../logic/utils/cn";
import { BhpMasukTable } from "./components/BhpMasukTable";
import { BhpKeluarTable } from "./components/BhpKeluarTable";
import { StokBerjalanBhpTable } from "./components/StokBerjalanBhpTable";
import { useManajemenBhp } from "../../logic/hooks/useManajemenBhp.js";

type Tab = "stok-berjalan" | "bhp-masuk" | "bhp-keluar";

export function BhpModule() {
  const [activeTab, setActiveTab] = useState<Tab>("stok-berjalan");
  const {
    stokBerjalan,
    setStokBerjalan,
    bhpMasuk,
    setBhpMasuk,
    bhpKeluar,
    setBhpKeluar,
    addBhpMasuk,
    addBhpKeluar,
    deleteBhp,
  } = useManajemenBhp();

  return (
    <div className="space-y-[2rem]">
      <div className="flex flex-col gap-[1rem] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className={cn(tokens.typography.h1, tokens.colors.text.base, "mb-[0.25rem]")}>
            Manajemen BHP
          </h2>
          <p className={tokens.colors.text.muted}>
            Kelola stok bahan habis pakai (BHP) masuk, keluar, dan perbaikan stok.
          </p>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-[2rem]" aria-label="Tabs">
          {[
            { id: "stok-berjalan", name: "Stok Berjalan" },
            { id: "bhp-masuk", name: "BHP Masuk" },
            { id: "bhp-keluar", name: "BHP Keluar" },
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
        {activeTab === "stok-berjalan" && <StokBerjalanBhpTable data={stokBerjalan} setData={setStokBerjalan} onDelete={deleteBhp} />}
        {activeTab === "bhp-masuk" && <BhpMasukTable data={bhpMasuk} setData={setBhpMasuk} stokBerjalan={stokBerjalan} setStokBerjalan={setStokBerjalan} onAddEntry={addBhpMasuk} />}
        {activeTab === "bhp-keluar" && <BhpKeluarTable data={bhpKeluar} setData={setBhpKeluar} stokBerjalan={stokBerjalan} setStokBerjalan={setStokBerjalan} onAddEntry={addBhpKeluar} />}
      </div>
    </div>
  );
}
