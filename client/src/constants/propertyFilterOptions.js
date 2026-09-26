// Filter option lists for the property filter UI.
//
// These mirror the controlled values in the backend shared constants
// (server/src/constants/propertyOptions.js). The client is a separate package,
// so it keeps its own copy of the values plus display labels.
//
// Each value maps directly to a query parameter value.

export const BHK_OPTIONS = [
  { value: "1", label: "1 BHK" },
  { value: "2", label: "2 BHK" },
  { value: "3", label: "3 BHK" },
  { value: "4", label: "4 BHK" },
  { value: "5", label: "5 BHK" },
];

export const PROPERTY_TYPE_OPTIONS = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "commercial", label: "Commercial" },
];

export const POSSESSION_OPTIONS = [
  { value: "ready_to_move", label: "Ready to Move" },
  { value: "under_construction", label: "Under Construction" },
  { value: "upcoming", label: "Upcoming" },
];

export const FURNISHING_OPTIONS = [
  { value: "unfurnished", label: "Unfurnished" },
  { value: "semi_furnished", label: "Semi Furnished" },
  { value: "fully_furnished", label: "Fully Furnished" },
];

// The query parameters owned by this filter panel. "Clear Filters" removes
// only these, leaving location/budget parameters untouched.
export const PROPERTY_FILTER_KEYS = [
  "bhk",
  "propertyType",
  "minArea",
  "possession",
  "furnishing",
];
