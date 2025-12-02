import { Menu } from "../_schemas";

export const addMenuSteps: string[] = [
  "General Info",
  "Media",
  "Configuration",
  "Deal Settings",
];

export const DEFAULT_MENU_VALUES: Menu = {
  name: "",
  description: "",
  isFeatured: false,
  price: 0,
  quantity: 0,
  category: "",
  status: "DRAFT",
  availabilityType: "ALWAYS_AVAILABLE",
  addOns: [],
  nutritionAllergens: [],
  extras: [],
  files: [],
  availabilitySchedule: { days: [], startTime: "", endTime: "" },
  tag: "",
  dealId: "",
};
export const MENU_QUERY_KEY = "menus";
