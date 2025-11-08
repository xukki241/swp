import loginBg from "@/assets/login.jpg";
import { Button } from "@/components/ui/button";
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
    <div className="flex min-h-screen overflow-hidden">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white animate-in fade-in slide-in-from-left-10 duration-700">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="mb-8 animate-in fade-in slide-in-from-left-5 duration-700 delay-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center transform transition-transform hover:scale-110 duration-300">
                <Pill className="h-6 w-6 text-primary" />
              </div>
              <span className="text-2xl font-bold text-primary">
                PharmaFlow
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Chào mừng trở lại 👋
            </h1>
            <p className="text-gray-600">
              Đăng nhập để tiếp tục sử dụng PharmaFlow
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 animate-in fade-in slide-in-from-left-5 duration-700 delay-200"
          >
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

            <div className="flex items-center justify-between">
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
              <Link
                to="/forgot-password"
                className="text-sm text-primary font-medium hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
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

          <div className="mt-6 text-center animate-in fade-in duration-700 delay-300">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="text-primary font-medium hover:underline transition-all"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div
        className="hidden lg:flex flex-1 bg-cover bg-center bg-no-repeat relative animate-in fade-in slide-in-from-right-10 duration-700"
        style={{
          backgroundImage: `url(${loginBg})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/70 animate-in fade-in duration-1000" />
        <div className="relative z-10 flex flex-col items-center justify-center text-white p-12 text-center animate-in fade-in slide-in-from-bottom-5 duration-700 delay-300">
          <h2 className="text-4xl font-bold mb-4 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-500">
            Quản lý nhà thuốc hiện đại
          </h2>
          <p className="text-xl text-white/90 max-w-md animate-in fade-in slide-in-from-bottom-3 duration-700 delay-700">
            Giải pháp toàn diện cho việc quản lý kho, bán hàng và theo dõi tồn
            kho thuốc
          </p>
        </div>
      </div>
    </div>
  );
}
