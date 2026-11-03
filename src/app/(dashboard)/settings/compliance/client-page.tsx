"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import Breadcrumb from "@/components/breadcrumb";
import Loader from "@/components/loader";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useComplianceStatus } from "@/hooks/use-compliance";
import ComplianceSummary from "./_components/compliance-summary";
import KycForm from "./_components/kyc-form";

export default function ClientPage() {
  const { data: status, kyc, steps, percent, adminNotes, verificationUrl, isLoading, refetch } = useComplianceStatus();
  const [submitted, setSubmitted] = useState<{ verificationUrl: string | null; registered: boolean } | null>(null);

  if (isLoading) return <Loader />;

  // A first submission, a rejected one, or an approval that has run out all go through the form.
  const showForm = status === "UNVERIFIED" || status === "REJECTED" || !!kyc?.isExpired;

  return (
    <div>
      <Breadcrumb parent={{ label: "Settings", href: "/settings" }} current="Compliance" />
      <PageHeader title="Compliance" subtitle="Verify your business to unlock payouts and public pages." />
      <ComplianceSummary
        status={status}
        steps={steps}
        percent={percent}
        adminNotes={adminNotes}
        verificationUrl={verificationUrl}
        onRefresh={() => refetch()}
      />

      {showForm && !submitted && (
        <div className="mx-auto w-full overflow-hidden lg:max-w-[760px]">
          <KycForm kyc={kyc} resubmitting={status === "REJECTED" || !!kyc?.isExpired} onSubmitted={setSubmitted} />
        </div>
      )}

      <Dialog open={!!submitted} onOpenChange={(open) => !open && setSubmitted(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{submitted?.verificationUrl ? "One last step" : "Submission received"}</DialogTitle>
            <DialogDescription>
              {submitted?.verificationUrl
                ? "Finish a quick identity check with our verification partner. You'll come back here when it's done."
                : submitted?.registered
                  ? "Our team will review your documents, usually within 24–48 hours. We'll let you know once you're verified."
                  : "We're confirming your identity. Your status updates on this page."}
            </DialogDescription>
          </DialogHeader>
          {submitted?.verificationUrl ? (
            <Button variant="brand" size="lg" asChild>
              <a href={submitted.verificationUrl}>
                Verify my identity <ExternalLink />
              </a>
            </Button>
          ) : (
            <Button variant="brand" size="lg" onClick={() => setSubmitted(null)}>
              Done
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
