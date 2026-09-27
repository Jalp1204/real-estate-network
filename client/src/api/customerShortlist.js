// API helper for the private customer <-> property relationship
// (customer "interested properties", stored in MongoDB).
//
// This is entirely separate from the browser-local presentation shortlist.
// Relative paths are used so Vite proxies `/api` to the backend.

const CUSTOMERS_ENDPOINT = "/api/customers";

// GET /api/customers/:customerId/shortlist
// Returns the customer's interested properties (empty array when none).
export async function getCustomerShortlist(customerId) {
  let response;

  try {
    response = await fetch(`${CUSTOMERS_ENDPOINT}/${customerId}/shortlist`);
  } catch {
    throw new Error("Unable to reach the server.");
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`);
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error("Received an invalid response from the server.");
  }

  if (!payload || payload.success !== true || !Array.isArray(payload.data)) {
    throw new Error("Unexpected response from the server.");
  }

  return payload.data;
}

// POST /api/customers/:customerId/shortlist
// Adds propertyIds to the customer's interested properties and returns the
// resulting list. Surfaces the server's message on failure.
export async function addCustomerShortlistProperties(customerId, propertyIds) {
  let response;

  try {
    response = await fetch(`${CUSTOMERS_ENDPOINT}/${customerId}/shortlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyIds }),
    });
  } catch {
    throw new Error("Unable to reach the server.");
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload && typeof payload.message === "string"
        ? payload.message
        : `Request failed with status ${response.status}.`;
    throw new Error(message);
  }

  if (!payload || payload.success !== true || !Array.isArray(payload.data)) {
    throw new Error("Unexpected response from the server.");
  }

  return payload.data;
}

// DELETE /api/customers/:customerId/shortlist/:propertyId
// Removes one property from the customer's interested properties and returns
// the resulting list. Surfaces the server's message on failure.
export async function removeCustomerShortlistProperty(customerId, propertyId) {
  let response;

  try {
    response = await fetch(
      `${CUSTOMERS_ENDPOINT}/${customerId}/shortlist/${propertyId}`,
      { method: "DELETE" }
    );
  } catch {
    throw new Error("Unable to reach the server.");
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload && typeof payload.message === "string"
        ? payload.message
        : `Request failed with status ${response.status}.`;
    throw new Error(message);
  }

  if (!payload || payload.success !== true || !Array.isArray(payload.data)) {
    throw new Error("Unexpected response from the server.");
  }

  return payload.data;
}
