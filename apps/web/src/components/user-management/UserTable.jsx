import { memo } from "react";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserTableRow } from "./UserTableRow";

/**
 * Empty state component for user table
 */
const EmptyState = memo(function EmptyState() {
  return (
    <TableRow>
      <TableCell colSpan={6} className="text-center py-12">
        <div className="flex flex-col items-center gap-2">
          <Search className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-muted-foreground font-medium">No users found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
});

/**
 * User table component
 * @param {Object} props
 * @param {Array} props.users - Array of user objects
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.onStatusChange - Status change handler
 */
export const UserTable = memo(function UserTable({
  users,
  onEdit,
  onStatusChange,
}) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <EmptyState />
          ) : (
            users.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                onEdit={onEdit}
                onStatusChange={onStatusChange}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
});
