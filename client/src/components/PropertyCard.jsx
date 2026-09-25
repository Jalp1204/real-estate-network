// Presentational card for a single property.
//
// Shows only customer-safe, list-relevant information. Internal data
// (broker details, internal notes, verification notes, trust score, IDs) is
// deliberately never rendered.
//
// Missing/nullable data is handled gracefully: sections are simply omitted.

// "ready_to_move" -> "Ready To Move"
function humanize(value) {
  if (!value || typeof value !== "string") return null;
  return value
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// 2500000 -> "25,00,000" (Indian digit grouping)
function formatNumber(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return value.toLocaleString("en-IN");
}

function PropertyCard({ property }) {
  const location = property?.locationId;

  const price = property?.price ?? {};
  const formattedAmount = formatNumber(price.amount);
  const priceType = humanize(price.type);

  const bhk = typeof property?.bhk === "number" ? `${property.bhk} BHK` : null;
  const formattedArea = formatNumber(property?.area);
  const area = formattedArea
    ? `${formattedArea} ${property?.areaUnit ?? ""}`.trim()
    : null;

  const propertyType = humanize(property?.propertyType);
  const availability = humanize(property?.availability);
  const possession = humanize(property?.possession?.status);

  // locationId is populated by the API; fall back safely if it is missing.
  const locationName =
    location && typeof location === "object" ? location.name : null;
  const city = location && typeof location === "object" ? location.city : null;

  const metaItems = [bhk, area, propertyType].filter(Boolean);

  return (
    <article className="property-card">
      <div className="property-card__top">
        <h2 className="property-card__title">{property?.title}</h2>
        {availability && (
          <span className="property-card__badge">{availability}</span>
        )}
      </div>

      {formattedAmount && (
        <p className="property-card__price">
          ₹{formattedAmount}
          {priceType && <span className="property-card__price-type"> · {priceType}</span>}
        </p>
      )}

      {metaItems.length > 0 && (
        <ul className="property-card__meta">
          {metaItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}

      {(locationName || city) && (
        <p className="property-card__location">
          {[locationName, city].filter(Boolean).join(", ")}
        </p>
      )}

      {possession && (
        <p className="property-card__possession">{possession}</p>
      )}
    </article>
  );
}

export default PropertyCard;
