import {
  Calendar,
  ClipboardList,
  LayoutDashboard,
  Package,
  Pill,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";

export const sidebarConfig = [
  {
    title: "Tổng quan",
    icon: LayoutDashboard,
    path: "/dashboard",
    roles: ["owner"],
  },
  {
    title: "Bán hàng",
    icon: ShoppingCart,
    roles: ["owner", "staff"],
    children: [
      { label: "Bán hàng (POS)", path: "/sales" },
      { label: "Đơn bán hàng", path: "/sales/orders" },
    ],
  },
  {
    title: "Mua hàng",
    icon: ClipboardList,
    roles: ["owner"],
    children: [
      { label: "Đơn đặt hàng", path: "/procurement/purchase-orders" },
      { label: "Phiếu nhập", path: "/procurement/receipts" },
    ],
  },
  {
    title: "Kho hàng",
    icon: Package,
    roles: ["owner", "staff"],
    children: [
      { label: "Tồn kho", path: "/inventory/stock" },
      { label: "Sơ đồ kho", path: "/inventory/warehouse" },
      { label: "Theo dõi nhập/xuất", path: "/inventory/tracking" },
    ],
  },
  {
    title: "Nhà cung cấp",
    icon: Truck,
    path: "/suppliers",
    roles: ["owner"],
  },
  {
    title: "Thuốc",
    icon: Pill,
    path: "/medications",
    roles: ["owner", "staff"],
  },
  {
    title: "Ca làm việc",
    icon: Calendar,
    roles: ["owner", "staff"],
    children: [
      {
        label: "Quản lý ca",
        path: "/shifts/management",
        roles: ["owner"],
      },
      {
        label: "Phân công ca",
        path: "/shifts/assignments",
        roles: ["owner"],
      },
      {
        label: "Lịch của tôi",
        path: "/shifts/my-schedule",
        roles: ["owner", "staff"],
      },
    ],
  },
  {
    title: "Người dùng",
    icon: Users,
    roles: ["owner"],
    children: [
      { label: "Danh sách", path: "/users/list" },
      { label: "Đăng ký chờ duyệt", path: "/users/registrations" },
    ],
  },
];
