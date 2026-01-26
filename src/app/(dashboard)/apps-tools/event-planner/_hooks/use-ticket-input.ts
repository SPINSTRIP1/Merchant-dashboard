import { useCallback, useState, useRef, useEffect } from "react";
import { TicketTier } from "../_schemas";
import { INITIAL_TICKET_STATE } from "../_constants/event-modal";

// Registry to track all ticket input instances for auto-flush on submit
const ticketInputRegistry = new Set<() => void>();

// Function to flush all pending ticket inputs before form submission
export const flushPendingTicketInputs = () => {
  ticketInputRegistry.forEach((flush) => flush());
};

export const useTicketInput = (
  tickets: TicketTier[],
  onAddTicket: (tickets: TicketTier[]) => void,
) => {
  const [ticketInput, setTicketInput] =
    useState<TicketTier>(INITIAL_TICKET_STATE);

  // Use refs to always have the latest values
  const ticketInputRef = useRef(ticketInput);
  const ticketsRef = useRef(tickets);

  useEffect(() => {
    ticketInputRef.current = ticketInput;
  }, [ticketInput]);

  useEffect(() => {
    ticketsRef.current = tickets;
  }, [tickets]);

  const handleInputChange = useCallback(
    (field: keyof TicketTier, value: string | number) => {
      setTicketInput((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const addTicket = useCallback(() => {
    const current = ticketInputRef.current;
    if (current.name.trim() && current.price >= 0) {
      onAddTicket([...ticketsRef.current, current]);
      setTicketInput(INITIAL_TICKET_STATE);
    }
  }, [onAddTicket]);

  // Register this instance for auto-flush
  useEffect(() => {
    const flushCallback = () => {
      const current = ticketInputRef.current;
      if (current.name.trim() && current.price >= 0) {
        onAddTicket([...ticketsRef.current, current]);
        setTicketInput(INITIAL_TICKET_STATE);
      }
    };

    ticketInputRegistry.add(flushCallback);
    return () => {
      ticketInputRegistry.delete(flushCallback);
    };
  }, [onAddTicket]);

  const resetInput = useCallback(() => {
    setTicketInput(INITIAL_TICKET_STATE);
  }, []);

  return { ticketInput, handleInputChange, addTicket, resetInput };
};
