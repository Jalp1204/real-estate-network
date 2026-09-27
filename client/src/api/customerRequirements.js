// API helper for the private customer requirements document (customerRequirements).
//
// Private/internal area only. Relative paths are used so Vite proxies `/api`.

const CUSTOMERS_ENDPOINT = "/api/customers";

// Shared request helper for GET/POST/PUT. `allowNull` permits data: null
// (GET when the customer has no requirements yet).
async function request(customerId, { method = "GET", body, allowNull = false } = {}) {
  const options = { method };
  if (body !== undefined) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(
      `${CUSTOMERS_ENDPOINT}/${customerId}/requirements`,
      options
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

  if (!payload || payload.success !== true) {
    throw new Error("Unexpected response from the server.");
  }

  if (payload.data === null) {
    if (allowNull) return null;
    throw new Error("Unexpected response from the server.");
  }

  return payload.data;
}

// GET /api/customers/:customerId/requirements
// Returns the requirements document, or null when none exist.
export async function getCustomerRequirements(customerId) {
  return request(customerId, { method: "GET", allowNull: true });
}

// POST /api/customers/:customerId/requirements
export async function createCustomerRequirements(customerId, data) {
  return request(customerId, { method: "POST", body: data });
}

// PUT /api/customers/:customerId/requirements
export async function updateCustomerRequirements(customerId, data) {
  return request(customerId, { method: "PUT", body: data });
}

// DELETE /api/customers/:customerId/requirements
// Removes the requirements document (a no-op success when none exist).
// Resolves with null on success.
export async function deleteCustomerRequirements(customerId) {
  return request(customerId, { method: "DELETE", allowNull: true });
}
