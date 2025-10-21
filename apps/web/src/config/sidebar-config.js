import {
  LayoutDashboard,
  Truck,
  ClipboardList,
  Package,
  ShoppingCart,
  BarChart2,
  Settings,
  Users,
  Pill,
  CreditCard,
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
    title: "Medications",
    icon: Pill,
    path: "/medications",
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
      { label: "Point of Sale (POS)", path: "/sales" },
      { label: "Sales Orders", path: "/sales/orders" },
    ],
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
