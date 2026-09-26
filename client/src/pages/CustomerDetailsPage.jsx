import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getCustomerById, deleteCustomer } from "../api/customers.js";

// Customer details screen (private/internal area).
// V1 shows name + phone only. Interested properties are intentionally empty in
// this slice; the relationship is added in Slice 2.
function CustomerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  // status: "loading" | "success" | "not_found" | "error"
  const [status, setStatus] = useState("loading");

  // Delete flow: requires an explicit confirmation step (never a single tap).
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const loadCustomer = useCallback(async () => {
    setStatus("loading");

    try {
      const data = await getCustomerById(id);
      setCustomer(data);
      setStatus("success");
    } catch (error) {
      setCustomer(null);
      setStatus(error?.code === "NOT_FOUND" ? "not_found" : "error");
    }
  }, [id]);

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
            <h2>Contact</h2>
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
            <h2>Interested Properties</h2>
            <p className="details__muted">No interested properties yet.</p>
            <p className="details__note">
              Linking interested properties to a customer will be available in a
              later update.
            </p>
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
