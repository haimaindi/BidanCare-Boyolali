import { useState, useEffect, FormEvent } from "react";
import { tokens } from "../../../ui/styles/tokens";
import { KbMasterData, KbTier } from "../types";
import { Input } from "../../../ui/components/elements/Input";
import { Button } from "../../../ui/components/elements/Button";
import { FormGroup } from "../../../ui/components/common/FormGroup";
import { Plus, Trash2 } from "lucide-react";

interface KbFormProps {
  initialData?: KbMasterData | null;
  onSubmit: (data: Omit<KbMasterData, "id">) => void;
  onCancel: () => void;
}

export function KbForm({ initialData, onSubmit, onCancel }: KbFormProps) {
  const [name, setName] = useState("");
  const [tiers, setTiers] = useState<KbTier[]>([{ tier: 1, durationDays: 30 }]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setTiers(initialData.tiers);
    }
  }, [initialData]);

  const handleAddTier = () => {
    const nextTier = tiers.length > 0 ? Math.max(...tiers.map(t => t.tier)) + 1 : 1;
    setTiers([...tiers, { tier: nextTier, durationDays: 30 }]);
    setError(null);
  };

  const handleRemoveTier = (index: number) => {
    const newTiers = tiers.filter((_, i) => i !== index);
    setTiers(newTiers);
    setError(null);
  };

  const handleTierChange = (index: number, field: keyof KbTier, value: number) => {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setTiers(newTiers);
    setError(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Validate unique tier numbers
    const tierNumbers = tiers.map(t => t.tier);
    const hasDuplicates = new Set(tierNumbers).size !== tierNumbers.length;

    if (hasDuplicates) {
      setError("Angka tier tidak boleh ada yang sama!");
      return;
    }

    onSubmit({ name, tiers });
  };

  return (
    <form id="kb-master-form" onSubmit={handleSubmit} className="space-y-[1.5rem]">
      {error && (
        <div className="p-[0.75rem] text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-md">
          {error}
        </div>
      )}
      <FormGroup id="kb-name" label="Nama / Jenis KB" required>
        <Input 
          id="kb-name"
          placeholder="Contoh: Suntik 3 Bulan" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          required
        />
      </FormGroup>

      <div className="space-y-[1rem]">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Tier Kunjungan Ulang</label>
          <Button type="button" variant="outline" size="sm" onClick={handleAddTier}>
            <Plus className="h-[1rem] w-[1rem] mr-[0.5rem]" />
            Tambah Tier
          </Button>
        </div>

        <div className="space-y-[0.75rem]">
          {tiers.map((tier, index) => (
            <div key={index} className="flex items-end gap-[1rem] p-[1rem] border rounded-md bg-gray-50 border-gray-200">
              <div className="w-[5rem]">
                <FormGroup id={`tier-num-${index}`} label="Tier">
                  <Input 
                    id={`tier-num-${index}`} 
                    type="number"
                    min={1}
                    value={tier.tier} 
                    onChange={(e) => handleTierChange(index, "tier", parseInt(e.target.value) || 0)}
                    className="text-center" 
                  />
                </FormGroup>
              </div>
              <div className="flex-1">
                <FormGroup id={`tier-duration-${index}`} label="Durasi (Hari)" required>
                  <Input 
                    id={`tier-duration-${index}`}
                    type="number" 
                    min={1} 
                    value={tier.durationDays} 
                    onChange={(e) => handleTierChange(index, "durationDays", parseInt(e.target.value) || 0)}
                    required
                  />
                </FormGroup>
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => handleRemoveTier(index)}
                disabled={tiers.length === 1}
                className="mb-[0.25rem]"
              >
                <Trash2 className="h-[1rem] w-[1rem] text-rose-500" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
