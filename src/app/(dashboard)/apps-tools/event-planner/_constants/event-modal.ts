import { TicketTier } from "../_schemas";

export const MAX_IMAGES = 6;

export const INITIAL_TICKET_STATE: TicketTier = {
  name: "",
  price: 0,
  description: "",
  quantityAvailable: 0,
};

export const FREQUENCY_OPTIONS = [
  { label: "One-Off", value: "ONE_OFF" },
  { label: "Recurring", value: "RECURRING" },
];

export const RECURRENCE_OPTIONS = [
  { label: "Weekly", value: "WEEKLY" },
  { label: "Bi-Weekly", value: "BIWEEKLY" },
  { label: "Monthly", value: "MONTHLY" },
  { label: "Custom", value: "CUSTOM" },
];

export const TIMEZONE_OPTIONS = [
  { label: "Africa/Lagos (GMT+1)", value: "Africa/Lagos" },
  { label: "Africa/Cairo (GMT+2)", value: "Africa/Cairo" },
  { label: "Africa/Johannesburg (GMT+2)", value: "Africa/Johannesburg" },
  { label: "Africa/Nairobi (GMT+3)", value: "Africa/Nairobi" },
  { label: "Europe/London (GMT+0)", value: "Europe/London" },
];

export const FEATURED_OPTIONS = [
  { label: "Yes", value: "true" },
  { label: "No", value: "false" },
];
