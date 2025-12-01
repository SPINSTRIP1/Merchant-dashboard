import { MultiSelect } from "@/app/(dashboard)/settings/_components/multi-select";
import SelectDropdown from "@/components/select-dropdown";
import { Label } from "@/components/ui/label";
import React from "react";
import { useMenuForm } from "../../_context";
import { DEALS_SERVER_URL } from "@/constants";
import { Deal } from "../../../deals/_schemas";
import { useServerPagination } from "@/hooks/use-server-pagination";

export default function DealSettings() {
  const {
    form: { watch, setValue },
  } = useMenuForm();
  const isFeatured = watch("isFeatured");
  const dealId = watch("dealId");

  const { items, isLoading } = useServerPagination<Deal>({
    queryKey: "deals",
    endpoint: `${DEALS_SERVER_URL}/deals`,
  });
  const options =
    items?.map((deal) => ({ label: deal.name, value: deal.id! })) || [];
  return (
    <div className="space-y-7">
      <div className="space-y-1.5">
        <Label>Mark as Featured</Label>
        <MultiSelect
          value={isFeatured ? "YES" : "NO"}
          options={[
            { label: "Yes", value: "YES" },
            { label: "No", value: "NO" },
          ]}
          className="lg:grid"
          radioClassName="lg:w-full"
          onValueChange={(value) => {
            setValue("isFeatured", value === "YES", {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
        />
      </div>
      <div className=" flex flex-col">
        <Label>Apply a campaign (Deals)</Label>
        <input
          className="text-xs my-1.5 outline-none"
          placeholder="Brief description of this option goes here..."
        />

        {!isLoading && <p>Fetching deals...</p>}
        <SelectDropdown
          className="!rounded-2xl border border-neutral-accent"
          placeholder="Select Deal"
          options={options}
          value={dealId || ""}
          onValueChange={(value) => {
            setValue("dealId", value);
          }}
          category="Deals"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
