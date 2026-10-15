import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import PillGroup from "@/components/pill-group";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDealsForm } from "../../_context";
import { useInventoryProducts } from "@/hooks/use-inventory";
import { useDealCampaigns } from "@/hooks/use-deals";
import { FormInput } from "@/components/ui/forms/form-input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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

  const { products: menuItems, isLoading } = useInventoryProducts();
  const { campaigns } = useDealCampaigns();
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
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{action === "edit" ? "Edit Deal" : "Create Deal"}</SheetTitle>
          <SheetDescription>Discount selected products for a campaign period.</SheetDescription>
        </SheetHeader>

        <div className="space-y-5 pb-2">
          <FormInput
            control={control}
            label="Deal Name"
            name="name"
            placeholder="e.g. Buy 1 get 1 free"
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

          <div className="space-y-2">
            <Label>Products</Label>
            <p className="text-xs text-muted-foreground">
              {productIds.length > 0
                ? `${productIds.length} selected: ${menuItems
                    ?.filter((item) => productIds.includes(item.id))
                    .map((item) => item.name)
                    .join(", ")}`
                : "No items selected"}
            </p>
            {isLoading ? (
              <p className="py-3 text-sm text-muted-foreground">Loading products…</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {menuItems?.map((item) => {
                  const isSelected = productIds.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleMenuItem(item.id)}
                      aria-pressed={isSelected}
                      className={cn(
                        "inline-flex min-h-[34px] items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                      {item.name}
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
            placeholder="e.g. Get a free item for every item you buy during this festive season"
            type="textarea"
          />

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              control={control}
              label="Discount (%)"
              name="discountPercentage"
              placeholder="10"
              type="number"
            />
            <FormInput
              control={control}
              label="Maximum Threshold"
              name="maximumThreshold"
              placeholder="500 orders"
              type="number"
            />
            <FormInput control={control} label="Start Date" name="startDate" type="date" />
            <FormInput control={control} label="End Date" name="endDate" type="date" />
          </div>

          <PillGroup
            label="Mark as Featured"
            options={[
              { label: "Yes", value: "YES" },
              { label: "No", value: "NO" },
            ]}
            value={isFeatured ? "YES" : "NO"}
            onChange={(value) => {
              setValue("isFeatured", value === "YES", {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
          />
        </div>

        <div className="flex items-center justify-between gap-3 border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="brand" disabled={loading} onClick={submitDeal}>
            {getButtonLabel()}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
