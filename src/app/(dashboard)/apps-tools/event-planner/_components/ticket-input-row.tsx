import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TicketTier } from "../_schemas";

export interface TicketInputRowProps {
  ticketInput: TicketTier;
  onInputChange: (field: keyof TicketTier, value: string | number) => void;
  onAdd: () => void;
}

/** Draft row for a new ticket tier; "+" adds it (it's also added automatically on save). */
export const TicketInputRow = ({ ticketInput, onInputChange, onAdd }: TicketInputRowProps) => (
  <div className="space-y-2 rounded-2xl border border-dashed p-3">
    <div className="flex items-center gap-2">
      <Input
        className="h-10 flex-1"
        placeholder="New tier, e.g. VIP"
        value={ticketInput.name}
        onChange={(e) => onInputChange("name", e.target.value)}
      />
      <button
        type="button"
        onClick={onAdd}
        aria-label="Add ticket tier"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary hover:bg-primary/20"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
    <Input
      className="h-10"
      placeholder="Description"
      value={ticketInput.description || ""}
      onChange={(e) => onInputChange("description", e.target.value)}
    />
    <div className="grid grid-cols-2 gap-2">
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          ₦
        </span>
        <Input
          type="number"
          className="h-10 pl-7"
          placeholder="0"
          value={ticketInput.price || ""}
          onChange={(e) => onInputChange("price", parseFloat(e.target.value) || 0)}
        />
      </div>
      <Input
        type="number"
        className="h-10"
        placeholder="Qty. available"
        value={ticketInput.quantityAvailable || ""}
        onChange={(e) => onInputChange("quantityAvailable", parseFloat(e.target.value) || 0)}
      />
    </div>
  </div>
);
