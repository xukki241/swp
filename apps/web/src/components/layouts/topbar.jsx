import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser, useLogout } from "@/hooks/useAuth";
import { Bell, PanelLeft, Settings } from "lucide-react";
import { useNavigate } from "react-router";

export function Topbar({ title, onToggleSidebar, sidebarCollapsed }) {
  const logoutMutation = useLogout();
  const { data: currentUser, isLoading } = useCurrentUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleProfileClick = () => {
    navigate("/user-profile");
  };

  const handleSettingClick = () => {
    console.log("go to setting");
  };

  // Get user initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const userName = currentUser?.user?.name || "User";
  const userEmail = currentUser?.user?.email || "";
  const userRole = currentUser?.user?.role || "user";
  const userInitials = getInitials(userName);
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-card px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="rounded-xl hover:bg-primary cursor-pointer"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl hover:bg-secondary cursor-pointer"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl hover:bg-secondary cursor-pointer"
        >
          <Settings className="h-5 w-5" />
        </Button>

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild className=" cursor-pointer">
            <button className="relative h-10 w-10 rounded-full hover:bg-secondary outline-none focus:ring-2 focus:ring-primary">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src="/pharmacist-consultation.png"
                  alt={userName}
                />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">
                  {isLoading ? "Loading..." : userName}
                </p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
                {userRole && (
                  <p className="text-xs text-muted-foreground capitalize">
                    Role: {userRole}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="rounded-lg cursor-pointer"
              onClick={handleProfileClick}
            >
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-lg cursor-pointer"
              onClick={handleSettingClick}
            >
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="rounded-lg text-destructive cursor-pointer"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
