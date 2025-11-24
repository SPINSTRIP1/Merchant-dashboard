"use client";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useRouter } from "next/navigation";
import InfiniteCarousel from "../_components/carousel";
import React from "react";
import { forgotPassword } from "../_api";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const router = useRouter();
  const handleSubmit = async () => {
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    try {
      setIsLoading(true);
      const res = await forgotPassword({ email });

      if (res.status === "success") {
        toast.success("Password reset link sent to your email");
        router.push("/reset-password?email=" + encodeURIComponent(email));
      }
    } catch (error) {
      setError((error as Error)?.message || "Invalid email address.");
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
          <h2 className="font-bold text-lg mt-14">Forgot your Password</h2>
          <div className="mt-7 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your Email Address"
              />
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
              {isLoading ? "Sending..." : "Send Reset Link"}
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
