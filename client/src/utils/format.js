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

// 2000000 -> "₹20 Lakh"; 10000000 -> "₹1 Crore"; smaller -> "₹75,000".
// Used for human-friendly budget labels (never shown raw).
export function formatRupeesShort(amount) {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return null;

  const LAKH = 100000;
  const CRORE = 10000000;

  if (amount >= CRORE) {
    return `₹${trimDecimal(amount / CRORE)} Crore`;
  }
  if (amount >= LAKH) {
    return `₹${trimDecimal(amount / LAKH)} Lakh`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

function trimDecimal(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
}
