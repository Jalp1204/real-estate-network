import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProperties } from "../api/properties.js";
import PropertyCard from "../components/PropertyCard.jsx";
import CompareSelect from "../components/CompareSelect.jsx";
import { useShortlist } from "../shortlist/useShortlist.js";

// Compare selection rules (locked product decision).
const MIN_COMPARE = 2;
const MAX_COMPARE = 3;

// Shortlist screen.
//
// The shortlist stores only property ids (localStorage). This page loads the
// CURRENT property data from the existing API and renders the ids that still
// resolve. It re-renders automatically when the shortlist changes, so removing
// a property disappears immediately.
//
// Data fetching: there is no batch "fetch by ids" endpoint, so we fetch the
// property list once (the existing GET /api/properties) and filter it by the
// shortlisted ids client-side. Stale ids simply do not resolve and are ignored.
//
// Compare selection is separate temporary page state (NOT persisted). It is
// always intersected with the currently rendered (resolved) properties.
function ShortlistPage() {
  const { shortlist } = useShortlist();
  const navigate = useNavigate();

  const hasIds = shortlist.length > 0;

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(hasIds);
  const [error, setError] = useState(false);

  // Temporary compare selection (ids) + the "too many" hint.
  const [compareIds, setCompareIds] = useState([]);
  const [limitMessage, setLimitMessage] = useState(false);

  const loadProperties = useCallback(async () => {
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

  // Fetch once on mount if there is anything to resolve. Shortlist changes
  // afterwards only remove items, which is handled client-side without refetch.
  useEffect(() => {
    if (hasIds) {
      loadProperties();
    }
    // Intentionally mount-only: see comment above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadProperties]);

  // Resolve shortlisted ids against current data, preserving shortlist order and
  // ignoring ids whose property no longer exists (stale).
  const byId = new Map(properties.map((property) => [property._id, property]));
  const shortlisted = shortlist
    .map((id) => byId.get(id))
    .filter(Boolean);

  const shortlistedIds = shortlisted.map((property) => property._id);
  const shortlistedKey = shortlistedIds.join(",");

  // Drop compare ids that are no longer shortlisted / resolvable (removed or
  // stale). The rendered selection below is also intersected, so the UI is
  // correct even before this effect runs.
  useEffect(() => {
    setCompareIds((current) =>
      current.filter((id) => shortlistedIds.includes(id))
    );
    setLimitMessage(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortlistedKey]);

  const compareSelection = compareIds.filter((id) =>
    shortlistedIds.includes(id)
  );

  const handleCompareToggle = (propertyId) => {
    if (compareIds.includes(propertyId)) {
      setCompareIds(compareIds.filter((id) => id !== propertyId));
      setLimitMessage(false);
      return;
    }

    if (compareIds.length >= MAX_COMPARE) {
      setLimitMessage(true);
      return;
    }

    setCompareIds([...compareIds, propertyId]);
    setLimitMessage(false);
  };

  // Navigate to the comparison page with the selected ids, preserving order.
  const handleCompare = () => {
    if (
      compareSelection.length < MIN_COMPARE ||
      compareSelection.length > MAX_COMPARE
    ) {
      return;
    }
    navigate(`/compare?ids=${compareSelection.join(",")}`);
  };

  return (
    <main className="app">
      <Link className="back-link" to="/">
        ← Home
      </Link>

      <header className="page-header">
        <h1>My Shortlist</h1>
        {hasIds && !loading && !error && (
          <p>
            {shortlisted.length}{" "}
            {shortlisted.length === 1 ? "property" : "properties"} shortlisted
          </p>
        )}
      </header>

      {!hasIds && (
        <div className="state-message">
          <p>Your shortlist is empty.</p>
          <p>Browse properties and add the ones you want to keep here.</p>
          <Link className="button-link" to="/properties">
            Browse Properties
          </Link>
        </div>
      )}

      {hasIds && loading && (
        <p className="state-message">Loading your shortlist…</p>
      )}

      {hasIds && !loading && error && (
        <div className="state-message state-message--error" role="alert">
          <p>Unable to load your shortlist.</p>
          <button type="button" className="retry-button" onClick={loadProperties}>
            Retry
          </button>
        </div>
      )}

      {hasIds && !loading && !error && shortlisted.length === 0 && (
        <div className="state-message">
          <p>Your shortlisted properties are no longer available.</p>
          <Link className="button-link" to="/properties">
            Browse Properties
          </Link>
        </div>
      )}

      {hasIds && !loading && !error && shortlisted.length > 0 && (
        <>
          <div className="compare-bar">
            <div className="compare-bar__info">
              <p className="compare-bar__count">
                {compareSelection.length} selected for compare
              </p>
              {limitMessage && (
                <p className="compare-bar__message" role="status">
                  You can compare up to 3 properties.
                </p>
              )}
            </div>

            {/* Compare requires 2–3 selected properties; the button is
                disabled otherwise. */}
            <button
              type="button"
              className="button-primary"
              disabled={
                compareSelection.length < MIN_COMPARE ||
                compareSelection.length > MAX_COMPARE
              }
              onClick={handleCompare}
            >
              Compare Properties
            </button>
          </div>

          <div className="property-grid">
            {shortlisted.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                actions={
                  <CompareSelect
                    propertyId={property._id}
                    propertyTitle={property.title}
                    checked={compareSelection.includes(property._id)}
                    onToggle={handleCompareToggle}
                  />
                }
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
}

export default ShortlistPage;
