import React, { useState, useEffect } from "react";
import { User, UserPermission } from "../types";
import { Input } from "../../../ui/components/elements/Input";
import { Button } from "../../../ui/components/elements/Button";
import { FormGroup } from "../../../ui/components/common/FormGroup";
import { PhoneInput } from "../../../ui/components/elements/PhoneInput";
import { ComboBox } from "../../../ui/components/elements/ComboBox";
import { tokens } from "../../../ui/styles/tokens";
import { cn } from "../../../logic/utils/cn";

interface UserFormProps {
  initialData?: User | null;
  onSubmit: (data: Partial<User>) => void;
  onCancel: () => void;
}

const PERMISSION_OPTIONS: UserPermission[] = [
  "Master Data",
  "Cashier",
  "Report",
  "Pendaftaran",
  "Pemeriksaan",
  "Farmasi",
  "Dokumen"
];

const JENIS_USER_SUGGESTIONS = [
  "dokter",
  "bidan",
  "perawat",
  "ahli gizi",
  "farmasi"
];

export function UserForm({ initialData, onSubmit, onCancel }: UserFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    nama: "",
    jenisUser: "",
    str: "",
    sip: "",
    noWhatsapp: "",
    accessId: "",
    accessPassword: "",
    permissions: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof User, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handlePermissionToggle = (permission: UserPermission) => {
    setFormData((prev) => {
      const current = prev.permissions || [];
      const next = current.includes(permission)
        ? current.filter((p) => p !== permission)
        : [...current, permission];
      return { ...prev, permissions: next };
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nama) newErrors.nama = "Nama wajib diisi";
    if (!formData.jenisUser) newErrors.jenisUser = "Jenis User wajib diisi";
    if (!formData.accessId) newErrors.accessId = "Access ID wajib diisi";
    if (!formData.accessPassword || formData.accessPassword.length < 4) {
      newErrors.accessPassword = "Password minimal 4 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form id="user-form" onSubmit={handleSubmit} className="space-y-[1.5rem]">
      <div className="grid grid-cols-1 gap-[1.5rem] md:grid-cols-2">
        <FormGroup id="nama" label="Nama" required error={errors.nama}>
          <Input
            id="nama"
            value={formData.nama}
            onChange={(e) => handleChange("nama", e.target.value)}
            placeholder="Masukkan nama lengkap"
            error={!!errors.nama}
          />
        </FormGroup>

        <FormGroup id="jenisUser" label="Jenis User" required error={errors.jenisUser}>
          <ComboBox
            id="jenisUser"
            value={formData.jenisUser || ""}
            onChange={(val) => handleChange("jenisUser", val)}
            options={JENIS_USER_SUGGESTIONS}
            placeholder="Pilih atau input jenis user"
            error={!!errors.jenisUser}
          />
        </FormGroup>

        <FormGroup id="str" label="STR">
          <Input
            id="str"
            value={formData.str}
            onChange={(e) => handleChange("str", e.target.value)}
            placeholder="Masukkan nomor STR"
          />
        </FormGroup>

        <FormGroup id="sip" label="SIP">
          <Input
            id="sip"
            value={formData.sip}
            onChange={(e) => handleChange("sip", e.target.value)}
            placeholder="Masukkan nomor SIP"
          />
        </FormGroup>

        <FormGroup id="noWhatsapp" label="No Whatsapp" required>
          <PhoneInput
            id="noWhatsapp"
            value={formData.noWhatsapp || ""}
            onChange={(val) => handleChange("noWhatsapp", val)}
            placeholder="081 234 567 890"
          />
        </FormGroup>

        <FormGroup id="accessId" label="Access ID" required error={errors.accessId}>
          <Input
            id="accessId"
            value={formData.accessId}
            onChange={(e) => handleChange("accessId", e.target.value)}
            placeholder="Username akses"
            error={!!errors.accessId}
          />
        </FormGroup>

        <FormGroup id="accessPassword" label="Access Password" required error={errors.accessPassword}>
          <Input
            id="accessPassword"
            type="password"
            value={formData.accessPassword}
            onChange={(e) => handleChange("accessPassword", e.target.value)}
            placeholder="Minimal 4 karakter"
            error={!!errors.accessPassword}
          />
        </FormGroup>
      </div>

      <div className="space-y-[0.75rem]">
        <label className="text-sm font-medium text-gray-700">Permission Access</label>
        <div className="grid grid-cols-2 gap-[0.75rem] sm:grid-cols-3 md:grid-cols-4">
          {PERMISSION_OPTIONS.map((permission) => (
            <label
              key={permission}
              className={cn(
                "flex cursor-pointer items-center gap-[0.5rem] rounded-lg border p-[0.75rem] transition-all",
                formData.permissions?.includes(permission)
                  ? "border-purple-700 bg-purple-50 text-purple-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-purple-200"
              )}
            >
              <input
                type="checkbox"
                className="h-[1rem] w-[1rem] rounded border-gray-300 text-purple-700 focus:ring-purple-700"
                checked={formData.permissions?.includes(permission)}
                onChange={() => handlePermissionToggle(permission)}
              />
              <span className="text-sm font-medium">{permission}</span>
            </label>
          ))}
        </div>
      </div>
    </form>
  );
}
