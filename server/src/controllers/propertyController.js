import * as propertyService from "../services/propertyService.js";

// GET /api/properties
// Delegates filter parsing/validation and the query to the property service,
// then formats the HTTP response. Service validation errors carry a status
// code; anything else is an unexpected 500.
export async function getProperties(req, res) {
  try {
    const properties = await propertyService.getProperties(req.query);

    return res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    if (error instanceof propertyService.PropertyServiceError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    // Never leak database internals or stack traces to the client.
    console.error("Failed to fetch properties:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch properties",
    });
  }
}

// GET /api/properties/:id
// Delegates the lookup to the property service, then formats the response.
export async function getPropertyById(req, res) {
  try {
    const property = await propertyService.getPropertyById(req.params.id);

    return res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    if (error instanceof propertyService.PropertyServiceError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Failed to fetch property:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch property",
    });
  }
}
