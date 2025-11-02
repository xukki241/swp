import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/ui/loading";
import { useLogin } from "@/hooks/useAuth";
import { Pill } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { toast } from "sonner";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const loginMutation = useLogin();
  const rememberValue = watch("remember");

  const onSubmit = (data) => {
    loginMutation.mutate(
      {
        email: data.email,
        password: data.password,
      },
      {
        onError: (error) => {
          toast.error("Đăng nhập thất bại", {
            description:
              error?.response?.data?.message ||
              error?.message ||
              "Email hoặc mật khẩu không đúng. Vui lòng thử lại.",
          });
        },
        onSuccess: () => {
          toast.success("Đăng nhập thành công", {
            description:
              "Chào mừng trở lại! Đang chuyển đến trang tổng quan...",
          });
        },
      }
    );
  };

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
              Chào mừng trở lại 👋
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Đăng nhập để tiếp tục sử dụng PharmaFlow
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-8 pt-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email.cua.ban@example.com"
                {...register("email", {
                  required: "Email là bắt buộc",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Địa chỉ email không hợp lệ",
                  },
                })}
                className="h-11 rounded-lg"
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Mật khẩu
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                {...register("password", {
                  required: "Mật khẩu là bắt buộc",
                  minLength: {
                    value: 6,
                    message: "Mật khẩu phải có ít nhất 6 ký tự",
                  },
                })}
                className="h-11 rounded-lg"
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberValue}
                onCheckedChange={(checked) => setValue("remember", checked)}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Ghi nhớ đăng nhập
              </Label>
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium"
            >
              {loginMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loading className="h-4 w-4 text-white" />
                  Đang đăng nhập...
                </span>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-primary font-medium hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="text-primary font-medium hover:underline"
              >
                Đăng ký
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
