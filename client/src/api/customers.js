// API helper for customer endpoints (private/internal area).
//
// All network logic lives here so React components stay free of fetch calls.
// Relative paths are used on purpose: Vite proxies `/api` to the backend.

const CUSTOMERS_ENDPOINT = "/api/customers";

// GET /api/customers?search=
// Returns the array of customers (name + phone + timestamps). Throws a useful
// Error when the request fails so the caller can render an error state.
export async function getCustomers(search) {
  const trimmed = typeof search === "string" ? search.trim() : "";
  const query = trimmed ? `?search=${encodeURIComponent(trimmed)}` : "";
  const url = `${CUSTOMERS_ENDPOINT}${query}`;

  let response;

  try {
    response = await fetch(url);
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

// GET /api/customers/:id
// Throws an Error with code "NOT_FOUND" for a missing/invalid id so the caller
// can show a distinct not-found state.
export async function getCustomerById(id) {
  let response;

  try {
    response = await fetch(`${CUSTOMERS_ENDPOINT}/${id}`);
  } catch {
    throw new Error("Unable to reach the server.");
  }

  if (response.status === 404 || response.status === 400) {
    const error = new Error("Customer not found.");
    error.code = "NOT_FOUND";
    throw error;
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

  if (!payload || payload.success !== true || !payload.data) {
    throw new Error("Unexpected response from the server.");
  }

  return payload.data;
}

// POST /api/customers
// Accepts { name, phone }. Surfaces the server's validation message when the
// request is rejected.
export async function createCustomer({ name, phone } = {}) {
  let response;

  try {
    response = await fetch(CUSTOMERS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
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

  if (!payload || payload.success !== true || !payload.data) {
    throw new Error("Unexpected response from the server.");
  }

  return payload.data;
}

// DELETE /api/customers/:id
// Surfaces the server's message on failure (e.g. not found).
export async function deleteCustomer(id) {
  let response;

  try {
    response = await fetch(`${CUSTOMERS_ENDPOINT}/${id}`, { method: "DELETE" });
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

  if (!payload || payload.success !== true) {
    throw new Error("Unexpected response from the server.");
  }

  return payload;
}
