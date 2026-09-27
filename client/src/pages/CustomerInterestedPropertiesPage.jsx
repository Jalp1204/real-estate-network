import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCustomerById } from "../api/customers.js";
import {
  getCustomerShortlist,
  addCustomerShortlistProperties,
  removeCustomerShortlistProperty,
} from "../api/customerShortlist.js";
import { getProperties } from "../api/properties.js";
import { formatRupeesShort } from "../utils/format.js";

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

// Returns the URL of the property's primary photo, or null when there is none.
// Only isPrimary === true is used (no fallback), matching the requirement to
// show exactly one identifying photo.
function primaryPhotoUrl(property) {
  const photos = property?.photos;
  if (!Array.isArray(photos)) return null;
  const primary = photos.find((photo) => photo?.isPrimary === true && photo?.url);
  return primary?.url ?? null;
}

// Add / manage Interested Property screen (private/internal area).
//
// Selects properties from the existing inventory and adds them to the
// customer's interested properties (the private MongoDB relationship). Existing
// interested properties are shown checked and can be REMOVED via an explicit
// confirmation (never by toggling the checkbox). Selection is temporary React
// state (no localStorage).
function CustomerInterestedPropertiesPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [existingIds, setExistingIds] = useState([]);
  const [properties, setProperties] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  // status: "loading" | "success" | "not_found" | "error"
  const [status, setStatus] = useState("loading");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Remove flow: explicit confirmation + per-row in-progress/error state.
  const [confirmingId, setConfirmingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [removeError, setRemoveError] = useState(null);

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
      const [shortlist, inventory] = await Promise.all([
        getCustomerShortlist(customerId),
        getProperties(),
      ]);
      setExistingIds(shortlist.map((property) => property._id));
      setProperties(inventory);
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
      navigate(`/customers/${customerId}`);
    } catch (error) {
      setSaveError(error.message || "Unable to add properties.");
      setSaving(false);
    }
  };

  const handleConfirmRemove = async (propertyId) => {
    setRemovingId(propertyId);
    setRemoveError(null);

    try {
      const remaining = await removeCustomerShortlistProperty(
        customerId,
        propertyId
      );
      // Authoritative result from the API: remaining interested ids.
      setExistingIds(remaining.map((property) => property._id));
      setSelectedIds((current) => current.filter((id) => id !== propertyId));
      setConfirmingId(null);
    } catch (error) {
      setRemoveError({
        propertyId,
        message: error.message || "Unable to remove property.",
      });
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <main className="app">
      <Link className="back-link" to={`/customers/${customerId}`}>
        ← Customer
      </Link>

      <header className="page-header">
        <h1>Add Interested Properties</h1>
        {customer && <p>{customer.name}</p>}
      </header>

      {status === "loading" && (
        <p className="state-message">Loading properties…</p>
      )}

      {status === "not_found" && (
        <p className="state-message">Customer not found.</p>
      )}

      {status === "error" && (
        <div className="state-message state-message--error" role="alert">
          <p>Unable to load properties.</p>
          <button type="button" className="retry-button" onClick={loadAll}>
            Retry
          </button>
        </div>
      )}

      {status === "success" && (
        <>
          {properties.length === 0 ? (
            <p className="state-message">No properties available.</p>
          ) : (
            <>
              <p className="property-count">
                {selectedIds.length} selected to add
              </p>

              <div className="select-list">
                {properties.map((property) => {
                  const already = existingSet.has(property._id);
                  const checked = already || selectedSet.has(property._id);
                  const photoUrl = primaryPhotoUrl(property);
                  const isConfirming = confirmingId === property._id;
                  const isRemoving = removingId === property._id;
                  const rowError =
                    removeError?.propertyId === property._id
                      ? removeError.message
                      : null;

                  return (
                    <div
                      className={`select-row${already ? " select-row--existing" : ""}${
                        !already && checked ? " select-row--selected" : ""
                      }`}
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
                        </span>
                      </label>

                      {already && !isConfirming && (
                        <button
                          type="button"
                          className="select-row__remove"
                          onClick={() => {
                            setRemoveError(null);
                            setConfirmingId(property._id);
                          }}
                          aria-label={`Remove ${property.title} from interested properties`}
                        >
                          Remove
                        </button>
                      )}

                      {already && isConfirming && (
                        <div
                          className="select-row__confirm"
                          role="group"
                          aria-label={`Confirm removal of ${property.title}`}
                        >
                          <p className="select-row__confirm-question">
                            Remove this property from the customer's interested
                            properties?
                          </p>
                          <div className="filters__actions">
                            <button
                              type="button"
                              className="button-danger"
                              onClick={() => handleConfirmRemove(property._id)}
                              disabled={isRemoving}
                            >
                              {isRemoving ? "Removing…" : "Remove"}
                            </button>
                            <button
                              type="button"
                              className="button-secondary"
                              onClick={() => {
                                setConfirmingId(null);
                                setRemoveError(null);
                              }}
                              disabled={isRemoving}
                            >
                              Cancel
                            </button>
                          </div>
                          {rowError && (
                            <p
                              className="state-message state-message--error"
                              role="alert"
                            >
                              {rowError}
                            </p>
                          )}
                        </div>
                      )}

                      {rowError && !isConfirming && (
                        <p
                          className="state-message state-message--error"
                          role="alert"
                        >
                          {rowError}
                        </p>
                      )}
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
                  {saving ? "Adding…" : "Add Selected"}
                </button>
                <Link className="button-secondary" to={`/customers/${customerId}`}>
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

export default CustomerInterestedPropertiesPage;
