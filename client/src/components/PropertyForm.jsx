import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLocations } from "../api/locations.js";
import { getBrokers } from "../api/brokers.js";
import { PROPERTY_TYPE_OPTIONS, BHK_OPTIONS, FURNISHING_OPTIONS, POSSESSION_OPTIONS } from "../constants/propertyFilterOptions.js";
import {
  PRICE_TYPE_OPTIONS,
  AREA_UNIT_OPTIONS,
  AVAILABILITY_OPTIONS,
  FACING_OPTIONS,
  SOURCE_TYPE_OPTIONS,
} from "../constants/propertyFormOptions.js";

// Human-readable broker label: "Name — Business Name" or just "Name".
function brokerLabel(broker) {
  return broker.businessName ? `${broker.name} — ${broker.businessName}` : broker.name;
}

const EMPTY = {
  title: "",
  propertyType: "",
  locationId: "",
  priceAmount: "",
  priceType: "fixed",
  area: "",
  areaUnit: "sqft",
  bhk: "",
  availability: "available",
  possessionStatus: "ready_to_move",
  furnishing: "unfurnished",
  facing: "unknown",
  sourceType: "owner",
  brokerId: "",
};

// Shared internal property form (Add / Edit). Owns option loading (locations +
// brokers) and field validation; the parent owns the API call via onSubmit.
//
// `initialValues` may include `sourceBrokerId` (the stored raw broker id) and
// `sourceBrokerMissing` to preserve a deleted-broker reference.
function PropertyForm({ initialValues, submitLabel, onSubmit, cancelHref }) {
  const [values, setValues] = useState({ ...EMPTY, ...initialValues });

  const [locations, setLocations] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [optionsStatus, setOptionsStatus] = useState("loading"); // loading | success | error

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setOptionsStatus("loading");
      try {
        const [locationList, brokerList] = await Promise.all([
          getLocations(),
          getBrokers(),
        ]);
        if (!active) return;
        setLocations(locationList);
        setBrokers(brokerList);
        setOptionsStatus("success");
      } catch {
        if (!active) return;
        setOptionsStatus("error");
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const update = (key) => (event) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = {};
    if (!values.title.trim()) errors.title = "Title is required.";
    if (!values.propertyType) errors.propertyType = "Property type is required.";
    if (!values.locationId) errors.locationId = "Location is required.";
    if (String(values.priceAmount).trim() === "") {
      errors.priceAmount = "Price amount is required.";
    } else if (!Number.isFinite(Number(values.priceAmount))) {
      errors.priceAmount = "Price amount must be a number.";
    }
    if (!values.priceType) errors.priceType = "Price type is required.";
    if (String(values.area).trim() === "") {
      errors.area = "Area is required.";
    } else if (!Number.isFinite(Number(values.area))) {
      errors.area = "Area must be a number.";
    }
    if (!values.areaUnit) errors.areaUnit = "Area unit is required.";
    if (!values.availability) errors.availability = "Availability is required.";
    if (!values.possessionStatus) errors.possessionStatus = "Possession is required.";
    if (!values.furnishing) errors.furnishing = "Furnishing is required.";
    if (!values.facing) errors.facing = "Facing is required.";
    if (!values.sourceType) errors.sourceType = "Source type is required.";
    if (values.sourceType === "broker" && !values.brokerId) {
      errors.brokerId = "A broker must be selected.";
    }

    setFieldErrors(errors);
    setSubmitError(null);
    if (Object.keys(errors).length > 0) return;

    // When the source is not a broker, brokerId is explicitly cleared.
    const source =
      values.sourceType === "broker"
        ? { sourceType: "broker", brokerId: values.brokerId }
        : { sourceType: values.sourceType, brokerId: null };

    const payload = {
      title: values.title.trim(),
      propertyType: values.propertyType,
      locationId: values.locationId,
      price: { amount: Number(values.priceAmount), type: values.priceType },
      area: Number(values.area),
      areaUnit: values.areaUnit,
      bhk: values.bhk === "" ? null : Number(values.bhk),
      availability: values.availability,
      possession: { status: values.possessionStatus },
      details: { furnishing: values.furnishing, facing: values.facing },
      source,
    };

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (error) {
      setSubmitError(error.message || "Unable to save property.");
      setSubmitting(false);
    }
  };

  if (optionsStatus === "loading") {
    return <p className="state-message">Loading form options…</p>;
  }

  if (optionsStatus === "error") {
    return (
      <div className="state-message state-message--error" role="alert">
        <p>Unable to load locations/brokers. Please try again.</p>
      </div>
    );
  }

  // Preserve a stored broker that no longer exists (deleted from the directory)
  // so editing does not silently lose the reference.
  const brokerOptions = brokers.map((broker) => ({
    value: broker._id,
    label: brokerLabel(broker),
  }));
  if (
    values.sourceType === "broker" &&
    values.brokerId &&
    !brokerOptions.some((option) => option.value === values.brokerId)
  ) {
    brokerOptions.unshift({
      value: values.brokerId,
      label: "Broker record unavailable",
    });
  }

  return (
    <form className="filters" onSubmit={handleSubmit} noValidate>
      <div className="filters__grid">
        <label className="filters__field">
          <span className="filters__label">Title *</span>
          <input
            className="filters__control"
            type="text"
            value={values.title}
            onChange={update("title")}
            aria-invalid={Boolean(fieldErrors.title)}
          />
          {fieldErrors.title && (
            <span className="filters__error" role="alert">
              {fieldErrors.title}
            </span>
          )}
        </label>

        <label className="filters__field">
          <span className="filters__label">Property Type *</span>
          <select
            className="filters__control"
            value={values.propertyType}
            onChange={update("propertyType")}
          >
            <option value="">Select…</option>
            {PROPERTY_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldErrors.propertyType && (
            <span className="filters__error" role="alert">
              {fieldErrors.propertyType}
            </span>
          )}
        </label>

        <label className="filters__field">
          <span className="filters__label">Location *</span>
          <select
            className="filters__control"
            value={values.locationId}
            onChange={update("locationId")}
          >
            <option value="">Select…</option>
            {locations.map((location) => (
              <option key={location._id} value={location._id}>
                {[location.name, location.city].filter(Boolean).join(" — ")}
              </option>
            ))}
          </select>
          {fieldErrors.locationId && (
            <span className="filters__error" role="alert">
              {fieldErrors.locationId}
            </span>
          )}
        </label>

        <label className="filters__field">
          <span className="filters__label">Price Amount (₹) *</span>
          <input
            className="filters__control"
            type="number"
            min="0"
            inputMode="numeric"
            value={values.priceAmount}
            onChange={update("priceAmount")}
          />
          {fieldErrors.priceAmount && (
            <span className="filters__error" role="alert">
              {fieldErrors.priceAmount}
            </span>
          )}
        </label>

        <label className="filters__field">
          <span className="filters__label">Price Type *</span>
          <select
            className="filters__control"
            value={values.priceType}
            onChange={update("priceType")}
          >
            {PRICE_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="filters__field">
          <span className="filters__label">Area *</span>
          <input
            className="filters__control"
            type="number"
            min="0"
            inputMode="numeric"
            value={values.area}
            onChange={update("area")}
          />
          {fieldErrors.area && (
            <span className="filters__error" role="alert">
              {fieldErrors.area}
            </span>
          )}
        </label>

        <label className="filters__field">
          <span className="filters__label">Area Unit *</span>
          <select
            className="filters__control"
            value={values.areaUnit}
            onChange={update("areaUnit")}
          >
            {AREA_UNIT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="filters__field">
          <span className="filters__label">BHK</span>
          <select
            className="filters__control"
            value={values.bhk}
            onChange={update("bhk")}
          >
            <option value="">Not specified</option>
            {BHK_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="filters__field">
          <span className="filters__label">Availability *</span>
          <select
            className="filters__control"
            value={values.availability}
            onChange={update("availability")}
          >
            {AVAILABILITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="filters__field">
          <span className="filters__label">Possession *</span>
          <select
            className="filters__control"
            value={values.possessionStatus}
            onChange={update("possessionStatus")}
          >
            {POSSESSION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="filters__field">
          <span className="filters__label">Furnishing *</span>
          <select
            className="filters__control"
            value={values.furnishing}
            onChange={update("furnishing")}
          >
            {FURNISHING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="filters__field">
          <span className="filters__label">Facing *</span>
          <select
            className="filters__control"
            value={values.facing}
            onChange={update("facing")}
          >
            {FACING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="filters__field">
          <span className="filters__label">Source Type *</span>
          <select
            className="filters__control"
            value={values.sourceType}
            onChange={update("sourceType")}
          >
            {SOURCE_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {values.sourceType === "broker" && (
          <label className="filters__field">
            <span className="filters__label">Broker *</span>
            <select
              className="filters__control"
              value={values.brokerId}
              onChange={update("brokerId")}
              aria-invalid={Boolean(fieldErrors.brokerId)}
            >
              <option value="">Select…</option>
              {brokerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldErrors.brokerId && (
              <span className="filters__error" role="alert">
                {fieldErrors.brokerId}
              </span>
            )}
          </label>
        )}
      </div>

      {submitError && (
        <p className="state-message state-message--error" role="alert">
          {submitError}
        </p>
      )}

      <div className="filters__actions">
        <button type="submit" className="button-primary" disabled={submitting}>
          {submitting ? "Saving…" : submitLabel}
        </button>
        <Link className="button-secondary" to={cancelHref}>
          Cancel
        </Link>
      </div>
    </form>
  );
}

export default PropertyForm;
