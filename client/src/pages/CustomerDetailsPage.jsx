import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getCustomerById, deleteCustomer } from "../api/customers.js";
import { getCustomerShortlist } from "../api/customerShortlist.js";
import { getCustomerRequirements, deleteCustomerRequirements } from "../api/customerRequirements.js";
import PropertyCard from "../components/PropertyCard.jsx";
import { humanize, formatRupeesShort, formatNumber } from "../utils/format.js";

// Builds the read-only requirements summary rows (empty values omitted).
function requirementRows(requirement) {
  const budget = requirement?.budget ?? {};
  const minLabel = formatRupeesShort(budget.min);
  const maxLabel = formatRupeesShort(budget.max);

  let budgetText = null;
  if (minLabel && maxLabel) budgetText = `₹${minLabel.replace("₹", "")} – ${maxLabel}`;
  else if (minLabel) budgetText = `From ${minLabel}`;
  else if (maxLabel) budgetText = `Up to ${maxLabel}`;

  const locations = (requirement?.locations ?? [])
    .map((loc) => (loc && typeof loc === "object" ? loc.name : null))
    .filter(Boolean)
    .join(", ");

  const bhk = (requirement?.bhk ?? []).map((n) => `${n} BHK`).join(", ");
  const propertyTypes = (requirement?.propertyTypes ?? [])
    .map((t) => humanize(t))
    .join(", ");
  const possession = (requirement?.possession ?? [])
    .map((p) => humanize(p))
    .join(", ");
  const amenities = (requirement?.amenities ?? [])
    .map((a) => humanize(a))
    .join(", ");
  const minArea =
    requirement?.minArea != null
      ? `${formatNumber(requirement.minArea)} sq ft`
      : null;

  return [
    { label: "Budget", value: budgetText },
    { label: "Preferred Locations", value: locations || null },
    { label: "BHK", value: bhk || null },
    { label: "Property Types", value: propertyTypes || null },
    { label: "Possession", value: possession || null },
    { label: "Minimum Area", value: minArea },
    { label: "Amenities", value: amenities || null },
    { label: "Notes", value: requirement?.notes ?? null },
  ].filter((row) => row.value !== null && row.value !== "");
}

