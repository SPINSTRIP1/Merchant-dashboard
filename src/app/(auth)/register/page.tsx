"use client";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { registerApi } from "../_api";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InfiniteCarousel from "../_components/carousel";
import { useReduxAuth } from "@/hooks/use-redux-auth";

// Zod schema for form validation
const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(50, "Full name must be less than 50 characters"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be less than 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
    email: z.string().email("Please enter a valid email address"),
    phoneNumber: z
      .string()
      .min(1, "Phone number is required")
      .transform((val) => {
        // Remove any spaces, hyphens, or other formatting
        const cleaned = val.replace(/[\s\-\(\)]/g, "");
        // If it starts with +234, use as is
        if (cleaned.startsWith("+234")) {
          return cleaned;
        }
        // If it starts with 234, add +
        if (cleaned.startsWith("234")) {
          return "+" + cleaned;
        }
        // If it starts with 0, replace with +234
        if (cleaned.startsWith("0")) {
          return "+234" + cleaned.substring(1);
        }
        // If it's just the number without country code, add +234
        if (cleaned.length === 10 && /^\d{10}$/.test(cleaned)) {
          return "+234" + cleaned;
        }
        return cleaned;
      })
      .refine((val) => /^\+234\d{10}$/.test(val), {
        message:
          "Phone number must be a valid Nigerian number (e.g., 08012345678 or +2348012345678)",
      }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const router = useRouter();
  const auth = useReduxAuth();

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      const response = await registerApi({
        email: data.email,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        username: data.username,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      if (response.status === "success") {
        auth.setTokens(
          {
            refreshToken: response.refreshToken,
            accessToken: response.accessToken,
          },
          {
            email: response.data.email,
            fullName: response.data.fullName,
            userName: response.data.username,
            role: "USER",
            emailVerified: response.data.emailVerified,
          }
        );
        toast.success("Registration successful!");

        router.push("/otp-verification");
      }
    } catch (error) {
      console.log(error);
      setError("root", {
        type: "manual",
        message:
          error instanceof Error
            ? error.message
            : "Registration failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <section
      style={{
        backgroundImage: "url('/background.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "40%",
      }}
      className=" min-h-screen flex items-center p-2 py-9 lg:p-10 justify-center"
    >
      <MaxWidthWrapper className="flex justify-center items-center gap-x-20">
        <div className="max-w-[486px] w-full">
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
          <h2 className="font-bold text-lg mt-14">Create a Merchant Account</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                {...register("fullName")}
                placeholder="Enter your Full Name"
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                {...register("username")}
                placeholder="Enter your Username"
              />
              {errors.username && (
                <p className="text-red-500 text-sm">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                {...register("email")}
                type="email"
                placeholder="Enter your Email Address"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                {...register("phoneNumber")}
                placeholder="08012345678 or +2348012345678"
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="password">Password</Label>
              <Input
                {...register("password")}
                placeholder="Enter your Password"
                type={showPassword ? "text" : "password"}
              />
              <button
                type="button"
                className="absolute top-10 right-1.5"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                {...register("confirmPassword")}
                placeholder="Re-enter Password"
                type={showConfirmPassword ? "text" : "password"}
              />
              <button
                type="button"
                className="absolute top-10 right-1.5"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {errors.root && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {errors.root.message}
              </div>
            )}

            <Button
              disabled={loading}
              type="submit"
              className="w-full"
              size={"lg"}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-[#000000E5] mt-7 text-sm">
            Already have an account?{" "}
            <Link className="font-bold text-primary" href="/login">
              Login
            </Link>{" "}
          </p>
        </div>
        <div className="h-[832px] max-w-[588px] w-full hidden lg:block bg-[#F8F8F8] relative overflow-hidden rounded-lg">
          <InfiniteCarousel />
        </div>{" "}
      </MaxWidthWrapper>
    </section>
  );
}
