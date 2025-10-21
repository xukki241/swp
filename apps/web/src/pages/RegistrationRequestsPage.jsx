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

      toast.success("Request Approved", {
        description: `${selectedRequest.name}'s registration has been approved as staff.`,
      });

      setShowApproveDialog(false);
      setSelectedRequest(null);

      // No need to call refetch() here, the useApproveRegistration hook handles it.
    } catch (err) {
      toast.error("Error", {
        description:
          err.response?.data?.message || "Failed to approve registration",
      });
    }
  }

  async function confirmReject() {
    if (!selectedRequest) return;

    try {
      await rejectMutation.mutateAsync(selectedRequest.id);

      toast.success("Request Rejected", {
        description: `${selectedRequest.name}'s registration has been rejected.`,
      });

      setShowRejectDialog(false);
      setSelectedRequest(null);

      // No need to call refetch() here, the useRejectRegistration hook handles it.
    } catch (err) {
      toast.error("Error", {
        description:
          err.response?.data?.message ||
          error?.message ||
          "Failed to reject registration",
      });
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Registration Requests
            </h1>
            <p className="text-muted-foreground mt-1">
              Loading registration requests...
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
              Registration Requests
            </h1>
            <p className="text-muted-foreground mt-1">
              Review and manage staff registration requests
            </p>
          </div>
          <Card className="shadow-md rounded-xl border-0">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Error Loading Registrations
                </h3>
                <p className="text-sm text-muted-foreground">
                  {error?.response?.data?.message ||
                    error?.message ||
                    "Failed to load registration requests"}
                </p>
                <Button
                  onClick={() => refetch()}
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Registration Requests
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and manage staff registration requests
          </p>
        </div>

        <Card className="shadow-md rounded-xl border-0">
          <CardHeader>
            <CardTitle>Pending Registrations</CardTitle>
            <CardDescription>
              Approve or reject staff account registration requests
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
                  placeholder="Search by name or email..."
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
                Search
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
                  Clear
                </Button>
              )}
            </form>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <Clock className="h-10 w-10 text-muted-foreground/50" />
                          <p className="text-muted-foreground font-medium">
                            No pending registrations
                          </p>
                          <p className="text-sm text-muted-foreground">
                            All registration requests have been processed
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
                            No results found
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Try adjusting your search terms
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
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectClick(request)}
                              disabled={rejectMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
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
            <AlertDialogTitle>Approve Registration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve the registration request from{" "}
              <span className="font-semibold">{selectedRequest?.name}</span>?
              They will be assigned as a staff member.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmApprove}
              disabled={approveMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {approveMutation.isPending ? "Approving..." : "Approve"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Registration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject the registration request from{" "}
              <span className="font-semibold">{selectedRequest?.name}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReject}
              disabled={rejectMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {rejectMutation.isPending ? "Rejecting..." : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
