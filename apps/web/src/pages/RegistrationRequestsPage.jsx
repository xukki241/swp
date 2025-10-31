import { AppLayout } from "@/components/layouts/app-layout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useApproveRegistration,
  useRegistrationRequests,
  useRejectRegistration,
} from "@/hooks/useRegistration";
import { CheckCircle, Clock, Search, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function RegistrationRequestsPage() {
  // Separate pending search input from actual search query
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // Fetch registration requests with pending status
  const {
    data: apiResponse,
    isLoading,
    error,
    refetch,
  } = useRegistrationRequests({ status: "pending" });
  const approveMutation = useApproveRegistration();
  const rejectMutation = useRejectRegistration();

  // Safely extract registrations array from API response
  const registrations = Array.isArray(apiResponse)
    ? apiResponse
    : Array.isArray(apiResponse?.data)
      ? apiResponse.data
      : [];

  // Client-side filtering based on search query
  const filteredRequests = registrations.filter(
    (req) =>
      req.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function handleApproveClick(request) {
    setSelectedRequest(request);
    setShowApproveDialog(true);
  }

  function handleRejectClick(request) {
    setSelectedRequest(request);
    setShowRejectDialog(true);
  }

  async function confirmApprove() {
    if (!selectedRequest) return;

    try {
      await approveMutation.mutateAsync({
        id: selectedRequest.id,
        role: "staff", // Auto assign as staff
      });

      toast.success("Đã phê duyệt yêu cầu", {
        description: `Đăng ký của ${selectedRequest.name} đã được phê duyệt với vai trò nhân viên.`,
      });

      setShowApproveDialog(false);
      setSelectedRequest(null);

      // No need to call refetch() here, the useApproveRegistration hook handles it.
    } catch (err) {
      toast.error("Lỗi", {
        description:
          err.response?.data?.message || "Không thể phê duyệt đăng ký",
      });
    }
  }

  async function confirmReject() {
    if (!selectedRequest) return;

    try {
      await rejectMutation.mutateAsync(selectedRequest.id);

      toast.success("Đã từ chối yêu cầu", {
        description: `Đăng ký của ${selectedRequest.name} đã bị từ chối.`,
      });

      setShowRejectDialog(false);
      setSelectedRequest(null);

      // No need to call refetch() here, the useRejectRegistration hook handles it.
    } catch (err) {
      toast.error("Lỗi", {
        description:
          err.response?.data?.message ||
          error?.message ||
          "Không thể từ chối đăng ký",
      });
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Yêu cầu đăng ký
            </h1>
            <p className="text-muted-foreground mt-1">
              Đang tải yêu cầu đăng ký...
            </p>
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
              Yêu cầu đăng ký
            </h1>
            <p className="text-muted-foreground mt-1">
              Xem xét và quản lý yêu cầu đăng ký nhân viên
            </p>
          </div>
          <Card className="shadow-md rounded-xl border-0">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Lỗi tải dữ liệu đăng ký
                </h3>
                <p className="text-sm text-muted-foreground">
                  {error?.response?.data?.message ||
                    error?.message ||
                    "Không thể tải yêu cầu đăng ký"}
                </p>
                <Button
                  onClick={() => refetch()}
                  className="mt-4"
                  variant="outline"
                >
                  Thử lại
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Yêu cầu đăng ký</h1>
          <p className="text-muted-foreground mt-1">
            Xem xét và quản lý yêu cầu đăng ký nhân viên
          </p>
        </div>

        <Card className="shadow-md rounded-xl border-0">
          <CardHeader>
            <CardTitle>Đăng ký chờ duyệt</CardTitle>
            <CardDescription>
              Phê duyệt hoặc từ chối yêu cầu đăng ký tài khoản nhân viên
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearchQuery(searchInput);
              }}
              className="mb-6 flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 h-11 rounded-lg"
                />
              </div>
              <Button
                type="submit"
                className="h-11 bg-primary hover:bg-primary/90"
              >
                <Search className="h-4 w-4 mr-2" />
                Tìm kiếm
              </Button>
              {searchQuery && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={() => {
                    setSearchInput("");
                    setSearchQuery("");
                  }}
                >
                  Xóa
                </Button>
              )}
            </form>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Điện thoại</TableHead>
                    <TableHead>Địa chỉ</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <Clock className="h-10 w-10 text-muted-foreground/50" />
                          <p className="text-muted-foreground font-medium">
                            Không có đăng ký chờ duyệt
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Tất cả yêu cầu đăng ký đã được xử lý
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-10 w-10 text-muted-foreground/50" />
                          <p className="text-muted-foreground font-medium">
                            Không tìm thấy kết quả
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Thử điều chỉnh từ khóa tìm kiếm
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          {request.name || "N/A"}
                        </TableCell>
                        <TableCell>{request.email || "N/A"}</TableCell>
                        <TableCell>{request.phone || "N/A"}</TableCell>
                        <TableCell>{request.address || "N/A"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveClick(request)}
                              disabled={approveMutation.isPending}
                              className="bg-primary hover:bg-primary/90 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Phê duyệt
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectClick(request)}
                              disabled={rejectMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Từ chối
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Phê duyệt đăng ký</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn phê duyệt yêu cầu đăng ký từ{" "}
              <span className="font-semibold">{selectedRequest?.name}</span>? Họ
              sẽ được gán vai trò nhân viên.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmApprove}
              disabled={approveMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {approveMutation.isPending ? "Đang phê duyệt..." : "Phê duyệt"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Từ chối đăng ký</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn từ chối yêu cầu đăng ký từ{" "}
              <span className="font-semibold">{selectedRequest?.name}</span>?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReject}
              disabled={rejectMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {rejectMutation.isPending ? "Đang từ chối..." : "Từ chối"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
