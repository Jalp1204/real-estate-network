import { useCallback, useSyncExternalStore } from "react";
import {
  getSnapshot,
  subscribe,
  toggleShortlist,
} from "./shortlistStore.js";

// React binding for the centralized shortlist store.
//
// Uses React's built-in useSyncExternalStore (no state-management library and
// no context provider needed). Every component that calls this hook re-renders
// when the shortlist changes, so the list and details screens stay in sync.
export function useShortlist() {
  const shortlist = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const isShortlisted = useCallback(
    (id) => Boolean(id) && shortlist.includes(id),
    [shortlist]
  );

  const toggle = useCallback((id) => toggleShortlist(id), []);

  return { shortlist, isShortlisted, toggle };
}
