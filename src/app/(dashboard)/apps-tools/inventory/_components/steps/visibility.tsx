import { MultiSelect } from "@/app/(dashboard)/settings/_components/multi-select";
import SelectDropdown from "@/components/select-dropdown";
import { Label } from "@/components/ui/label";
import React from "react";
import { useInventoryForm } from "../../_context";
import { SERVER_URL } from "@/constants";
import { X } from "lucide-react";
import { Deal } from "../../../deals/_schemas";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { Menu } from "../../../menu/_schemas";
import { useDealSubscription } from "@/hooks/use-deals";
import { useServerPagination } from "@/hooks/use-server-pagination";
import { MENU_QUERY_KEY } from "../../../menu/_constants";

export default function Visibility() {
  const {
    form: { watch, setValue },
  } = useInventoryForm();
  const showInMenu = watch("showInMenu");
  const isFeatured = watch("isFeatured");
  const dealIds = watch("dealIds") || [];

  const { items: deals } = useServerPagination<Deal>({
    queryKey: "deals",
    endpoint: `${SERVER_URL}/deals`,
  });
  const { items: menus } = useServerPagination<Menu>({
    queryKey: MENU_QUERY_KEY,
    endpoint: `${SERVER_URL}/menu/menu-items`,
  });
  const { subscribed } = useDealSubscription();
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
    return deals.find((deal: Deal) => deal.id === dealId);
  };
  const options = deals.map((deal) => ({
    label: `${deal.name} (-${deal.discountPercentage}%) off`,
    value: deal.id!,
  }));
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
        {menus && menus?.length ? null : (
          <p className="text-[#000000E5] flex items-center gap-x-2 mt-7 text-sm">
            Menu app is not turned ON.
            <Switch
              showLabel={false}
              checked={showInMenu}
              onCheckedChange={(checked) => {
                setValue("showInMenu", checked, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            />
          </p>
        )}
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
        <Label>Give a discount</Label>

        <SelectDropdown
          className="!rounded-2xl border border-neutral-accent"
          placeholder="Select available deals to apply a discount"
          options={options}
          value={""}
          onValueChange={(value) => {
            addDeal(value);
          }}
          category="Deals"
        />
        <p className="text-[#000000E5] mt-7 text-sm">
          Want to give a discount?{" "}
          <Link
            className="font-bold text-primary"
            href={
              subscribed
                ? "/apps-tools/deals"
                : "/apps-tools"
            }
          >
            Create Deals
          </Link>
        </p>
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
