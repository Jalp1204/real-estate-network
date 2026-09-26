import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createCustomer } from "../api/customers.js";

// V1 customer phone: exactly 10 digits, starting with 6, 7, 8 or 9.
const PHONE_PATTERN = /^[6-9][0-9]{9}$/;

// Add customer screen (private/internal area).
// V1 customer = name + phone only.
function AddCustomerPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedPhone = phone.trim();

    const errors = {};
    if (!name.trim()) errors.name = "Name is required.";
    if (!trimmedPhone) {
      errors.phone = "Phone is required.";
    } else if (!PHONE_PATTERN.test(trimmedPhone)) {
      errors.phone =
        "Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.";
    }
    setFieldErrors(errors);
    setSubmitError(null);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      const created = await createCustomer({
        name: name.trim(),
        phone: trimmedPhone,
      });
      navigate(`/customers/${created._id}`);
    } catch (error) {
      setSubmitError(error.message || "Unable to create customer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="app">
      <Link className="back-link" to="/customers">
        ← Customers
      </Link>

      <header className="page-header">
        <h1>Add Customer</h1>
        <p>Create a new private customer record.</p>
      </header>

      <form className="filters" onSubmit={handleSubmit} noValidate>
        <div className="filters__grid">
          <label className="filters__field">
            <span className="filters__label">Name *</span>
            <input
              className="filters__control"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "customer-name-error" : undefined}
            />
            {fieldErrors.name && (
              <span className="filters__error" id="customer-name-error" role="alert">
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
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              aria-invalid={Boolean(fieldErrors.phone)}
              aria-describedby={fieldErrors.phone ? "customer-phone-error" : undefined}
            />
            {fieldErrors.phone && (
              <span className="filters__error" id="customer-phone-error" role="alert">
                {fieldErrors.phone}
              </span>
            )}
          </label>
        </div>

        {submitError && (
          <p className="state-message state-message--error" role="alert">
            {submitError}
          </p>
        )}

        <div className="filters__actions">
          <button type="submit" className="button-primary" disabled={submitting}>
            {submitting ? "Saving…" : "Save Customer"}
          </button>
          <Link className="button-secondary" to="/customers">
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}

export default AddCustomerPage;