// Customer details screen (private/internal area).
// V1 shows name + phone and the customer's interested properties (the private
// MongoDB relationship, NOT the browser-local presentation shortlist).
function CustomerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  // status: "loading" | "success" | "not_found" | "error"
  const [status, setStatus] = useState("loading");

  const [interested, setInterested] = useState([]);
  // shortlistStatus: "loading" | "success" | "error"
  const [shortlistStatus, setShortlistStatus] = useState("loading");

  const [requirement, setRequirement] = useState(null);
  // requirementStatus: "loading" | "success" | "error"
  const [requirementStatus, setRequirementStatus] = useState("loading");

  // Requirements delete flow (inline confirmation, like the customer delete).
  const [confirmingRequirementDelete, setConfirmingRequirementDelete] =
    useState(false);
  const [deletingRequirement, setDeletingRequirement] = useState(false);
  const [requirementDeleteError, setRequirementDeleteError] = useState(null);

  // Delete flow: requires an explicit confirmation step (never a single tap).
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const loadShortlist = useCallback(async () => {
    setShortlistStatus("loading");
    try {
      const properties = await getCustomerShortlist(id);
      setInterested(properties);
      setShortlistStatus("success");
    } catch {
      setInterested([]);
      setShortlistStatus("error");
    }
  }, [id]);

  const loadRequirements = useCallback(async () => {
    setRequirementStatus("loading");
    try {
      const data = await getCustomerRequirements(id);
      setRequirement(data);
      setRequirementStatus("success");
    } catch {
      setRequirement(null);
      setRequirementStatus("error");
    }
  }, [id]);

  const loadCustomer = useCallback(async () => {
    setStatus("loading");

    try {
      const data = await getCustomerById(id);
      setCustomer(data);
      setStatus("success");
    } catch (error) {
      setCustomer(null);
      setStatus(error?.code === "NOT_FOUND" ? "not_found" : "error");
      return;
    }

    await loadShortlist();
    await loadRequirements();
  }, [id, loadShortlist, loadRequirements]);

  useEffect(() => {
    loadCustomer();
  }, [loadCustomer]);

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteCustomer(id);
      navigate("/customers");
    } catch (error) {
      setDeleteError(error.message || "Unable to delete customer.");
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  const handleDeleteRequirements = async () => {
    setDeletingRequirement(true);
    setRequirementDeleteError(null);

    try {
      await deleteCustomerRequirements(id);
      // Update UI immediately from the successful response (no refresh needed).
      setRequirement(null);
      setConfirmingRequirementDelete(false);
    } catch (error) {
      setRequirementDeleteError(
        error.message || "Unable to delete requirements."
      );
    } finally {
      setDeletingRequirement(false);
    }
  };

  return (
    <main className="app">
      <Link className="back-link" to="/customers">
        ← Customers
      </Link>

      {status === "loading" && (
        <p className="state-message">Loading customer…</p>
      )}

      {status === "not_found" && (
        <p className="state-message">Customer not found.</p>
      )}

      {status === "error" && (
        <div className="state-message state-message--error" role="alert">
          <p>Unable to load this customer.</p>
          <button type="button" className="retry-button" onClick={loadCustomer}>
            Retry
          </button>
        </div>
      )}

      {status === "success" && customer && (
        <article className="details">
          <header className="details__header">
            <h1>{customer.name}</h1>
          </header>

          <section className="details__section">
            <div className="page-header__row">
              <h2>Contact</h2>
              <Link className="button-link" to={`/customers/${id}/edit`}>
                Edit
              </Link>
            </div>
            <dl className="facts">
              <div className="facts__item">
                <dt className="facts__label">Name</dt>
                <dd className="facts__value">{customer.name}</dd>
              </div>
              <div className="facts__item">
                <dt className="facts__label">Phone</dt>
                <dd className="facts__value">{customer.phone}</dd>
              </div>
            </dl>
          </section>

          <section className="details__section">
            <div className="page-header__row">
              <h2>Interested Properties</h2>
              <Link className="button-link" to={`/customers/${id}/properties`}>
                + Add Interested Property
              </Link>
            </div>

            {shortlistStatus === "loading" && (
              <p className="details__muted">Loading interested properties…</p>
            )}

            {shortlistStatus === "error" && (
              <div className="state-message state-message--error" role="alert">
                <p>Unable to load interested properties.</p>
                <button
                  type="button"
                  className="retry-button"
                  onClick={loadShortlist}
                >
                  Retry
                </button>
              </div>
            )}

            {shortlistStatus === "success" && interested.length === 0 && (
              <p className="details__muted">No interested properties yet.</p>
            )}

            {shortlistStatus === "success" && interested.length > 0 && (
              <div className="property-grid">
                {interested.map((property) => (
                  <PropertyCard
                    key={property._id}
                    property={property}
                    showShortlist={false}
                    actions={
                      <Link
                        className="button-link"
                        to={`/properties/${property._id}`}
                      >
                        View Property
                      </Link>
                    }
                  />
                ))}
              </div>
            )}
          </section>

          <section className="details__section">
            <div className="page-header__row">
              <h2>Requirements</h2>
              {requirementStatus === "success" && !confirmingRequirementDelete && (
                <div className="section-actions">
                  <Link
                    className="button-link"
                    to={`/customers/${id}/requirements`}
                  >
                    {requirement ? "Edit Requirements" : "+ Add Requirements"}
                  </Link>
                  {requirement && (
                    <Link
                      className="button-link"
                      to={`/customers/${id}/matching-properties`}
                    >
                      Find Matching Properties
                    </Link>
                  )}
                  {requirement && (
                    <button
                      type="button"
                      className="button-danger"
                      onClick={() => {
                        setRequirementDeleteError(null);
                        setConfirmingRequirementDelete(true);
                      }}
                    >
                      Delete Requirements
                    </button>
                  )}
                </div>
              )}
            </div>

            {requirementStatus === "loading" && (
              <p className="details__muted">Loading requirements…</p>
            )}

            {requirementStatus === "error" && (
              <div className="state-message state-message--error" role="alert">
                <p>Unable to load requirements.</p>
                <button
                  type="button"
                  className="retry-button"
                  onClick={loadRequirements}
                >
                  Retry
                </button>
              </div>
            )}

            {requirementStatus === "success" && !requirement && (
              <p className="details__muted">No requirements recorded yet.</p>
            )}

            {requirementStatus === "success" && requirement && (
              <dl className="facts">
                {requirementRows(requirement).map((row) => (
                  <div className="facts__item" key={row.label}>
                    <dt className="facts__label">{row.label}</dt>
                    <dd className="facts__value">{row.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {requirementStatus === "success" && requirement && confirmingRequirementDelete && (
              <div
                className="delete-confirm"
                role="group"
                aria-label="Confirm delete requirements"
              >
                <p className="delete-confirm__question">
                  Are you sure you want to delete these requirements?
                </p>
                <div className="filters__actions">
                  <button
                    type="button"
                    className="button-danger"
                    onClick={handleDeleteRequirements}
                    disabled={deletingRequirement}
                  >
                    {deletingRequirement ? "Deleting…" : "Delete"}
                  </button>
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => {
                      setConfirmingRequirementDelete(false);
                      setRequirementDeleteError(null);
                    }}
                    disabled={deletingRequirement}
                  >
                    Cancel
                  </button>
                </div>
                {requirementDeleteError && (
                  <p className="state-message state-message--error" role="alert">
                    {requirementDeleteError}
                  </p>
                )}
              </div>
            )}
          </section>

          <section className="details__section details__section--danger">
            <h2>Danger Zone</h2>
            <p className="details__muted">
              Deleting this customer permanently removes their record.
            </p>

            {deleteError && (
              <p className="state-message state-message--error" role="alert">
                {deleteError}
              </p>
            )}

            {!confirmingDelete ? (
              <button
                type="button"
                className="button-danger"
                onClick={() => {
                  setDeleteError(null);
                  setConfirmingDelete(true);
                }}
              >
                Delete Customer
              </button>
            ) : (
              <div className="delete-confirm" role="group" aria-label="Confirm delete customer">
                <p className="delete-confirm__question">
                  Are you sure you want to delete {customer.name}? This cannot be
                  undone.
                </p>
                <div className="filters__actions">
                  <button
                    type="button"
                    className="button-danger"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting…" : "Yes, Delete Customer"}
                  </button>
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => {
                      setConfirmingDelete(false);
                      setDeleteError(null);
                    }}
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>
        </article>
      )}
    </main>
  );
}

export default CustomerDetailsPage;
