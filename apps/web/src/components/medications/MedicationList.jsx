import { MedicationCard } from "./MedicationCard";

export function MedicationList({
  medications,
  isOwner,
  onView,
  onEdit,
  onVariants,
  onDelete,
}) {
  if (medications.length === 0) {
    return (
      <div className="rounded-xl border p-10 text-center text-sm text-muted-foreground">
        Không tìm thấy thuốc nào
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {medications.map((m) => (
        <MedicationCard
          key={m.id}
          medication={m}
          isOwner={isOwner}
          onView={() => onView(m)}
          onEdit={() => onEdit(m)}
          onVariants={() => onVariants(m)}
          onDelete={() => onDelete(m.id)}
        />
      ))}
    </div>
  );
}
