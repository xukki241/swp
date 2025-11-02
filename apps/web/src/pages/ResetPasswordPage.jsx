import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/ui/loading";
import { useVerifyResetOTP } from "@/hooks/useAuth";
import { AlertCircle, CheckCircle, Eye, EyeOff, Pill } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      identifier: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const verifyOTPMutation = useVerifyResetOTP();
  const newPassword = watch("newPassword");

  const onSubmit = (data) => {
    verifyOTPMutation.mutate(
      {
        identifier: data.identifier,
        otp: data.otp,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          setShowSuccess(true);
          // Redirect to login after 2 seconds
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        },
      }
    );
  };

  if (showSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-md shadow-lg rounded-2xl border-0">
          <CardHeader className="space-y-4 text-center pb-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-2xl bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-gray-800">
                Đặt lại mật khẩu thành công
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Bây giờ bạn có thể đăng nhập với mật khẩu mới
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-8 pt-4">
            <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200">
              <p className="text-sm text-green-800 text-center">
                Đang chuyển đến trang đăng nhập...
              </p>
            </div>

            <Link to="/login">
              <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium">
                Đến Đăng nhập
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl border-0">
        <CardHeader className="space-y-4 text-center pb-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Pill className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-gray-800">
              Đặt lại mật khẩu
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Nhập mã OTP và mật khẩu mới của bạn
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-8 pt-4">
          {verifyOTPMutation.isError && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>
                {verifyOTPMutation.error?.response?.data?.message ||
                  "Không thể đặt lại mật khẩu. Vui lòng thử lại."}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-sm font-medium">
                Địa chỉ Email
              </Label>
              <Input
                id="identifier"
                type="email"
                placeholder="email.cua.ban@example.com"
                {...register("identifier", {
                  required: "Email là bắt buộc",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Địa chỉ email không hợp lệ",
                  },
                })}
                className="h-11 rounded-lg"
              />
              {errors.identifier && (
                <p className="text-sm text-destructive">
                  {errors.identifier.message}
                </p>
              )}
            </div>

            {/* OTP Input */}
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-sm font-medium">
                Mã OTP
              </Label>
              <Input
                id="otp"
                type="text"
                placeholder="Nhập mã OTP 6 chữ số"
                maxLength={6}
                {...register("otp", {
                  required: "Mã OTP là bắt buộc",
                  pattern: {
                    value: /^\d{6}$/,
                    message: "Mã OTP phải có 6 chữ số",
                  },
                })}
                className="h-11 rounded-lg text-center text-lg tracking-widest font-mono"
              />
              {errors.otp && (
                <p className="text-sm text-destructive">{errors.otp.message}</p>
              )}
            </div>

            {/* New Password Input */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium">
                Mật khẩu mới
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu mới"
                  {...register("newPassword", {
                    required: "Mật khẩu mới là bắt buộc",
                    minLength: {
                      value: 6,
                      message: "Mật khẩu phải có ít nhất 6 ký tự",
                    },
                  })}
                  className="h-11 rounded-lg pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-destructive">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Xác nhận mật khẩu mới
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Xác nhận mật khẩu mới"
                  {...register("confirmPassword", {
                    required: "Vui lòng xác nhận mật khẩu",
                    validate: (value) =>
                      value === newPassword || "Mật khẩu không khớp",
                  })}
                  className="h-11 rounded-lg pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={verifyOTPMutation.isPending}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium"
            >
              {verifyOTPMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loading className="h-4 w-4 text-white" />
                  Đang đặt lại mật khẩu...
                </span>
              ) : (
                "Đặt lại mật khẩu"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Không nhận được OTP?{" "}
              <Link
                to="/forgot-password"
                className="text-primary font-medium hover:underline"
              >
                Gửi lại OTP
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Quay lại Đăng nhập
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
