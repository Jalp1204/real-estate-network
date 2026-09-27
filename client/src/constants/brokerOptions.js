// Broker option constants (mirror the locked Broker status enum).
// Values must match server/src/models/Broker.js. Do not invent new values.

export const BROKER_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "under_review", label: "Under Review" },
  { value: "inactive", label: "Inactive" },
];

// Human-readable label for a broker status value.
export function brokerStatusLabel(value) {
  return BROKER_STATUS_OPTIONS.find((option) => option.value === value)?.label ?? value ?? null;
}
