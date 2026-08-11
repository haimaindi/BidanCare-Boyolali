import { User } from "../types";
import { Button } from "../../../ui/components/elements/Button";
import { Badge } from "../../../ui/components/elements/Badge";
import { Edit, Trash2, Shield } from "lucide-react";
import { TableModule, Column } from "../../../ui/components/common/TableModule";

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
}

export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  const columns: Column<User>[] = [
    {
      header: "Nama & Jenis",
      accessor: (user: User) => (
        <div className="flex flex-col text-left">
          <span className="font-medium text-gray-900">{user.nama}</span>
          <span className="text-xs text-gray-500 capitalize">{user.jenisUser}</span>
        </div>
      ),
    },
    {
      header: "STR / SIP",
      accessor: (user: User) => (
        <div className="flex flex-col text-xs text-left">
          <span className={user.str ? "text-gray-700" : "text-gray-400"}>
            {user.str || "No STR"}
          </span>
          <span className={user.sip ? "text-gray-700" : "text-gray-400"}>
            {user.sip || "No SIP"}
          </span>
        </div>
      ),
    },
    {
      header: "Kontak & Akses",
      accessor: (user: User) => (
        <div className="flex flex-col text-xs text-left">
          <span className="text-gray-700">{user.noWhatsapp}</span>
          <span className="font-mono text-purple-600">@{user.accessId}</span>
        </div>
      ),
    },
    {
      header: "Permissions",
      accessor: (user: User) => (
        <div className="flex flex-wrap gap-[0.25rem] justify-center">
          {user.permissions.slice(0, 2).map((p) => (
            <Badge key={p} variant="outline" className="text-[10px] py-0 px-1 border-purple-200 text-purple-700 bg-purple-50">
              {p}
            </Badge>
          ))}
          {user.permissions.length > 2 && (
            <Badge variant="outline" className="text-[10px] py-0 px-1">
              +{user.permissions.length - 2} more
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: "Aksi",
      className: "w-[100px] text-right",
      accessor: (user: User) => (
        <div className="flex justify-end gap-[0.5rem]">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(user)}
            className="h-[2rem] w-[2rem] p-0 text-gray-500 hover:text-purple-700"
          >
            <Edit className="h-[1rem] w-[1rem]" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(user.id)}
            className="h-[2rem] w-[2rem] p-0 text-gray-500 hover:text-rose-600"
          >
            <Trash2 className="h-[1rem] w-[1rem]" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <TableModule
      data={users}
      columns={columns}
      keyExtractor={(u) => u.id}
    />
  );
}
