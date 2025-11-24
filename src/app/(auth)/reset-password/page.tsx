"use client";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import InfiniteCarousel from "../_components/carousel";
import React from "react";
import { resetPassword } from "../_api";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const [formData, setFormData] = React.useState({
    resetCode: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const params = useSearchParams();
  const email = params.get("email") || "";

  const router = useRouter();
  const handleSubmit = async () => {
    setError("");

    if (
      !formData.resetCode ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please enter all required fields.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await resetPassword({
        email,
        otp: formData.resetCode,
        newPassword: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      if (res.status === "success") {
        router.push("/login");
      }
    } catch (error) {
      setError((error as Error)?.message || "Invalid Reset Code.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <section
      style={{
        backgroundImage: "url('/background.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "40%",
      }}
      className="min-h-screen flex items-center p-2 lg:p-10 justify-center"
    >
      <MaxWidthWrapper className="flex justify-center items-center gap-x-20">
        <div className="lg:max-w-[486px] w-full">
          <div className="flex items-center gap-x-2">
            <Image
              src="/logo.svg"
              alt="Description"
              className="w-[137px] h-[42px]"
              width={500}
              height={500}
            />
            <div className="bg-[#F8F8F8] w-fit p-2 ">
              <p className="font-sf-pro text-primary font-bold text-sm">
                Merchant Suite
              </p>
            </div>
          </div>
          <h2 className="font-bold text-lg mt-14">Reset your Password</h2>
          <div className="mt-7 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resetCode">Reset Code</Label>
              <Input
                value={formData.resetCode}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    resetCode: e.target.value,
                  }))
                }
                placeholder="Enter your Reset Code"
              />
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="Enter your new password"
                type={showPassword ? "text" : "password"}
              />
              <button
                className="absolute bottom-3 right-1.5"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                placeholder="Confirm new password"
                type={showConfirmPassword ? "text" : "password"}
              />
              <button
                className="absolute bottom-3 right-1.5"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              disabled={isLoading}
              onClick={handleSubmit}
              className="w-full"
              size={"lg"}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </div>
        </div>
        <div className="h-[832px] max-w-[588px] hidden lg:block w-full bg-[#F8F8F8] relative overflow-hidden rounded-lg">
          <InfiniteCarousel />
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
