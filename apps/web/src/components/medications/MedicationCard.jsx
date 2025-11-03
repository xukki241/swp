import MedicationImage from "@/components/MedicationImage";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Package, Trash2 } from "lucide-react";

function StatusBadge({ status }) {
  const s = (status || "active").toLowerCase();
  const style =
    s === "active"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-zinc-50 text-zinc-600 border-zinc-200";
  return (
    <span
      className={`px-2 py-0.5 text-xs rounded-full border ${style} capitalize`}
    >
      {s}
    </span>
  );
}

export function MedicationCard({
  medication,
  isOwner,
  onView,
  onEdit,
  onVariants,
  onDelete,
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <MedicationImage
          fileId={medication.imageId}
          alt={medication.name}
          size={56}
        />
        <div>
          <div className="flex items-center gap-2">
            <div className="font-medium">{medication.name}</div>
            <StatusBadge status={medication.status} />
          </div>
          <div className="text-sm text-muted-foreground">
            Thương hiệu: {medication.brand || "-"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={onView} title="View">
          <Eye className="w-4 h-4 mr-1" />
          Xem
        </Button>

        {isOwner && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={onEdit}
              title="Chỉnh sửa"
            >
              <Edit className="w-4 h-4 mr-1" />
              Sửa
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onVariants}
              title="Quản lý biến thể"
            >
              <Package className="w-4 h-4 mr-1" />
              Biến thể
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={onDelete}
              title="Xóa"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Xóa
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
