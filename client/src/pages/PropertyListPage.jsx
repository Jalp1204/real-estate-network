import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getProperties } from "../api/properties.js";
import PropertyCard from "../components/PropertyCard.jsx";

// Property list screen.
// Fetches the property list on mount and renders loading / error / empty /
// populated states. Each card links to the property details screen.
//
// Supports an optional `?location=<id>` query to show a single location's
// properties. Without it, the full list is shown (unchanged behavior).
function PropertyListPage() {
  const [searchParams] = useSearchParams();
  const locationId = searchParams.get("location") || null;
  const isFiltered = Boolean(locationId);

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadProperties = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const data = await getProperties(locationId);
      setProperties(data);
    } catch {
      // Details are not shown to the user; the error state offers a retry.
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  // The populated location on any returned property tells us the area name,
  // so we do not need a separate request for it.
  const locationName =
    properties.find(
      (property) =>
        property?.locationId && typeof property.locationId === "object"
    )?.locationId?.name ?? null;

  const heading = isFiltered
    ? locationName
      ? `Properties in ${locationName}`
      : "Properties in this location"
    : "Properties";

  return (
    <main className="app">
      <header className="page-header">
        {isFiltered && (
          <Link className="back-link" to="/properties">
            ← All properties
          </Link>
        )}
        <h1>{heading}</h1>
        <p>
          {isFiltered
            ? "Available properties in this area."
            : "Browse available properties in the network."}
        </p>
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
        <p className="state-message">
          {isFiltered
            ? "No available properties in this location yet."
            : "No properties available yet."}
        </p>
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
