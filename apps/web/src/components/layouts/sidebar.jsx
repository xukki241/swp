import { sidebarConfig } from "@/config/sidebar-config";
import { cn } from "@/lib/utils";
import { Pill } from "lucide-react";
import { Link } from "react-router";
import { SidebarItem } from "./sidebar-item";

export function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Pill className="h-6 w-6 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-primary">PharmaFlow</span>
          )}
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {sidebarConfig.map((item) => (
          <SidebarItem key={item.title} item={item} collapsed={collapsed} />
        ))}
      </nav>
    </aside>
  );
}
