import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPropertyInternalById } from "../api/properties.js";
import { humanize, formatNumber } from "../utils/format.js";
import { sourceTypeLabel } from "../constants/propertyFormOptions.js";

// Internal Property Details (private area). Shows the property plus its source
// relationship. Broker information is shown ONLY here (internal), never in the
// customer-facing presentation pages.
function InternalPropertyDetailsPage() {
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  // status: "loading" | "success" | "not_found" | "error"
  const [status, setStatus] = useState("loading");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await getPropertyInternalById(id);
      setProperty(data);
      setStatus("success");
    } catch (error) {
      setProperty(null);
      setStatus(error?.code === "NOT_FOUND" ? "not_found" : "error");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const locationName =
    property?.locationId && typeof property.locationId === "object"
      ? [property.locationId.name, property.locationId.city]
          .filter(Boolean)
          .join(", ")
      : null;

  return (
    <main className="app">
      <Link className="back-link" to="/inventory/properties">
        ← Inventory
      </Link>

      {status === "loading" && <p className="state-message">Loading property…</p>}
      {status === "not_found" && <p className="state-message">Property not found.</p>}

      {status === "error" && (
        <div className="state-message state-message--error" role="alert">
          <p>Unable to load this property.</p>
          <button type="button" className="retry-button" onClick={load}>
            Retry
          </button>
        </div>
      )}

      {status === "success" && property && (
        <article className="details">
          <header className="details__header">
            <h1>{property.title}</h1>
          </header>

          <section className="details__section">
            <div className="page-header__row">
              <h2>Overview</h2>
              <div className="section-actions">
                <Link
                  className="button-link"
                  to={`/inventory/properties/${id}/edit`}
                >
                  Edit Property
                </Link>
              </div>
            </div>

            <dl className="facts">
              {property.price?.amount != null && (
                <div className="facts__item">
                  <dt className="facts__label">Price</dt>
                  <dd className="facts__value">
                    ₹{formatNumber(property.price.amount)}
                    {property.price.type
                      ? ` · ${humanize(property.price.type)}`
                      : ""}
                  </dd>
                </div>
              )}
              <div className="facts__item">
                <dt className="facts__label">Property Type</dt>
                <dd className="facts__value">{humanize(property.propertyType)}</dd>
              </div>
              {property.bhk != null && (
                <div className="facts__item">
                  <dt className="facts__label">BHK</dt>
                  <dd className="facts__value">{property.bhk} BHK</dd>
                </div>
              )}
              {property.area != null && (
                <div className="facts__item">
                  <dt className="facts__label">Area</dt>
                  <dd className="facts__value">
                    {formatNumber(property.area)} {property.areaUnit ?? ""}
                  </dd>
                </div>
              )}
              {locationName && (
                <div className="facts__item">
                  <dt className="facts__label">Location</dt>
                  <dd className="facts__value">{locationName}</dd>
                </div>
              )}
              <div className="facts__item">
                <dt className="facts__label">Availability</dt>
                <dd className="facts__value">{humanize(property.availability)}</dd>
              </div>
            </dl>
          </section>

          <section className="details__section">
            <h2>Source</h2>
            <dl className="facts">
              <div className="facts__item">
                <dt className="facts__label">Source Type</dt>
                <dd className="facts__value">
                  {sourceTypeLabel(property.source?.sourceType)}
                </dd>
              </div>
            </dl>

            {property.source?.sourceType === "broker" && (
              property.broker ? (
                <dl className="facts">
                  {property.broker.name && (
                    <div className="facts__item">
                      <dt className="facts__label">Broker</dt>
                      <dd className="facts__value">{property.broker.name}</dd>
                    </div>
                  )}
                  {property.broker.businessName && (
                    <div className="facts__item">
                      <dt className="facts__label">Business Name</dt>
                      <dd className="facts__value">
                        {property.broker.businessName}
                      </dd>
                    </div>
                  )}
                  {property.broker.phone && (
                    <div className="facts__item">
                      <dt className="facts__label">Phone</dt>
                      <dd className="facts__value">{property.broker.phone}</dd>
                    </div>
                  )}
                </dl>
              ) : (
                <p className="details__muted">Broker record unavailable</p>
              )
            )}
          </section>
        </article>
      )}
    </main>
  );
}

export default InternalPropertyDetailsPage;
