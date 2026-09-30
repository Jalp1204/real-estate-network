import mongoose from "mongoose";
import Property from "../models/Property.js";
import Location from "../models/Location.js";
import Broker from "../models/Broker.js";
import {
  BHK,
  PROPERTY_TYPES,
  PRICE_TYPES,
  AREA_UNITS,
  POSSESSION_STATUSES,
  FURNISHINGS,
  FACINGS,
  AVAILABILITIES,
  SOURCE_TYPES,
  PROPERTY_SORTS,
  AMENITIES,
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

// Builds a MongoDB filter from a customer's requirements document.
//
// This is the deterministic V1 requirement -> property mapping used by the
// private "Find Matching Properties" flow. There is no scoring, ranking or
// fuzzy logic: each requirement field either adds an exact restriction or is
// ignored when empty. Returns { filter, filterCount }, where filterCount is the
// number of active filter groups (0 means the requirements impose no
// restriction at all).
//
// Semantics:
//   budget.min        -> property.price.amount >= min
//   budget.max        -> property.price.amount <= max
//   locations[]       -> property.locationId in locations (ANY)
//   bhk[]             -> property.bhk in bhk (ANY)
//   propertyTypes[]   -> property.propertyType in propertyTypes (ANY)
//   minArea           -> property.area >= minArea
//   possession[]      -> property.possession.status in possession (ANY)
//   amenities[]       -> property.amenities contains ALL selected (AND)
export function buildRequirementFilter(requirement) {
  const source = requirement ?? {};
  const filter = {};
  let filterCount = 0;

  const min = Number.isFinite(source?.budget?.min) ? source.budget.min : null;
  const max = Number.isFinite(source?.budget?.max) ? source.budget.max : null;

  if (min !== null || max !== null) {
    const priceFilter = {};
    if (min !== null) priceFilter.$gte = min;
    if (max !== null) priceFilter.$lte = max;
    filter["price.amount"] = priceFilter;
    filterCount += 1;
  }

  // locations may be raw ObjectIds or populated Location documents.
  const locationIds = (Array.isArray(source.locations) ? source.locations : [])
    .map((loc) => (loc && typeof loc === "object" && loc._id ? loc._id : loc))
    .filter((id) => mongoose.Types.ObjectId.isValid(id));

  if (locationIds.length > 0) {
    filter.locationId = { $in: locationIds };
    filterCount += 1;
  }

  const bhk = (Array.isArray(source.bhk) ? source.bhk : []).filter((value) =>
    Number.isInteger(value)
  );
  if (bhk.length > 0) {
    filter.bhk = { $in: bhk };
    filterCount += 1;
  }

  const propertyTypes = (
    Array.isArray(source.propertyTypes) ? source.propertyTypes : []
  ).filter((value) => PROPERTY_TYPES.includes(value));
  if (propertyTypes.length > 0) {
    filter.propertyType = { $in: propertyTypes };
    filterCount += 1;
  }

  if (Number.isFinite(source.minArea)) {
    filter.area = { $gte: source.minArea };
    filterCount += 1;
  }

  const possession = (
    Array.isArray(source.possession) ? source.possession : []
  ).filter((value) => POSSESSION_STATUSES.includes(value));
  if (possession.length > 0) {
    filter["possession.status"] = { $in: possession };
    filterCount += 1;
  }

  const amenities = (Array.isArray(source.amenities) ? source.amenities : [])
    .filter((value) => AMENITIES.includes(value));
  if (amenities.length > 0) {
    // Every selected amenity must be present on the property.
    filter.amenities = { $all: amenities };
    filterCount += 1;
  }

  return { filter, filterCount };
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

// Public/customer-facing property shape.
//
// Strips the internal `source` relationship (sourceType + brokerId) and the
// internal-only `internalNotes` array so no broker/source metadata or internal
// notes ever reach customer-facing responses. This is a response-boundary
// sanitizer only: the database value is never modified, and the intentional
// public `verification` field is preserved exactly as-is.
// Uses toJSON() so the serialized shape (and absence of `__v`) matches the
// previous behavior exactly.
export function toPublicProperty(property) {
  const obj =
    typeof property.toJSON === "function" ? property.toJSON() : { ...property };
  delete obj.source;
  delete obj.internalNotes;
  return obj;
}

// ---------------------------------------------------------------------------
// Minimal write foundation (Broker Slice 2). Only what is required to create /
// edit a property's source relationship. Not a general property-management API.
// ---------------------------------------------------------------------------

function requireText(value, label) {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) throw new PropertyServiceError(`${label} is required`, 400);
  return trimmed;
}

function requireEnum(value, allowed, label) {
  if (typeof value !== "string" || !allowed.includes(value)) {
    throw new PropertyServiceError(`Invalid ${label}`, 400);
  }
  return value;
}

function requireNonNegative(value, label) {
  if (value === undefined || value === null || value === "") {
    throw new PropertyServiceError(`${label} is required`, 400);
  }
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    throw new PropertyServiceError(`Invalid ${label}`, 400);
  }
  return number;
}

