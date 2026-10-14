import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import StepProgress from "@/components/step-progress";
import FindPlace from "../claim-places-steps/find-place";
import { usePlacesForm } from "../../_context";
import GeneralInfo from "../claim-places-steps/general-info";
import SafetyPolicies from "../claim-places-steps/safety-policies";

const CLAIM_STEPS = ["Find Place", "General Info", "Safety & Policies"];

export default function ClaimPlacesModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { currentStep } = usePlacesForm();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Claim a Place</SheetTitle>
          <SheetDescription>Find your place on SpinStrip and verify that you own it.</SheetDescription>
        </SheetHeader>
        <StepProgress steps={CLAIM_STEPS} currentStep={Math.min(currentStep, 3)} />
        {currentStep === 1 ? <FindPlace /> : currentStep === 2 ? <GeneralInfo /> : <SafetyPolicies />}
      </SheetContent>
    </Sheet>
  );
}
