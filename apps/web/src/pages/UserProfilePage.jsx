import { useChangePassword, useCurrentUser } from "@/hooks/useAuth";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

import { AppLayout } from "@/components/layouts/app-layout";
import { Loading } from "@/components/ui/loading";
import { KeyRound, Mail, Phone, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function UserProfile() {
  const { data: currentUser, isLoading, isError } = useCurrentUser();
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const changePasswordMutation = useChangePassword();
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordInputChange = (field, value) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    // validate reset password form
    if (!passwordData.oldPassword.trim()) {
      toast.error("Lỗi xác thực", {
        description: "Vui lòng nhập mật khẩu cũ",
      });
      return;
    }

    if (!passwordData.newPassword.trim()) {
      toast.error("Lỗi xác thực", {
        description: "Vui lòng nhập mật khẩu mới",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Lỗi xác thực", {
        description: "Mật khẩu mới phải có ít nhất 8 ký tự",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Lỗi xác thực", {
        description: "Mật khẩu mới và xác nhận mật khẩu không khớp",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await changePasswordMutation.mutateAsync({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success("Đổi mật khẩu thành công", {
        description:
          data?.message || "Mật khẩu của bạn đã được thay đổi thành công.",
      });

      setIsResetPasswordOpen(false);
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.log(error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể đổi mật khẩu. Vui lòng thử lại.";
      toast.error("Đổi mật khẩu thất bại", { description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="flex-1 space-y-3 w-full">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-56" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (isError || !currentUser?.user) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          <Card className="rounded-2xl border-destructive/50">
            <CardContent className="p-6">
              <p className="text-sm text-destructive">
                Failed to load user information. Please try again later.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const user = currentUser.user;

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusVariant = (status) => {
    if (status === "active") return "default";
    if (status === "inactive") return "secondary";
    return "outline";
  };

  return (
    <AppLayout>
      {/* Overlay when submitting */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4 shadow-xl">
            <Loading className="h-8 w-8" />
            <p className="text-sm font-medium text-gray-700">
              {isResetPasswordOpen
                ? "Đang đổi mật khẩu..."
                : "Đang cập nhật hồ sơ..."}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
        <Card className="rounded-2xl border-border shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold">
              Hồ sơ người dùng
            </CardTitle>
            <CardDescription className="text-md">
              Thông tin cá nhân và cài đặt tài khoản của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar Section */}
              <Avatar className="h-24 w-24 border-4 border-primary/10">
                <AvatarImage
                  src="/pharmacist-consultation.png"
                  alt={user.name}
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>

              {/* User Info Section */}
              <div className="flex-1 space-y-4 w-full">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-foreground">
                    {user.name}
                  </h2>
                  <p className="text-sm text-muted-foreground capitalize flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {user.role || "Người dùng"}
                  </p>
                </div>

                {/* Status Badge */}
                {user.status && (
                  <Badge
                    variant={getStatusVariant(user.status)}
                    className="capitalize"
                  >
                    {user.status === "active"
                      ? "Hoạt động"
                      : user.status === "inactive"
                        ? "Không hoạt động"
                        : user.status}
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
              {/* Email Section */}
              {user.email && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Email
                    </p>
                    <p className="text-sm text-foreground break-words">
                      {user.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Phone Section */}
              {user.phone && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Điện thoại
                    </p>
                    <p className="text-sm text-foreground">{user.phone}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Reset Password Section */}
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row gap-3">
              <Dialog
                open={isResetPasswordOpen}
                onOpenChange={setIsResetPasswordOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    onClick={() => setIsResetPasswordOpen(true)}
                    variant="outline"
                    className="w-full sm:w-auto gap-2 bg-transparent"
                  >
                    <KeyRound className="h-4 w-4" />
                    Đổi mật khẩu
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[500px]">
                  <form onSubmit={handlePasswordReset}>
                    <DialogHeader className="mb-4">
                      <DialogTitle>Đổi mật khẩu</DialogTitle>
                      <DialogDescription>
                        Nhập mật khẩu hiện tại và chọn mật khẩu mới.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2 mb-2">
                        <Label className="mb-1" htmlFor="oldPassword">
                          Mật khẩu cũ
                        </Label>
                        <Input
                          id="oldPassword"
                          type="password"
                          placeholder="Nhập mật khẩu hiện tại"
                          value={passwordData.oldPassword}
                          onChange={(e) =>
                            handlePasswordInputChange(
                              "oldPassword",
                              e.target.value
                            )
                          }
                          disabled={changePasswordMutation.isPending}
                          required
                          minLength={8}
                        />
                      </div>
                      <div className="grid gap-2 mb-2">
                        <Label className="mb-1" htmlFor="newPassword">
                          Mật khẩu mới
                        </Label>
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="Nhập mật khẩu mới"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            handlePasswordInputChange(
                              "newPassword",
                              e.target.value
                            )
                          }
                          disabled={changePasswordMutation.isPending}
                          required
                          minLength={8}
                        />
                        <p className="text-xs text-muted-foreground">
                          Phải có ít nhất 8 ký tự
                        </p>
                      </div>
                      <div className="grid gap-2 mb-2">
                        <Label className="mb-1" htmlFor="confirmPassword">
                          Xác nhận mật khẩu mới
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Xác nhận mật khẩu mới"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            handlePasswordInputChange(
                              "confirmPassword",
                              e.target.value
                            )
                          }
                          disabled={changePasswordMutation.isPending}
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsResetPasswordOpen(false);
                          setPasswordData({
                            oldPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          });
                        }}
                        disabled={changePasswordMutation.isPending}
                      >
                        Hủy
                      </Button>
                      <Button
                        type="submit"
                        disabled={changePasswordMutation.isPending}
                      >
                        {changePasswordMutation.isPending
                          ? "Đang đổi..."
                          : "Đổi mật khẩu"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
