import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink, FileText } from "lucide-react";

export default function PharmacyPolicyDialog({ open, onOpenChange }) {
  const regulationUrl =
    "https://tulieuvankien.dangcongsan.vn/he-thong-van-ban/van-ban-quy-pham-phap-luat/nghi-dinh-so-1022016nd-cp-ngay-172016-cua-chinh-phu-quy-dinh-dieu-kien-kinh-doanh-thuoc-2171";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <FileText className="w-6 h-6 text-primary" />
            Quy định về Điều kiện Kinh doanh Thuốc
          </DialogTitle>
          <DialogDescription>
            Nghị định số 102/2016/NĐ-CP ngày 01/7/2016 của Chính phủ
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 text-sm">
          {/* Link to Official Document */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 mb-3 font-medium">
              📋 Văn bản chính thức từ Chính phủ Việt Nam
            </p>
            <a
              href={regulationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium underline"
            >
              Xem toàn văn Nghị định 102/2016/NĐ-CP
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Summary of Key Points */}
          <section>
            <h3 className="font-semibold text-base mb-3 text-gray-900">
              Tóm tắt những điểm chính
            </h3>

            <div className="space-y-4">
              <div className="pl-4 border-l-4 border-primary/30">
                <h4 className="font-semibold text-gray-800 mb-2">
                  1. Điều kiện chung về kinh doanh thuốc
                </h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                  <li>
                    Có Giấy chứng nhận đủ điều kiện kinh doanh do cơ quan có
                    thẩm quyền cấp
                  </li>
                  <li>Có cơ sở vật chất, trang thiết bị phù hợp</li>
                  <li>
                    Có đội ngũ nhân viên đủ trình độ chuyên môn (dược sĩ, người
                    bán thuốc)
                  </li>
                  <li>Đảm bảo các điều kiện về bảo quản thuốc</li>
                </ul>
              </div>

              <div className="pl-4 border-l-4 border-primary/30">
                <h4 className="font-semibold text-gray-800 mb-2">
                  2. Quy định về người hành nghề
                </h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                  <li>
                    Dược sĩ hoặc người có chứng chỉ hành nghề dược được phép bán
                    thuốc
                  </li>
                  <li>
                    Phải có Giấy chứng nhận đủ điều kiện hành nghề dược còn hiệu
                    lực
                  </li>
                  <li>Tuân thủ các quy định về đạo đức nghề nghiệp</li>
                  <li>Thường xuyên cập nhật kiến thức chuyên môn</li>
                </ul>
              </div>

              <div className="pl-4 border-l-4 border-primary/30">
                <h4 className="font-semibold text-gray-800 mb-2">
                  3. Thuốc kê đơn và thuốc không kê đơn
                </h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                  <li>
                    <strong>Thuốc kê đơn:</strong> Chỉ được bán khi có đơn thuốc
                    hợp lệ của bác sĩ
                  </li>
                  <li>
                    <strong>Thuốc không kê đơn:</strong> Có thể bán trực tiếp
                    cho người mua
                  </li>
                  <li>Phải tư vấn đầy đủ về cách sử dụng, liều lượng</li>
                  <li>Lưu giữ đơn thuốc theo quy định (tối thiểu 2 năm)</li>
                </ul>
              </div>

              <div className="pl-4 border-l-4 border-primary/30">
                <h4 className="font-semibold text-gray-800 mb-2">
                  4. Quản lý chất lượng thuốc
                </h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                  <li>Đảm bảo thuốc có nguồn gốc rõ ràng, hợp pháp</li>
                  <li>
                    Bảo quản thuốc đúng điều kiện (nhiệt độ, độ ẩm, ánh sáng)
                  </li>
                  <li>Kiểm tra hạn sử dụng thường xuyên</li>
                  <li>Không được bán thuốc hết hạn, kém chất lượng</li>
                  <li>Ghi chép đầy đủ nhập - xuất - tồn kho theo quy định</li>
                </ul>
              </div>

              <div className="pl-4 border-l-4 border-primary/30">
                <h4 className="font-semibold text-gray-800 mb-2">
                  5. Trách nhiệm với khách hàng
                </h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                  <li>
                    Tư vấn đầy đủ, chính xác về tác dụng, cách dùng, liều lượng
                  </li>
                  <li>Cảnh báo về tác dụng phụ và chống chỉ định</li>
                  <li>Cung cấp hóa đơn, chứng từ đầy đủ</li>
                  <li>Bảo mật thông tin sức khỏe của khách hàng</li>
                  <li>Xử lý khiếu nại, đổi trả theo quy định</li>
                </ul>
              </div>

              <div className="pl-4 border-l-4 border-primary/30">
                <h4 className="font-semibold text-gray-800 mb-2">
                  6. Cơ sở vật chất và trang thiết bị
                </h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                  <li>Diện tích tối thiểu theo quy định</li>
                  <li>Hệ thống bảo quản (tủ lạnh, kho chứa phù hợp)</li>
                  <li>Thiết bị đo nhiệt độ, độ ẩm</li>
                  <li>Khu vực riêng biệt cho thuốc cần điều kiện đặc biệt</li>
                  <li>Đảm bảo vệ sinh, an toàn lao động</li>
                </ul>
              </div>

              <div className="pl-4 border-l-4 border-primary/30">
                <h4 className="font-semibold text-gray-800 mb-2">
                  7. Ghi chép và lưu trữ
                </h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                  <li>Sổ sách ghi chép nhập - xuất - tồn đầy đủ</li>
                  <li>Lưu trữ đơn thuốc kê đơn tối thiểu 2 năm</li>
                  <li>Báo cáo định kỳ theo yêu cầu cơ quan quản lý</li>
                  <li>Lưu giữ chứng từ mua bán thuốc</li>
                  <li>Có hồ sơ chất lượng sản phẩm</li>
                </ul>
              </div>

              <div className="pl-4 border-l-4 border-red-400 bg-red-50 p-3 rounded">
                <h4 className="font-semibold text-red-800 mb-2">
                  8. Các hành vi bị cấm
                </h4>
                <ul className="list-disc list-inside space-y-1 text-red-700 ml-2">
                  <li>Kinh doanh thuốc giả, thuốc kém chất lượng</li>
                  <li>Kinh doanh thuốc không rõ nguồn gốc</li>
                  <li>Kinh doanh thuốc hết hạn sử dụng</li>
                  <li>Bán thuốc kê đơn không có đơn hợp lệ</li>
                  <li>Quảng cáo sai sự thật về công dụng thuốc</li>
                  <li>Bảo quản thuốc không đúng quy định</li>
                </ul>
              </div>

              <div className="pl-4 border-l-4 border-amber-400 bg-amber-50 p-3 rounded">
                <h4 className="font-semibold text-amber-800 mb-2">
                  9. Xử phạt vi phạm
                </h4>
                <p className="text-amber-700 mb-2">
                  Tùy theo mức độ vi phạm, cơ sở kinh doanh thuốc có thể bị:
                </p>
                <ul className="list-disc list-inside space-y-1 text-amber-700 ml-2">
                  <li>Cảnh cáo</li>
                  <li>
                    Phạt tiền hành chính (từ vài triệu đến hàng trăm triệu đồng)
                  </li>
                  <li>Đình chỉ hoạt động có thời hạn</li>
                  <li>Thu hồi Giấy chứng nhận đủ điều kiện kinh doanh</li>
                  <li>
                    Truy cứu trách nhiệm hình sự (các trường hợp nghiêm trọng)
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Commitment */}
          <section className="bg-primary/5 p-4 rounded-lg border border-primary/20">
            <h3 className="font-semibold text-base mb-2 text-primary">
              Cam kết tuân thủ
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Bằng cách đồng ý với quy định này, bạn cam kết sẽ tuân thủ đầy đủ
              các quy định của pháp luật Việt Nam về kinh doanh thuốc, đảm bảo
              chất lượng dịch vụ và an toàn sức khỏe cho người dùng.
            </p>
          </section>

          {/* Additional Resources */}
          <section>
            <h3 className="font-semibold text-base mb-2 text-gray-900">
              Tài liệu tham khảo thêm
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.moh.gov.vn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 underline inline-flex items-center gap-1"
                >
                  Bộ Y tế Việt Nam
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://dav.gov.vn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 underline inline-flex items-center gap-1"
                >
                  Cục Quản lý Dược Việt Nam
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </section>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
