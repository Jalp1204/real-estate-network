// Centralized shortlist storage (V1: browser localStorage only).
//
// This module is the ONLY place that reads/writes the shortlist. Components
// consume it through the useShortlist hook, so they never touch localStorage
// directly.
//
// Storage format: a JSON array of property ids (strings) under a single key.
//   ["propertyId1", "propertyId2"]
//
// No property objects are stored. No backend/customer identity is involved.

export const SHORTLIST_STORAGE_KEY = "real-estate-network:shortlist";

function loadIds() {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(SHORTLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Defensive: keep only non-empty string ids.
    return parsed.filter((id) => typeof id === "string" && id.length > 0);
  } catch {
    // Corrupt/unavailable storage: start empty rather than crash.
    return [];
  }
}

let ids = loadIds();

// A stable snapshot reference that only changes when the shortlist changes.
// useSyncExternalStore requires getSnapshot to return a cached value.
let snapshot = ids;

const listeners = new Set();

function persist() {
  try {
    window.localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage unavailable/full: keep the in-memory state working.
  }
}

function emit() {
  snapshot = ids;
  for (const listener of listeners) {
    listener();
  }
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot() {
  return snapshot;
}

export function isShortlisted(id) {
  return Boolean(id) && ids.includes(id);
}

// Adds the id when absent, removes it when present.
export function toggleShortlist(id) {
  if (!id) return;

  ids = ids.includes(id)
    ? ids.filter((existing) => existing !== id)
    : [...ids, id];

  persist();
  emit();
}
