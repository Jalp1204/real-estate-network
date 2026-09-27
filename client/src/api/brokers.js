// API helper for the private/internal Broker Directory.
//
// Relative paths are used so Vite proxies `/api` to the backend.

const BROKERS_ENDPOINT = "/api/brokers";

// GET /api/brokers?search=
// Returns the broker list (empty array when none).
export async function getBrokers(search) {
  const trimmed = typeof search === "string" ? search.trim() : "";
  const query = trimmed ? `?search=${encodeURIComponent(trimmed)}` : "";
  const url = `${BROKERS_ENDPOINT}${query}`;

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

// GET /api/brokers/:id
// Throws an Error with code "NOT_FOUND" for a missing/invalid id.
export async function getBrokerById(id) {
  let response;
  try {
    response = await fetch(`${BROKERS_ENDPOINT}/${id}`);
  } catch {
    throw new Error("Unable to reach the server.");
  }

  if (response.status === 404 || response.status === 400) {
    const error = new Error("Broker not found.");
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

// Shared write helper for POST/PUT.
async function writeBroker(method, url, data) {
  let response;
  try {
    response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
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

// POST /api/brokers
export async function createBroker(data) {
  return writeBroker("POST", BROKERS_ENDPOINT, data);
}

// PUT /api/brokers/:id
export async function updateBroker(id, data) {
  return writeBroker("PUT", `${BROKERS_ENDPOINT}/${id}`, data);
}

// DELETE /api/brokers/:id
export async function deleteBroker(id) {
  let response;
  try {
    response = await fetch(`${BROKERS_ENDPOINT}/${id}`, { method: "DELETE" });
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
