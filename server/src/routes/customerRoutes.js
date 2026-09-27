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

// GET /api/customers/:id
router.get("/:id", getCustomerById);

// DELETE /api/customers/:id
router.delete("/:id", deleteCustomer);

export default router;
