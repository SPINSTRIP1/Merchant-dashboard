import { Event } from "../_schemas";

export const DEFAULT_EVENT_VALUES: Partial<Event> = {
  name: "",
  description: "",
  frequency: "ONE_OFF",
  startDate: "",
  endDate: "",
  timezone: "",
  location: "",
  city: "",
  state: "",
  country: "",
  contactPhone: "",
  contactEmail: "",
  ticketTiers: [],
  status: "ACTIVE",
  startTime: "",
  endTime: "",
  files: [],
  // coverImage: undefined,
};
