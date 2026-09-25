import { useCallback, useEffect, useState } from "react";
import { getProperties } from "../api/properties.js";
import PropertyCard from "../components/PropertyCard.jsx";

// Property list screen.
// Fetches the property list on mount and renders loading / error / empty /
// populated states. No filtering, sorting, search or routing yet.
function PropertyListPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadProperties = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const data = await getProperties();
      setProperties(data);
    } catch {
      // Details are not shown to the user; the error state offers a retry.
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  return (
    <main className="app">
      <header className="page-header">
        <h1>Properties</h1>
        <p>Browse available properties in the network.</p>
      </header>

      {loading && <p className="state-message">Loading properties…</p>}

      {!loading && error && (
        <div className="state-message state-message--error" role="alert">
          <p>Unable to load properties.</p>
          <button type="button" className="retry-button" onClick={loadProperties}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && properties.length === 0 && (
        <p className="state-message">No properties available yet.</p>
      )}

      {!loading && !error && properties.length > 0 && (
        <>
          <p className="property-count">
            {properties.length}{" "}
            {properties.length === 1 ? "property" : "properties"}
          </p>
          <div className="property-grid">
            {properties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}

export default PropertyListPage;
