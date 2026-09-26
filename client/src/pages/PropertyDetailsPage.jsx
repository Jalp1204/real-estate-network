import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPropertyById } from "../api/properties.js";
import PropertyGallery from "../components/PropertyGallery.jsx";
import PropertyFacts from "../components/PropertyFacts.jsx";
import PropertyChips from "../components/PropertyChips.jsx";
import { humanize, formatNumber, formatDate } from "../utils/format.js";

// Property details screen.
// Fetches a single property by id and renders loading / success / not-found /
// error states. Only customer-safe fields are displayed.
function PropertyDetailsPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  // status: "loading" | "success" | "not_found" | "error"
  const [status, setStatus] = useState("loading");

  const loadProperty = useCallback(async () => {
    setStatus("loading");

    try {
      const data = await getPropertyById(id);
      setProperty(data);
      setStatus("success");
    } catch (error) {
      setProperty(null);
      setStatus(error?.code === "NOT_FOUND" ? "not_found" : "error");
    }
  }, [id]);

  useEffect(() => {
    loadProperty();
  }, [loadProperty]);

  return (
    <main className="app">
      <Link className="back-link" to="/properties">
        ← Back to properties
      </Link>

      {status === "loading" && (
        <p className="state-message">Loading property…</p>
      )}

      {status === "not_found" && (
        <p className="state-message">Property not found.</p>
      )}

      {status === "error" && (
        <div className="state-message state-message--error" role="alert">
          <p>Unable to load this property.</p>
          <button type="button" className="retry-button" onClick={loadProperty}>
            Retry
          </button>
        </div>
      )}

      {status === "success" && property && <PropertyDetails property={property} />}
    </main>
  );
}

// Presentational body of the details screen, given a loaded property.
function PropertyDetails({ property }) {
  const location = property?.locationId;
  const details = property?.details ?? {};
  const possession = property?.possession ?? {};
  const verification = property?.verification ?? {};

  const price = property?.price ?? {};
  const formattedAmount = formatNumber(price.amount);
  const priceType = humanize(price.type);
  const availability = humanize(property?.availability);

  const locationName =
    location && typeof location === "object" ? location.name : null;
  const city = location && typeof location === "object" ? location.city : null;

  const bhk = typeof property?.bhk === "number" ? `${property.bhk} BHK` : null;
  const formattedArea = formatNumber(property?.area);
  const area = formattedArea
    ? `${formattedArea} ${property?.areaUnit ?? ""}`.trim()
    : null;

  const verificationStatus = humanize(verification.status);
  const lastUpdated = formatDate(property?.updatedAt);

  const facts = [
    { label: "Property Type", value: humanize(property?.propertyType) },
    { label: "BHK", value: bhk },
    { label: "Area", value: area },
    {
      label: "Floor",
      value: details.floor != null ? formatNumber(details.floor) : null,
    },
    {
      label: "Total Floors",
      value: details.totalFloors != null ? formatNumber(details.totalFloors) : null,
    },
    {
      label: "Parking",
      value: details.parking != null ? formatNumber(details.parking) : null,
    },
    { label: "Furnishing", value: humanize(details.furnishing) },
    { label: "Facing", value: humanize(details.facing) },
    {
      label: "Property Age",
      value: details.propertyAge != null ? formatNumber(details.propertyAge) : null,
    },
    { label: "Possession", value: humanize(possession.status) },
    {
      label: "Possession Date",
      value: possession.date ? formatDate(possession.date) : null,
    },
  ];

  return (
    <article className="details">
      <header className="details__header">
        <div className="details__headline">
          <h1>{property?.title}</h1>
          {availability && (
            <span className="property-card__badge">{availability}</span>
          )}
        </div>

        {formattedAmount && (
          <p className="details__price">
            ₹{formattedAmount}
            {priceType && <span className="details__price-type"> · {priceType}</span>}
          </p>
        )}

        {(locationName || city) && (
          <p className="details__location">
            {[locationName, city].filter(Boolean).join(", ")}
          </p>
        )}
      </header>

      <PropertyGallery photos={property?.photos} title={property?.title} />

      <section className="details__section">
        <h2>Overview</h2>
        <PropertyFacts facts={facts} />
      </section>

      <section className="details__section">
        <h2>Amenities</h2>
        {Array.isArray(property?.amenities) && property.amenities.length > 0 ? (
          <PropertyChips items={property.amenities} />
        ) : (
          <p className="details__muted">No amenities listed.</p>
        )}
      </section>

      <section className="details__section">
        <h2>Specialities</h2>
        {Array.isArray(property?.specialities) && property.specialities.length > 0 ? (
          <PropertyChips items={property.specialities} />
        ) : (
          <p className="details__muted">No specialities listed.</p>
        )}
      </section>

      <section className="details__section">
        <h2>Verification</h2>
        <p>{verificationStatus ?? "Not checked"}</p>
        <p className="details__note">
          Verification information is informational only and is not a legal
          certification.
        </p>
      </section>

      {lastUpdated && (
        <p className="details__updated">Last updated {lastUpdated}</p>
      )}
    </article>
  );
}

export default PropertyDetailsPage;
