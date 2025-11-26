import { MultiSelect } from "@/app/(dashboard)/settings/_components/multi-select";
import SelectDropdown from "@/components/select-dropdown";
import { Label } from "@/components/ui/label";
import React from "react";
import { useInventoryForm } from "../../_context";
import { useQuery } from "@tanstack/react-query";
import { DEALS_SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import { X } from "lucide-react";

export default function Visibility() {
  const {
    form: { watch, setValue },
  } = useInventoryForm();
  const showInMenu = watch("showInMenu");
  const isFeatured = watch("isFeatured");
  const dealIds = watch("dealIds") || [];

  const { data } = useQuery({
    queryKey: ["deals"],
    queryFn: async () => {
      try {
        const response = await api.get(DEALS_SERVER_URL + "/deals");
        return response.data;
      } catch (error) {
        console.log("Error fetching deals:", error);
        return [];
      }
    },
  });

  const addDeal = (dealId: string) => {
    if (dealId && !dealIds.includes(dealId)) {
      setValue("dealIds", [...dealIds, dealId], {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const removeDeal = (dealId: string) => {
    setValue(
      "dealIds",
      dealIds.filter((id) => id !== dealId),
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    );
  };

  const getDealById = (dealId: string) => {
    return data?.find((deal: { id: string }) => deal.id === dealId);
  };

  return (
    <div className="space-y-7">
      <div className="space-y-1.5">
        <Label>Show in Menu</Label>
        <MultiSelect
          value={showInMenu ? "YES" : "NO"}
          options={[
            { label: "Yes", value: "YES" },
            { label: "No", value: "NO" },
          ]}
          className="lg:grid"
          radioClassName="lg:w-full"
          onValueChange={(value) => {
            setValue("showInMenu", value === "YES", {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
        />
      </div>
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
      <div className="space-y-1.5">
        <Label>Add to Deals</Label>

        <SelectDropdown
          className="!rounded-2xl border border-neutral-accent"
          placeholder="Add to Deals"
          options={data || []}
          value={""}
          onValueChange={(value) => {
            addDeal(value);
          }}
          category="Deals"
        />

        {dealIds.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {dealIds.map((dealId) => {
              const deal = getDealById(dealId);
              return (
                <span
                  key={dealId}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-accent rounded-full text-sm"
                >
                  {deal?.name || dealId}
                  <button
                    type="button"
                    onClick={() => removeDeal(dealId)}
                    className="hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
