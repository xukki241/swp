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
import { useRequestPasswordReset } from "@/hooks/useAuth";
import { AlertCircle, CheckCircle, Pill } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";

export default function ForgotPasswordPage() {
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      identifier: "",
    },
  });

  const requestResetMutation = useRequestPasswordReset();
  const identifierValue = watch("identifier");

  const onSubmit = (data) => {
    requestResetMutation.mutate(
      {
        identifier: data.identifier,
      },
      {
        onSuccess: () => {
          setShowSuccess(true);
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
                Đã gửi OTP thành công
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Kiểm tra email của bạn để lấy mã OTP
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-8 pt-4">
            <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-800">
                Chúng tôi đã gửi mã OTP 6 chữ số đến địa chỉ email của bạn. Mã
                sẽ hết hạn sau <strong>10 phút</strong>.
              </p>
            </div>

            <Link to="/reset-password">
              <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium">
                Tiếp tục đặt lại mật khẩu
              </Button>
            </Link>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Không nhận được mã?{" "}
                <button
                  onClick={() => setShowSuccess(false)}
                  className="text-primary font-medium hover:underline"
                >
                  Gửi lại OTP
                </button>
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
              Quên mật khẩu?
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Nhập email để nhận mã OTP
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-8 pt-4">
          {requestResetMutation.isError && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>
                {requestResetMutation.error?.response?.data?.message ||
                  "Không thể gửi OTP. Vui lòng thử lại."}
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

            <Button
              type="submit"
              disabled={requestResetMutation.isPending}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium"
            >
              {requestResetMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loading className="h-4 w-4 text-white" />
                  Đang gửi OTP...
                </span>
              ) : (
                "Gửi OTP"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Nhớ mật khẩu rồi?{" "}
              <Link
                to="/login"
                className="text-primary font-medium hover:underline"
              >
                Quay lại Đăng nhập
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
