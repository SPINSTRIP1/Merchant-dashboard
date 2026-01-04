import { Input } from "@/components/ui/input";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { TicketTier } from "../_schemas";

export interface TicketInputRowProps {
  ticketInput: TicketTier;
  onInputChange: (field: keyof TicketTier, value: string | number) => void;
  onAdd: () => void;
}

export const TicketInputRow = ({
  ticketInput,
  onInputChange,
  onAdd,
}: TicketInputRowProps) => (
  <div className="flex items-center pt-2 gap-x-2">
    <button type="button" onClick={onAdd} className="flex-shrink-0">
      <HugeiconsIcon icon={PlusSignIcon} size={24} color="#6F6D6D" />
    </button>
    <Input
      className="rounded-none border-b bg-transparent border-neutral-accent"
      placeholder="e.g. VIP"
      value={ticketInput.name}
      onChange={(e) => onInputChange("name", e.target.value)}
    />
    <Input
      className="!rounded-2xl max-w-[300px] border border-neutral-accent"
      placeholder="Description"
      value={ticketInput.description || ""}
      onChange={(e) => onInputChange("description", e.target.value)}
    />
    <Input
      type="number"
      className="!rounded-2xl max-w-[120px] border border-neutral-accent"
      placeholder="₦0.00"
      value={ticketInput.price || ""}
      onChange={(e) => onInputChange("price", parseFloat(e.target.value) || 0)}
    />
    <Input
      type="number"
      className="!rounded-2xl max-w-[120px] border border-neutral-accent"
      placeholder="Qty. Available"
      value={ticketInput.quantityAvailable || ""}
      onChange={(e) =>
        onInputChange("quantityAvailable", parseFloat(e.target.value) || 0)
      }
    />
  </div>
);
