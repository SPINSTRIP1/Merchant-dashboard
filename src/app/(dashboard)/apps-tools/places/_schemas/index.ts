import z from "zod";

// Availability schema for each day
export const availabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6), // 0 = Sunday, 6 = Saturday
  isOpen: z.boolean(),
  openTime: z.string(), // Format: "HH:MM"
  closeTime: z.string(), // Format: "HH:MM"
});

export type Availability = z.infer<typeof availabilitySchema>;

// Place schema
export const placeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Place name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  address: z.string().min(5, "Address is required"),
  landmarks: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().min(2, "Country is required"),
  longitude: z.number(),
  latitude: z.number(),
  placeType: z.enum([
    "HOTEL",
    "SHORT_LET",
    "BEACH_RESORT",
    "RECREATION_CENTER",
    "BUSINESS_HUB",
    "STADIUM",
    "SPORT_FACILITY",
    "COUNTRY_CLUB",
    "SPORT_RECREATION_CLUB",
    "HOSPITAL",
    "CLINIC",
    "PHARMACY",
    "SPA_WELLNESS_CENTER",
    "GYM",
    "STUDIO",
    "AIRPORT",
    "RAIL_STATION",
    "ROAD_TRANSPORT_HUB",
    "WATER_TRANSPORT_HUB",
    "RELIGIOUS_CENTRE",
    "POLICE_STATION",
    "COURT",
    "MILITARY_BARRACKS",
    "BANK",
    "STRIP_CLUB",
  ]),
  accessModel: z.enum(["GATE_FEE", "FREE", "RESERVATION", "MEMBERSHIP"]),
  emails: z
    .array(z.email("Invalid email format"))
    .min(1, "At least one email is required"),
  phoneNumbers: z
    .array(z.string().min(10, "Invalid phone number"))
    .min(1, "At least one phone number is required"),
  environmentalSafetyPolicy: z.string().optional(),
  privacyPolicy: z.string().optional(),
  disclaimers: z.string().optional(),
  status: z.enum(["PUBLISHED", "UNPUBLISHED", "DRAFT"]),
  availability: z.array(availabilitySchema).optional(),
  website: z.string().url("Invalid URL").optional(),
});

export type Place = z.infer<typeof placeSchema>;

// Fee tier schema for facilities
export const feeTierSchema = z.object({
  tierName: z.string().min(2, "Tier name is required"),
  tierLevel: z.number().min(1, "Tier level must be at least 1"),
  amount: z.number().min(0, "Amount must be positive"),
  description: z.string().optional(),
});

export type FeeTier = z.infer<typeof feeTierSchema>;

// Facility schema
export const facilitySchema = z.object({
  id: z.string().optional(),
  placeId: z.string().min(1, "Place ID is required"),
  name: z.string().min(2, "Facility name must be at least 2 characters"),
  facilityCategory: z.string().min(2, "Facility category is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  fees: z.array(feeTierSchema),
  files: z.array(z.instanceof(File)).optional(),
  facilityAccess: z.enum(["OPEN", "PRICED"]).optional(),
  freeAccess: z.boolean().optional(),
});

export type Facility = z.infer<typeof facilitySchema>;
