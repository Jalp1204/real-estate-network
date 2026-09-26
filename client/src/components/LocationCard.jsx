import { Link } from "react-router-dom";

// Neutral placeholder shown when a location has no cover image, so we never
// render a broken image. Uses the location's initials as the visual.
function initials(name) {
  if (!name || typeof name !== "string") return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

// Presentational card for a single location in the discovery list.
// `to` is the target URL chosen by the caller (the discovery flow decides where
// selecting a location should lead).
function LocationCard({ location, to }) {
  const propertyCount =
    typeof location?.propertyCount === "number" ? location.propertyCount : 0;
  const cityState = [location?.city, location?.state].filter(Boolean).join(", ");

  return (
    <article className="location-card">
      <div className="location-card__media">
        {location?.coverImage ? (
          <img
            className="location-card__image"
            src={location.coverImage}
            alt={location?.name ?? "Location"}
            loading="lazy"
          />
        ) : (
          <div className="location-card__placeholder" aria-hidden="true">
            {initials(location?.name)}
          </div>
        )}
      </div>

      <div className="location-card__body">
        <h2 className="location-card__name">{location?.name}</h2>
        {cityState && <p className="location-card__place">{cityState}</p>}

        <p className="location-card__count">
          {propertyCount} available{" "}
          {propertyCount === 1 ? "property" : "properties"}
        </p>

        {location?.description && (
          <p className="location-card__description">{location.description}</p>
        )}

        <Link className="button-link" to={to}>
          View Properties
        </Link>
      </div>
    </article>
  );
}

export default LocationCard;
