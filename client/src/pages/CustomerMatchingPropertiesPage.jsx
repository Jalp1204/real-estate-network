import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCustomerById } from "../api/customers.js";
import { getMatchingProperties } from "../api/customerRequirements.js";
import {
  getCustomerShortlist,
  addCustomerShortlistProperties,
} from "../api/customerShortlist.js";
import { formatRupeesShort, formatNumber, humanize } from "../utils/format.js";

// Builds a compact "price • location" line for a property.
function propertyMeta(property) {
  const amount = formatRupeesShort(property?.price?.amount);
  const location = property?.locationId;
  const place =
    location && typeof location === "object"
      ? [location.name, location.city].filter(Boolean).join(", ")
      : null;
  return [amount, place].filter(Boolean).join(" • ");
}

// Builds a secondary "3 BHK • Apartment • 1200 sq ft" line.
function propertySpecs(property) {
  const bhk = property?.bhk != null ? `${property.bhk} BHK` : null;
  const type = property?.propertyType ? humanize(property.propertyType) : null;
  const area =
    property?.area != null
      ? `${formatNumber(property.area)} ${property.areaUnit ?? ""}`.trim()
      : null;
  return [bhk, type, area].filter(Boolean).join(" • ");
}

// Returns the URL of the property's primary photo, or null when there is none.
// Only isPrimary === true is used (no fallback), matching the interested
// properties view.
function primaryPhotoUrl(property) {
  const photos = property?.photos;
  if (!Array.isArray(photos)) return null;
  const primary = photos.find((photo) => photo?.isPrimary === true && photo?.url);
  return primary?.url ?? null;
}

// "Find Matching Properties" screen (private/internal area).
//
// Runs the deterministic requirement-based search against the existing
// property inventory. Matching is a FILTER, not an endorsement: nothing is
// added to the customer's Interested Properties until the father explicitly
// selects it here. Properties already in the customer's interested list are
// shown checked and disabled (never re-added).
function CustomerMatchingPropertiesPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [existingIds, setExistingIds] = useState([]);
  const [properties, setProperties] = useState([]);
  const [filterCount, setFilterCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);

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
      const [matches, shortlist] = await Promise.all([
        getMatchingProperties(customerId),
        getCustomerShortlist(customerId),
      ]);
      setProperties(matches.properties);
      setFilterCount(matches.filterCount);
      setExistingIds(shortlist.map((property) => property._id));
      setSelectedIds([]);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, [customerId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const existingSet = useMemo(() => new Set(existingIds), [existingIds]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const toggle = (propertyId) => {
    if (existingSet.has(propertyId)) return; // already interested: use Remove
    setSelectedIds((current) =>
      current.includes(propertyId)
        ? current.filter((id) => id !== propertyId)
        : [...current, propertyId]
    );
  };

  const handleAddSelected = async () => {
    if (selectedIds.length === 0) return;

    setSaving(true);
    setSaveError(null);

    try {
      await addCustomerShortlistProperties(customerId, selectedIds);
      // The details view reloads the interested properties on mount, so the
      // newly added properties appear immediately (no manual refresh).
      navigate(`/customers/${customerId}`);
    } catch (error) {
      setSaveError(error.message || "Unable to add properties.");
      setSaving(false);
    }
  };

  const hasActiveFilters = filterCount > 0;

  return (
    <main className="app">
      <Link className="back-link" to={`/customers/${customerId}`}>
        ← Customer
      </Link>

      <header className="page-header">
        <h1>Matching Properties</h1>
        {customer && <p>{customer.name}</p>}
      </header>

      {status === "loading" && (
        <p className="state-message">Finding matching properties…</p>
      )}

      {status === "not_found" && (
        <p className="state-message">Customer not found.</p>
      )}

      {status === "error" && (
        <div className="state-message state-message--error" role="alert">
          <p>Unable to find matching properties.</p>
          <button type="button" className="retry-button" onClick={loadAll}>
            Retry
          </button>
        </div>
      )}

      {status === "success" && !hasActiveFilters && (
        <div className="details__muted">
          <p>
            No specific property filters have been added yet. Add requirements
            to find matching properties.
          </p>
          <div className="filters__actions">
            <Link
              className="button-primary"
              to={`/customers/${customerId}/requirements`}
            >
              Add Requirements
            </Link>
            <Link
              className="button-secondary"
              to={`/customers/${customerId}`}
            >
              Back to Customer
            </Link>
          </div>
        </div>
      )}

      {status === "success" && hasActiveFilters && (
        <>
          {properties.length === 0 ? (
            <p className="state-message">
              No properties match this customer's requirements.
            </p>
          ) : (
            <>
              <p className="property-count">
                {properties.length} matching{" "}
                {properties.length === 1 ? "property" : "properties"} •{" "}
                {selectedIds.length} selected to add
              </p>

              <div className="select-list">
                {properties.map((property) => {
                  const already = existingSet.has(property._id);
                  const checked = already || selectedSet.has(property._id);
                  const photoUrl = primaryPhotoUrl(property);

                  return (
                    <div
                      className={`select-row${
                        already ? " select-row--existing" : ""
                      }${!already && checked ? " select-row--selected" : ""}`}
                      key={property._id}
                    >
                      <label className="select-row__toggle">
                        <span className="select-row__photo">
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt=""
                              loading="lazy"
                              className="select-row__photo-img"
                            />
                          ) : (
                            <span
                              className="select-row__photo-empty"
                              aria-hidden="true"
                            >
                              No photo
                            </span>
                          )}
                        </span>
                        <input
                          type="checkbox"
                          className="select-row__input"
                          checked={checked}
                          disabled={already}
                          onChange={() => toggle(property._id)}
                          aria-label={`Select ${property.title}`}
                        />
                        <span className="select-row__body">
                          <span className="select-row__title">
                            {property.title}
                          </span>
                          {propertyMeta(property) && (
                            <span className="select-row__meta">
                              {propertyMeta(property)}
                            </span>
                          )}
                          {propertySpecs(property) && (
                            <span className="select-row__meta">
                              {propertySpecs(property)}
                            </span>
                          )}
                        </span>
                      </label>

                      {already && (
                        <span className="select-row__badge">Interested</span>
                      )}

                      <Link
                        className="button-link"
                        to={`/properties/${property._id}`}
                      >
                        View
                      </Link>
                    </div>
                  );
                })}
              </div>

              {saveError && (
                <p className="state-message state-message--error" role="alert">
                  {saveError}
                </p>
              )}

              <div className="filters__actions">
                <button
                  type="button"
                  className="button-primary"
                  onClick={handleAddSelected}
                  disabled={selectedIds.length === 0 || saving}
                >
                  {saving ? "Adding…" : "Add Selected to Interested Properties"}
                </button>
                <Link
                  className="button-secondary"
                  to={`/customers/${customerId}`}
                >
                  Cancel
                </Link>
              </div>
            </>
          )}
        </>
      )}
    </main>
  );
}

export default CustomerMatchingPropertiesPage;
