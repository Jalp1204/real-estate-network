import Location from "../models/Location.js";
import Property from "../models/Property.js";

// GET /api/locations
// Returns active locations sorted by name, each with a count of properties
// that are currently available in that location.
//
// propertyCount is computed at read time (it is NOT stored on the Location
// schema, which is locked).
export async function getLocations(req, res) {
  try {
    const locations = await Location.find({ isActive: true })
      .sort({ name: 1 })
      .lean();

    const data = await Promise.all(
      locations.map(async (location) => ({
        _id: location._id,
        name: location.name,
        city: location.city,
        state: location.state,
        coverImage: location.coverImage,
        description: location.description,
        isActive: location.isActive,
        propertyCount: await Property.countDocuments({
          locationId: location._id,
          availability: "available",
        }),
      }))
    );

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    // Never leak database internals or stack traces to the client.
    console.error("Failed to fetch locations:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch locations",
    });
  }
}
