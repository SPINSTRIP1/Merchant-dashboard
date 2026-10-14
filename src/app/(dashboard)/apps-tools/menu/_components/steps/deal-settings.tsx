import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import PillGroup from "@/components/pill-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActiveDeals, useDealSubscription } from "@/hooks/use-deals";
import { useMenuForm } from "../../_context";

const NO_DEAL = "none";

export default function DealSettings() {
  const {
    form: { watch, setValue },
    handleCreateDeals,
  } = useMenuForm();
  const router = useRouter();
  const isFeatured = watch("isFeatured");
  const dealId = watch("dealId");
  const { subscribed } = useDealSubscription();
  const { deals, isLoading } = useActiveDeals();

  return (
    <div className="space-y-6">
      <PillGroup
        label="Mark as Featured"
        options={[
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ]}
        value={isFeatured ? "yes" : "no"}
        onChange={(value) =>
          setValue("isFeatured", value === "yes", { shouldDirty: true, shouldValidate: true })
        }
      />

      <div className="space-y-1.5">
        <Label>Apply a campaign</Label>
        <Select
          value={dealId || NO_DEAL}
          onValueChange={(value) =>
            setValue("dealId", value === NO_DEAL ? undefined : value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoading ? "Loading deals…" : "Select Deal"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_DEAL}>No deal</SelectItem>
            {deals.map((deal) => (
              <SelectItem key={deal.id} value={deal.id!}>
                {deal.name} — {deal.discountPercentage}% off
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {deals.length || isLoading ? "Only active deals are listed." : "You have no active deals."}{" "}
          Want to apply a campaign?{" "}
          <button
            type="button"
            className="font-semibold text-primary hover:underline"
            onClick={() => {
              handleCreateDeals();
              router.push(subscribed ? "/apps-tools/deals" : "/apps-tools");
            }}
          >
            Create Deals
          </button>
        </p>
      </div>
    </div>
  );
}
