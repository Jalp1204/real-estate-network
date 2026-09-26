import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getProperties } from "../api/properties.js";
import { humanize, formatNumber, formatDate } from "../utils/format.js";

// Compare requires 2 or 3 properties (locked product decision).
const MIN_COMPARE = 2;
const MAX_COMPARE = 3;

// Parses the `ids` query parameter into a de-duplicated, order-preserving list.
function parseIds(raw) {
  if (!raw) return [];

  const seen = new Set();
  const ids = [];

  for (const part of raw.split(",")) {
    const id = part.trim();
    if (id && !seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }

  return ids;
}

// Formats a comparison value, falling back to an em dash for missing data so
// rows stay aligned.
function valueOrDash(value) {
  return value !== null && value !== undefined && value !== "" ? value : "—";
}

function priceText(property) {
  const price = property?.price ?? {};
  const amount = formatNumber(price.amount);
  if (!amount) return null;
  const type = humanize(price.type);
  return `₹${amount}${type ? ` · ${type}` : ""}`;
}

function locationText(property) {
  const location = property?.locationId;
  if (!location || typeof location !== "object") return null;
  return [location.name, location.city].filter(Boolean).join(", ") || null;
}

function possessionText(property) {
  const possession = property?.possession ?? {};
  const status = humanize(possession.status);
  const date = possession.date ? formatDate(possession.date) : null;
  if (status && date) return `${status} · ${date}`;
  return status || date || null;
}

function listText(items) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return items.map((item) => humanize(item)).filter(Boolean).join(", ") || null;
}

// Customer-safe comparison rows, in display order. Internal data (broker/source,
// internalNotes, verification notes, customer info) is deliberately excluded.
const FIELDS = [
  { key: "price", label: "Price", get: priceText },
  { key: "location", label: "Location", get: locationText },
  { key: "propertyType", label: "Property Type", get: (p) => humanize(p?.propertyType) },
  {
    key: "bhk",
    label: "BHK",
    get: (p) => (typeof p?.bhk === "number" ? `${p.bhk} BHK` : null),
  },
  {
    key: "area",
    label: "Area",
    get: (p) => {
      const amount = formatNumber(p?.area);
      return amount ? `${amount} ${p?.areaUnit ?? ""}`.trim() : null;
    },
  },
  { key: "possession", label: "Possession", get: possessionText },
  {
    key: "floor",
    label: "Floor",
    get: (p) => (p?.details?.floor != null ? formatNumber(p.details.floor) : null),
  },
  {
    key: "totalFloors",
    label: "Total Floors",
    get: (p) =>
      p?.details?.totalFloors != null ? formatNumber(p.details.totalFloors) : null,
  },
  {
    key: "parking",
    label: "Parking",
    get: (p) => (p?.details?.parking != null ? formatNumber(p.details.parking) : null),
  },
  { key: "furnishing", label: "Furnishing", get: (p) => humanize(p?.details?.furnishing) },
  { key: "facing", label: "Facing", get: (p) => humanize(p?.details?.facing) },
  {
    key: "propertyAge",
    label: "Property Age",
    get: (p) =>
      p?.details?.propertyAge != null ? formatNumber(p.details.propertyAge) : null,
  },
  { key: "amenities", label: "Amenities", get: (p) => listText(p?.amenities) },
  { key: "specialities", label: "Specialities", get: (p) => listText(p?.specialities) },
  { key: "availability", label: "Availability", get: (p) => humanize(p?.availability) },
];

// Returns the property's primary photo, or null when there is none.
// Strictly requires isPrimary === true (no fallback) so a missing primary photo
// simply omits the photo area.
function primaryPhoto(property) {
  const photos = property?.photos;
  if (!Array.isArray(photos)) return null;
  const photo = photos.find((item) => item?.isPrimary === true && item?.url);
  return photo ?? null;
}

// Meaningful alt text for a property photo.
function photoAlt(photo, property) {
  return photo?.caption || `${property?.title ?? "Property"} photo`;
}

