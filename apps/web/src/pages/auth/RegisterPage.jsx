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
        <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <ScrollText className="w-6 h-6 text-primary" />
              Chính sách bảo mật & Bảo vệ dữ liệu cá nhân
            </DialogTitle>
            <DialogDescription>
              Tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 text-sm">
            {/* Link to Official Document */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 mb-3 font-medium">
                📋 Tham chiếu pháp lý
              </p>
              <a
                href="https://baovedlcn.vn/nghi-dinh-13-ve-bao-ve-du-lieu-ca-nhan-dpvn/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium underline text-sm"
              >
                Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>

            <section>
              <h3 className="font-semibold text-base mb-2">1. Giới thiệu</h3>
              <p className="text-gray-700 leading-relaxed">
                Chào mừng bạn đến với PharmaFlow - Hệ thống quản lý nhà thuốc.
                Bằng cách đăng ký tài khoản, bạn đồng ý với chính sách bảo mật
                và bảo vệ dữ liệu cá nhân của chúng tôi, tuân thủ Nghị định
                13/2023/NĐ-CP ngày 17/4/2023 của Chính phủ về bảo vệ dữ liệu cá
                nhân.
              </p>
            </section>

            <section className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-base mb-3 text-amber-900">
                2. Dữ liệu cá nhân được thu thập
              </h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                Theo Nghị định 13/2023/NĐ-CP, chúng tôi thu thập các dữ liệu cá
                nhân sau:
              </p>
              <div className="space-y-3">
                <div className="pl-4 border-l-4 border-amber-400">
                  <p className="font-semibold text-gray-800 mb-1">
                    a) Dữ liệu cá nhân cơ bản:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                    <li>Họ và tên</li>
                    <li>Địa chỉ email</li>
                    <li>Số điện thoại</li>
                    <li>Địa chỉ liên lạc</li>
                  </ul>
                </div>
                <div className="pl-4 border-l-4 border-amber-400">
                  <p className="font-semibold text-gray-800 mb-1">
                    b) Dữ liệu tài khoản:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                    <li>Tên đăng nhập (email)</li>
                    <li>Mật khẩu (được mã hóa bảo mật)</li>
                    <li>Vai trò và quyền hạn</li>
                  </ul>
                </div>
                <div className="pl-4 border-l-4 border-amber-400">
                  <p className="font-semibold text-gray-800 mb-1">
                    c) Dữ liệu hoạt động:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                    <li>Lịch sử giao dịch và đơn hàng</li>
                    <li>Nhật ký truy cập hệ thống</li>
                    <li>Thông tin về các thao tác trong hệ thống</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                3. Mục đích xử lý dữ liệu cá nhân
              </h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                Dữ liệu cá nhân của bạn được xử lý cho các mục đích sau:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Xác thực danh tính và quản lý tài khoản</li>
                <li>Xử lý đơn hàng và giao dịch bán thuốc</li>
                <li>Cung cấp dịch vụ hỗ trợ khách hàng</li>
                <li>
                  Tuân thủ quy định pháp luật về kinh doanh dược phẩm (lưu trữ
                  đơn thuốc, ghi chép giao dịch)
                </li>
                <li>Gửi thông báo quan trọng về tài khoản và dịch vụ</li>
                <li>Cải thiện và phát triển dịch vụ</li>
                <li>Phân tích thống kê và báo cáo quản lý</li>
              </ul>
            </section>

            <section className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-base mb-3 text-green-900">
                4. Quyền của chủ thể dữ liệu (Theo Nghị định 13)
              </h3>
              <div className="space-y-2">
                <div className="pl-4 border-l-4 border-green-400">
                  <p className="font-semibold text-gray-800 mb-1">
                    Bạn có các quyền sau đối với dữ liệu cá nhân của mình:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                    <li>
                      <strong>Quyền được biết:</strong> Biết về việc thu thập,
                      xử lý dữ liệu cá nhân của mình
                    </li>
                    <li>
                      <strong>Quyền đồng ý:</strong> Đồng ý hoặc không đồng ý
                      cho phép xử lý dữ liệu cá nhân
                    </li>
                    <li>
                      <strong>Quyền truy cập:</strong> Được truy cập, xem xét dữ
                      liệu cá nhân của mình
                    </li>
                    <li>
                      <strong>Quyền chỉnh sửa:</strong> Yêu cầu sửa chữa, bổ
                      sung dữ liệu không chính xác
                    </li>
                    <li>
                      <strong>Quyền xóa dữ liệu:</strong> Yêu cầu xóa dữ liệu cá
                      nhân trong các trường hợp theo quy định
                    </li>
                    <li>
                      <strong>Quyền hạn chế xử lý:</strong> Yêu cầu hạn chế xử
                      lý dữ liệu cá nhân
                    </li>
                    <li>
                      <strong>Quyền cung cấp lại:</strong> Yêu cầu cung cấp lại
                      dữ liệu cá nhân đã cung cấp
                    </li>
                    <li>
                      <strong>Quyền phản đối:</strong> Phản đối việc xử lý dữ
                      liệu cá nhân
                    </li>
                    <li>
                      <strong>Quyền rút lại sự đồng ý:</strong> Rút lại sự đồng
                      ý đã cấp (trừ trường hợp pháp luật yêu cầu)
                    </li>
                    <li>
                      <strong>Quyền khiếu nại:</strong> Khiếu nại, tố cáo hoặc
                      khởi kiện về bảo vệ dữ liệu cá nhân
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                5. Bảo mật và bảo vệ dữ liệu
              </h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức phù hợp để
                bảo vệ dữ liệu cá nhân:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>
                  Mã hóa dữ liệu nhạy cảm (mật khẩu, thông tin thanh toán)
                </li>
                <li>Sử dụng kết nối HTTPS/SSL cho toàn bộ hệ thống</li>
                <li>Kiểm soát truy cập dựa trên vai trò (RBAC)</li>
                <li>
                  Lưu trữ nhật ký hoạt động để phát hiện truy cập trái phép
                </li>
                <li>Sao lưu dữ liệu định kỳ và bảo mật</li>
                <li>Đào tạo nhân viên về bảo mật và bảo vệ dữ liệu cá nhân</li>
                <li>Kiểm tra và cập nhật bảo mật thường xuyên</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                6. Chia sẻ dữ liệu với bên thứ ba
              </h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                Dữ liệu cá nhân của bạn có thể được chia sẻ trong các trường hợp
                sau:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>
                  Với cơ quan nhà nước có thẩm quyền khi có yêu cầu theo quy
                  định pháp luật
                </li>
                <li>
                  Với đơn vị cung cấp dịch vụ thanh toán (nếu sử dụng thanh toán
                  trực tuyến)
                </li>
                <li>
                  Với bên cung cấp dịch vụ kỹ thuật hỗ trợ vận hành hệ thống (đã
                  ký hợp đồng bảo mật)
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-2">
                <strong>Cam kết:</strong> Chúng tôi KHÔNG bán, cho thuê hoặc
                trao đổi dữ liệu cá nhân của bạn cho mục đích thương mại với bên
                thứ ba.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                7. Thời gian lưu trữ dữ liệu
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>
                  <strong>Dữ liệu tài khoản:</strong> Lưu trữ trong suốt thời
                  gian tài khoản hoạt động + 2 năm sau khi đóng tài khoản
                </li>
                <li>
                  <strong>Dữ liệu giao dịch thuốc:</strong> Tối thiểu 5 năm theo
                  quy định quản lý dược
                </li>
                <li>
                  <strong>Đơn thuốc kê đơn:</strong> Tối thiểu 2 năm theo Luật
                  Dược
                </li>
                <li>
                  <strong>Nhật ký hệ thống:</strong> 12 tháng cho mục đích bảo
                  mật và kiểm toán
                </li>
              </ul>
            </section>

            <section className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="font-semibold text-base mb-2 text-red-900">
                8. Thông báo sự cố dữ liệu cá nhân
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Trong trường hợp xảy ra sự cố mất an toàn dữ liệu cá nhân, chúng
                tôi cam kết:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                <li>Thông báo cho chủ thể dữ liệu trong vòng 72 giờ</li>
                <li>Thông báo cho cơ quan quản lý nhà nước có thẩm quyền</li>
                <li>Áp dụng biện pháp khắc phục và ngăn chặn ngay lập tức</li>
                <li>
                  Hỗ trợ chủ thể dữ liệu trong việc bảo vệ quyền và lợi ích hợp
                  pháp
                </li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                9. Cập nhật chính sách
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Chúng tôi có thể cập nhật chính sách này để phản ánh các thay
                đổi trong hoạt động kinh doanh hoặc pháp luật. Mọi thay đổi quan
                trọng sẽ được thông báo qua email hoặc thông báo trên hệ thống
                trước khi có hiệu lực.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                10. Liên hệ về bảo vệ dữ liệu cá nhân
              </h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                Nếu bạn có bất kỳ câu hỏi, yêu cầu hoặc khiếu nại nào về bảo vệ
                dữ liệu cá nhân, vui lòng liên hệ:
              </p>
              <div className="bg-gray-50 p-3 rounded border">
                <ul className="list-none space-y-2 text-gray-700">
                  <li>
                    <strong>Người phụ trách bảo vệ dữ liệu:</strong> Ban Quản lý
                    PharmaFlow
                  </li>
                  <li>
                    <strong>Email:</strong> privacy@pharmaflow.com
                  </li>
                  <li>
                    <strong>Hotline:</strong> 1900 1234
                  </li>
                  <li>
                    <strong>Địa chỉ:</strong> [Địa chỉ công ty]
                  </li>
                </ul>
              </div>
            </section>

            <section className="bg-primary/5 p-4 rounded-lg border border-primary/20">
              <h3 className="font-semibold text-base mb-2 text-primary">
                Cam kết tuân thủ
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Bằng cách đồng ý với chính sách này, bạn xác nhận đã đọc, hiểu
                và đồng ý với các điều khoản về thu thập, xử lý và bảo vệ dữ
                liệu cá nhân theo Nghị định 13/2023/NĐ-CP và các quy định pháp
                luật liên quan.
              </p>
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
