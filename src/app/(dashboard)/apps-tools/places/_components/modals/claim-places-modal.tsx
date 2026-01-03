import StepIndicator from "@/app/(dashboard)/settings/_components/step-indicator";
import SideModal from "@/app/(dashboard)/_components/side-modal";
import FindPlace from "../claim-places-steps/find-place";
import { usePlacesForm } from "../../_context";
import GeneralInfo from "../claim-places-steps/general-info";
import SafetyPolicies from "../claim-places-steps/safety-policies";

export default function ClaimPlacesModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { currentStep } = usePlacesForm();
  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return <FindPlace />;
      case 2:
        return <GeneralInfo />;
      default:
        return <SafetyPolicies />;
    }
  };

  return (
    <SideModal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-7 pb-10 md:pb-0">
        <StepIndicator
          className="mb-16 mt-10 md:mt-0 pr-5 justify-end items-end"
          currentStep={currentStep}
          steps={["Find Place", "General Info", "Safety & Policies"]}
        />
        {renderContent()}
      </div>
    </SideModal>
  );
}
