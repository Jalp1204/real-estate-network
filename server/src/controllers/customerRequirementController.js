import * as customerRequirementService from "../services/customerRequirementService.js";
import { CustomerServiceError } from "../services/customerService.js";

// GET /api/customers/:customerId/requirements
// Returns the requirements document, or data: null when none exist.
export async function getCustomerRequirements(req, res) {
  try {
    const requirement = await customerRequirementService.getCustomerRequirements(
      req.params.customerId
    );

    return res.status(200).json({
      success: true,
      data: requirement,
    });
  } catch (error) {
    if (error instanceof CustomerServiceError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Failed to fetch customer requirements:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer requirements",
    });
  }
}

// POST /api/customers/:customerId/requirements
export async function createCustomerRequirements(req, res) {
  try {
    const requirement =
      await customerRequirementService.createCustomerRequirements(
        req.params.customerId,
        req.body
      );

    return res.status(201).json({
      success: true,
      data: requirement,
    });
  } catch (error) {
    if (error instanceof CustomerServiceError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Failed to create customer requirements:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to create customer requirements",
    });
  }
}

// PUT /api/customers/:customerId/requirements
export async function updateCustomerRequirements(req, res) {
  try {
    const requirement =
      await customerRequirementService.updateCustomerRequirements(
        req.params.customerId,
        req.body
      );

    return res.status(200).json({
      success: true,
      data: requirement,
    });
  } catch (error) {
    if (error instanceof CustomerServiceError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Failed to update customer requirements:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update customer requirements",
    });
  }
}

// DELETE /api/customers/:customerId/requirements
// Returns data: null. A no-op success when the customer has no requirements.
export async function deleteCustomerRequirements(req, res) {
  try {
    await customerRequirementService.deleteCustomerRequirements(
      req.params.customerId
    );

    return res.status(200).json({
      success: true,
      data: null,
    });
  } catch (error) {
    if (error instanceof CustomerServiceError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Failed to delete customer requirements:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to delete customer requirements",
    });
  }
}

// GET /api/customers/:customerId/matching-properties
// Deterministic requirement-based property search for the private customer
// area. Returns { filterCount, properties }.
export async function getMatchingProperties(req, res) {
  try {
    const result = await customerRequirementService.findMatchingProperties(
      req.params.customerId
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof CustomerServiceError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Failed to find matching properties:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to find matching properties",
    });
  }
}
