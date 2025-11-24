"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { resendToken, verifyEmail } from "../_api";
import { useReduxAuth } from "@/hooks/use-redux-auth";

export default function OTPVerificationPage() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const user = useReduxAuth().user;
  const router = useRouter();

  // Timer for resend functionality
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow numeric input
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");

    if (pastedData.length === 6) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);

    try {
      await verifyEmail({
        otp: otpCode,
        email: user?.email || "",
      });

      toast.success("OTP verified successfully!");
      router.push("/settings/compliance");
    } catch {
      toast.error("Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    try {
      // Simulate API call for resending OTP
      await resendToken({ email: user?.email || "" });
      toast.success("OTP sent successfully!");
      setTimeLeft(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch {
      toast.error("Failed to resend OTP. Please try again.");
    }
  };

  const isOTPComplete = otp.every((digit) => digit !== "");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-secondary-text" />
          </button>
          <h1 className="text-2xl font-bold text-primary-text ml-4">
            Verify OTP
          </h1>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          {/* Title and Description */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-primary-text mb-3">
              Enter Verification Code
            </h2>
            <p className="text-secondary-text text-sm leading-relaxed">
              We&apos;ve sent a 6-digit verification code to your email address.
              Please enter it below to continue.
            </p>
          </div>

          {/* OTP Input */}
          <div className="mb-8">
            <div className="flex justify-center gap-3 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`
                    w-12 h-12 text-center text-lg font-semibold
                    border-2 rounded-xl transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-primary/20
                    ${
                      digit
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-neutral-accent bg-white text-secondary-text"
                    }
                    ${
                      index === 0 && otp.every((d) => !d)
                        ? "border-primary"
                        : ""
                    }
                  `}
                  placeholder="0"
                />
              ))}
            </div>

            {/* Timer and Resend */}
            <div className="text-center">
              {!canResend ? (
                <p className="text-secondary-text text-sm">
                  Resend code in{" "}
                  <span className="font-semibold text-primary">
                    {Math.floor(timeLeft / 60)}:
                    {(timeLeft % 60).toString().padStart(2, "0")}
                  </span>
                </p>
              ) : (
                <button
                  onClick={handleResendOTP}
                  className="text-primary font-semibold text-sm hover:underline transition-all"
                >
                  Resend Code
                </button>
              )}
            </div>
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerifyOTP}
            disabled={!isOTPComplete || isLoading}
            size="lg"
            className="w-full h-14 text-base font-semibold"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Verifying...
              </div>
            ) : (
              "Verify Code"
            )}
          </Button>

          {/* Help Text */}
          <div className="text-center mt-6">
            <p className="text-secondary-text text-sm">
              Didn&apos;t receive the code?{" "}
              <button
                onClick={handleResendOTP}
                disabled={!canResend}
                className={`font-semibold transition-all ${
                  canResend
                    ? "text-primary hover:underline"
                    : "text-neutral-accent cursor-not-allowed"
                }`}
              >
                Send again
              </button>
            </p>
          </div>

          {/* Security Note */}
          <div className="mt-8 p-4 bg-primary/5 rounded-xl">
            <p className="text-xs text-secondary-text text-center">
              🔒 This code will expire in 10 minutes for your security
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
