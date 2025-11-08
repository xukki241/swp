import backgroundImg from "@/assets/background.jpg";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/ui/loading";
import { useRegister } from "@/hooks/useAuth";
import { Pill, ScrollText } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { toast } from "sonner";
import PharmacyPolicyDialog from "./components/PharmacyPolicyDialog";

export default function RegisterPage() {
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);
  const [showPharmacyPolicyDialog, setShowPharmacyPolicyDialog] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      confirmPassword: "",
      agreePolicy: false,
      agreePharmacyPolicy: false,
    },
  });

  const registerMutation = useRegister();
  const password = watch("password");

  const onSubmit = (data) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData, {
      onSuccess: () => {
        toast.success("Đăng ký thành công! Vui lòng chờ phê duyệt.");
      },
      onError: (error) => {
        toast.error(
          error?.response?.data?.message ||
            "Đăng ký thất bại. Vui lòng thử lại."
        );
      },
    });
  };

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto animate-in fade-in slide-in-from-left-10 duration-700">
        <div className="w-full max-w-md py-8">
          {/* Logo and Title */}
          <div className="mb-6 animate-in fade-in slide-in-from-left-5 duration-700 delay-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center transform transition-transform hover:scale-110 duration-300">
                <Pill className="h-6 w-6 text-primary" />
              </div>
              <span className="text-2xl font-bold text-primary">
                PharmaFlow
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Tạo tài khoản mới
            </h1>
            <p className="text-gray-600">
              Tham gia PharmaFlow để quản lý nhà thuốc hiệu quả
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 animate-in fade-in slide-in-from-left-5 duration-700 delay-200"
          >
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Họ và tên
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Nguyễn Văn A"
                {...register("name", {
                  required: "Họ tên là bắt buộc",
                  minLength: {
                    value: 2,
                    message: "Họ tên phải có ít nhất 2 ký tự",
                  },
                })}
                className="h-11 rounded-lg"
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

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
              <Label htmlFor="phone" className="text-sm font-medium">
                Số điện thoại
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+84 123 456 789"
                {...register("phone", {
                  required: "Số điện thoại là bắt buộc",
                  pattern: {
                    value: /^[0-9+\s-()]+$/,
                    message: "Số điện thoại không hợp lệ",
                  },
                })}
                className="h-11 rounded-lg"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">
                Địa chỉ
              </Label>
              <Input
                id="address"
                type="text"
                placeholder="123 Đường ABC, Quận XYZ, TP. HCM"
                {...register("address", {
                  required: "Địa chỉ là bắt buộc",
                  minLength: {
                    value: 5,
                    message: "Địa chỉ phải có ít nhất 5 ký tự",
                  },
                })}
                className="h-11 rounded-lg"
              />
              {errors.address && (
                <p className="text-sm text-destructive">
                  {errors.address.message}
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
                placeholder="Tạo mật khẩu mạnh"
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Xác nhận mật khẩu
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu"
                {...register("confirmPassword", {
                  required: "Vui lòng xác nhận mật khẩu",
                  validate: (value) =>
                    value === password || "Mật khẩu không khớp",
                })}
                className="h-11 rounded-lg"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="agreePolicy"
                  {...register("agreePolicy", {
                    required:
                      "Bạn phải đồng ý với chính sách để tiếp tục đăng ký.",
                  })}
                  className="accent-primary h-4 w-4 mt-0.5 cursor-pointer"
                />
                <span className="text-sm text-gray-700">
                  Tôi đồng ý với{" "}
                  <button
                    type="button"
                    onClick={() => setShowPolicyDialog(true)}
                    className="text-primary underline hover:text-primary/80 font-medium"
                  >
                    Chính sách bảo mật & Điều khoản dịch vụ
                  </button>
                </span>
              </Label>
              {errors.agreePolicy && (
                <p className="text-sm text-destructive mt-1">
                  {errors.agreePolicy.message}
                </p>
              )}

              <Label className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="agreePharmacyPolicy"
                  {...register("agreePharmacyPolicy", {
                    required:
                      "Bạn phải đồng ý tuân thủ quy định về kinh doanh thuốc.",
                  })}
                  className="accent-primary h-4 w-4 mt-0.5 cursor-pointer"
                />
                <span className="text-sm text-gray-700">
                  Tôi cam kết tuân thủ{" "}
                  <button
                    type="button"
                    onClick={() => setShowPharmacyPolicyDialog(true)}
                    className="text-primary underline hover:text-primary/80 font-medium"
                  >
                    Nghị định 102/2016/NĐ-CP về điều kiện kinh doanh thuốc
                  </button>
                </span>
              </Label>
              {errors.agreePharmacyPolicy && (
                <p className="text-sm text-destructive mt-1">
                  {errors.agreePharmacyPolicy.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium mt-6 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              {registerMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loading className="h-4 w-4 text-white" />
                  Đang tạo tài khoản...
                </span>
              ) : (
                "Đăng ký"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center animate-in fade-in duration-700 delay-300">
            <p className="text-sm text-gray-600">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="text-primary font-medium hover:underline transition-all"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div
        className="hidden lg:flex flex-1 bg-cover bg-center bg-no-repeat relative animate-in fade-in slide-in-from-right-10 duration-700"
        style={{
          backgroundImage: `url(${backgroundImg})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/70 animate-in fade-in duration-1000" />
        <div className="relative z-10 flex flex-col items-center justify-center text-white p-12 text-center">
          <h2 className="text-4xl font-bold mb-4 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-500">
            Bắt đầu hành trình số hóa
          </h2>
          <p className="text-xl text-white/90 max-w-md mb-8 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-700">
            Quản lý nhà thuốc chuyên nghiệp với hệ thống tự động hóa toàn diện
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-md w-full animate-in fade-in zoom-in-95 duration-700 delay-1000">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 transform transition-all hover:scale-105 hover:bg-white/20 duration-300">
              <div className="text-3xl font-bold">1000+</div>
              <div className="text-sm text-white/90">Sản phẩm</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 transform transition-all hover:scale-105 hover:bg-white/20 duration-300">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm text-white/90">Hỗ trợ</div>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Dialog */}
      <Dialog open={showPolicyDialog} onOpenChange={setShowPolicyDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <ScrollText className="w-6 h-6 text-primary" />
              Chính sách bảo mật & Điều khoản dịch vụ
            </DialogTitle>
            <DialogDescription>
              Vui lòng đọc kỹ các điều khoản trước khi đồng ý
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-2">1. Giới thiệu</h3>
              <p className="text-gray-700 leading-relaxed">
                Chào mừng bạn đến với PharmaFlow - Hệ thống quản lý nhà thuốc.
                Bằng cách đăng ký tài khoản, bạn đồng ý tuân thủ các điều khoản
                và điều kiện sau đây.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                2. Thu thập thông tin
              </h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                Chúng tôi thu thập các thông tin sau:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Họ tên, email, số điện thoại</li>
                <li>Địa chỉ liên lạc</li>
                <li>Thông tin đăng nhập và mật khẩu (được mã hóa)</li>
                <li>Lịch sử giao dịch và đơn hàng</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                3. Sử dụng thông tin
              </h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                Thông tin của bạn được sử dụng để:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Xử lý đơn hàng và giao dịch</li>
                <li>Cung cấp dịch vụ hỗ trợ khách hàng</li>
                <li>Gửi thông báo về đơn hàng và khuyến mãi</li>
                <li>Cải thiện chất lượng dịch vụ</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                4. Bảo mật thông tin
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn bằng các biện
                pháp bảo mật hiện đại. Thông tin của bạn sẽ không được chia sẻ
                với bên thứ ba mà không có sự đồng ý của bạn, trừ khi được yêu
                cầu bởi pháp luật.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                5. Quyền và trách nhiệm
              </h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                Người dùng có quyền:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Truy cập và cập nhật thông tin cá nhân</li>
                <li>Yêu cầu xóa tài khoản và dữ liệu</li>
                <li>Từ chối nhận email marketing</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-2">
                Người dùng có trách nhiệm:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Cung cấp thông tin chính xác và đầy đủ</li>
                <li>Bảo mật thông tin đăng nhập</li>
                <li>Tuân thủ quy định và pháp luật hiện hành</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                6. Chính sách đặt hàng
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Đơn hàng sẽ được xử lý sau khi xác nhận thanh toán. Chúng tôi có
                quyền từ chối hoặc hủy đơn hàng trong trường hợp phát hiện thông
                tin sai lệch hoặc hành vi gian lận.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                7. Chính sách đổi trả
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Khách hàng có thể đổi trả sản phẩm trong vòng 7 ngày kể từ ngày
                mua hàng, với điều kiện sản phẩm còn nguyên vẹn, chưa sử dụng và
                có hóa đơn. Thuốc kê đơn không được phép đổi trả.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                8. Điều khoản thay đổi
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Chúng tôi có quyền cập nhật điều khoản này bất cứ lúc nào. Các
                thay đổi sẽ được thông báo qua email hoặc trên trang web. Việc
                tiếp tục sử dụng dịch vụ sau khi có thay đổi đồng nghĩa với việc
                bạn chấp nhận các điều khoản mới.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">9. Liên hệ</h3>
              <p className="text-gray-700 leading-relaxed">
                Nếu có bất kỳ câu hỏi nào về chính sách này, vui lòng liên hệ
                với chúng tôi:
              </p>
              <ul className="list-none space-y-1 text-gray-700 ml-4 mt-2">
                <li>
                  <strong>Email:</strong> support@pharmaflow.com
                </li>
                <li>
                  <strong>Hotline:</strong> 1900 1234
                </li>
              </ul>
            </section>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowPolicyDialog(false)}
            >
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pharmacy Policy Dialog */}
      <PharmacyPolicyDialog
        open={showPharmacyPolicyDialog}
        onOpenChange={setShowPharmacyPolicyDialog}
      />
    </div>
  );
}
