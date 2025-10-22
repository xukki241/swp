import { AppLayout } from "@/components/layouts/app-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EditUserDialog } from "@/components/user-management/EditUserDialog";
import {
  ErrorState,
  LoadingState,
} from "@/components/user-management/LoadingAndErrorStates";
import { UserFilters } from "@/components/user-management/UserFilters";
import { UserTable } from "@/components/user-management/UserTable";
import {
  useActivateUser,
  useDeactivateUser,
  useSuspendUser,
  useUpdateUser,
  useUsers,
} from "@/hooks/useUsers";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

export default function UserListPage() {
  // Search state - controlled with submit button
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  // Filter states - apply immediately
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // Dialog state
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Build API filters - memoized to prevent unnecessary re-renders
  const apiFilters = useMemo(() => {
    const filters = {};
    if (appliedSearch) filters.search = appliedSearch;
    if (statusFilter !== "all") filters.status = statusFilter;
    if (roleFilter !== "all") filters.role = roleFilter;
    return filters;
  }, [appliedSearch, statusFilter, roleFilter]);

  // Fetch users with filters
  const { data: apiResponse, isLoading, error } = useUsers(apiFilters);
  const updateMutation = useUpdateUser();
  const activateMutation = useActivateUser();
  const deactivateMutation = useDeactivateUser();
  const suspendMutation = useSuspendUser();

  // Extract users array from API response
  const users = Array.isArray(apiResponse)
    ? apiResponse
    : Array.isArray(apiResponse?.data)
      ? apiResponse.data
      : [];

  // Handler functions - memoized to prevent unnecessary re-renders
  const handleSearchSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setAppliedSearch(searchInput.trim());
    },
    [searchInput]
  );

  const handleClearFilters = useCallback(() => {
    setSearchInput("");
    setAppliedSearch("");
    setStatusFilter("all");
    setRoleFilter("all");
  }, []);

  const handleEditClick = useCallback((user) => {
    setSelectedUser(user);
    setShowEditDialog(true);
  }, []);

  const handleEditSubmit = useCallback(
    async (data) => {
      if (!selectedUser) return;

      try {
        await updateMutation.mutateAsync({
          id: selectedUser.id,
          ...data,
        });

        toast.success("User Updated", {
          description: `${data.name}'s information has been updated.`,
        });

        setShowEditDialog(false);
        setSelectedUser(null);
      } catch (err) {
        toast.error("Error", {
          description: err.response?.data?.message || "Failed to update user",
        });
      }
    },
    [selectedUser, updateMutation]
  );

  const handleStatusChange = useCallback(
    async (userId, action) => {
      try {
        if (action === "activate") {
          await activateMutation.mutateAsync(userId);
          toast.success("User Activated", {
            description: "User can now login.",
          });
        } else if (action === "deactivate") {
          await deactivateMutation.mutateAsync(userId);
          toast.success("User Deactivated", {
            description: "User cannot login.",
          });
        } else if (action === "suspend") {
          await suspendMutation.mutateAsync(userId);
          toast.warning("User Suspended", {
            description: "User has been suspended.",
          });
        }
      } catch (err) {
        toast.error("Error", {
          description:
            err.response?.data?.message || "Failed to update user status",
        });
      }
    },
    [activateMutation, deactivateMutation, suspendMutation]
  );

  // Render loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="text-muted-foreground mt-1">Loading users...</p>
          </div>
          <LoadingState />
        </div>
      </AppLayout>
    );
  }

  // Render error state
  if (error) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage staff accounts and permissions
            </p>
          </div>
          <ErrorState error={error} onRetry={() => window.location.reload()} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage staff accounts and permissions
            </p>
          </div>
        </div>

        <Card className="shadow-md rounded-xl border-0">
          <CardHeader>
            <CardTitle>Staff Accounts</CardTitle>
            <CardDescription>
              View, search, and manage user accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserFilters
              searchInput={searchInput}
              onSearchInputChange={setSearchInput}
              appliedSearch={appliedSearch}
              onSearchSubmit={handleSearchSubmit}
              onClearFilters={handleClearFilters}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              roleFilter={roleFilter}
              onRoleFilterChange={setRoleFilter}
            />

            <UserTable
              users={users}
              onEdit={handleEditClick}
              onStatusChange={handleStatusChange}
            />
          </CardContent>
        </Card>
      </div>

      <EditUserDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        user={selectedUser}
        onSubmit={handleEditSubmit}
        isLoading={updateMutation.isPending}
      />
    </AppLayout>
  );
}
