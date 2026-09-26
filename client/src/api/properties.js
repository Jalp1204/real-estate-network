// API helper for property endpoints.
//
// All network logic lives here so React components stay free of fetch calls.
// The relative path is used on purpose: Vite proxies `/api` to the backend in
// development, so no API URL is hardcoded in the frontend.

const PROPERTIES_ENDPOINT = "/api/properties";

// GET /api/properties
// Returns the array of properties. When `locationId` is provided the request
// is filtered to that location. Throws a useful Error when the request fails
// so the caller can render an error state.
export async function getProperties(locationId) {
  const url = locationId
    ? `${PROPERTIES_ENDPOINT}?location=${encodeURIComponent(locationId)}`
    : PROPERTIES_ENDPOINT;

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

// GET /api/properties/:id
// Returns a single property. Throws an Error with code "NOT_FOUND" when the
// property does not exist (or the id is malformed), so the caller can show a
// distinct "not found" state. Other failures throw a generic Error.
export async function getPropertyById(id) {
  let response;

  try {
    response = await fetch(`${PROPERTIES_ENDPOINT}/${id}`);
  } catch {
    throw new Error("Unable to reach the server.");
  }

  // 404 = no such property; 400 = malformed id. Both are "not found" to a user.
  if (response.status === 404 || response.status === 400) {
    const error = new Error("Property not found.");
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