// Mobile comparison card. Photos are optional and collapsed by default; when a
// primary photo exists a "Show Photo" / "Hide Photo" toggle reveals it. Cards
// with no primary photo render no photo area at all.
function CompareCard({ property }) {
  const photo = primaryPhoto(property);
  const [showPhoto, setShowPhoto] = useState(false);

  const photoWrapId = photo ? `compare-photo-${property._id}` : undefined;

  return (
    <section className="compare-card">
      <header className="compare-card__header">
        <div className="compare-card__heading">
          <h2 className="compare-card__title">{property.title}</h2>
          {locationText(property) && (
            <p className="compare-card__place">{locationText(property)}</p>
          )}
        </div>

        {photo && (
          <button
            type="button"
            className="compare-photo-toggle"
            aria-expanded={showPhoto}
            aria-controls={photoWrapId}
            onClick={() => setShowPhoto((value) => !value)}
          >
            {showPhoto ? "Hide Photo" : "Show Photo"}
          </button>
        )}
      </header>

      {photo && (
        <div className="compare-card__photo-wrap" id={photoWrapId}>
          {showPhoto && (
            <img
              className="compare-card__photo"
              src={photo.url}
              alt={photoAlt(photo, property)}
              loading="lazy"
            />
          )}
        </div>
      )}

      <dl className="compare-card__facts">
        {FIELDS.map((field) => (
          <div className="compare-card__row" key={field.key}>
            <dt className="compare-card__label">{field.label}</dt>
            <dd className="compare-card__value">
              {valueOrDash(field.get(property))}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

// Compare screen. Reads ids from the URL, loads current property data and shows
// a comparison. Mobile-first: a stacked layout on small screens, a side-by-side
// table on wider screens.
function ComparePage() {
  const [searchParams] = useSearchParams();
  const idsParam = searchParams.get("ids");
  const requestedIds = parseIds(idsParam);

  const withinRange =
    requestedIds.length >= MIN_COMPARE && requestedIds.length <= MAX_COMPARE;

  const [properties, setProperties] = useState([]);
  // status: "loading" | "success" | "error"
  const [status, setStatus] = useState(withinRange ? "loading" : "success");
  const [error, setError] = useState(false);

  const loadProperties = useCallback(async () => {
    setStatus("loading");
    setError(false);

    try {
      const data = await getProperties();
      setProperties(data);
      setStatus("success");
    } catch {
      setError(true);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (withinRange) {
      loadProperties();
    }
    // Fetch once on mount; ids come from the URL and do not change without a
    // full navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadProperties]);

  // Resolve requested ids against current data, preserving URL order and
  // ignoring ids whose property no longer exists (stale).
  const byId = new Map(properties.map((property) => [property._id, property]));
  const compared = requestedIds
    .map((id) => byId.get(id))
    .filter(Boolean);

  const tooFewSelected = !withinRange || compared.length < MIN_COMPARE;
  const anyPrimaryPhoto = compared.some((property) => primaryPhoto(property));

  return (
    <main className="app">
      <Link className="back-link" to="/shortlist">
        ← Back to Shortlist
      </Link>

      <header className="page-header">
        <h1>Compare Properties</h1>
        {!tooFewSelected && status === "success" && (
          <p>Comparing {compared.length} properties</p>
        )}
      </header>

      {status === "loading" && (
        <p className="state-message">Loading properties to compare…</p>
      )}

      {status === "error" && (
        <div className="state-message state-message--error" role="alert">
          <p>Unable to load properties for comparison.</p>
          <button type="button" className="retry-button" onClick={loadProperties}>
            Retry
          </button>
        </div>
      )}

      {status !== "loading" && status !== "error" && tooFewSelected && (
        <div className="state-message">
          <p>Select 2 or 3 properties to compare.</p>
          <p>
            Some of the selected properties may no longer be available.
          </p>
          <Link className="button-link" to="/shortlist">
            Back to Shortlist
          </Link>
        </div>
      )}

      {status === "success" && !tooFewSelected && (
        <>
          {/* Mobile: stacked, one card per property (no horizontal scroll). */}
          <div className="compare-cards">
            {compared.map((property) => (
              <CompareCard key={property._id} property={property} />
            ))}
          </div>

          {/* Desktop: side-by-side comparison table. */}
          <div className="compare-table-wrap">
            <table className="compare-table">
              <caption className="visually-hidden">
                Comparison of selected properties
              </caption>
              <thead>
                <tr>
                  <th scope="col">Property</th>
                  {compared.map((property) => (
                    <th scope="col" key={property._id}>
                      {property.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {anyPrimaryPhoto && (
                  <tr>
                    <th scope="row">Photo</th>
                    {compared.map((property) => {
                      const photo = primaryPhoto(property);
                      return (
                        <td key={property._id}>
                          {photo && (
                            <img
                              className="compare-table__photo"
                              src={photo.url}
                              alt={photoAlt(photo, property)}
                              loading="lazy"
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                )}
                {FIELDS.map((field) => (
                  <tr key={field.key}>
                    <th scope="row">{field.label}</th>
                    {compared.map((property) => (
                      <td key={property._id}>{valueOrDash(field.get(property))}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}

export default ComparePage;
