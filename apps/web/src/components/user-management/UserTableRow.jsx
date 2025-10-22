import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Ban, CheckCircle, Edit, XCircle } from "lucide-react";
import { memo } from "react";
import { RoleBadge, StatusBadge } from "./UserBadges";

/**
 * User action buttons component
 * @param {Object} props
 * @param {Object} props.user - User object
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.onStatusChange - Status change handler
 */
const UserActionButtons = memo(function UserActionButtons({
  user,
  onEdit,
  onStatusChange,
}) {
  return (
    <div className="flex justify-end gap-2">
      <Button size="sm" variant="outline" onClick={() => onEdit(user)}>
        <Edit className="h-4 w-4" />
      </Button>

      {user.status === "active" ? (
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onStatusChange(user.id, "deactivate")}
            title="Deactivate"
          >
            <XCircle className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-orange-600 hover:text-orange-700"
            onClick={() => onStatusChange(user.id, "suspend")}
            title="Suspend"
          >
            <Ban className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onStatusChange(user.id, "activate")}
          title="Activate"
        >
          <CheckCircle className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
});

/**
 * User table row component
 * @param {Object} props
 * @param {Object} props.user - User object
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.onStatusChange - Status change handler
 */
export const UserTableRow = memo(function UserTableRow({
  user,
  onEdit,
  onStatusChange,
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{user.name || "N/A"}</TableCell>
      <TableCell>{user.email || "N/A"}</TableCell>
      <TableCell>{user.phone || "N/A"}</TableCell>
      <TableCell>
        <RoleBadge role={user.role} />
      </TableCell>
      <TableCell>
        <StatusBadge status={user.status} />
      </TableCell>
      <TableCell className="text-right">
        <UserActionButtons
          user={user}
          onEdit={onEdit}
          onStatusChange={onStatusChange}
        />
      </TableCell>
    </TableRow>
  );
});
