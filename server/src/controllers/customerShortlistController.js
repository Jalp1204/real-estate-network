import * as customerShortlistService from "../services/customerShortlistService.js";
import { CustomerServiceError } from "../services/customerService.js";

// GET /api/customers/:customerId/shortlist
export async function getCustomerShortlist(req, res) {
  try {
    const properties = await customerShortlistService.getCustomerShortlist(
      req.params.customerId
    );

    return res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    if (error instanceof CustomerServiceError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Failed to fetch customer shortlist:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer shortlist",
    });
  }
}

// POST /api/customers/:customerId/shortlist
export async function addCustomerShortlistProperties(req, res) {
  try {
    const properties = await customerShortlistService.addCustomerShortlistProperties(
      req.params.customerId,
      req.body?.propertyIds
    );

    return res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    if (error instanceof CustomerServiceError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Failed to update customer shortlist:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update customer shortlist",
    });
  }
}

// DELETE /api/customers/:customerId/shortlist/:propertyId
export async function removeCustomerShortlistProperty(req, res) {
  try {
    const properties = await customerShortlistService.removeCustomerShortlistProperty(
      req.params.customerId,
      req.params.propertyId
    );

    return res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    if (error instanceof CustomerServiceError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Failed to remove customer shortlist property:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to remove customer shortlist property",
    });
  }
}
