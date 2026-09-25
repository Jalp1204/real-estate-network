// API helper for property endpoints.
//
// All network logic lives here so React components stay free of fetch calls.
// The relative path is used on purpose: Vite proxies `/api` to the backend in
// development, so no API URL is hardcoded in the frontend.

const PROPERTIES_ENDPOINT = "/api/properties";

// GET /api/properties
// Returns the array of properties. Throws a useful Error when the request
// fails so the caller can render an error state.
export async function getProperties() {
  let response;

  try {
    response = await fetch(PROPERTIES_ENDPOINT);
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
