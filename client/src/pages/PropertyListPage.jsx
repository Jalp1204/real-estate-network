import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getProperties } from "../api/properties.js";
import PropertyCard from "../components/PropertyCard.jsx";
import { formatRupeesShort } from "../utils/format.js";

function toNumber(raw) {
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

// Property list screen.
// Fetches the property list on mount and renders loading / error / empty /
// populated states. Each card links to the property details screen.
//
// Supports optional, combinable query filters:
//   ?location=<id>                          -> single location
//   ?budgetMin=<n>&budgetMax=<n>            -> price range
// With no query parameters the full list is shown (unchanged behavior).
function PropertyListPage() {
  const [searchParams] = useSearchParams();
  const locationId = searchParams.get("location") || null;
  const budgetMinParam = searchParams.get("budgetMin") || null;
  const budgetMaxParam = searchParams.get("budgetMax") || null;
  const hasBudget = Boolean(budgetMinParam || budgetMaxParam);
  const isFiltered = Boolean(locationId || hasBudget);

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadProperties = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const data = await getProperties({
        locationId,
        budgetMin: budgetMinParam,
        budgetMax: budgetMaxParam,
      });
      setProperties(data);
    } catch {
      // Details are not shown to the user; the error state offers a retry.
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [locationId, budgetMinParam, budgetMaxParam]);

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

  // Human-friendly budget labels derived from the query (never shown raw).
  const budgetMin = toNumber(budgetMinParam);
  const budgetMax = toNumber(budgetMaxParam);
  const minLabel = formatRupeesShort(budgetMin);
  const maxLabel = formatRupeesShort(budgetMax);

  const budgetHeading = !hasBudget
    ? null
    : minLabel && maxLabel
      ? `Properties from ${minLabel} to ${maxLabel}`
      : minLabel
        ? `Properties from ${minLabel}+`
        : maxLabel
          ? `Properties up to ${maxLabel}`
          : "Properties";

  // Compact budget summary, shown under the heading when a location is also set.
  const budgetSummary = !hasBudget
    ? null
    : minLabel && maxLabel
      ? `${minLabel} – ${maxLabel}`
      : minLabel
        ? `${minLabel}+`
        : maxLabel
          ? `Up to ${maxLabel}`
          : null;

  const heading = locationId
    ? locationName
      ? `Properties in ${locationName}`
      : "Properties in this location"
    : hasBudget
      ? budgetHeading
      : "Properties";

  const subText = locationId && hasBudget
    ? "Available properties in this area and budget range."
    : locationId
      ? "Available properties in this area."
      : hasBudget
        ? "Available properties in this budget range."
        : "Browse available properties in the network.";

  const emptyText = locationId && hasBudget
    ? "No available properties match these filters."
    : locationId
      ? "No available properties in this location yet."
      : hasBudget
        ? "No available properties in this budget range."
        : "No properties available yet.";

  return (
    <main className="app">
      <header className="page-header">
        {isFiltered && (
          <Link className="back-link" to="/properties">
            ← All properties
          </Link>
        )}
        <h1>{heading}</h1>
        {locationId && hasBudget && budgetSummary && (
          <p className="budget-summary">{budgetSummary}</p>
        )}
        <p>{subText}</p>
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
        <p className="state-message">{emptyText}</p>
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
