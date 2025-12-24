import z from "zod";

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
  accessType: z.enum(["OPEN", "PRICED"]).optional(),
  isGated: z.boolean().optional(),
  images: z.array(z.string()).optional(),
});

export type Facility = z.infer<typeof facilitySchema>;

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
  emails: z
    .array(z.email("Invalid email format"))
    .min(1, "At least one email is required"),
  phoneNumbers: z
    .array(z.string().min(10, "Invalid phone number"))
    .min(1, "At least one phone number is required"),
  environmentalSafetyPolicy: z.instanceof(File).optional().nullable(),
  privacyPolicy: z.instanceof(File).optional().nullable(),
  disclaimers: z.instanceof(File).optional().nullable(),
  ownershipDocument: z.instanceof(File).optional().nullable(),
  ownershipVideo: z.instanceof(File).optional().nullable(),
  status: z.enum(["PUBLISHED", "UNPUBLISHED", "DRAFT", "REJECTED"]).optional(),
  website: z.string().optional(),
  facilities: z.array(facilitySchema).optional(),
  coverImage: z.instanceof(File, { message: "Please upload a cover image" }),
  disclaimersUrl: z.string().optional(),
  environmentalSafetyPolicyUrl: z.string().optional(),
  ownershipDocumentUrl: z.string().optional(),
  ownershipVideoUrl: z.string().optional(),
  privacyPolicyUrl: z.string().optional(),
  userId: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export type Place = z.infer<typeof placeSchema>;
