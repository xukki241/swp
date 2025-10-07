import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { Pill, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { useRegister } from "@/hooks/useAuth";

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      confirmPassword: "",
    },
  });

  const registerMutation = useRegister();
  const password = watch("password");

  const onSubmit = (data) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl border-0">
        <CardHeader className="space-y-4 text-center pb-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Pill className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-gray-800">
              Create an Account
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Join PharmaFlow to get started
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-8 pt-4">
          {registerMutation.isError && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>
                {registerMutation.error?.message ||
                  "Registration failed. Please try again."}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                {...register("name", {
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
                className="h-11 rounded-lg"
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className="h-11 rounded-lg"
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+84 123 456 789"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9+\s-()]+$/,
                    message: "Invalid phone number",
                  },
                })}
                className="h-11 rounded-lg"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">
                Address
              </Label>
              <Input
                id="address"
                type="text"
                placeholder="123 Main Street, District, City"
                {...register("address", {
                  required: "Address is required",
                  minLength: {
                    value: 5,
                    message: "Address must be at least 5 characters",
                  },
                })}
                className="h-11 rounded-lg"
              />
              {errors.address && (
                <p className="text-sm text-destructive">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                className="h-11 rounded-lg"
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
                className="h-11 rounded-lg"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium mt-6"
            >
              {registerMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loading className="h-4 w-4 text-white" />
                  Creating account...
                </span>
              ) : (
                "Register"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary font-medium hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
