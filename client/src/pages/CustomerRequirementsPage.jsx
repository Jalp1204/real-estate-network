import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCustomerById } from "../api/customers.js";
import { getLocations } from "../api/locations.js";
import {
  getCustomerRequirements,
  createCustomerRequirements,
  updateCustomerRequirements,
} from "../api/customerRequirements.js";
import {
  BHK_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  POSSESSION_OPTIONS,
  AMENITY_OPTIONS,
} from "../constants/propertyFilterOptions.js";

// BHK is stored as an array of numbers.
const BHK_NUMBER_OPTIONS = BHK_OPTIONS.map((option) => ({
  value: Number(option.value),
  label: option.label,
}));

// A labeled group of checkboxes (multi-select) reused for locations, BHK,
// property types, possession and amenities.
function CheckboxGroup({ label, options, selected, onToggle }) {
  return (
    <fieldset className="checkbox-group">
      <legend className="filters__label">{label}</legend>
      {options.length === 0 ? (
        <p className="details__muted">None available.</p>
      ) : (
        <div className="checkbox-grid">
          {options.map((option) => (
            <label className="checkbox-grid__item" key={option.value}>
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => onToggle(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}

// Customer requirements screen (private/internal area).
// Creates requirements when none exist, otherwise edits the existing document.
function CustomerRequirementsPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [locations, setLocations] = useState([]);
  const [hasExisting, setHasExisting] = useState(false);

  // Form state. Numeric fields are kept as strings while editing.
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [minArea, setMinArea] = useState("");
  const [notes, setNotes] = useState("");
  const [locationIds, setLocationIds] = useState([]);
  const [bhk, setBhk] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [possession, setPossession] = useState([]);
  const [amenities, setAmenities] = useState([]);

  // status: "loading" | "success" | "not_found" | "error"
  const [status, setStatus] = useState("loading");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const loadAll = useCallback(async () => {
    setStatus("loading");

    try {
      const customerData = await getCustomerById(customerId);
      setCustomer(customerData);
    } catch (error) {
      setCustomer(null);
      setStatus(error?.code === "NOT_FOUND" ? "not_found" : "error");
      return;
    }

    try {
      const [requirement, locationList] = await Promise.all([
        getCustomerRequirements(customerId),
        getLocations(),
      ]);
      setLocations(locationList);

      if (requirement) {
        setHasExisting(true);
        setBudgetMin(requirement.budget?.min != null ? String(requirement.budget.min) : "");
        setBudgetMax(requirement.budget?.max != null ? String(requirement.budget.max) : "");
        setMinArea(requirement.minArea != null ? String(requirement.minArea) : "");
        setNotes(requirement.notes ?? "");
        setLocationIds(
          (requirement.locations ?? []).map((loc) =>
            loc && typeof loc === "object" ? loc._id : loc
          )
        );
        setBhk(requirement.bhk ?? []);
        setPropertyTypes(requirement.propertyTypes ?? []);
        setPossession(requirement.possession ?? []);
        setAmenities(requirement.amenities ?? []);
      }

      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, [customerId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const toggleValue = (setter) => (value) =>
    setter((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaveError(null);

    // Lightweight numeric validation; the service is authoritative.
    const numeric = [
      [budgetMin, "Minimum budget"],
      [budgetMax, "Maximum budget"],
      [minArea, "Minimum area"],
    ];
    for (const [raw, label] of numeric) {
      if (String(raw).trim() !== "" && !Number.isFinite(Number(raw))) {
        setSaveError(`${label} must be a number.`);
        return;
      }
    }

    const data = {
      budget: {
        min: budgetMin.trim() === "" ? null : Number(budgetMin),
        max: budgetMax.trim() === "" ? null : Number(budgetMax),
      },
      locations: locationIds,
      bhk,
      propertyTypes,
      possession,
      amenities,
      minArea: minArea.trim() === "" ? null : Number(minArea),
      notes: notes.trim() === "" ? null : notes.trim(),
    };

    setSaving(true);
    try {
      if (hasExisting) {
        await updateCustomerRequirements(customerId, data);
      } else {
        await createCustomerRequirements(customerId, data);
      }
      navigate(`/customers/${customerId}`);
    } catch (error) {
      setSaveError(error.message || "Unable to save requirements.");
      setSaving(false);
    }
  };

  const locationOptions = locations.map((location) => ({
    value: location._id,
    label: [location.name, location.city].filter(Boolean).join(" — "),
  }));

  return (
    <main className="app">
      <Link className="back-link" to={`/customers/${customerId}`}>
        ← Customer
      </Link>

      <header className="page-header">
        <h1>{hasExisting ? "Edit Requirements" : "Add Requirements"}</h1>
        {customer && <p>{customer.name}</p>}
      </header>

      {status === "loading" && (
        <p className="state-message">Loading requirements…</p>
      )}

      {status === "not_found" && (
        <p className="state-message">Customer not found.</p>
      )}

      {status === "error" && (
        <div className="state-message state-message--error" role="alert">
          <p>Unable to load requirements.</p>
          <button type="button" className="retry-button" onClick={loadAll}>
            Retry
          </button>
        </div>
      )}

      {status === "success" && (
        <form className="filters" onSubmit={handleSubmit} noValidate>
          <div className="filters__grid">
            <label className="filters__field">
              <span className="filters__label">Minimum Budget (₹)</span>
              <input
                className="filters__control"
                type="number"
                min="0"
                inputMode="numeric"
                value={budgetMin}
                onChange={(event) => setBudgetMin(event.target.value)}
              />
            </label>

            <label className="filters__field">
              <span className="filters__label">Maximum Budget (₹)</span>
              <input
                className="filters__control"
                type="number"
                min="0"
                inputMode="numeric"
                value={budgetMax}
                onChange={(event) => setBudgetMax(event.target.value)}
              />
            </label>

            <label className="filters__field">
              <span className="filters__label">Minimum Area (sq ft)</span>
              <input
                className="filters__control"
                type="number"
                min="0"
                inputMode="numeric"
                value={minArea}
                onChange={(event) => setMinArea(event.target.value)}
              />
            </label>
          </div>

          <div className="requirements-groups">
            <CheckboxGroup
              label="Preferred Locations"
              options={locationOptions}
              selected={locationIds}
              onToggle={toggleValue(setLocationIds)}
            />
            <CheckboxGroup
              label="BHK"
              options={BHK_NUMBER_OPTIONS}
              selected={bhk}
              onToggle={toggleValue(setBhk)}
            />
            <CheckboxGroup
              label="Property Types"
              options={PROPERTY_TYPE_OPTIONS}
              selected={propertyTypes}
              onToggle={toggleValue(setPropertyTypes)}
            />
            <CheckboxGroup
              label="Possession"
              options={POSSESSION_OPTIONS}
              selected={possession}
              onToggle={toggleValue(setPossession)}
            />
            <CheckboxGroup
              label="Amenities"
              options={AMENITY_OPTIONS}
              selected={amenities}
              onToggle={toggleValue(setAmenities)}
            />

            <label className="filters__field">
              <span className="filters__label">Notes</span>
              <textarea
                className="filters__control"
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </label>
          </div>

          {saveError && (
            <p className="state-message state-message--error" role="alert">
              {saveError}
            </p>
          )}

          <div className="filters__actions">
            <button type="submit" className="button-primary" disabled={saving}>
              {saving ? "Saving…" : "Save Requirements"}
            </button>
            <Link className="button-secondary" to={`/customers/${customerId}`}>
              Cancel
            </Link>
          </div>
        </form>
      )}
    </main>
  );
}

export default CustomerRequirementsPage;
