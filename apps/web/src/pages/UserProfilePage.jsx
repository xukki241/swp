"use client";

import { useCurrentUser } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/layouts/app-layout";
import { Mail, Phone, User, KeyRound, PenBox } from "lucide-react";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function UserProfile() {
  const { data: currentUser, isLoading, isError } = useCurrentUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState(
    {
      name: "",
      email: "",
      phone: "",
      status: "",
    },
    [currentUser]
  );

  useEffect(() => {
    if (currentUser?.user) {
      setFormData({
        name: currentUser.user.name || "",
        email: currentUser.user.email || "",
        phone: currentUser.user.phone || "",
        status: currentUser.user.status || "",
      });
    }
  }, [currentUser]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = () => {
    console.log("save change");
    setIsDialogOpen(false);
  };

  const handleResetPassword = () => {
    console.log(
      "[v0] Reset password clicked for user:",
      currentUser?.user?.email
    );
    // TODO: Implement actual password reset logic
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="flex-1 space-y-3 w-full">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-56" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (isError || !currentUser?.user) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          <Card className="rounded-2xl border-destructive/50">
            <CardContent className="p-6">
              <p className="text-sm text-destructive">
                Failed to load user information. Please try again later.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const user = currentUser.user;

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusVariant = (status) => {
    if (status === "active") return "default";
    if (status === "inactive") return "secondary";
    return "outline";
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
        <Card className="rounded-2xl border-border shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold">User Profile</CardTitle>
            <CardDescription className="text-md">
              Your personal information and account settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar Section */}
              <Avatar className="h-24 w-24 border-4 border-primary/10">
                <AvatarImage
                  src="/pharmacist-consultation.png"
                  alt={user.name}
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>

              {/* User Info Section */}
              <div className="flex-1 space-y-4 w-full">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-foreground">
                    {user.name}
                  </h2>
                  <p className="text-sm text-muted-foreground capitalize flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {user.role || "User"}
                  </p>
                </div>

                {/* Status Badge */}
                {user.status && (
                  <Badge
                    variant={getStatusVariant(user.status)}
                    className="capitalize"
                  >
                    {user.status}
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
              {user.email && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Email
                    </p>
                    <p className="text-sm text-foreground break-words">
                      {user.email}
                    </p>
                  </div>
                </div>
              )}

              {user.phone && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Phone
                    </p>
                    <p className="text-sm text-foreground">{user.phone}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border flex flex-col sm:flex-row gap-3">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="default"
                    className="w-full sm:w-auto gap-2 cursor-pointer"
                  >
                    <PenBox className="h-4 w-4" />
                    Update Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] p-8">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Update your profile information. Click save when you're
                      done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          handleInputChange("status", value)
                        }
                      >
                        <SelectTrigger id="status" className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      className="cursor-pointer"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="cursor-pointer"
                      onClick={handleSaveChanges}
                    >
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                onClick={handleResetPassword}
                variant="outline"
                className="w-full sm:w-auto gap-2 bg-transparent cursor-pointer"
              >
                <KeyRound className="h-4 w-4" />
                Reset Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
