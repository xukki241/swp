import {
  LayoutDashboard,
  Truck,
  ClipboardList,
  Package,
  ShoppingCart,
  BarChart2,
  Settings,
  Users,
} from "lucide-react";

export const sidebarConfig = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    title: "Suppliers",
    icon: Truck,
    path: "/suppliers",
  },
  {
    title: "Procurement",
    icon: ClipboardList,
    children: [
      { label: "Purchase Orders", path: "/procurement/purchase-orders" },
      { label: "Receipts", path: "/procurement/receipts" },
    ],
  },
  {
    title: "Inventory",
    icon: Package,
    children: [
      { label: "Stock Overview", path: "/inventory/stock" },
      { label: "Warehouse Map", path: "/inventory/warehouse" },
      { label: "Inventory Tracking", path: "/inventory/tracking" },
    ],
  },
  {
    title: "Sales",
    icon: ShoppingCart,
    children: [
      { label: "Sales Orders", path: "/sales/orders" },
      { label: "Customers", path: "/sales/customers" },
    ],
  },
  {
    title: "Reports",
    icon: BarChart2,
    path: "/reports",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
  },
  {
    title: "Users",
    icon: Users,
    children: [
      { label: "User List", path: "/users/list" },
      { label: "Registrations", path: "/users/registrations" },
    ],
  },
];
