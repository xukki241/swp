"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { customerService } from "@/services/customerService";
import { Loader2, Save, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function EditCustomerForm({ customer, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: customer.name || "",
    email: customer.email || "",
    phone: customer.phone || "",
    address: customer.address || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên khách hàng");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Định dạng email không hợp lệ");
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      };

      const trimmedEmail = formData.email.trim();
      if (trimmedEmail) {
        updateData.email = trimmedEmail;
      }

      const trimmedAddress = formData.address.trim();
      if (trimmedAddress) {
        updateData.address = trimmedAddress;
      }

      const response = await customerService.updateCustomer(
        customer.id,
        updateData
      );

      const updatedCustomer = response.data || response;
      toast.success("Cập nhật thông tin khách hàng thành công!");
      onSuccess(updatedCustomer);
      onClose();
    } catch (error) {
      console.error("Lỗi cập nhật khách hàng:", error);

      let message = "Không thể cập nhật thông tin khách hàng";
      if (error?.response?.data?.error) {
        const errorData = error.response.data.error;
        if (typeof errorData === "object" && errorData.message) {
          message = errorData.message;
        } else if (typeof errorData === "string") {
          message = errorData;
        }
      } else if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else if (error?.message) {
        message = error.message;
      }

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">
          Chỉnh sửa thông tin khách hàng
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={isSubmitting}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="edit-name" className="text-sm font-medium">
            Tên khách hàng <span className="text-red-500">*</span>
          </Label>
          <Input
            id="edit-name"
            placeholder="Nhập tên khách hàng"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-phone" className="text-sm font-medium">
            Số điện thoại <span className="text-red-500">*</span>
          </Label>
          <Input
            id="edit-phone"
            type="tel"
            placeholder="Nhập số điện thoại"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-email" className="text-sm font-medium">
            Email (Không bắt buộc)
          </Label>
          <Input
            id="edit-email"
            type="email"
            placeholder="Nhập địa chỉ email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground">
            Hóa đơn sẽ được gửi đến email này (nếu có)
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-address" className="text-sm font-medium">
            Địa chỉ (Không bắt buộc)
          </Label>
          <Input
            id="edit-address"
            placeholder="Nhập địa chỉ khách hàng"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            disabled={isSubmitting}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Lưu thay đổi
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
}
