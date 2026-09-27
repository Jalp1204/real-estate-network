import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProperties } from "../api/properties.js";
import { humanize, formatNumber } from "../utils/format.js";
import { sourceTypeLabel } from "../constants/propertyFormOptions.js";

// Internal property inventory list (private area).
// Minimal: lists properties with a compact summary and links to the internal
// details page. Used to reach Add/Edit for the broker-source workflow.
function InventoryPropertyListPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getProperties();
      setProperties(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <main className="app">
      <Link className="back-link" to="/">
        ← Home
      </Link>

      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Inventory</h1>
            <p>Private property inventory.</p>
          </div>
          <Link className="button-primary" to="/inventory/properties/new">
            Add Property
          </Link>
        </div>
      </header>

      {loading && <p className="state-message">Loading properties…</p>}

      {!loading && error && (
        <div className="state-message state-message--error" role="alert">
          <p>Unable to load properties.</p>
          <button type="button" className="retry-button" onClick={load}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && properties.length === 0 && (
        <div className="state-message">
          <p>No properties yet.</p>
          <Link className="button-link" to="/inventory/properties/new">
            Add Property
          </Link>
        </div>
      )}

      {!loading && !error && properties.length > 0 && (
        <div className="customer-list">
          {properties.map((property) => (
            <Link
              className="customer-card"
              key={property._id}
              to={`/inventory/properties/${property._id}`}
            >
              <div className="customer-card__main">
                <span className="customer-card__name">{property.title}</span>
                <span className="broker-card__meta">
                  {[
                    property.price?.amount != null
                      ? `₹${formatNumber(property.price.amount)}`
                      : null,
                    humanize(property.propertyType),
                    property.area != null
                      ? `${formatNumber(property.area)} ${property.areaUnit ?? ""}`.trim()
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
                <span className="broker-card__meta">
                  Source: {sourceTypeLabel(property.source?.sourceType)}
                </span>
              </div>
              <span className="customer-card__chevron" aria-hidden="true">
                ›
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

export default InventoryPropertyListPage;
