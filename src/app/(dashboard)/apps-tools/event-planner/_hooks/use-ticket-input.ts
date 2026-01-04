import { useCallback, useState } from "react";
import { TicketTier } from "../_schemas";
import { INITIAL_TICKET_STATE } from "../_constants/event-modal";

export const useTicketInput = (
  tickets: TicketTier[],
  onAddTicket: (tickets: TicketTier[]) => void
) => {
  const [ticketInput, setTicketInput] =
    useState<TicketTier>(INITIAL_TICKET_STATE);

  const handleInputChange = useCallback(
    (field: keyof TicketTier, value: string | number) => {
      setTicketInput((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const addTicket = useCallback(() => {
    if (ticketInput.name.trim() && ticketInput.price >= 0) {
      onAddTicket([...tickets, ticketInput]);
      setTicketInput(INITIAL_TICKET_STATE);
    }
  }, [ticketInput, tickets, onAddTicket]);

  const resetInput = useCallback(() => {
    setTicketInput(INITIAL_TICKET_STATE);
  }, []);

  return { ticketInput, handleInputChange, addTicket, resetInput };
};
