"use client";
import ContainerWrapper from "@/components/container-wrapper";
import SelectDropdown from "@/components/select-dropdown";
import { Label } from "@/components/ui/label";
import { useComplianceForm } from "../_context";
import FileUpload from "@/components/file-upload";
import { Input } from "@/components/ui/input";
import CountrySelectDropdown from "@/components/country-select-dropdown";
import { Textarea } from "@/components/ui/textarea";
export default function AboutBusiness() {
  const {
    form: {
      getValues,
      formState: { errors },
    },

    handleFieldChange,
  } = useComplianceForm();
  return (
    <div className="space-y-5">
      <ContainerWrapper className="space-y-2.5">
        <Label>Business Sub-category under -Hospitality-</Label>
        <SelectDropdown
          className="!rounded-2xl border border-neutral-accent"
          placeholder="Choose your business sub-category"
          options={["Retail", "Food & Beverage", "Healthcare", "Technology"]}
          value={getValues("businessSubCategory")}
          onValueChange={(value) => {
            handleFieldChange("businessSubCategory", value);
          }}
          category="Business Sub-category"
        />
        <div className="h-5 mt-1">
          {errors.businessSubCategory && (
            <p className="text-red-500 text-sm">
              {errors.businessSubCategory.message}
            </p>
          )}
        </div>
      </ContainerWrapper>
      <ContainerWrapper className="space-y-2.5">
        <Label>Business Description</Label>
        <Textarea
          value={getValues("businessDescription")}
          onChange={(e) =>
            handleFieldChange("businessDescription", e.target.value)
          }
          className="rounded-2xl"
          placeholder="Describe your business"
          rows={6}
        />
        <div className="h-5 mt-1">
          {errors.businessDescription && (
            <p className="text-red-500 text-sm">
              {errors.businessDescription.message}
            </p>
          )}
        </div>
      </ContainerWrapper>
      <div className="lg:grid-cols-2 grid gap-3">
        <ContainerWrapper className="space-y-2.5">
          <Label>Country of Incorporation</Label>
          <CountrySelectDropdown
            className="!rounded-2xl border border-neutral-accent"
            placeholder="Select Country"
            onValueChange={(value) =>
              handleFieldChange("countryOfIncorporation", value)
            }
          />
          <div className="h-5 mt-1">
            {errors.countryOfIncorporation && (
              <p className="text-red-500 text-sm">
                {errors.countryOfIncorporation.message}
              </p>
            )}
          </div>
        </ContainerWrapper>
        <ContainerWrapper className="space-y-2.5">
          <Label>Company Name</Label>
          <Input
            className="!rounded-2xl border border-neutral-accent"
            placeholder="Enter Company Name"
            value={getValues("companyName")}
            onChange={(e) => handleFieldChange("companyName", e.target.value)}
          />
          <div className="h-5 mt-1">
            {errors.companyName && (
              <p className="text-red-500 text-sm">
                {errors.companyName.message}
              </p>
            )}
          </div>
        </ContainerWrapper>
        <ContainerWrapper className="space-y-2.5">
          <Label>Company Website (Optional)</Label>
          <Input
            className="!rounded-2xl border border-neutral-accent"
            placeholder="Enter Company Website"
            value={getValues("companyWebsite")}
            onChange={(e) =>
              handleFieldChange("companyWebsite", e.target.value)
            }
          />
          <div className="h-5 mt-1">
            {errors.companyWebsite && (
              <p className="text-red-500 text-sm">
                {errors.companyWebsite.message}
              </p>
            )}
          </div>
        </ContainerWrapper>
        <ContainerWrapper className="space-y-2.5">
          <Label>Company Registration ID/Number </Label>
          <Input
            className="!rounded-2xl border border-neutral-accent"
            placeholder="Enter No."
            value={getValues("registrationNumber")}
            onChange={(e) =>
              handleFieldChange("registrationNumber", e.target.value)
            }
          />
          <div className="h-5 mt-1">
            {errors.registrationNumber && (
              <p className="text-red-500 text-sm">
                {errors.registrationNumber.message}
              </p>
            )}
          </div>
        </ContainerWrapper>
      </div>
      <ContainerWrapper>
        <FileUpload
          type="image"
          label="Upload Company Logo"
          placeholder="Click to upload logo or drop image here"
          acceptedFormats={["JPG", "JPEG", "PNG", "SVG"]}
          maxSizeInMB={5}
          fileName="logo"
          value={getValues("logo")}
          onFileSelect={(fileKey) => {
            if (fileKey) {
              handleFieldChange("logo", fileKey);
              console.log("Logo uploaded, fileKey:", fileKey);
            }
          }}
        />
        <div className="h-5 mt-1">
          {errors.logo && (
            <p className="text-red-500 text-sm">{errors.logo.message}</p>
          )}
        </div>
      </ContainerWrapper>
    </div>
  );
}
