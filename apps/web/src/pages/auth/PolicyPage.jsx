import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "react-router";

export default function PolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/register">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại Đăng ký
          </Button>
        </Link>

        <Card className="shadow-lg rounded-2xl border-0">
          <CardHeader className="space-y-4 pb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-gray-800">
                  Chính sách bảo mật & Điều khoản dịch vụ
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  Chính sách Bảo mật & Điều khoản PharmaFlow
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 pt-0 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                1. Giới thiệu
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Chào mừng đến với PharmaFlow - Hệ thống Quản lý Kho hàng và Bán
                hàng Thông minh. Bằng việc đăng ký và sử dụng dịch vụ của chúng
                tôi, bạn đồng ý tuân thủ các điều khoản và chính sách được nêu
                trong tài liệu này.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                2. Điều khoản sử dụng
              </h2>
              <p className="text-gray-600 leading-relaxed mb-2">
                Khi sử dụng PharmaFlow, bạn cam kết:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>Cung cấp thông tin chính xác và đầy đủ khi đăng ký</li>
                <li>Bảo mật thông tin đăng nhập của bạn</li>
                <li>Chỉ sử dụng hệ thống cho các mục đích hợp pháp</li>
                <li>Tuân thủ các quy định về quản lý dược phẩm</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                3. Chính sách bảo mật
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn. Dữ liệu của
                bạn được mã hóa và lưu trữ an toàn. Chúng tôi không chia sẻ
                thông tin của bạn với bên thứ ba mà không có sự đồng ý của bạn.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                4. Quyền và trách nhiệm
              </h2>
              <p className="text-gray-600 leading-relaxed">
                PharmaFlow cung cấp nền tảng quản lý kho hàng và bán hàng. Người
                dùng chịu trách nhiệm về tính chính xác của dữ liệu nhập vào hệ
                thống và tuân thủ các luật liên quan đến hoạt động kinh doanh
                dược phẩm.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                5. Liên hệ
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Nếu bạn có bất kỳ câu hỏi nào về chính sách này, vui lòng liên
                hệ với chúng tôi qua email: support@pharmaflow.com
              </p>
            </section>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
