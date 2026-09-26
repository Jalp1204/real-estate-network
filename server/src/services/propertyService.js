import mongoose from "mongoose";
import Property from "../models/Property.js";
import {
  BHK,
  PROPERTY_TYPES,
  POSSESSION_STATUSES,
  FURNISHINGS,
  PROPERTY_SORTS,
} from "../constants/propertyOptions.js";

// Default sort: most recently updated first.
const DEFAULT_SORT = "recent";

// Simple sort specs expressible with a plain Mongoose `.sort()`.
// possession_asc is handled separately (it needs dated-before-undated ordering).
const SORT_SPECS = {
  recent: { updatedAt: -1 },
  price_asc: { "price.amount": 1 },
  price_desc: { "price.amount": -1 },
  area_asc: { area: 1 },
  area_desc: { area: -1 },
};

// Application error carrying the HTTP status the controller should use.
// Keeps validation semantics out of the controller without a global error
// framework.
export class PropertyServiceError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "PropertyServiceError";
    this.statusCode = statusCode;
  }
}

// Parses an optional, non-negative numeric query parameter (budget, minArea).
// Returns { valid, value } where value is null when the parameter is absent.
function parseNonNegativeNumber(raw) {
  // Absent (or empty) means "no filter".
  if (raw === undefined || raw === "") {
    return { valid: true, value: null };
  }

  // Reject arrays/objects (e.g. ?budgetMin=1&budgetMin=2).
  if (typeof raw !== "string") {
    return { valid: false, value: null };
  }

  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) {
    return { valid: false, value: null };
  }

  return { valid: true, value };
}

// Parses an optional enum query parameter against a shared constant list.
// Returns { valid, value } where value is null when the parameter is absent.
function parseEnumValue(raw, allowed) {
  if (raw === undefined || raw === "") {
    return { valid: true, value: null };
  }

  if (typeof raw !== "string" || !allowed.includes(raw)) {
    return { valid: false, value: null };
  }

  return { valid: true, value: raw };
}

// Parses the optional BHK parameter: an integer present in the shared BHK list.
function parseBhk(raw) {
  if (raw === undefined || raw === "") {
    return { valid: true, value: null };
  }

  if (typeof raw !== "string") {
    return { valid: false, value: null };
  }

  const value = Number(raw);
  if (!Number.isInteger(value) || !BHK.includes(value)) {
    return { valid: false, value: null };
  }

  return { valid: true, value };
}

// Builds the MongoDB filter from raw query params, throwing PropertyServiceError
// (status 400) on invalid input. Preserves the exact validation semantics that
// previously lived in the controller.
function buildFilter(filters = {}) {
  const {
    location,
    budgetMin: rawMin,
    budgetMax: rawMax,
    bhk: rawBhk,
    propertyType: rawPropertyType,
    minArea: rawMinArea,
    possession: rawPossession,
    furnishing: rawFurnishing,
  } = filters;

  const filter = {};

  if (location) {
    // Validate the location id format so a bad value is a 400, not a 500.
    if (!mongoose.Types.ObjectId.isValid(location)) {
      throw new PropertyServiceError("Invalid location ID", 400);
    }
    filter.locationId = location;
  }

  // Enum values come from the shared constants so allowed values are never
  // duplicated here.
  const min = parseNonNegativeNumber(rawMin);
  const max = parseNonNegativeNumber(rawMax);
  const minArea = parseNonNegativeNumber(rawMinArea);
  const bhk = parseBhk(rawBhk);
  const propertyType = parseEnumValue(rawPropertyType, PROPERTY_TYPES);
  const possession = parseEnumValue(rawPossession, POSSESSION_STATUSES);
  const furnishing = parseEnumValue(rawFurnishing, FURNISHINGS);

  if (!min.valid || !max.valid) {
    throw new PropertyServiceError("Invalid budget parameters", 400);
  }

  if (min.value !== null && max.value !== null && min.value > max.value) {
    throw new PropertyServiceError("Invalid budget parameters", 400);
  }

  if (
    !minArea.valid ||
    !bhk.valid ||
    !propertyType.valid ||
    !possession.valid ||
    !furnishing.valid
  ) {
    throw new PropertyServiceError("Invalid filter parameters", 400);
  }

  // Only property.price.amount participates in budget filtering.
  const priceFilter = {};
  if (min.value !== null) priceFilter.$gte = min.value;
  if (max.value !== null) priceFilter.$lte = max.value;
  if (Object.keys(priceFilter).length > 0) {
    filter["price.amount"] = priceFilter;
  }

  if (bhk.value !== null) filter.bhk = bhk.value;
  if (propertyType.value !== null) filter.propertyType = propertyType.value;
  if (minArea.value !== null) filter.area = { $gte: minArea.value };
  if (possession.value !== null) filter["possession.status"] = possession.value;
  if (furnishing.value !== null) filter["details.furnishing"] = furnishing.value;

  return filter;
}

