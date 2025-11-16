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
import { UserPagination } from "@/components/user-management/UserPagination";
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

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Dialog state
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Build API filters - memoized to prevent unnecessary re-renders
  const apiFilters = useMemo(() => {
    const filters = { page, limit };
    if (appliedSearch) filters.search = appliedSearch;
    if (statusFilter !== "all") filters.status = statusFilter;
    if (roleFilter !== "all") filters.role = roleFilter;
    return filters;
  }, [appliedSearch, statusFilter, roleFilter, page, limit]);

  // Fetch users with filters
  const { data: apiResponse, isLoading, error } = useUsers(apiFilters);
  const updateMutation = useUpdateUser();
  const activateMutation = useActivateUser();
  const deactivateMutation = useDeactivateUser();
  const suspendMutation = useSuspendUser();

  // Extract users array and pagination info from API response
  const users = Array.isArray(apiResponse)
    ? apiResponse
    : Array.isArray(apiResponse?.data)
      ? apiResponse.data
      : [];

  const total = apiResponse?.total || 0;
  const totalPages = apiResponse?.totalPages || 0;
  const currentPage = apiResponse?.page || 1;

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
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handleLimitChange = useCallback((newLimit) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when limit changes
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

        toast.success("Đã cập nhật người dùng", {
          description: `Thông tin của ${data.name} đã được cập nhật.`,
        });

        setShowEditDialog(false);
        setSelectedUser(null);
      } catch (err) {
        toast.error("Lỗi", {
          description:
            err.response?.data?.message || "Không thể cập nhật người dùng",
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
          toast.success("Đã kích hoạt người dùng", {
            description: "Người dùng giờ có thể đăng nhập.",
          });
        } else if (action === "deactivate") {
          await deactivateMutation.mutateAsync(userId);
          toast.success("Đã vô hiệu hóa người dùng", {
            description: "Người dùng không thể đăng nhập.",
          });
        } else if (action === "suspend") {
          await suspendMutation.mutateAsync(userId);
          toast.warning("Đã đình chỉ người dùng", {
            description: "Người dùng đã bị đình chỉ.",
          });
        }
      } catch (err) {
        toast.error("Lỗi", {
          description:
            err.response?.data?.message ||
            "Không thể cập nhật trạng thái người dùng",
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
              Quản lý người dùng
            </h1>
            <p className="text-muted-foreground mt-1">Đang tải người dùng...</p>
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
              Quản lý người dùng
            </h1>
            <p className="text-muted-foreground mt-1">
              Quản lý tài khoản và quyền hạn nhân viên
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
              Quản lý người dùng
            </h1>
            <p className="text-muted-foreground mt-1">
              Quản lý tài khoản và quyền hạn nhân viên
            </p>
          </div>
        </div>

        <Card className="shadow-md rounded-xl border-0">
          <CardHeader>
            <CardTitle>Tài khoản nhân viên</CardTitle>
            <CardDescription>
              Xem, tìm kiếm và quản lý tài khoản người dùng
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

            <UserPagination
              currentPage={currentPage}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
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
