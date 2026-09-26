import { useShortlist } from "../shortlist/useShortlist.js";

// Real <button> that toggles a property in the shortlist.
//
// Accessibility:
// - It is an actual button (keyboard operable, announced as a button).
// - `aria-pressed` exposes the on/off state to assistive tech.
// - The state is also conveyed by the icon (★ / ☆) and the visible label, so it
//   does not rely on color alone.
function ShortlistButton({ propertyId, className = "" }) {
  const { isShortlisted, toggle } = useShortlist();
  const active = isShortlisted(propertyId);

  return (
    <button
      type="button"
      className={`shortlist-button${
        active ? " shortlist-button--active" : ""
      }${className ? ` ${className}` : ""}`}
      aria-pressed={active}
      aria-label={active ? "Remove from shortlist" : "Add to shortlist"}
      onClick={() => toggle(propertyId)}
    >
      <span className="shortlist-button__icon" aria-hidden="true">
        {active ? "★" : "☆"}
      </span>
      <span>{active ? "Shortlisted" : "Add to Shortlist"}</span>
    </button>
  );
}

export default ShortlistButton;
