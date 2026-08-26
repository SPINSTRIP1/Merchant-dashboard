"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar03Icon,
  Mail01Icon,
  Ticket01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import Success from "@/components/ui/success";
import Loader from "@/components/loader";
import { useFetch } from "@/hooks/use-fetch";
import { EVENTS_SERVER_URL } from "@/constants";

interface VerifyPaymentResponse {
  status: string;
  message: string;
  data: {
    reference: string;
    status: "COMPLETED" | "PENDING" | "FAILED";
  };
}

function DashedDivider() {
  return (
    <div
      className="w-full h-[2px]"
      style={{
        backgroundImage:
          "linear-gradient(to right, #C8C8C8 8px, transparent 8px)",
        backgroundSize: "16px 2px",
        backgroundRepeat: "repeat-x",
      }}
    />
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  const { data, loading, error, refetch } = useFetch<VerifyPaymentResponse>({
    route: `${EVENTS_SERVER_URL}/events/payments/verify/${reference}`,
    enabled: !!reference,
    showErrorMessage: false,
  });

  const paymentStatus = data?.data?.status;
  const isVerified = paymentStatus === "COMPLETED";
  const isFailed = paymentStatus === "FAILED" || (!!error && !loading);

  // Verifying state
  if (reference && loading) {
    return (
      <section className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-primary-text">
              Verifying your payment...
            </h1>
            <p className="text-sm text-[#6F6D6D]">
              Hold on while we confirm your transaction.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-neutral flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Ticket-style card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header band */}
          <div className="bg-primary/5 flex flex-col items-center text-center px-6 pt-10 pb-6">
            <Success type={isFailed ? "info" : "success"} />
            <h1 className="text-2xl font-bold text-primary-text mt-5">
              {isFailed
                ? "Payment Not Completed"
                : isVerified
                  ? "Payment Successful!"
                  : "Registration Received!"}
            </h1>
            <p className="text-sm text-[#6F6D6D] mt-2">
              {isFailed
                ? "We couldn't confirm your payment. If you were debited, don't worry — your ticket will be issued once the payment is confirmed."
                : "Your ticket has been booked. A confirmation with your ticket details is on its way to your inbox."}
            </p>
          </div>

          <div className="px-6 py-2">
            <DashedDivider />
          </div>

          {/* Details */}
          <div className="px-6 py-4 space-y-4">
            {reference && (
              <div className="flex items-start justify-between gap-x-4">
                <p className="text-sm text-[#6F6D6D]">Reference</p>
                <p className="text-sm font-bold text-primary-text text-right break-all">
                  {reference}
                </p>
              </div>
            )}
            {paymentStatus && (
              <div className="flex items-center justify-between gap-x-4">
                <p className="text-sm text-[#6F6D6D]">Payment Status</p>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    isVerified
                      ? "bg-green-100 text-green-700"
                      : isFailed
                        ? "bg-red-100 text-red-600"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {paymentStatus}
                </span>
              </div>
            )}
          </div>

          {!isFailed && (
            <>
              <div className="px-6 py-2">
                <DashedDivider />
              </div>

              {/* What happens next */}
              <div className="px-6 py-4 space-y-3">
                <h2 className="text-sm font-bold text-primary-text">
                  What happens next?
                </h2>
                <div className="flex items-center gap-x-3">
                  <div className="bg-neutral rounded-full p-2 shrink-0">
                    <HugeiconsIcon icon={Mail01Icon} size={18} color="#6932E2" />
                  </div>
                  <p className="text-sm text-[#6F6D6D]">
                    Check your email for your ticket confirmation.
                  </p>
                </div>
                <div className="flex items-center gap-x-3">
                  <div className="bg-neutral rounded-full p-2 shrink-0">
                    <HugeiconsIcon
                      icon={Ticket01Icon}
                      size={18}
                      color="#6932E2"
                    />
                  </div>
                  <p className="text-sm text-[#6F6D6D]">
                    Present your ticket at the event entrance.
                  </p>
                </div>
                <div className="flex items-center gap-x-3">
                  <div className="bg-neutral rounded-full p-2 shrink-0">
                    <HugeiconsIcon
                      icon={Calendar03Icon}
                      size={18}
                      color="#6932E2"
                    />
                  </div>
                  <p className="text-sm text-[#6F6D6D]">
                    We&apos;ll remind you before the event starts.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="px-6 pt-2 pb-6 space-y-3">
            {isFailed && reference && (
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="w-full"
                size={"lg"}
              >
                Retry Verification
              </Button>
            )}
            <Button asChild className="w-full" size={"lg"}>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-x-1.5 pt-6">
          <p className="text-sm">Powered by</p>
          <Image
            src={"/logo-black.svg"}
            alt="SpinStrip"
            width={100}
            height={100}
            className="w-[78px] h-[24px] object-contain"
          />
        </div>
      </div>
    </section>
  );
}

export default function EventRegistrationSuccessPage() {
  return (
    <Suspense fallback={<Loader />}>
      <SuccessContent />
    </Suspense>
  );
}
