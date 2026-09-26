import express from "express";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  deleteCustomer,
} from "../controllers/customerController.js";

const router = express.Router();

// GET /api/customers  (optional ?search=)
router.get("/", getCustomers);

// POST /api/customers
router.post("/", createCustomer);

// GET /api/customers/:id
router.get("/:id", getCustomerById);

// DELETE /api/customers/:id
router.delete("/:id", deleteCustomer);

export default router;
