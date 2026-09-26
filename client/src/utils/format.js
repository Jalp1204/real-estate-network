// Shared formatting helpers used by property UI components.
// Keeping them here avoids duplication between the list and details screens.

// "ready_to_move" -> "Ready To Move"
export function humanize(value) {
  if (!value || typeof value !== "string") return null;
  return value
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// 2500000 -> "25,00,000" (Indian digit grouping)
export function formatNumber(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return value.toLocaleString("en-IN");
}

// ISO date -> "24 September 2026". Returns null for missing/invalid dates.
export function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
