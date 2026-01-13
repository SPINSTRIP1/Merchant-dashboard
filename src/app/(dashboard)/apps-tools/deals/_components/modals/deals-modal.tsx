import { MultiSelect } from "@/app/(dashboard)/settings/_components/multi-select";
import { Label } from "@/components/ui/label";
import { CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { useDealsForm } from "../../_context";
import { SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import { InventoryProduct } from "../../../inventory/_schemas";
import { useQuery } from "@tanstack/react-query";
import { Campaign } from "../../_schemas";
import { FormInput } from "@/components/ui/forms/form-input";
import SideModal from "@/app/(dashboard)/_components/side-modal";
import { FormSelect } from "@/components/ui/forms/form-select";

export default function DealsModal({
  isOpen,
  onClose,
  action = "add",
}: {
  isOpen: boolean;
  onClose: () => void;
  action?: "edit" | "add" | null;
}) {
  const {
    submitDeal,
    loading,
    form: { watch, setValue, control },
  } = useDealsForm();

  const productIds = watch("productIds") || [];
  const isFeatured = watch("isFeatured");

  const { data: menuItems, isLoading } = useQuery<InventoryProduct[]>({
    queryKey: ["inventory-products"],
    queryFn: async () => {
      try {
        const response = await api.get(SERVER_URL + "/inventory/products");
        return response.data.data.data || [];
      } catch (error) {
        console.log("Error fetching products:", error);
        return [];
      }
    },
  });
  const { data: campaigns } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: async () => {
      try {
        const response = await api.get(SERVER_URL + "/deals/campaigns");
        return response.data.data.data;
      } catch (error) {
        console.log("Error fetching campaigns:", error);
        return null;
      }
    },
  });
  const toggleMenuItem = (itemId: string) => {
    const currentProductIds = productIds;
    if (currentProductIds.includes(itemId)) {
      // Remove item if already selected
      setValue(
        "productIds",
        currentProductIds.filter((i) => i !== itemId),
        { shouldDirty: true, shouldValidate: true }
      );
    } else {
      // Add item if not selected
      setValue("productIds", [...currentProductIds, itemId], {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };
  const getButtonLabel = () => {
    if (loading) {
      return action === "edit" ? "Updating..." : "Submitting...";
    }

    return action === "edit" ? "Update" : "Submit";
  };

  return (
    <SideModal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-7 pt-16 pb-5">
        <FormInput
          control={control}
          label="Deal Name"
          name="name"
          placeholder="Enter Deal Name"
        />

        <FormSelect
          control={control}
          name="campaignId"
          label="Select Campaign"
          placeholder="Select Campaign"
          options={campaigns?.map((cat) => ({
            label: cat.name,
            value: cat.id,
          }))}
          category="Campaigns"
        />
        <div>
          <Label>Menu items</Label>
          <div className="!rounded-2xl my-2 !h-[49px] border bg-neutral border-neutral-accent flex flex-col justify-center px-4">
            <p className="text-secondary-text text-sm">
              {productIds.length > 0
                ? menuItems
                    ?.filter((item) => productIds.includes(item.id))
                    .map((item) => item.name)
                    .join(", ")
                : "No items selected"}
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-4 text-gray-500">
              Loading menu items...
            </div>
          ) : (
            <div className="flex flex-wrap mt-4 items-center gap-3">
              {menuItems?.map((item) => {
                const isSelected = productIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleMenuItem(item.id)}
                    className={`flex items-center py-0.5 px-1.5 gap-x-2 rounded-3xl border w-fit transition-all duration-200 ${
                      isSelected
                        ? "border-primary bg-primary-accent"
                        : "border-gray-300 bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    <p
                      className={`text-sm ${
                        isSelected ? "text-primary" : "text-gray-500"
                      }`}
                    >
                      {item.name}
                    </p>
                    {isSelected && (
                      <HugeiconsIcon
                        icon={CheckmarkCircle01Icon}
                        size={16}
                        color="#6932E2"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <FormInput
          control={control}
          label="Deal Description"
          name="description"
          placeholder="Enter description"
          type="textarea"
        />

        <div className="grid grid-cols-2 gap-5">
          <FormInput
            control={control}
            label="Discount"
            name="discountPercentage"
            placeholder="10%"
            type="number"
          />
          <FormInput
            control={control}
            label="Maximum Threshold"
            name="maximumThreshold"
            placeholder="500 Orders"
            type="number"
          />
          <FormInput
            control={control}
            label="Start Date"
            name="startDate"
            placeholder="MM/DD/YYYY"
            type="date"
          />
          <FormInput
            control={control}
            label="End Date"
            name="endDate"
            placeholder="MM/DD/YYYY"
            type="date"
          />
        </div>
        {/* <div className="space-y-1.5">
            <Label>Quantity</Label>
            <Input
              className="!rounded-2xl border border-neutral-accent"
              placeholder="50 Portions"
            />
          </div> */}

        {/* <div className="space-y-1.5">
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
          </div> */}
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

        <div className="flex mt-6 gap-x-3 items-center">
          <Button
            variant={"secondary"}
            className="w-full h-[51px] py-3"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="w-full h-[51px] py-3"
            disabled={loading}
            onClick={submitDeal}
          >
            {getButtonLabel()}
          </Button>
        </div>
      </div>
    </SideModal>
  );
}
