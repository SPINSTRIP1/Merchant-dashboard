"use client";

// import { ChevronLeft } from "lucide-react";
// import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/modal";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import Image from "next/image";
import StepIndicator from "../_components/step-indicator";
import { useComplianceStatus } from "@/hooks/use-compliance";
import Survey from "./_components/survey";
import { useComplianceForm } from "./_context";
import AboutBusiness from "./_components/about-business";
import UploadDocuments from "./_components/upload-documents";
import UBO from "./_components/ubo";
import Loader from "@/components/loader";
import Breadcrumb from "@/components/breadcrumb";
import PageHeader from "@/components/page-header";
import ComplianceSummary from "./_components/compliance-summary";

export default function ClientPage() {
  const {
    data,
    steps: milestones,
    percent,
    adminNotes,
    isLoading,
  } = useComplianceStatus();
  const {
    steps,
    currentStep,
    loading,
    isOpen,
    setIsOpen,
    handleNext,
    isCurrentStepValid,
    form: { reset },
    setCurrentStep,
  } = useComplianceForm();

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return <Survey />;
      case 2:
        return <AboutBusiness />;
      case 3:
        return <UploadDocuments />;
      case 4:
        return <UBO />;
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div>
      <Breadcrumb
        parent={{ label: "Settings", href: "/settings" }}
        current="Compliance"
      />
      <PageHeader
        title="Compliance"
        subtitle="Verify your business to unlock payouts and public pages."
      />
      <ComplianceSummary
        status={data}
        steps={milestones}
        percent={percent}
        adminNotes={adminNotes}
      />
      <div className="overflow-hidden lg:max-w-[760px] mx-auto w-full">
        {/* <button
        onClick={() => router.back()}
        className="flex items-center gap-x-2 mb-8"
      >
        <ChevronLeft /> <p className="font-bold">Back</p>
      </button> */}

        {data !== "VERIFIED" && data !== "PENDING" && (
          <div className="mt-6 rounded-2xl border bg-card px-4 pb-6 pt-1 sm:px-6">
            <h3 className="mt-4 font-display text-lg font-bold text-foreground">
              {data === "REJECTED"
                ? "Update and resubmit your documents"
                : "Complete your verification"}
            </h3>
            <StepIndicator currentStep={currentStep} steps={steps} />
            {renderContent()}
            <div className="mt-5 space-y-5">
              <Button
                size={"lg"}
                onClick={handleNext}
                className="w-full"
                disabled={loading || !isCurrentStepValid}
              >
                {loading
                  ? "Submitting..."
                  : currentStep === steps.length
                    ? "Submit"
                    : "Next"}
              </Button>
              {currentStep > 1 && (
                <Button
                  size={"lg"}
                  className="w-full bg-primary-accent text-primary hover:bg-primary-accent/90 font-semibold"
                  onClick={() =>
                    setCurrentStep((prev) => Math.max(prev - 1, 1))
                  }
                >
                  Previous
                </Button>
              )}
            </div>
          </div>
        )}
        <Modal
          isOpen={isOpen}
          className="max-w-[590px]"
          onClose={() => {
            reset();
            setIsOpen(false);
          }}
        >
          <div className="flex flex-col gap-y-2 items-center justify-center">
            <div className="bg-card relative overflow-hidden p-3 rounded-full shadow-md">
              <HugeiconsIcon
                icon={CheckmarkCircle01Icon}
                size={24}
                color="currentColor"
                className="text-primary z-[999]"
              />
              <Image
                src={"/icons/check.svg"}
                className="size-[36px] absolute opacity-60 -bottom-3 z-10 -left-3"
                width={40}
                height={40}
                alt="check"
              />
            </div>
            <h2 className="text-lg font-bold text-primary-text">
              Submission Successful
            </h2>
            <p className="text-sm text-center">
              Your documents have been received. Our team will review your
              information shortly. This usually takes 24–48 hours. You’ll be
              notified once your compliance status is confirmed.
            </p>
          </div>
        </Modal>
      </div>
    </div>
  );
}
