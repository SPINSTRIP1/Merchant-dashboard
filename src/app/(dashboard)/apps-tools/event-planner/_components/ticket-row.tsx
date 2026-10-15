import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TicketTier } from "../_schemas";

export interface TicketRowProps {
  ticket: TicketTier;
  /** Update this tier's fields (omit for a read-only row). */
  onChange?: (patch: Partial<TicketTier>) => void;
  onRemove?: () => void;
}

/** A saved ticket tier: name, description, price and quantity, editable in place. */
export const TicketRow = ({ ticket, onChange, onRemove }: TicketRowProps) => {
  const readOnly = !onChange;
  return (
    <div className="space-y-2 rounded-2xl border bg-card p-3">
      <div className="flex items-center gap-2">
        <Input
          className="h-10 flex-1 font-semibold"
          placeholder="Tier name, e.g. VIP"
          value={ticket.name}
          readOnly={readOnly}
          onChange={(e) => onChange?.({ name: e.target.value })}
        />
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${ticket.name || "ticket tier"}`}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-rose-500 hover:bg-rose-500/10"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      <Input
        className="h-10"
        placeholder="Description, e.g. Front row + drinks"
        value={ticket.description || ""}
        readOnly={readOnly}
        onChange={(e) => onChange?.({ description: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            ₦
          </span>
          <Input
            type="number"
            min={0}
            className="h-10 pl-7"
            placeholder="0"
            value={ticket.price || ""}
            readOnly={readOnly}
            onChange={(e) => onChange?.({ price: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <Input
          type="number"
          min={1}
          className="h-10"
          placeholder="Qty. available"
          value={ticket.quantityAvailable || ""}
          readOnly={readOnly}
          onChange={(e) => onChange?.({ quantityAvailable: parseFloat(e.target.value) || 0 })}
        />
      </div>
    </div>
  );
};
