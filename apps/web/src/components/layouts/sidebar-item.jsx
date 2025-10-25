import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router";

export function SidebarItem({ item, collapsed }) {
  const location = useLocation();
  const pathname = location.pathname;
  const [isOpen, setIsOpen] = useState(false);
  const Icon = item.icon;

  // Get user role from localStorage
  const getUserRole = () => {
    const userInfo = localStorage.getItem("user"); // Fixed: key is "user" not "userInfo"
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      return parsed.role;
    }
    return null;
  };

  const userRole = getUserRole();

  // Check if user has access to this item
  // If no user role (not logged in), hide items with role restrictions
  // If item has no roles defined, show to all users
  if (item.roles && item.roles.length > 0) {
    // If user not logged in, hide all restricted items
    if (!userRole) {
      return null;
    }
    // If logged in but role doesn't match, hide
    if (!item.roles.includes(userRole)) {
      return null;
    }
  }

  const hasChildren = item.children && item.children.length > 0;

  // Filter children by role
  const accessibleChildren = hasChildren
    ? item.children.filter((child) => {
        if (!child.roles || child.roles.length === 0) return true;
        if (!userRole) return false;
        return child.roles.includes(userRole);
      })
    : [];

  const isActive = item.path ? pathname === item.path : false;
  const hasActiveChild =
    accessibleChildren.length > 0 &&
    accessibleChildren.some((child) => pathname === child.path);

  const handleClick = () => {
    if (accessibleChildren.length > 0 && !collapsed) {
      setIsOpen(!isOpen);
    }
  };

  // Single menu item (no children)
  if (!hasChildren && item.path) {
    return (
      <Link
        to={item.path}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
            : "text-sidebar-foreground"
        )}
        title={collapsed ? item.title : undefined}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span>{item.title}</span>}
      </Link>
    );
  }

  // Menu with children
  return (
    <div>
      <button
        onClick={handleClick}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          hasActiveChild
            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
            : "text-sidebar-foreground"
        )}
        title={collapsed ? item.title : undefined}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{item.title}</span>
            {accessibleChildren.length > 0 && (
              <span className="transition-transform duration-200">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </span>
            )}
          </>
        )}
      </button>

      {accessibleChildren.length > 0 && !collapsed && (
        <div
          className={cn(
            "overflow-hidden transition-all duration-200 ease-in-out",
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="space-y-1 py-1">
            {accessibleChildren.map((child) => {
              const isChildActive = pathname === child.path;
              return (
                <Link
                  key={child.path}
                  to={child.path}
                  className={cn(
                    "flex items-center rounded-lg py-2 pl-10 pr-3 text-sm transition-colors",
                    "hover:text-sidebar-accent-foreground",
                    isChildActive
                      ? "font-medium text-sidebar-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {child.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
