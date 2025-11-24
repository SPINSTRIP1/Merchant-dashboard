"use client";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import InfiniteCarousel from "../_components/carousel";
import { useReduxAuth } from "@/hooks/use-redux-auth";

export default function LoginPage() {
  const [formData, setFormData] = React.useState({
    emailOrUsername: "",
    password: "",
  });
  const [error, setError] = React.useState("");
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const { login, isLoading } = useReduxAuth();
  const handleSubmit = async () => {
    setError("");

    if (!formData.emailOrUsername || !formData.password) {
      setError("Please fill in all fields");
      return;
    }
    const res = await login(formData);
    if (res.success) {
      toast.success("Login successful!");
      router.push("/settings/compliance");
    } else {
      toast.error(res?.error || "Invalid credentials. Please try again.");
      if (
        res.error?.includes(
          "Email not verified. Please verify your email before logging in"
        )
      ) {
        router.push("/otp-verification");
      }
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
          <h2 className="font-bold text-lg mt-14">Log into your Account</h2>
          <div className="mt-7 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailOrUsername">Email Address</Label>
              <Input
                value={formData.emailOrUsername}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    emailOrUsername: e.target.value,
                  }))
                }
                placeholder="Enter your Email Address"
              />
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="password">Password</Label>
              <Input
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="Enter your Password"
                type={showPassword ? "text" : "password"}
              />
              <button
                className="absolute bottom-3 right-1.5"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="mt-2">
              <Link
                href={"/forgot-password"}
                className="font-bold text-secondary-text"
              >
                Forgot Password?
              </Link>
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
              {isLoading ? "Logging in..." : "Log in"}
            </Button>
          </div>

          <p className="text-[#000000E5] mt-7 text-sm">
            Don&apos;t have an account?{" "}
            <Link className="font-bold text-primary" href="/register">
              Request Access
            </Link>{" "}
            or <br />
            <Link className="font-bold text-primary" href="/register">
              Create a Merchant Account
            </Link>
          </p>
        </div>
        <div className="h-[832px] max-w-[588px] hidden lg:block w-full bg-[#F8F8F8] relative overflow-hidden rounded-lg">
          <InfiniteCarousel />
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
