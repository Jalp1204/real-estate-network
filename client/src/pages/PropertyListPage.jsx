import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getProperties } from "../api/properties.js";
import PropertyCard from "../components/PropertyCard.jsx";
import PropertyFilters from "../components/PropertyFilters.jsx";
import { PROPERTY_FILTER_KEYS, SORT_OPTIONS, DEFAULT_SORT } from "../constants/propertyFilterOptions.js";
import { humanize, formatNumber, formatRupeesShort } from "../utils/format.js";

function toNumber(raw) {
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

// Property list screen.
// Fetches the property list on mount and renders loading / error / empty /
// populated states. Each card links to the property details screen.
//
// The URL is the source of truth for filters. Supports optional, combinable
// query parameters:
//   ?location=<id>
//   ?budgetMin=<n>&budgetMax=<n>
//   ?bhk=<n>&propertyType=<v>&minArea=<n>&possession=<v>&furnishing=<v>
// With no query parameters the full list is shown (unchanged behavior).
function PropertyListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const locationId = searchParams.get("location") || null;
  const budgetMinParam = searchParams.get("budgetMin") || null;
  const budgetMaxParam = searchParams.get("budgetMax") || null;
  const bhkParam = searchParams.get("bhk") || "";
  const propertyTypeParam = searchParams.get("propertyType") || "";
  const minAreaParam = searchParams.get("minArea") || "";
  const possessionParam = searchParams.get("possession") || "";
  const furnishingParam = searchParams.get("furnishing") || "";
  const sortParam = searchParams.get("sort") || "";

  const hasBudget = Boolean(budgetMinParam || budgetMaxParam);
  const hasNewFilters = Boolean(
    bhkParam || propertyTypeParam || minAreaParam || possessionParam || furnishingParam
  );
  const isFiltered = Boolean(locationId || hasBudget || hasNewFilters);

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
        bhk: bhkParam,
        propertyType: propertyTypeParam,
        minArea: minAreaParam,
        possession: possessionParam,
        furnishing: furnishingParam,
        sort: sortParam,
      });
      setProperties(data);
    } catch {
      // Details are not shown to the user; the error state offers a retry.
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [
    locationId,
    budgetMinParam,
    budgetMaxParam,
    bhkParam,
    propertyTypeParam,
    minAreaParam,
    possessionParam,
    furnishingParam,
    sortParam,
  ]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  // Applies the filter-panel draft to the URL, preserving location/budget.
  // Sort is written separately; an explicit "recent" is stored as no parameter
  // (the default), keeping the URL clean.
  const handleApply = (draft) => {
    const next = new URLSearchParams(searchParams);
    for (const key of PROPERTY_FILTER_KEYS) {
      const value = (draft[key] ?? "").toString().trim();
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    }

    const sortValue = (draft.sort ?? "").trim();
    if (sortValue && sortValue !== DEFAULT_SORT) {
      next.set("sort", sortValue);
    } else {
      next.delete("sort");
    }

    setSearchParams(next);
  };

  // Clears the filter-panel parameters and resets sort to the default,
  // while preserving location/budget.
  const handleClear = () => {
    const next = new URLSearchParams(searchParams);
    for (const key of PROPERTY_FILTER_KEYS) {
      next.delete(key);
    }
    next.delete("sort");
    setSearchParams(next);
  };

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

  const budgetSummary = !hasBudget
    ? null
    : minLabel && maxLabel
      ? `${minLabel} – ${maxLabel}`
      : minLabel
        ? `${minLabel}+`
        : maxLabel
          ? `Up to ${maxLabel}`
          : null;

  // Human-readable descriptors for the new filters (never raw enum values).
  const descriptors = [
    bhkParam ? `${bhkParam} BHK` : null,
    propertyTypeParam ? humanize(propertyTypeParam) : null,
    possessionParam ? humanize(possessionParam) : null,
    furnishingParam ? humanize(furnishingParam) : null,
  ].filter(Boolean);

  const minAreaNumber = toNumber(minAreaParam);
  const areaSummary = minAreaNumber !== null
    ? `From ${formatNumber(minAreaNumber)} sq ft`
    : null;
  const areaPhrase = areaSummary ? areaSummary.toLowerCase() : null;

  const heading = locationId
    ? locationName
      ? `Properties in ${locationName}`
      : "Properties in this location"
    : hasBudget
      ? budgetHeading
      : descriptors.length > 0
        ? `${descriptors.join(" ")} Properties`
        : areaPhrase
          ? `Properties ${areaPhrase}`
          : "Properties";

  // Secondary summary line so combined filters stay readable.
  let filterSummary = null;
  if (hasNewFilters) {
    if (locationId || hasBudget) {
      filterSummary = [...descriptors, areaSummary].filter(Boolean).join(" · ");
    } else if (descriptors.length > 0 && areaSummary) {
      filterSummary = areaSummary;
    }
  }

  // Sort summary, shown only when a non-default sort is active.
  const sortLabel =
    sortParam && sortParam !== DEFAULT_SORT
      ? SORT_OPTIONS.find((option) => option.value === sortParam)?.label ?? null
      : null;

  const subText = locationId && hasBudget
    ? "Available properties in this area and budget range."
    : locationId
      ? "Available properties in this area."
      : hasBudget
        ? "Available properties in this budget range."
        : hasNewFilters
          ? "Available properties matching your filters."
          : "Browse available properties in the network.";

  const emptyText = hasNewFilters
    ? "No properties match these filters."
    : locationId && hasBudget
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
        {filterSummary && <p className="filter-summary">{filterSummary}</p>}
        {sortLabel && <p className="filter-summary">Sorted by {sortLabel}</p>}
        <p>{subText}</p>
      </header>

      <PropertyFilters
        filters={{
          bhk: bhkParam,
          propertyType: propertyTypeParam,
          minArea: minAreaParam,
          possession: possessionParam,
          furnishing: furnishingParam,
          sort: sortParam || DEFAULT_SORT,
        }}
        onApply={handleApply}
        onClear={handleClear}
      />

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
