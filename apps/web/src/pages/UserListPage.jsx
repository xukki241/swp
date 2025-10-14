import { useState } from "react";
import { Search, Edit, CheckCircle, XCircle, Ban } from "lucide-react";
import { useForm } from "react-hook-form";
import { AppLayout } from "@/components/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  useStaff,
  useUpdateUser,
  useActivateUser,
  useDeactivateUser,
  useSuspendUser,
} from "@/hooks/useUsers";

export default function UserListPage() {
  // Separate pending search input from actual search query
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Fetch staff with filters - only searches when user clicks search button
  const filters = {};
  if (searchQuery) filters.search = searchQuery;
  if (statusFilter !== "all") filters.status = statusFilter;
  if (roleFilter !== "all") filters.role = roleFilter;

  const { data: apiResponse, isLoading, error } = useStaff(filters);
  const updateMutation = useUpdateUser();
  const activateMutation = useActivateUser();
  const deactivateMutation = useDeactivateUser();
  const suspendMutation = useSuspendUser();

  // Form for editing user
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      role: "staff",
    },
  });

  // Extract users array from API response
  const users = Array.isArray(apiResponse)
    ? apiResponse
    : Array.isArray(apiResponse?.data)
      ? apiResponse.data
      : [];

  function handleEditClick(user) {
    setSelectedUser(user);
    setValue("name", user.name || "");
    setValue("email", user.email || "");
    setValue("phone", user.phone || "");
    setValue("address", user.address || "");
    setValue("role", user.role || "staff");
    setShowEditDialog(true);
  }

  async function onEditSubmit(data) {
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
      reset();
    } catch (err) {
      toast.error("Error", {
        description: err.response?.data?.message || "Failed to update user",
      });
    }
  }

  async function handleStatusChange(userId, action) {
    try {
      if (action === "activate") {
        await activateMutation.mutateAsync(userId);
        toast.success("User Activated", { description: "User can now login." });
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
  }

  function getStatusBadge(status) {
    const variants = {
      active: {
        className: "bg-green-100 text-green-700 hover:bg-green-100",
        icon: CheckCircle,
      },
      inactive: {
        className: "bg-gray-100 text-gray-700 hover:bg-gray-100",
        icon: XCircle,
      },
      suspended: {
        className: "bg-red-100 text-red-700 hover:bg-red-100",
        icon: Ban,
      },
    };

    const config = variants[status] || variants.inactive;
    const Icon = config.icon;

    return (
      <Badge variant="secondary" className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  }

  function getRoleBadge(role) {
    const colors = {
      owner: "bg-purple-100 text-purple-700 hover:bg-purple-100",
      staff: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    };

    return (
      <Badge variant="secondary" className={colors[role] || colors.staff}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  }

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
          <Card className="shadow-md rounded-xl border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

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
          <Card className="shadow-md rounded-xl border-0">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Error Loading Users
                </h3>
                <p className="text-sm text-muted-foreground">
                  {error?.response?.data?.message ||
                    error?.message ||
                    "Failed to load users"}
                </p>
                <Button
                  onClick={function () {
                    window.location.reload();
                  }}
                  className="mt-4"
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
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
            <form
              onSubmit={function (e) {
                e.preventDefault();
                setSearchQuery(searchInput);
              }}
              className="mb-6 flex flex-col gap-4 md:flex-row"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchInput}
                  onChange={function (e) {
                    setSearchInput(e.target.value);
                  }}
                  className="pl-10 h-11 rounded-lg"
                />
              </div>
              <Button
                type="submit"
                className="h-11 bg-primary/90 hover:bg-primary"
              >
                <Search className="h-4 w-4" />
                Search
              </Button>
              {searchQuery && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={function () {
                    setSearchInput("");
                    setSearchQuery("");
                  }}
                >
                  Clear
                </Button>
              )}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px] h-11">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-[180px] h-11">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </form>

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
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-10 w-10 text-muted-foreground/50" />
                          <p className="text-muted-foreground font-medium">
                            No users found
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Try adjusting your filters
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map(function (user) {
                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.name || "N/A"}
                          </TableCell>
                          <TableCell>{user.email || "N/A"}</TableCell>
                          <TableCell>{user.phone || "N/A"}</TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>{getStatusBadge(user.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={function () {
                                  handleEditClick(user);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {user.status === "active" ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={function () {
                                      handleStatusChange(user.id, "deactivate");
                                    }}
                                    title="Deactivate"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-orange-600 hover:text-orange-700"
                                    onClick={function () {
                                      handleStatusChange(user.id, "suspend");
                                    }}
                                    title="Suspend"
                                  >
                                    <Ban className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : user.status === "suspended" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={function () {
                                    handleStatusChange(user.id, "activate");
                                  }}
                                  title="Activate"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={function () {
                                    handleStatusChange(user.id, "activate");
                                  }}
                                  title="Activate"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information for{" "}
              <span className="font-semibold">{selectedUser?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onEditSubmit)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  {...register("name", {
                    required: "Name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters",
                    },
                  })}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  {...register("phone", {
                    required: "Phone is required",
                  })}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  {...register("address", {
                    required: "Address is required",
                  })}
                />
                {errors.address && (
                  <p className="text-sm text-red-500">
                    {errors.address.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={watch("role")}
                  onValueChange={function (value) {
                    setValue("role", value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={function () {
                  setShowEditDialog(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
