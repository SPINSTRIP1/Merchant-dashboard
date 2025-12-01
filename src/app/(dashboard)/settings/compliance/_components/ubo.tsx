"use client";
import ContainerWrapper from "@/components/container-wrapper";
import { useComplianceForm } from "../_context";
import FileUpload from "@/components/file-upload";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";

export default function UBO() {
  const {
    form: {
      getValues,
      formState: { errors },
    },
    addUbo,
    removeUbo,
    updateUboField,
  } = useComplianceForm();

  const ubos = getValues("ubos");

  const renderUboForm = (uboIndex: number) => {
    const ubo = ubos[uboIndex];
    const uboErrors = errors.ubos?.[uboIndex];

    return (
      <div
        key={uboIndex}
        className="space-y-5 p-3.5 lg:p-6 border border-gray-200 rounded-2xl relative"
      >
        {/* Header with UBO number and remove button */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Ultimate Beneficial Owner {uboIndex + 1}
          </h3>
          {ubos.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeUbo(uboIndex)}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Remove
            </Button>
          )}
        </div>

        {/* UBO Form Fields */}
        <ContainerWrapper className="space-y-2.5">
          <Label>Full Name</Label>
          <Input
            className="!rounded-2xl border border-neutral-accent"
            placeholder="Enter Full Name"
            value={ubo.fullName}
            onChange={(e) =>
              updateUboField(uboIndex, "fullName", e.target.value)
            }
          />
          <div className="h-5 mt-1">
            {uboErrors?.fullName && (
              <p className="text-red-500 text-sm">
                {uboErrors.fullName.message}
              </p>
            )}
          </div>
        </ContainerWrapper>

        <ContainerWrapper className="space-y-2.5">
          <Label>Email Address</Label>
          <Input
            className="!rounded-2xl border border-neutral-accent"
            placeholder="Enter Email Address"
            type="email"
            value={ubo.email}
            onChange={(e) => updateUboField(uboIndex, "email", e.target.value)}
          />
          <div className="h-5 mt-1">
            {uboErrors?.email && (
              <p className="text-red-500 text-sm">{uboErrors.email.message}</p>
            )}
          </div>
        </ContainerWrapper>

        <ContainerWrapper className="space-y-2.5">
          <Label>Phone Number</Label>
          <Input
            className="!rounded-2xl border border-neutral-accent"
            placeholder="Enter Phone Number"
            type="tel"
            value={ubo.phoneNumber}
            onChange={(e) =>
              updateUboField(uboIndex, "phoneNumber", e.target.value)
            }
          />
          <div className="h-5 mt-1">
            {uboErrors?.phoneNumber && (
              <p className="text-red-500 text-sm">
                {uboErrors.phoneNumber.message}
              </p>
            )}
          </div>
        </ContainerWrapper>

        <ContainerWrapper className="space-y-2.5">
          <Label>Address</Label>
          <Input
            className="!rounded-2xl border border-neutral-accent"
            placeholder="Enter Address"
            type="text"
            value={ubo.address}
            onChange={(e) =>
              updateUboField(uboIndex, "address", e.target.value)
            }
          />
          <div className="h-5 mt-1">
            {uboErrors?.address && (
              <p className="text-red-500 text-sm">
                {uboErrors.address.message}
              </p>
            )}
          </div>
        </ContainerWrapper>

        <div className="lg:grid-cols-2 grid gap-3">
          <ContainerWrapper className="space-y-2.5">
            <Label>BVN</Label>
            <Input
              className="!rounded-2xl border border-neutral-accent"
              placeholder="Enter BVN"
              value={ubo.identityMetadata.bvn}
              onChange={(e) =>
                updateUboField(uboIndex, "identityMetadata.bvn", e.target.value)
              }
            />
            <div className="h-5 mt-1">
              {uboErrors?.identityMetadata?.bvn && (
                <p className="text-red-500 text-sm">
                  {uboErrors.identityMetadata.bvn.message}
                </p>
              )}
            </div>
          </ContainerWrapper>

          <ContainerWrapper className="space-y-2.5">
            <Label>NIN</Label>
            <Input
              className="!rounded-2xl border border-neutral-accent"
              placeholder="Enter NIN"
              value={ubo.identityMetadata.nin}
              onChange={(e) =>
                updateUboField(uboIndex, "identityMetadata.nin", e.target.value)
              }
            />
            <div className="h-5 mt-1">
              {uboErrors?.identityMetadata?.nin && (
                <p className="text-red-500 text-sm">
                  {uboErrors.identityMetadata.nin.message}
                </p>
              )}
            </div>
          </ContainerWrapper>
        </div>

        {/* Bank Statement Upload for this UBO */}
        <ContainerWrapper>
          <FileUpload
            type="file"
            label={`Upload Bank Statement for ${
              ubo.fullName || `UBO ${uboIndex + 1}`
            }`}
            acceptedFormats={["JPG", "JPEG", "PNG", "SVG", "PDF"]}
            maxSizeInMB={5}
            fileName={`uboBankStatement${uboIndex + 1}`}
            value={ubo.bankStatement}
            onFileSelect={(fileKey) => {
              if (fileKey) {
                // Update the bankStatement field for this specific UBO
                updateUboField(uboIndex, "bankStatement", fileKey);
                // console.log(
                //   `UBO ${uboIndex + 1} bank statement uploaded, fileKey:`,
                //   fileKey
                // );
              }
            }}
          />
          <div className="h-5 mt-1">
            {errors.ubos?.[uboIndex]?.bankStatement && (
              <p className="text-red-500 text-sm">
                {errors.ubos[uboIndex].bankStatement.message}
              </p>
            )}
          </div>
        </ContainerWrapper>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Render all UBO forms */}
      {ubos.map((_, index) => renderUboForm(index))}

      {/* Add another UBO button */}
      <ContainerWrapper className="flex items-center justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={addUbo}
          className="bg-[#F3F3F3] text-black border-none rounded-3xl p-6 hover:bg-gray-200 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          <span className="text-sm font-bold">Add another Shareholder</span>
        </Button>
      </ContainerWrapper>
    </div>
  );
}
