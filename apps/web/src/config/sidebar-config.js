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
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    roles: ["owner", "manager", "staff"],
  },
  {
    title: "Suppliers",
    icon: Truck,
    path: "/suppliers",
    roles: ["owner", "manager"],
  },
  {
    title: "Medications",
    icon: Pill,
    path: "/medications",
    roles: ["owner", "manager", "staff"],
  },
  {
    title: "Procurement",
    icon: ClipboardList,
    roles: ["owner", "manager"],
    children: [
      { label: "Purchase Orders", path: "/procurement/purchase-orders" },
      { label: "Receipts", path: "/procurement/receipts" },
    ],
  },
  {
    title: "Inventory",
    icon: Package,
    roles: ["owner", "manager", "staff"],
    children: [
      { label: "Stock Overview", path: "/inventory/stock" },
      { label: "Warehouse Map", path: "/inventory/warehouse" },
      { label: "Inventory Tracking", path: "/inventory/tracking" },
    ],
  },
  {
    title: "Sales",
    icon: ShoppingCart,
    roles: ["owner", "manager", "staff"],
    children: [
      { label: "Point of Sale (POS)", path: "/sales" },
      { label: "Sales Orders", path: "/sales/orders" },
    ],
  },
  {
    title: "Users",
    icon: Users,
    roles: ["owner"],
    children: [
      { label: "User List", path: "/users/list" },
      { label: "Registrations", path: "/users/registrations" },
    ],
  },
  {
    title: "Shifts",
    icon: Calendar,
    roles: ["owner", "manager", "staff"],
    children: [
      {
        label: "Shift Management",
        path: "/shifts/management",
        roles: ["owner", "manager"],
      },
      {
        label: "Shift Assignments",
        path: "/shifts/assignments",
        roles: ["owner", "manager"],
      },
      {
        label: "My Schedule",
        path: "/shifts/my-schedule",
        roles: ["owner", "manager", "staff"],
      },
    ],
  },
];
