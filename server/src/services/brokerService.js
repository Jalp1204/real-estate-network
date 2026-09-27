import mongoose from "mongoose";
import Broker from "../models/Broker.js";

// Broker Directory (private/internal area).
//
// The locked `brokers` schema is authoritative: name, phone, businessName,
// location, registration, trustScore, status, notes, timestamps. Nothing here
// invents new fields. `trustScore` is NOT edited by this slice (no scoring UI).

// V1 broker phone: exactly 10 digits, starting with 6, 7, 8 or 9 (same rule as
// the Customer area). Stored as the 10-digit string only.
const PHONE_PATTERN = /^[6-9][0-9]{9}$/;

// Allowed broker status values (mirrors the locked Broker enum).
const STATUS_VALUES = ["active", "under_review", "inactive"];

// Application error carrying the HTTP status the controller should use.
export class BrokerServiceError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "BrokerServiceError";
    this.statusCode = statusCode;
  }
}

// Escapes user input so it can be used safely inside a RegExp.
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Trims an optional text field; empty/whitespace becomes null.
function optionalText(value) {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") {
    throw new BrokerServiceError("Invalid text value", 400);
  }
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

// GET /api/brokers?search=
// Returns brokers newest first. When `search` is present it matches name OR
// phone OR businessName OR location (case-insensitive substring).
export async function getBrokers({ search } = {}) {
  const filter = {};

  if (typeof search === "string" && search.trim() !== "") {
    const pattern = new RegExp(escapeRegExp(search.trim()), "i");
    filter.$or = [
      { name: pattern },
      { phone: pattern },
      { businessName: pattern },
      { location: pattern },
    ];
  }

  return Broker.find(filter).sort({ createdAt: -1 });
}

// GET /api/brokers/:id
// Throws BrokerServiceError (400 invalid id, 404 not found).
export async function getBrokerById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BrokerServiceError("Invalid broker ID", 400);
  }

  const broker = await Broker.findById(id);

  if (!broker) {
    throw new BrokerServiceError("Broker not found", 404);
  }

  return broker;
}

// Builds and validates the shared broker payload from the request body.
// Throws BrokerServiceError (400) on invalid input. trustScore is intentionally
// not part of this payload.
function buildBrokerData(data = {}) {
  const source = data && typeof data === "object" ? data : {};

  const name = typeof source.name === "string" ? source.name.trim() : "";
  const phone = typeof source.phone === "string" ? source.phone.trim() : "";
  const status = typeof source.status === "string" ? source.status.trim() : "";

  if (!name) {
    throw new BrokerServiceError("Name is required", 400);
  }

  if (!phone) {
    throw new BrokerServiceError("Phone is required", 400);
  }

  if (!PHONE_PATTERN.test(phone)) {
    throw new BrokerServiceError(
      "Phone must be exactly 10 digits and start with 6, 7, 8, or 9",
      400
    );
  }

  if (!STATUS_VALUES.includes(status)) {
    throw new BrokerServiceError("Invalid status", 400);
  }

  return {
    name,
    phone,
    businessName: optionalText(source.businessName),
    location: optionalText(source.location),
    registration: optionalText(source.registration),
    status,
    notes: optionalText(source.notes),
  };
}

// POST /api/brokers
export async function createBroker(data) {
  const payload = buildBrokerData(data);
  return Broker.create(payload);
}

// PUT /api/brokers/:id
// Throws 400 invalid id, 404 not found.
export async function updateBroker(id, data) {
  const broker = await getBrokerById(id);

  const payload = buildBrokerData(data);
  Object.assign(broker, payload);
  await broker.save();

  return broker;
}

// DELETE /api/brokers/:id
// Throws 400 invalid id, 404 not found.
//
// NOTE: There is no Property <-> Broker relationship in this slice, so deleting
// a broker does NOT cascade to any properties.
export async function deleteBroker(id) {
  const broker = await getBrokerById(id);
  await broker.deleteOne();
  return broker;
}
