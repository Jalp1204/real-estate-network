import { useEffect, useState } from "react";
import {
  BHK_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  POSSESSION_OPTIONS,
  FURNISHING_OPTIONS,
} from "../constants/propertyFilterOptions.js";

// Draft shape used while the user is editing the form.
const EMPTY_DRAFT = {
  bhk: "",
  propertyType: "",
  minArea: "",
  possession: "",
  furnishing: "",
};

// Where filters are edited and applied.
//
// Presentational only: it owns temporary draft state while editing, but the URL
// (owned by PropertyListPage) remains the source of truth. When the applied
// filters change, the draft resyncs from props.
function PropertyFilters({ filters, onApply, onClear }) {
  const [draft, setDraft] = useState({ ...EMPTY_DRAFT, ...filters });

  // Resync the form whenever the applied (URL) filters change.
  useEffect(() => {
    setDraft({ ...EMPTY_DRAFT, ...filters });
  }, [
    filters.bhk,
    filters.propertyType,
    filters.minArea,
    filters.possession,
    filters.furnishing,
  ]);

  const update = (key) => (event) =>
    setDraft((current) => ({ ...current, [key]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    onApply(draft);
  };

  return (
    <form className="filters" onSubmit={handleSubmit}>
      <h2 className="filters__title">Filters</h2>

      <div className="filters__grid">
        <label className="filters__field">
          <span className="filters__label">BHK</span>
          <select className="filters__control" value={draft.bhk} onChange={update("bhk")}>
            <option value="">Any</option>
            {BHK_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="filters__field">
          <span className="filters__label">Property Type</span>
          <select
            className="filters__control"
            value={draft.propertyType}
            onChange={update("propertyType")}
          >
            <option value="">Any</option>
            {PROPERTY_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="filters__field">
          <span className="filters__label">Minimum Area (sq ft)</span>
          <input
            className="filters__control"
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="e.g. 1200"
            value={draft.minArea}
            onChange={update("minArea")}
          />
        </label>

        <label className="filters__field">
          <span className="filters__label">Possession</span>
          <select
            className="filters__control"
            value={draft.possession}
            onChange={update("possession")}
          >
            <option value="">Any</option>
            {POSSESSION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="filters__field">
          <span className="filters__label">Furnishing</span>
          <select
            className="filters__control"
            value={draft.furnishing}
            onChange={update("furnishing")}
          >
            <option value="">Any</option>
            {FURNISHING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="filters__actions">
        <button type="submit" className="button-primary">
          Apply Filters
        </button>
        <button type="button" className="button-secondary" onClick={onClear}>
          Clear Filters
        </button>
      </div>
    </form>
  );
}

export default PropertyFilters;
