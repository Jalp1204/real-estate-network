import express from "express";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  deleteCustomer,
} from "../controllers/customerController.js";
import {
  getCustomerShortlist,
  addCustomerShortlistProperties,
  removeCustomerShortlistProperty,
} from "../controllers/customerShortlistController.js";
import {
  getCustomerRequirements,
  createCustomerRequirements,
  updateCustomerRequirements,
  deleteCustomerRequirements,
} from "../controllers/customerRequirementController.js";

const router = express.Router();

// GET /api/customers  (optional ?search=)
router.get("/", getCustomers);

// POST /api/customers
router.post("/", createCustomer);

// GET /api/customers/:customerId/shortlist  (interested properties)
router.get("/:customerId/shortlist", getCustomerShortlist);

// POST /api/customers/:customerId/shortlist
router.post("/:customerId/shortlist", addCustomerShortlistProperties);

// DELETE /api/customers/:customerId/shortlist/:propertyId
router.delete(
  "/:customerId/shortlist/:propertyId",
  removeCustomerShortlistProperty
);

// GET /api/customers/:customerId/requirements
router.get("/:customerId/requirements", getCustomerRequirements);

// POST /api/customers/:customerId/requirements
router.post("/:customerId/requirements", createCustomerRequirements);

// PUT /api/customers/:customerId/requirements
router.put("/:customerId/requirements", updateCustomerRequirements);

// DELETE /api/customers/:customerId/requirements
router.delete("/:customerId/requirements", deleteCustomerRequirements);

// GET /api/customers/:id
router.get("/:id", getCustomerById);

// DELETE /api/customers/:id
router.delete("/:id", deleteCustomer);

export default router;
