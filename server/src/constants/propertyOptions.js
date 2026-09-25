// ---------------------------------------------------------------------------
// Shared property option constants
//
// Canonical controlled values for property-related fields. These are the single
// source of truth for enums used by Property and by CustomerRequirement (where
// fields mirror property options).
//
// Values must match docs/database-schema.md. Do not invent or rename values
// without explicit approval.
// ---------------------------------------------------------------------------

export const PROPERTY_TYPES = ["apartment", "house", "commercial"];

export const BHK = [1, 2, 3, 4, 5];

export const PRICE_TYPES = ["fixed", "negotiable", "on_request"];

// Apartment/house may use sqyd or sqft.
// Commercial properties may use sqyd or sqft depending on the property.
export const AREA_UNITS = ["sqyd", "sqft"];

export const POSSESSION_STATUSES = ["ready_to_move", "under_construction", "upcoming"];

export const POSSESSION_DATE_TYPES = ["actual", "expected", "not_applicable"];

export const FURNISHINGS = ["unfurnished", "semi_furnished", "fully_furnished"];

export const FACINGS = [
  "north",
  "south",
  "east",
  "west",
  "north_east",
  "north_west",
  "south_east",
  "south_west",
  "unknown",
];

export const AVAILABILITIES = ["available", "sold", "unavailable"];

export const SOURCE_TYPES = ["broker", "owner", "builder", "other"];

export const VERIFICATION_STATUSES = [
  "not_checked",
  "partially_verified",
  "verification_completed",
];

// Shared by ownershipInfo, registrationInfo, approvalInfo and loanInfo.
export const VERIFICATION_INFO_VALUES = ["not_checked", "provided", "checked"];

export const PHOTO_CATEGORIES = [
  "exterior",
  "drawing_room",
  "living_room",
  "bedroom",
  "kitchen",
  "bathroom",
  "balcony",
  "parking",
  "building",
  "surroundings",
  "other",
];

export const AMENITIES = [
  "lift",
  "parking",
  "gym",
  "security",
  "garden",
  "clubhouse",
  "play_area",
  "power_backup",
  "water_supply",
  "fire_safety",
  "solar",
];

export const SPECIALITIES = [
  "corner_unit",
  "garden_facing",
  "main_road_facing",
  "renovated",
  "premium_location",
  "large_balcony",
];
