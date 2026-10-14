import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const OPTIONS = [
  {
    value: "new" as const,
    title: "New Place",
    description: "Create a brand new listing for a place that isn't on SpinStrip yet.",
    image: "/places/new-place.svg",
  },
  {
    value: "claim" as const,
    title: "Claim Place",
    description: "Take ownership of a place that already exists on SpinStrip.",
    image: "/places/claim-place.svg",
  },
];

/** Asks whether the merchant is adding a new place or claiming an existing one. */
export default function SelectModal({
  isOpen,
  onClose,
}: Readonly<{ isOpen: boolean; onClose: (choice: "claim" | "new" | null) => void }>) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(null)}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose how you want to publish your place</DialogTitle>
          <DialogDescription>You can add as many places as you manage.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onClose(option.value)}
              className="card-hover group flex flex-col overflow-hidden rounded-2xl border bg-card text-left"
            >
              <div className="brand-gradient-soft grid h-40 place-items-center">
                <Image src={option.image} alt="" width={180} height={140} className="h-28 w-auto" />
              </div>
              <div className="flex flex-1 items-start justify-between gap-3 p-4">
                <div>
                  <p className="font-display font-bold text-foreground">{option.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{option.description}</p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