// Resolves the optional `sort` query parameter to one of the shared
// PROPERTY_SORTS values. Absent means the default; an unknown value is a 400.
function resolveSort(raw) {
  if (raw === undefined || raw === "") {
    return DEFAULT_SORT;
  }

  if (typeof raw !== "string" || !PROPERTY_SORTS.includes(raw)) {
    throw new PropertyServiceError("Invalid sort parameter", 400);
  }

  return raw;
}

// possession_asc: "earliest practical possession" ordering.
//   1. ready_to_move properties first (available now),
//   2. then other properties that have a usable possession.date, earliest date
//      first,
//   3. then the rest, most recently updated first.
//
// Mongo's plain `.sort()` cannot express this multi-group ordering in a single
// pass, so we run three partition queries with the existing query API and
// concatenate. Each partition applies the same base `filter` (via `$and`) so a
// user's filters are never clobbered. Groups 2 and 3 explicitly exclude
// ready_to_move so no document can appear twice.
async function findSortedByPossession(filter) {
  const readyToMove = await Property.find({
    $and: [filter, { "possession.status": "ready_to_move" }],
  })
    .populate("locationId")
    .sort({ updatedAt: -1 });

  const dated = await Property.find({
    $and: [
      filter,
      {
        "possession.status": { $ne: "ready_to_move" },
        "possession.date": { $ne: null },
      },
    ],
  })
    .populate("locationId")
    .sort({ "possession.date": 1 });

  const undated = await Property.find({
    $and: [
      filter,
      {
        "possession.status": { $ne: "ready_to_move" },
        "possession.date": null,
      },
    ],
  })
    .populate("locationId")
    .sort({ updatedAt: -1 });

  return [...readyToMove, ...dated, ...undated];
}

// GET /api/properties
// Returns properties, most recently updated first by default, with their
// location.
//
// Supported (all optional, combinable) filters:
//   - location:     property.locationId === location
//   - budgetMin:    property.price.amount >= budgetMin
//   - budgetMax:    property.price.amount <= budgetMax
//   - bhk:          property.bhk === bhk
//   - propertyType: property.propertyType === propertyType
//   - minArea:      property.area >= minArea
//   - possession:   property.possession.status === possession
//   - furnishing:   property.details.furnishing === furnishing
//
// Supported sort modes: recent (default), price_asc, price_desc, area_asc,
// area_desc, possession_asc.
export async function getProperties(filters = {}) {
  const filter = buildFilter(filters);
  const sort = resolveSort(filters.sort);

  if (sort === "possession_asc") {
    return findSortedByPossession(filter);
  }

  return Property.find(filter)
    .populate("locationId")
    .sort(SORT_SPECS[sort]);
}

// GET /api/properties/:id
// Returns a single property by id, with its location.
// Throws PropertyServiceError (400 invalid id, 404 not found).
export async function getPropertyById(id) {
  // Validate the id format first so an invalid id is a 400, not a 500.
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new PropertyServiceError("Invalid property ID", 400);
  }

  const property = await Property.findById(id).populate("locationId");

  if (!property) {
    throw new PropertyServiceError("Property not found", 404);
  }

  return property;
}
