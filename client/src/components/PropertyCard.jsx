import { Link } from "react-router-dom";
import { humanize, formatNumber } from "../utils/format.js";
import ShortlistButton from "./ShortlistButton.jsx";

// Card for a single property in the list.
//
// The main content links to the property details screen; the shortlist control
// is a separate real <button> (not nested inside the link) so both remain
// accessible and independently operable.
//
// `actions` is an optional extra control rendered next to the shortlist button
// (used by the shortlist page to add compare selection). It defaults to null so
// other usages are unchanged.
//
// Shows only customer-safe, list-relevant information. Internal data
// (broker details, internal notes, verification notes, trust score, IDs) is
// deliberately never rendered.
//
// Missing/nullable data is handled gracefully: sections are simply omitted.
function PropertyCard({ property, actions = null }) {
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
      <Link className="property-card-link" to={`/properties/${property?._id}`}>
        <div className="property-card__top">
          <h2 className="property-card__title">{property?.title}</h2>
          {availability && (
            <span className="property-card__badge">{availability}</span>
          )}
        </div>

        {formattedAmount && (
          <p className="property-card__price">
            ₹{formattedAmount}
            {priceType && (
              <span className="property-card__price-type"> · {priceType}</span>
            )}
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

        {possession && <p className="property-card__possession">{possession}</p>}
      </Link>

      <div className="property-card__actions">
        <ShortlistButton propertyId={property?._id} />
        {actions}
      </div>
    </article>
  );
}

export default PropertyCard;
