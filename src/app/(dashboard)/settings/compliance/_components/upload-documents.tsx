"use client";
import ContainerWrapper from "@/components/container-wrapper";
import { useComplianceForm } from "../_context";
import FileUpload from "@/components/file-upload";

export default function UploadDocuments() {
  const {
    form: {
      getValues,
      formState: { errors },
    },

    handleFieldChange,
  } = useComplianceForm();
  return (
    <div className="space-y-5">
      <ContainerWrapper>
        <FileUpload
          type="file"
          label="Upload COI (Certificate of Incorporation)"
          acceptedFormats={["JPG", "JPEG", "PNG", "SVG", "PDF"]}
          maxSizeInMB={5}
          fileName="certificateOfIncorporation"
          value={getValues("certificateOfIncorporation")}
          onFileSelect={(fileKey) => {
            if (fileKey) {
              handleFieldChange("certificateOfIncorporation", fileKey);
              console.log("COI uploaded, fileKey:", fileKey);
            }
          }}
        />
        <div className="h-5 mt-1">
          {errors.certificateOfIncorporation && (
            <p className="text-red-500 text-sm">
              {errors.certificateOfIncorporation.message}
            </p>
          )}
        </div>
      </ContainerWrapper>
      <ContainerWrapper>
        <FileUpload
          type="file"
          label="Upload Articles of Formation/Association"
          acceptedFormats={["JPG", "JPEG", "PNG", "SVG", "PDF"]}
          maxSizeInMB={5}
          fileName="articlesOfAssociation"
          value={getValues("articlesOfAssociation")}
          onFileSelect={(fileKey) => {
            if (fileKey) {
              handleFieldChange("articlesOfAssociation", fileKey);
              console.log(
                "Articles of Association uploaded, fileKey:",
                fileKey
              );
            }
          }}
        />
        <div className="h-5 mt-1">
          {errors.articlesOfAssociation && (
            <p className="text-red-500 text-sm">
              {errors.articlesOfAssociation.message}
            </p>
          )}
        </div>
      </ContainerWrapper>
      <ContainerWrapper>
        <FileUpload
          type="file"
          label="Upload Proof of Address (Recent Utility Bill)"
          placeholder="JPG, JPEG, PNG, SVG,  PDF formats supported"
          acceptedFormats={["JPG", "JPEG", "PNG", "SVG", "PDF"]}
          maxSizeInMB={5}
          fileName="proofOfAddress"
          value={getValues("proofOfAddress")}
          onFileSelect={(fileKey) => {
            if (fileKey) {
              handleFieldChange("proofOfAddress", fileKey);
              console.log("Proof of Address uploaded, fileKey:", fileKey);
            }
          }}
        />
        <div className="h-5 mt-1">
          {errors.proofOfAddress && (
            <p className="text-red-500 text-sm">
              {errors.proofOfAddress.message}
            </p>
          )}
        </div>
      </ContainerWrapper>
      <ContainerWrapper>
        <FileUpload
          type="file"
          label="Upload Bank Statement"
          acceptedFormats={["JPG", "JPEG", "PNG", "SVG", "PDF"]}
          maxSizeInMB={5}
          fileName="bankStatement"
          value={getValues("bankStatement")}
          onFileSelect={(fileKey) => {
            if (fileKey) {
              handleFieldChange("bankStatement", fileKey);
              console.log("Bank Statement uploaded, fileKey:", fileKey);
            }
          }}
        />
        <div className="h-5 mt-1">
          {errors.bankStatement && (
            <p className="text-red-500 text-sm">
              {errors.bankStatement.message}
            </p>
          )}
        </div>
      </ContainerWrapper>
    </div>
  );
}
