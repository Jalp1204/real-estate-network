import { useState } from "react";
import { Link } from "react-router-dom";
import { BROKER_STATUS_OPTIONS } from "../constants/brokerOptions.js";

// V1 broker phone: exactly 10 digits, starting with 6, 7, 8 or 9.
const PHONE_PATTERN = /^[6-9][0-9]{9}$/;

// Reusable broker form used by both Add Broker and Edit Broker.
// Presentational + local validation; the parent owns the API call via onSubmit.
function BrokerForm({ initialValues = {}, submitLabel, onSubmit, cancelHref }) {
  const [values, setValues] = useState({
    name: "",
    phone: "",
    businessName: "",
    location: "",
    registration: "",
    status: "active",
    notes: "",
    ...initialValues,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const update = (key) => (event) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedPhone = values.phone.trim();

    const errors = {};
    if (!values.name.trim()) errors.name = "Name is required.";
    if (!trimmedPhone) {
      errors.phone = "Phone is required.";
    } else if (!PHONE_PATTERN.test(trimmedPhone)) {
      errors.phone =
        "Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.";
    }
    if (!values.status) errors.status = "Status is required.";
    setFieldErrors(errors);
    setSubmitError(null);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name: values.name.trim(),
        phone: trimmedPhone,
        businessName: values.businessName,
        location: values.location,
        registration: values.registration,
        status: values.status,
        notes: values.notes,
      });
    } catch (error) {
      setSubmitError(error.message || "Unable to save broker.");
      setSubmitting(false);
    }
  };

  return (
    <form className="filters" onSubmit={handleSubmit} noValidate>
      <div className="filters__grid">
        <label className="filters__field">
          <span className="filters__label">Name *</span>
          <input
            className="filters__control"
            type="text"
            value={values.name}
            onChange={update("name")}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "broker-name-error" : undefined}
          />
          {fieldErrors.name && (
            <span className="filters__error" id="broker-name-error" role="alert">
              {fieldErrors.name}
            </span>
          )}
        </label>

        <label className="filters__field">
          <span className="filters__label">Phone *</span>
          <input
            className="filters__control"
            type="tel"
            inputMode="numeric"
            value={values.phone}
            onChange={update("phone")}
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={fieldErrors.phone ? "broker-phone-error" : undefined}
          />
          {fieldErrors.phone && (
            <span className="filters__error" id="broker-phone-error" role="alert">
              {fieldErrors.phone}
            </span>
          )}
        </label>

        <label className="filters__field">
          <span className="filters__label">Business Name</span>
          <input
            className="filters__control"
            type="text"
            value={values.businessName}
            onChange={update("businessName")}
          />
        </label>

        <label className="filters__field">
          <span className="filters__label">Location</span>
          <input
            className="filters__control"
            type="text"
            value={values.location}
            onChange={update("location")}
          />
        </label>

        <label className="filters__field">
          <span className="filters__label">Registration</span>
          <input
            className="filters__control"
            type="text"
            value={values.registration}
            onChange={update("registration")}
          />
        </label>

        <label className="filters__field">
          <span className="filters__label">Status *</span>
          <select
            className="filters__control"
            value={values.status}
            onChange={update("status")}
            aria-invalid={Boolean(fieldErrors.status)}
          >
            {BROKER_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldErrors.status && (
            <span className="filters__error" role="alert">
              {fieldErrors.status}
            </span>
          )}
        </label>
      </div>

      <label className="filters__field">
        <span className="filters__label">Notes</span>
        <textarea
          className="filters__control"
          rows={3}
          value={values.notes}
          onChange={update("notes")}
        />
      </label>

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

export default BrokerForm;
