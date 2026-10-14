import Image from "next/image";
import { UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { categoryLabel } from "@/hooks/use-menu";
import { formatAmount } from "@/utils";
import { Menu } from "../../_schemas";
import MenuStatusBadge from "../menu-status-badge";

interface DetailsModalProps {
  menu: Menu | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (menu: Menu) => void;
}

const AVAILABILITY: Record<Menu["availabilityType"], string> = {
  ALWAYS_AVAILABLE: "Always available",
  SCHEDULED: "Specific days/time",
  UNAVAILABLE: "Unavailable",
};

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{children}</span>
    </div>
  );
}

export default function DetailsModal({ isOpen, menu, onClose, onEdit }: Readonly<DetailsModalProps>) {
  if (!menu) return null;
  const schedule = menu.availabilitySchedule;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        {menu.images?.length ? (
          <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1">
            {menu.images.map((img, index) => (
              <div key={index} className="relative h-44 w-56 shrink-0 overflow-hidden rounded-2xl">
                <Image src={img} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid h-32 place-items-center rounded-2xl bg-primary/10 text-primary">
            <UtensilsCrossed className="h-8 w-8" />
          </div>
        )}

        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle className="text-2xl">{menu.name}</DialogTitle>
            <MenuStatusBadge status={menu.status} />
            {menu.isHidden && (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                Hidden
              </span>
            )}
          </div>
          <DialogDescription className="text-base font-bold text-primary">
            {formatAmount(menu.price)}
          </DialogDescription>
        </DialogHeader>

        {menu.description && <p className="text-sm text-muted-foreground">{menu.description}</p>}

        <div className="divide-y rounded-2xl border px-4">
          {menu.code && <Detail label="Item code"><span className="font-mono text-xs">{menu.code}</span></Detail>}
          <Detail label="Category">{categoryLabel(menu.category)}</Detail>
          {menu.tag && <Detail label="Tag">{menu.tag}</Detail>}
          <Detail label="Quantity">{menu.quantity}</Detail>
          <Detail label="Availability">
            {AVAILABILITY[menu.availabilityType] ?? menu.availabilityType}
            {menu.availabilityType === "SCHEDULED" && schedule?.days?.length ? (
              <span className="block text-xs font-normal text-muted-foreground">
                {schedule.days.map((d) => d.slice(0, 3)).join(", ")} · {schedule.startTime}–{schedule.endTime}
              </span>
            ) : null}
          </Detail>
          {!!menu.sizeOptions?.length && <Detail label="Sizes">{menu.sizeOptions.join(", ")}</Detail>}
          {!!menu.addOns?.length && (
            <Detail label="Add ons">
              {menu.addOns.map((a) => `${a.name}${a.price ? ` (${formatAmount(a.price)})` : ""}`).join(", ")}
            </Detail>
          )}
          {!!menu.extras?.length && (
            <Detail label="Extras">
              {menu.extras.map((e) => `${e.name} (${formatAmount(e.price)})`).join(", ")}
            </Detail>
          )}
          {!!menu.nutritionAllergens?.length && (
            <Detail label="Nutrition / allergens">
              {menu.nutritionAllergens.map((n) => n.name).join(", ")}
            </Detail>
          )}
          <Detail label="Featured">{menu.isFeatured ? "Yes" : "No"}</Detail>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Close
          </Button>
          <Button variant="brand" className="flex-1" onClick={() => onEdit(menu)}>
            Edit Item
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
