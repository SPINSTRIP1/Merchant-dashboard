import { Input } from "@/components/ui/input";
import { TicketTier } from "../_schemas";
import { formatAmount } from "@/utils";

export interface TicketRowProps {
  ticket: TicketTier;
  isReadOnly?: boolean;
}

export const TicketRow = ({ ticket }: TicketRowProps) => (
  <div className="flex items-center pt-2 gap-x-2">
    <Input
      className="rounded-none border-b bg-transparent border-neutral-accent"
      placeholder="Add Item"
      defaultValue={ticket.name}
      readOnly
    />
    <Input
      className="!rounded-2xl max-w-[300px] border border-neutral-accent"
      placeholder="Description"
      defaultValue={ticket.description}
      readOnly
    />
    <Input
      className="!rounded-2xl max-w-[140px] border border-neutral-accent"
      placeholder="₦0.00"
      defaultValue={formatAmount(ticket.price) || ""}
      readOnly
    />
    <Input
      className="!rounded-2xl max-w-[140px] border border-neutral-accent"
      placeholder="₦0.00"
      defaultValue={ticket.quantityAvailable || ""}
      readOnly
    />
  </div>
);
