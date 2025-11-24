import React from "react";
import { ComplianceFormProvider } from "./_context";
import ClientPage from "./client-page";

export default function CompliancePage() {
  return (
    <ComplianceFormProvider>
      <ClientPage />
    </ComplianceFormProvider>
  );
}
