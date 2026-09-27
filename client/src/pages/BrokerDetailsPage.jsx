import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getBrokerById, deleteBroker } from "../api/brokers.js";
import { brokerStatusLabel } from "../constants/brokerOptions.js";
import { formatDate } from "../utils/format.js";

// Broker details screen (private/internal area).
// Shows the stored broker information. `trustScore`, if present, is displayed
// only as raw existing data (no scoring UI or calculation).
function BrokerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [broker, setBroker] = useState(null);
  // status: "loading" | "success" | "not_found" | "error"
  const [status, setStatus] = useState("loading");

  // Delete flow: inline confirmation (never a single tap, no window.confirm).
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const loadBroker = useCallback(async () => {
    setStatus("loading");

    try {
      const data = await getBrokerById(id);
      setBroker(data);
      setStatus("success");
    } catch (error) {
      setBroker(null);
      setStatus(error?.code === "NOT_FOUND" ? "not_found" : "error");
    }
  }, [id]);

  useEffect(() => {
    loadBroker();
  }, [loadBroker]);

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteBroker(id);
      navigate("/brokers");
    } catch (error) {
      setDeleteError(error.message || "Unable to delete broker.");
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  return (
    <main className="app">
      <Link className="back-link" to="/brokers">
        ← Brokers
      </Link>

      {status === "loading" && <p className="state-message">Loading broker…</p>}

      {status === "not_found" && <p className="state-message">Broker not found.</p>}

      {status === "error" && (
        <div className="state-message state-message--error" role="alert">
          <p>Unable to load this broker.</p>
          <button type="button" className="retry-button" onClick={loadBroker}>
            Retry
          </button>
        </div>
      )}

      {status === "success" && broker && (
        <article className="details">
          <header className="details__header">
            <h1>{broker.name}</h1>
          </header>

          <section className="details__section">
            <div className="page-header__row">
              <h2>Broker Details</h2>
              <div className="section-actions">
                <Link className="button-link" to={`/brokers/${id}/edit`}>
                  Edit Broker
                </Link>
                {!confirmingDelete && (
                  <button
                    type="button"
                    className="button-danger"
                    onClick={() => {
                      setDeleteError(null);
                      setConfirmingDelete(true);
                    }}
                  >
                    Delete Broker
                  </button>
                )}
              </div>
            </div>

            <dl className="facts">
              <div className="facts__item">
                <dt className="facts__label">Name</dt>
                <dd className="facts__value">{broker.name}</dd>
              </div>
              <div className="facts__item">
                <dt className="facts__label">Phone</dt>
                <dd className="facts__value">{broker.phone}</dd>
              </div>
              {broker.businessName && (
                <div className="facts__item">
                  <dt className="facts__label">Business Name</dt>
                  <dd className="facts__value">{broker.businessName}</dd>
                </div>
              )}
              {broker.location && (
                <div className="facts__item">
                  <dt className="facts__label">Location</dt>
                  <dd className="facts__value">{broker.location}</dd>
                </div>
              )}
              {broker.registration && (
                <div className="facts__item">
                  <dt className="facts__label">Registration</dt>
                  <dd className="facts__value">{broker.registration}</dd>
                </div>
              )}
              <div className="facts__item">
                <dt className="facts__label">Status</dt>
                <dd className="facts__value">{brokerStatusLabel(broker.status)}</dd>
              </div>
              {broker.notes && (
                <div className="facts__item">
                  <dt className="facts__label">Notes</dt>
                  <dd className="facts__value">{broker.notes}</dd>
                </div>
              )}
              {broker.trustScore?.value != null && (
                <div className="facts__item">
                  <dt className="facts__label">Trust Score</dt>
                  <dd className="facts__value">{broker.trustScore.value}</dd>
                </div>
              )}
              {broker.trustScore?.lastReviewedAt && (
                <div className="facts__item">
                  <dt className="facts__label">Trust Score Reviewed</dt>
                  <dd className="facts__value">
                    {formatDate(broker.trustScore.lastReviewedAt)}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {confirmingDelete && (
            <section className="details__section details__section--danger">
              <h2>Delete Broker</h2>

              {deleteError && (
                <p className="state-message state-message--error" role="alert">
                  {deleteError}
                </p>
              )}

              <div
                className="delete-confirm"
                role="group"
                aria-label="Confirm delete broker"
              >
                <p className="delete-confirm__question">
                  Are you sure you want to delete this broker?
                </p>
                <div className="filters__actions">
                  <button
                    type="button"
                    className="button-danger"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting…" : "Delete"}
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
            </section>
          )}
        </article>
      )}
    </main>
  );
}

export default BrokerDetailsPage;
