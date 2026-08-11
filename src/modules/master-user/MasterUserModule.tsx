import { useState } from "react";
import { User } from "./types";
import { UserTable } from "./components/UserTable";
import { UserForm } from "./components/UserForm";
import { Button } from "../../ui/components/elements/Button";
import { Plus, Users } from "lucide-react";
import { PopUpModal } from "../../ui/components/common/PopUpModal";
import Swal from "sweetalert2";
import { useMasterUser } from "../../logic/hooks/useMasterUser.js";

export default function MasterUserModule() {
  const { data: users, addItem, updateItem, deleteItem } = useMasterUser({ strategy: 'full' });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleAdd = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string, nama: string) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: `Data user ${nama} akan dihapus secara permanen. Akses pengguna tersebut akan langsung dicabut.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48", // rose-600
      cancelButtonColor: "#6b7280", // gray-500
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        deleteItem(id);
        Swal.fire({
          title: "Terhapus!",
          text: "Data user telah berhasil dihapus.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  const handleFormSubmit = (formData: Partial<User>) => {
    if (editingUser) {
      updateItem(editingUser.id, formData);
    } else {
      addItem(formData as Omit<User, 'id' | 'createdAt'>);
    }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-[1.5rem]">
      <div className="flex flex-col gap-[1rem] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-[0.5rem]">
            <Users className="h-[1.5rem] w-[1.5rem] text-purple-700" />
            Master User
          </h1>
          <p className="text-sm text-gray-500">
            Kelola data personil dan hak akses aplikasi
          </p>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-[0.5rem]">
          <Plus className="h-[1.125rem] w-[1.125rem]" />
          Tambah User
        </Button>
      </div>

      <UserTable users={users} onEdit={handleEdit} onDelete={(id) => {
        const user = users.find(u => u.id === id);
        if (user) handleDelete(id, user.nama);
      }} />

      <PopUpModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingUser ? "Edit User" : "Tambah User Baru"}
        maxWidth="max-w-4xl"
        footer={
          <div className="flex justify-end gap-[0.75rem]">
            <Button variant="ghost" onClick={() => setIsFormOpen(false)} type="button">
              Batal
            </Button>
            <Button type="submit" form="user-form">
              {editingUser ? "Simpan Perubahan" : "Tambah User"}
            </Button>
          </div>
        }
      >
        <UserForm
          initialData={editingUser}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      </PopUpModal>
    </div>
  );
}