// Validates/normalizes the editable property fields shared by create and update.
// Advanced/optional fields are intentionally left at schema defaults.
async function buildPropertyFields(data = {}) {
  const source = data && typeof data === "object" ? data : {};

  const locationId = source.locationId;
  if (
    typeof locationId !== "string" ||
    !mongoose.Types.ObjectId.isValid(locationId)
  ) {
    throw new PropertyServiceError("A valid location is required", 400);
  }
  const locationExists = await Location.exists({ _id: locationId });
  if (!locationExists) {
    throw new PropertyServiceError("Location not found", 404);
  }

  let bhk = null;
  if (source.bhk !== undefined && source.bhk !== null && source.bhk !== "") {
    bhk = Number(source.bhk);
    if (!Number.isInteger(bhk) || !BHK.includes(bhk)) {
      throw new PropertyServiceError("Invalid BHK", 400);
    }
  }

  return {
    title: requireText(source.title, "Title"),
    propertyType: requireEnum(source.propertyType, PROPERTY_TYPES, "property type"),
    bhk,
    price: {
      amount: requireNonNegative(source.price?.amount, "Price amount"),
      type: requireEnum(source.price?.type, PRICE_TYPES, "price type"),
    },
    area: requireNonNegative(source.area, "Area"),
    areaUnit: requireEnum(source.areaUnit, AREA_UNITS, "area unit"),
    locationId,
    possession: {
      status: requireEnum(
        source.possession?.status,
        POSSESSION_STATUSES,
        "possession status"
      ),
      date: null,
      dateType: "not_applicable",
    },
    details: {
      floor: null,
      totalFloors: null,
      parking: null,
      furnishing: requireEnum(
        source.details?.furnishing,
        FURNISHINGS,
        "furnishing"
      ),
      facing: requireEnum(source.details?.facing, FACINGS, "facing"),
      propertyAge: null,
    },
    availability: requireEnum(source.availability, AVAILABILITIES, "availability"),
  };
}

// Validates/normalizes the property source relationship.
// sourceType=broker requires an existing broker; every other source type stores
// brokerId as null (explicitly clearing any previous broker reference).
async function buildSource(raw = {}) {
  const source = raw && typeof raw === "object" ? raw : {};
  const sourceType = requireEnum(source.sourceType, SOURCE_TYPES, "source type");

  if (sourceType === "broker") {
    const brokerId = source.brokerId;
    if (
      typeof brokerId !== "string" ||
      !mongoose.Types.ObjectId.isValid(brokerId)
    ) {
      throw new PropertyServiceError("A broker must be selected", 400);
    }
    const exists = await Broker.exists({ _id: brokerId });
    if (!exists) {
      throw new PropertyServiceError("Broker not found", 404);
    }
    return { sourceType, brokerId };
  }

  return { sourceType, brokerId: null };
}

// POST /api/properties
export async function createProperty(data = {}) {
  const fields = await buildPropertyFields(data);
  const source = await buildSource(data.source);

  return Property.create({
    ...fields,
    amenities: [],
    specialities: [],
    photos: [],
    verification: {
      status: "not_checked",
      lastCheckedAt: null,
      ownershipInfo: "not_checked",
      registrationInfo: "not_checked",
      approvalInfo: "not_checked",
      loanInfo: "not_checked",
      notes: null,
    },
    source,
    internalNotes: [],
  });
}

// PUT /api/properties/:id
export async function updateProperty(id, data = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new PropertyServiceError("Invalid property ID", 400);
  }

  const property = await Property.findById(id);
  if (!property) {
    throw new PropertyServiceError("Property not found", 404);
  }

  const fields = await buildPropertyFields(data);
  const source = await buildSource(data.source);

  // Assign only the fields this minimal form manages. Advanced/nested fields
  // that the form does not edit (possession.date/dateType, details.floor,
  // totalFloors, parking, propertyAge, amenities, photos, verification,
  // internalNotes) are preserved rather than reset.
  property.title = fields.title;
  property.propertyType = fields.propertyType;
  property.bhk = fields.bhk;
  property.price = fields.price;
  property.area = fields.area;
  property.areaUnit = fields.areaUnit;
  property.locationId = fields.locationId;
  property.possession.status = fields.possession.status;
  property.details.furnishing = fields.details.furnishing;
  property.details.facing = fields.details.facing;
  property.availability = fields.availability;

  // Replace the source entirely so switching away from broker explicitly writes
  // brokerId: null.
  property.source = source;

  await property.save();

  return property;
}

// GET /api/properties/:id/internal
// Internal-only detail: the property plus a resolved broker summary (or null
// when the referenced broker no longer exists). The stored broker ObjectId is
// preserved as-is; nothing is rewritten.
export async function getPropertyInternalById(id) {
  const property = await getPropertyById(id);
  const obj = property.toObject();

  let broker = null;
  if (obj.source?.sourceType === "broker" && obj.source?.brokerId) {
    broker = await Broker.findById(obj.source.brokerId)
      .select("name businessName phone status")
      .lean();
  }

  return { ...obj, broker };
}
