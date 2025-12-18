import { Place } from "../_schemas";

export const DEFAULT_PLACES_VALUES: Partial<Place> = {
  name: "",
  description: "",
  address: "",
  landmarks: "",
  city: "",
  state: "",
  country: "",
  longitude: 3.3792,
  latitude: 6.5244,
  placeType: "HOTEL",
  accessModel: "GATE_FEE",
  emails: [],
  phoneNumbers: [],
  environmentalSafetyPolicy: "",
  privacyPolicy: "",
  disclaimers: "",
  status: "PUBLISHED",
  availability: [],
  website: "",
};
