import * as React from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  Truck,
  ShoppingCart,
  BarChart2,
  Settings,
  Pill,
  FileText,
  AlertTriangle,
  ClipboardList,
  Layers,
  Sparkles,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "Pharma Owner",
    email: "owner@pharmaflow.com",
    avatar: "/avatars/pharma.png",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: LayoutDashboard,
      items: [
        { title: "Overview", url: "#" },
        { title: "Low Stock", url: "#", icon: Package },
        { title: "Expiring Products", url: "#", icon: AlertTriangle },
      ],
    },
    {
      title: "Staff Management",
      url: "#",
      icon: Users,
      items: [{ title: "Staff Accounts", url: "#" }],
    },
    {
      title: "Products",
      url: "#",
      icon: Package,
      items: [{ title: "All Products", url: "#" }],
    },
    {
      title: "Inventory",
      url: "#",
      icon: Boxes,
      items: [
        { title: "Stock Management", url: "#", icon: Layers },
        { title: "Adjustments", url: "#", icon: FileText },
        { title: "Threshold & Expiry", url: "#", icon: AlertTriangle },
      ],
    },
    {
      title: "Suppliers & Orders",
      url: "#",
      icon: Truck,
      items: [
        { title: "Suppliers", url: "#" },
        { title: "Purchase Orders", url: "#", icon: ClipboardList },
        { title: "AI Suggestions", url: "#", icon: Sparkles },
      ],
    },
    {
      title: "Sales (POS)",
      url: "#",
      icon: ShoppingCart,
      items: [
        { title: "Point of Sale", url: "#" },
        { title: "Invoices", url: "#", icon: FileText },
      ],
    },
    {
      title: "Reports",
      url: "#",
      icon: BarChart2,
      items: [
        { title: "Sales Reports", url: "#" },
        { title: "Profit Reports", url: "#" },
        { title: "Inventory Value", url: "#" },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      items: [
        { title: "General", url: "#" },
        { title: "Security", url: "#" },
      ],
    },
  ],
};

export function AppSidebar({ ...props }) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  {/* icon viên thuốc */}
                  <Pill className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">PharmaFlow</span>
                  <span className="truncate text-xs">Smart Pharmacy</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
