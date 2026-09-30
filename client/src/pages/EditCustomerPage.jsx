import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCustomerById, updateCustomer } from "../api/customers.js";

// V1 customer phone: exactly 10 digits, starting with 6, 7, 8 or 9.
const PHONE_PATTERN = /^[6-9][0-9]{9}$/;

// Edit customer screen (private/internal area). Edits only the V1 customer
// basic information (name + phone); requirements and interested properties are
// managed elsewhere and are left untouched.
function EditCustomerPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // status: "loading" | "success" | "not_found" | "error"
  const [status, setStatus] = useState("loading");
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const loadCustomer = useCallback(async () => {
    setStatus("loading");

    try {
      const customer = await getCustomerById(id);
      setName(customer.name ?? "");
      setPhone(customer.phone ?? "");
      setStatus("success");
    } catch (error) {
      setStatus(error?.code === "NOT_FOUND" ? "not_found" : "error");
    }
  }, [id]);

  useEffect(() => {
    loadCustomer();
  }, [loadCustomer]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    const errors = {};
    if (!trimmedName) errors.name = "Name is required.";
    if (!trimmedPhone) {
      errors.phone = "Phone is required.";
    } else if (!PHONE_PATTERN.test(trimmedPhone)) {
      errors.phone =
        "Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.";
    }
    setFieldErrors(errors);
    setSaveError(null);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setSaving(true);
    try {
      await updateCustomer(id, { name: trimmedName, phone: trimmedPhone });
      // Return to the details view; it reloads the customer on mount so the
      // updated information is shown immediately (no manual refresh).
      navigate(`/customers/${id}`);
    } catch (error) {
      setSaveError(error.message || "Unable to update customer.");
      setSaving(false);
    }
  };

  return (
    <main className="app">
      <Link className="back-link" to={`/customers/${id}`}>
        ← Customer
      </Link>

      <header className="page-header">
        <h1>Edit Customer</h1>
        <p>Update the customer's basic information.</p>
      </header>

      {status === "loading" && (
        <p className="state-message">Loading customer…</p>
      )}

      {status === "not_found" && (
        <p className="state-message">Customer not found.</p>
      )}

      {status === "error" && (
        <div className="state-message state-message--error" role="alert">
          <p>Unable to load this customer.</p>
          <button type="button" className="retry-button" onClick={loadCustomer}>
            Retry
          </button>
        </div>
      )}

      {status === "success" && (
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
                aria-describedby={
                  fieldErrors.name ? "customer-name-error" : undefined
                }
              />
              {fieldErrors.name && (
                <span
                  className="filters__error"
                  id="customer-name-error"
                  role="alert"
                >
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
                aria-describedby={
                  fieldErrors.phone ? "customer-phone-error" : undefined
                }
              />
              {fieldErrors.phone && (
                <span
                  className="filters__error"
                  id="customer-phone-error"
                  role="alert"
                >
                  {fieldErrors.phone}
                </span>
              )}
            </label>
          </div>

          {saveError && (
            <p className="state-message state-message--error" role="alert">
              {saveError}
            </p>
          )}

          <div className="filters__actions">
            <button type="submit" className="button-primary" disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <Link className="button-secondary" to={`/customers/${id}`}>
              Cancel
            </Link>
          </div>
        </form>
      )}
    </main>
  );
}

export default EditCustomerPage;
