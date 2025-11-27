import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { MultiSelect } from "@/app/(dashboard)/settings/_components/multi-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { useDealsForm } from "../../_context";
import { DEALS_SERVER_URL, INVENTORY_SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import { InventoryProduct } from "../../../inventory/_schemas";
import { useQuery } from "@tanstack/react-query";
import { Campaign } from "../../_schemas";
import SelectDropdown from "@/components/select-dropdown";
import { formatDateForInput } from "@/utils";

export default function DealsModal({
  isOpen,
  onClose,
  action = "add",
}: {
  isOpen: boolean;
  onClose: () => void;
  action?: "edit" | "add" | null;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const {
    submitDeal,
    loading,
    form: {
      register,
      watch,
      setValue,

      // formState: { isValid },
    },
    handleFieldChange,
  } = useDealsForm();
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Trigger animation after the modal is visible
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      // Hide modal after animation completes
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const productIds = watch("productIds") || [];
  const isFeatured = watch("isFeatured");
  const campaignId = watch("campaignId");
  const startDate = watch("startDate");
  const endDate = watch("endDate");

  const { data: menuItems, isLoading } = useQuery<InventoryProduct[]>({
    queryKey: ["inventory-products"],
    queryFn: async () => {
      try {
        const response = await api.get(INVENTORY_SERVER_URL + "/products");
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
        const response = await api.get(DEALS_SERVER_URL + "/campaigns");
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
  // console.log(getValues());
  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 bg-black flex items-center justify-end z-50 transition-all duration-300 ease-in-out ${
        isAnimating ? "bg-opacity-50" : "bg-opacity-0"
      }`}
    >
      <div
        className={`bg-white relative rounded-l-3xl p-3 lg:p-4 shadow-xl max-w-[92vw] lg:max-w-[732px] w-full h-screen overflow-y-auto scrollbar-hide transition-transform duration-300 ease-in-out ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          onClick={handleClose}
          className="p-1 absolute top-4 left-3 bg-neutral-accent rounded-full hover:bg-gray-200 transition-colors duration-200"
        >
          <X size={20} />
        </button>
        <div className="space-y-7 pt-16 pb-5">
          <div className="space-y-1.5">
            <Label>Deal Name</Label>
            <Input
              {...register("name")}
              className="!rounded-2xl border border-neutral-accent"
              placeholder="Enter Deal Name"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Select Campaign</Label>

            <SelectDropdown
              className="!rounded-2xl border border-neutral-accent"
              placeholder="Select Campaign"
              value={campaignId || ""}
              options={campaigns?.map((cat) => ({
                label: cat.name,
                value: cat.id,
              }))}
              onValueChange={(value) => {
                handleFieldChange("campaignId", value);
              }}
              category="Campaigns"
            />
          </div>
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
          <div className="space-y-1.5">
            <Label>Deal Description</Label>
            <Textarea
              {...register("description")}
              className="rounded-2xl"
              placeholder="Enter description"
              rows={6}
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label>Discount</Label>
              <Input
                {...register("discountPercentage")}
                className="!rounded-2xl border border-neutral-accent"
                placeholder="10%"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Maximum Threshold</Label>
              <Input
                {...register("maximumThreshold")}
                className="!rounded-2xl border border-neutral-accent"
                placeholder="500 Orders"
              />
            </div>
          </div>
          {/* <div className="space-y-1.5">
            <Label>Quantity</Label>
            <Input
              className="!rounded-2xl border border-neutral-accent"
              placeholder="50 Portions"
            />
          </div> */}
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label>Start Date</Label>
              <Input
                {...register("startDate")}
                type="date"
                className="!rounded-2xl inline-block border border-neutral-accent"
                placeholder="95"
                value={startDate ? formatDateForInput(startDate) : ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label>End Date</Label>
              <Input
                {...register("endDate")}
                type="date"
                className="!rounded-2xl inline-block border border-neutral-accent"
                placeholder="95"
                value={endDate ? formatDateForInput(endDate) : ""}
              />
            </div>
          </div>
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
      </div>
    </div>
  );
}
