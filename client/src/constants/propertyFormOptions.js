// Property form option lists (mirror server/src/constants/propertyOptions.js).
// The client is a separate package, so it keeps its own copies plus labels.
// Do not invent values; these must match the backend constants.

export const PRICE_TYPE_OPTIONS = [
  { value: "fixed", label: "Fixed" },
  { value: "negotiable", label: "Negotiable" },
  { value: "on_request", label: "On Request" },
];

export const AREA_UNIT_OPTIONS = [
  { value: "sqft", label: "sqft" },
  { value: "sqyd", label: "sqyd" },
];

export const AVAILABILITY_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "sold", label: "Sold" },
  { value: "unavailable", label: "Unavailable" },
];

export const FACING_OPTIONS = [
  { value: "north", label: "North" },
  { value: "south", label: "South" },
  { value: "east", label: "East" },
  { value: "west", label: "West" },
  { value: "north_east", label: "North East" },
  { value: "north_west", label: "North West" },
  { value: "south_east", label: "South East" },
  { value: "south_west", label: "South West" },
  { value: "unknown", label: "Unknown" },
];

// Property source (who supplied the property).
export const SOURCE_TYPE_OPTIONS = [
  { value: "broker", label: "Broker" },
  { value: "owner", label: "Owner" },
  { value: "builder", label: "Builder" },
  { value: "other", label: "Other" },
];

// Human-readable label for a source type value.
export function sourceTypeLabel(value) {
  return SOURCE_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value ?? null;
}
