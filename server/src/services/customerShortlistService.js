import mongoose from "mongoose";
import Customer from "../models/Customer.js";
import Property from "../models/Property.js";
import Shortlist from "../models/Shortlist.js";
import { CustomerServiceError } from "./customerService.js";

// Customer <-> Property relationship, stored in the locked `shortlists`
// collection as { customerId, properties: [propertyId, ...] }.
//
// This is the PRIVATE customer interested-properties list. It is entirely
// separate from the browser-local "presentation shortlist".

// Customer-safe property fields exposed to the customer area. Internal data
// (broker/source, internalNotes, verification notes) is deliberately excluded.
// `photos` is trimmed to the single primary photo below.
const PROPERTY_FIELDS =
  "title price area areaUnit bhk propertyType availability possession details locationId photos";

// Returns a property shaped for the customer area: the photo array is reduced
// to only the primary photo ({ url, isPrimary }), or an empty array when there
// is no primary photo. All other fields are passed through unchanged.
function toPublicProperty(property) {
  const doc =
    typeof property.toObject === "function" ? property.toObject() : property;
  const primary = (doc.photos ?? []).find(
    (photo) => photo?.isPrimary === true && photo?.url
  );

  return {
    ...doc,
    photos: primary ? [{ url: primary.url, isPrimary: true }] : [],
  };
}

// Validates the customer id and confirms the customer exists.
async function assertCustomerExists(customerId) {
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    throw new CustomerServiceError("Invalid customer ID", 400);
  }

  const exists = await Customer.exists({ _id: customerId });
  if (!exists) {
    throw new CustomerServiceError("Customer not found", 404);
  }
}

// Loads the customer's interested properties (populated) in stored order.
// Stale/deleted property references are dropped rather than crashing.
async function findPopulatedShortlist(customerId) {
  const shortlist = await Shortlist.findOne({ customerId }).populate({
    path: "properties",
    select: PROPERTY_FIELDS,
    populate: { path: "locationId" },
  });

  if (!shortlist) return [];

  return shortlist.properties.filter(Boolean).map(toPublicProperty);
}

// GET /api/customers/:customerId/shortlist
// Returns the interested properties (empty list when no shortlist exists).
export async function getCustomerShortlist(customerId) {
  await assertCustomerExists(customerId);
  return findPopulatedShortlist(customerId);
}

// POST /api/customers/:customerId/shortlist
// Adds the supplied property ids to the customer's interested properties.
// Never replaces or removes existing entries; duplicates are ignored.
export async function addCustomerShortlistProperties(customerId, propertyIds) {
  await assertCustomerExists(customerId);

  if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
    throw new CustomerServiceError("propertyIds must be a non-empty array", 400);
  }

  const hasInvalidId = propertyIds.some(
    (id) => typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)
  );
  if (hasInvalidId) {
    throw new CustomerServiceError("Invalid property ID", 400);
  }

  // De-duplicate while preserving order.
  const uniqueIds = [...new Set(propertyIds)];

  // Verify every referenced property exists.
  const found = await Property.find({ _id: { $in: uniqueIds } })
    .select("_id")
    .lean();

  if (found.length !== uniqueIds.length) {
    throw new CustomerServiceError("One or more properties were not found", 404);
  }

  // $addToSet appends only missing ids and never removes existing ones.
  // upsert creates the shortlist document the first time.
  await Shortlist.findOneAndUpdate(
    { customerId },
    { $addToSet: { properties: { $each: uniqueIds } } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return findPopulatedShortlist(customerId);
}

// DELETE /api/customers/:customerId/shortlist/:propertyId
// Removes ONE property from the customer's interested properties. Removing a
// property that is not present is a successful no-op. Removing the last
// property deletes the (now empty) shortlist document.
export async function removeCustomerShortlistProperty(customerId, propertyId) {
  await assertCustomerExists(customerId);

  if (
    typeof propertyId !== "string" ||
    !mongoose.Types.ObjectId.isValid(propertyId)
  ) {
    throw new CustomerServiceError("Invalid property ID", 400);
  }

  const shortlist = await Shortlist.findOne({ customerId });
  if (!shortlist) {
    // No relationship yet: nothing to remove.
    return [];
  }

  shortlist.properties = shortlist.properties.filter(
    (id) => String(id) !== propertyId
  );

  if (shortlist.properties.length === 0) {
    // Keep the relationship collection clean: drop the empty document.
    await shortlist.deleteOne();
    return [];
  }

  await shortlist.save();
  return findPopulatedShortlist(customerId);
}
