import mongoose from "mongoose";
import Customer from "../models/Customer.js";

// Customer V1 manages only name + phone. `interestLevel` is nullable in the
// locked schema and is not set by V1 (it defaults to null).

// V1 customer phone: exactly 10 digits, starting with 6, 7, 8 or 9. Stored as
// the 10-digit string only (no +91, no spaces).
const PHONE_PATTERN = /^[6-9][0-9]{9}$/;

// V1 customer shape: only name, phone and timestamps are exposed.
const CUSTOMER_FIELDS = "name phone createdAt updatedAt";

// Application error carrying the HTTP status the controller should use.
// Mirrors PropertyServiceError so both controllers handle errors the same way.
export class CustomerServiceError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "CustomerServiceError";
    this.statusCode = statusCode;
  }
}

// Escapes user input so it can be used safely inside a RegExp.
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET /api/customers?search=
// Returns customers newest first. When `search` is present it matches name OR
// phone (case-insensitive substring).
export async function getCustomers({ search } = {}) {
  const filter = {};

  if (typeof search === "string" && search.trim() !== "") {
    const pattern = new RegExp(escapeRegExp(search.trim()), "i");
    filter.$or = [{ name: pattern }, { phone: pattern }];
  }

  return Customer.find(filter).select(CUSTOMER_FIELDS).sort({ createdAt: -1 });
}

// GET /api/customers/:id
// Throws CustomerServiceError (400 invalid id, 404 not found).
export async function getCustomerById(id) {
  // Validate the id format first so an invalid id is a 400, not a 500.
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomerServiceError("Invalid customer ID", 400);
  }

  const customer = await Customer.findById(id).select(CUSTOMER_FIELDS);

  if (!customer) {
    throw new CustomerServiceError("Customer not found", 404);
  }

  return customer;
}

// POST /api/customers
// Accepts { name, phone }; both are required. Phone must be exactly 10 digits
// and start with 6, 7, 8 or 9.
export async function createCustomer({ name, phone } = {}) {
  const trimmedName = typeof name === "string" ? name.trim() : "";
  const trimmedPhone = typeof phone === "string" ? phone.trim() : "";

  if (!trimmedName || !trimmedPhone) {
    throw new CustomerServiceError("Name and phone are required", 400);
  }

  if (!PHONE_PATTERN.test(trimmedPhone)) {
    throw new CustomerServiceError(
      "Phone must be exactly 10 digits and start with 6, 7, 8, or 9",
      400
    );
  }

  const customer = await Customer.create({
    name: trimmedName,
    phone: trimmedPhone,
  });

  // Return only the V1 fields.
  return {
    _id: customer._id,
    name: customer.name,
    phone: customer.phone,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
  };
}

// DELETE /api/customers/:id
// Throws CustomerServiceError (400 invalid id, 404 not found).
//
// Note for Slice 2: once a customer -> shortlists relationship exists, any
// linked records should be cleaned up here alongside the customer.
export async function deleteCustomer(id) {
  // Validate the id format first so an invalid id is a 400, not a 500.
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomerServiceError("Invalid customer ID", 400);
  }

  const customer = await Customer.findByIdAndDelete(id);

  if (!customer) {
    throw new CustomerServiceError("Customer not found", 404);
  }

  return customer;
}
