import mongoose from "mongoose";
import Property from "../models/Property.js";
import Location from "../models/Location.js";

// GET /api/properties
// Returns all properties, most recently updated first, with their location.
export async function getProperties(req, res) {
  try {
    const properties = await Property.find()
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
