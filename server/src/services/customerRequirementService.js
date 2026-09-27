import mongoose from "mongoose";
import Customer from "../models/Customer.js";
import CustomerRequirement from "../models/CustomerRequirement.js";
import Location from "../models/Location.js";
import {
  BHK,
  PROPERTY_TYPES,
  POSSESSION_STATUSES,
  AMENITIES,
} from "../constants/propertyOptions.js";
import { CustomerServiceError } from "./customerService.js";

// Customer requirements (private/internal area). At most ONE requirements
// document per customer in the V1 workflow. The locked `customerRequirements`
// schema is authoritative; nothing here invents new fields or values.

// Confirms the customer id format and that the customer exists.
async function assertCustomerExists(customerId) {
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    throw new CustomerServiceError("Invalid customer ID", 400);
  }

  const exists = await Customer.exists({ _id: customerId });
  if (!exists) {
    throw new CustomerServiceError("Customer not found", 404);
  }
}

// Parses an optional, non-negative number into { valid, value } (value null when
// absent/empty).
function parseOptionalNumber(raw) {
  if (raw === undefined || raw === null || raw === "") {
    return { valid: true, value: null };
  }

  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) {
    return { valid: false, value: null };
  }

  return { valid: true, value };
}

// Parses an array of allowed string enum values, de-duplicated. Absent -> [].
function parseEnumArray(raw, allowed) {
  if (raw === undefined || raw === null) {
    return { valid: true, value: [] };
  }
  if (!Array.isArray(raw)) {
    return { valid: false, value: [] };
  }

  const out = [];
  for (const item of raw) {
    if (typeof item !== "string" || !allowed.includes(item)) {
      return { valid: false, value: [] };
    }
    if (!out.includes(item)) out.push(item);
  }
  return { valid: true, value: out };
}

// Parses an array of BHK numbers restricted to the shared BHK constant.
function parseBhkArray(raw) {
  if (raw === undefined || raw === null) {
    return { valid: true, value: [] };
  }
  if (!Array.isArray(raw)) {
    return { valid: false, value: [] };
  }

  const out = [];
  for (const item of raw) {
    const value = Number(item);
    if (!Number.isInteger(value) || !BHK.includes(value)) {
      return { valid: false, value: [] };
    }
    if (!out.includes(value)) out.push(value);
  }
  return { valid: true, value: out };
}

// Parses an array of Location ObjectId strings, de-duplicated.
function parseLocationIds(raw) {
  if (raw === undefined || raw === null) {
    return { valid: true, value: [] };
  }
  if (!Array.isArray(raw)) {
    return { valid: false, value: [] };
  }

  const out = [];
  for (const item of raw) {
    if (typeof item !== "string" || !mongoose.Types.ObjectId.isValid(item)) {
      return { valid: false, value: [] };
    }
    if (!out.includes(item)) out.push(item);
  }
  return { valid: true, value: out };
}

// Builds and validates the requirement payload from the raw request body.
// Throws CustomerServiceError (400) on invalid input. Never invents values:
// absent optional fields become null/[] per the locked schema.
async function buildRequirementData(data = {}) {
  const source = data && typeof data === "object" ? data : {};

  const min = parseOptionalNumber(source?.budget?.min);
  const max = parseOptionalNumber(source?.budget?.max);
  const minArea = parseOptionalNumber(source?.minArea);
  const locations = parseLocationIds(source.locations);
  const bhk = parseBhkArray(source.bhk);
  const propertyTypes = parseEnumArray(source.propertyTypes, PROPERTY_TYPES);
  const possession = parseEnumArray(source.possession, POSSESSION_STATUSES);
  const amenities = parseEnumArray(source.amenities, AMENITIES);

  if (!min.valid || !max.valid) {
    throw new CustomerServiceError("Invalid budget values", 400);
  }
  if (min.value !== null && max.value !== null && min.value > max.value) {
    throw new CustomerServiceError("Invalid budget range", 400);
  }

  if (!minArea.valid) {
    throw new CustomerServiceError("Invalid minimum area", 400);
  }

  if (!locations.valid) {
    throw new CustomerServiceError("Invalid location ID", 400);
  }

  if (
    !bhk.valid ||
    !propertyTypes.valid ||
    !possession.valid ||
    !amenities.valid
  ) {
    throw new CustomerServiceError("Invalid requirements values", 400);
  }

  // Verify referenced locations exist.
  if (locations.value.length > 0) {
    const found = await Location.find({ _id: { $in: locations.value } })
      .select("_id")
      .lean();
    if (found.length !== locations.value.length) {
      throw new CustomerServiceError("One or more locations were not found", 404);
    }
  }

  let notes = null;
  if (source.notes !== undefined && source.notes !== null) {
    if (typeof source.notes !== "string") {
      throw new CustomerServiceError("Invalid notes", 400);
    }
    const trimmed = source.notes.trim();
    notes = trimmed === "" ? null : trimmed;
  }

  return {
    budget: { min: min.value, max: max.value },
    locations: locations.value,
    bhk: bhk.value,
    propertyTypes: propertyTypes.value,
    minArea: minArea.value,
    possession: possession.value,
    amenities: amenities.value,
    notes,
  };
}

// GET /api/customers/:customerId/requirements
// Returns the requirements document, or null when none exist (a clean "none"
// result, not an error).
export async function getCustomerRequirements(customerId) {
  await assertCustomerExists(customerId);
  return CustomerRequirement.findOne({ customerId }).populate("locations");
}

// POST /api/customers/:customerId/requirements
// Creates requirements. Rejects if requirements already exist for the customer
// (409) rather than creating a duplicate.
export async function createCustomerRequirements(customerId, data) {
  await assertCustomerExists(customerId);

  const existing = await CustomerRequirement.exists({ customerId });
  if (existing) {
    throw new CustomerServiceError(
      "Requirements already exist for this customer",
      409
    );
  }

  const payload = await buildRequirementData(data);
  const created = await CustomerRequirement.create({ customerId, ...payload });
  return created.populate("locations");
}

// PUT /api/customers/:customerId/requirements
// Updates existing requirements. 404 when none exist.
export async function updateCustomerRequirements(customerId, data) {
  await assertCustomerExists(customerId);

  const requirement = await CustomerRequirement.findOne({ customerId });
  if (!requirement) {
    throw new CustomerServiceError("Requirements not found", 404);
  }

  const payload = await buildRequirementData(data);
  Object.assign(requirement, payload);
  await requirement.save();

  return requirement.populate("locations");
}

// DELETE /api/customers/:customerId/requirements
// Removes the customer's requirements document. Removing when none exist is a
// successful no-op (not an error).
export async function deleteCustomerRequirements(customerId) {
  await assertCustomerExists(customerId);

  // deleteMany is safe for 0 or 1 documents (V1 allows at most one per customer).
  await CustomerRequirement.deleteMany({ customerId });

  return null;
}
