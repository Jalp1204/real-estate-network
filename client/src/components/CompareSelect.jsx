// Temporary compare selection control (separate from the persistent shortlist).
//
// A plain labeled checkbox — deliberately NOT the ⭐ ShortlistButton. Compare
// selection is not persisted; it lives in ShortlistPage state for now.
function CompareSelect({ propertyId, propertyTitle, checked, onToggle }) {
  return (
    <label className="compare-select">
      <input
        type="checkbox"
        className="compare-select__input"
        checked={checked}
        onChange={() => onToggle(propertyId)}
        aria-label={`Select ${propertyTitle ?? "property"} for comparison`}
      />
      <span className="compare-select__label">Compare</span>
    </label>
  );
}

export default CompareSelect;
