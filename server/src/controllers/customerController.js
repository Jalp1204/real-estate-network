import * as customerService from "../services/customerService.js";

// GET /api/customers?search=
// Delegates query/validation to the customer service, then formats the
// response. Service validation errors carry a status code; anything else is an
// unexpected 500.
export async function getCustomers(req, res) {
  try {
    const customers = await customerService.getCustomers(req.query);

    return res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    if (error instanceof customerService.CustomerServiceError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    // Never leak database internals or stack traces to the client.
    console.error("Failed to fetch customers:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
}

// GET /api/customers/:id
export async function getCustomerById(req, res) {
  try {
    const customer = await customerService.getCustomerById(req.params.id);

    return res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    if (error instanceof customerService.CustomerServiceError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Failed to fetch customer:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
    });
  }
}

// POST /api/customers
export async function createCustomer(req, res) {
  try {
    const customer = await customerService.createCustomer(req.body);

    return res.status(201).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    if (error instanceof customerService.CustomerServiceError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Failed to create customer:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to create customer",
    });
  }
}

// DELETE /api/customers/:id
export async function deleteCustomer(req, res) {
  try {
    await customerService.deleteCustomer(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Customer deleted",
    });
  } catch (error) {
    if (error instanceof customerService.CustomerServiceError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Failed to delete customer:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to delete customer",
    });
  }
}
