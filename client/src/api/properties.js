// API helper for property endpoints.
//
// All network logic lives here so React components stay free of fetch calls.
// The relative path is used on purpose: Vite proxies `/api` to the backend in
// development, so no API URL is hardcoded in the frontend.

const PROPERTIES_ENDPOINT = "/api/properties";

// GET /api/properties
// Returns the array of properties. Optional filters:
//   locationId   -> only that location
//   budgetMin    -> price.amount >= budgetMin
//   budgetMax    -> price.amount <= budgetMax
//   bhk          -> property.bhk
//   propertyType -> property.propertyType
//   minArea      -> property.area >= minArea
//   possession   -> property.possession.status
//   furnishing   -> property.details.furnishing
// Throws a useful Error when the request fails so the caller can render an
// error state.
export async function getProperties({
  locationId,
  budgetMin,
  budgetMax,
  bhk,
  propertyType,
  minArea,
  possession,
  furnishing,
} = {}) {
  const params = new URLSearchParams();
  if (locationId) params.set("location", locationId);
  if (budgetMin != null && budgetMin !== "") params.set("budgetMin", String(budgetMin));
  if (budgetMax != null && budgetMax !== "") params.set("budgetMax", String(budgetMax));
  if (bhk != null && bhk !== "") params.set("bhk", String(bhk));
  if (propertyType) params.set("propertyType", propertyType);
  if (minArea != null && minArea !== "") params.set("minArea", String(minArea));
  if (possession) params.set("possession", possession);
  if (furnishing) params.set("furnishing", furnishing);

  const query = params.toString();
  const url = query ? `${PROPERTIES_ENDPOINT}?${query}` : PROPERTIES_ENDPOINT;

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
