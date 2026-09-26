import mongoose from "mongoose";
import Property from "../models/Property.js";

// Parses an optional, non-negative numeric query parameter.
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

// GET /api/properties?location=<locationId>&budgetMin=<n>&budgetMax=<n>
// Returns properties, most recently updated first, with their location.
//
// Supported (all optional, combinable) filters:
//   - location:  property.locationId === location
//   - budgetMin: property.price.amount >= budgetMin
//   - budgetMax: property.price.amount <= budgetMax
//
// With no query parameters the all-properties behavior is unchanged.
export async function getProperties(req, res) {
  const { location, budgetMin: rawMin, budgetMax: rawMax } = req.query;

  const filter = {};

  if (location) {
    // Validate the location id format so a bad value is a 400, not a 500.
    if (!mongoose.Types.ObjectId.isValid(location)) {
      return res.status(400).json({
        success: false,
        message: "Invalid location ID",
      });
    }
    filter.locationId = location;
  }

  const min = parseNonNegativeNumber(rawMin);
  const max = parseNonNegativeNumber(rawMax);

  if (!min.valid || !max.valid) {
    return res.status(400).json({
      success: false,
      message: "Invalid budget parameters",
    });
  }

  if (min.value !== null && max.value !== null && min.value > max.value) {
    return res.status(400).json({
      success: false,
      message: "Invalid budget parameters",
    });
  }

  // Only property.price.amount participates in budget filtering.
  const priceFilter = {};
  if (min.value !== null) priceFilter.$gte = min.value;
  if (max.value !== null) priceFilter.$lte = max.value;
  if (Object.keys(priceFilter).length > 0) {
    filter["price.amount"] = priceFilter;
  }

  try {
    const properties = await Property.find(filter)
      .populate("locationId")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    // Never leak database internals or stack traces to the client.
    console.error("Failed to fetch properties:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch properties",
    });
  }
}

// GET /api/properties/:id
// Returns a single property by id, with its location.
export async function getPropertyById(req, res) {
  const { id } = req.params;

  // Validate the id format first so an invalid id is a 400, not a 500.
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid property ID",
    });
  }

  try {
    const property = await Property.findById(id).populate("locationId");

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error("Failed to fetch property:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch property",
    });
  }
}
