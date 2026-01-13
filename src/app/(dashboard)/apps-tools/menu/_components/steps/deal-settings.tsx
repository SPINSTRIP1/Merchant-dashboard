import { MultiSelect } from "@/app/(dashboard)/settings/_components/multi-select";
import SelectDropdown from "@/components/select-dropdown";
import { Label } from "@/components/ui/label";
import React from "react";
import { useMenuForm } from "../../_context";
import { SERVER_URL } from "@/constants";
import { Deal } from "../../../deals/_schemas";
import { useServerPagination } from "@/hooks/use-server-pagination";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/axios-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function DealSettings() {
  const {
    form: { watch, setValue },
    handleCreateDeals,
  } = useMenuForm();
  const router = useRouter();
  const isFeatured = watch("isFeatured");
  const dealId = watch("dealId");
  const { data: subscriptionStatus } = useQuery({
    queryKey: ["deals-subscription-status"],
    queryFn: async () => {
      try {
        const response = await api.get(SERVER_URL + "/deals/subscriptions");
        return response.data.data as { subscribed: boolean };
      } catch (error) {
        console.log("Error fetching subscription status:", error);
        return {
          subscribed: false,
        };
      }
    },
  });
  const { items, isLoading } = useServerPagination<Deal>({
    queryKey: "deals",
    endpoint: `${SERVER_URL}/deals`,
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

        {isLoading && <p>Fetching deals...</p>}
        <SelectDropdown
          className="!rounded-2xl border border-neutral-accent"
          placeholder="Select Deal"
          options={options}
          value={dealId || ""}
          onValueChange={(value) => {
            setValue("dealId", value == dealId ? undefined : value, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
          category="Deals"
          isLoading={isLoading}
        />
        {/* {items && items.length ? null : ( */}
        <p className="text-[#000000E5] mt-2 text-sm">
          Want to apply a campaign?{" "}
          <Button
            type="button"
            variant="link"
            className="font-bold text-primary p-0 h-auto"
            onClick={() => {
              handleCreateDeals();
              router.push(
                subscriptionStatus?.subscribed
                  ? "/apps-tools/deals"
                  : "/apps-tools"
              );
            }}
          >
            Create Deals
          </Button>
        </p>
        {/* )} */}
      </div>
    </div>
  );
}
