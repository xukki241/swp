"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/ui/loading";
import { useVerifyResetOTP } from "@/hooks/useAuth";
import { AlertCircle, CheckCircle, Eye, EyeOff, Pill } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      identifier: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const verifyOTPMutation = useVerifyResetOTP();
  const newPassword = watch("newPassword");

  const onSubmit = (data) => {
    verifyOTPMutation.mutate(
      {
        identifier: data.identifier,
        otp: data.otp,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          setShowSuccess(true);
          // Redirect to login after 2 seconds
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        },
      }
    );
  };

  if (showSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-md shadow-lg rounded-2xl border-0">
          <CardHeader className="space-y-4 text-center pb-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-2xl bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-gray-800">
                Password Reset Successfully
              </CardTitle>
              <CardDescription className="text-base mt-2">
                You can now login with your new password
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-8 pt-4">
            <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200">
              <p className="text-sm text-green-800 text-center">
                Redirecting to login page...
              </p>
            </div>

            <Link to="/login">
              <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              Reset Password
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Enter the OTP code and your new password
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-8 pt-4">
          {verifyOTPMutation.isError && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>
                {verifyOTPMutation.error?.response?.data?.message ||
                  "Failed to reset password. Please try again."}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="identifier"
                type="email"
                placeholder="your.email@example.com"
                {...register("identifier", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className="h-11 rounded-lg"
              />
              {errors.identifier && (
                <p className="text-sm text-destructive">
                  {errors.identifier.message}
                </p>
              )}
            </div>

            {/* OTP Input */}
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-sm font-medium">
                OTP Code
              </Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                {...register("otp", {
                  required: "OTP is required",
                  pattern: {
                    value: /^\d{6}$/,
                    message: "OTP must be 6 digits",
                  },
                })}
                className="h-11 rounded-lg text-center text-lg tracking-widest font-mono"
              />
              {errors.otp && (
                <p className="text-sm text-destructive">{errors.otp.message}</p>
              )}
            </div>

            {/* New Password Input */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  {...register("newPassword", {
                    required: "New password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  className="h-11 rounded-lg pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-destructive">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === newPassword || "Passwords do not match",
                  })}
                  className="h-11 rounded-lg pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={verifyOTPMutation.isPending}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium"
            >
              {verifyOTPMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loading className="h-4 w-4 text-white" />
                  Resetting Password...
                </span>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Didn't receive the OTP?{" "}
              <Link
                to="/forgot-password"
                className="text-primary font-medium hover:underline"
              >
                Resend OTP
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
