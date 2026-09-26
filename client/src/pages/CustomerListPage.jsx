import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCustomers } from "../api/customers.js";

// Customer list screen (private/internal area).
//
// Lists customers (name + phone) newest first with an optional name/phone
// search. Interested-property counts are intentionally NOT shown: there is no
// existing API relationship to derive them from in this slice.
function CustomerListPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const loadCustomers = useCallback(async (search) => {
    setLoading(true);
    setError(false);

    try {
      const data = await getCustomers(search);
      setCustomers(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers(appliedSearch);
  }, [loadCustomers, appliedSearch]);

  const handleSearch = (event) => {
    event.preventDefault();
    setAppliedSearch(searchInput.trim());
  };

  const handleClear = () => {
    setSearchInput("");
    setAppliedSearch("");
  };

  return (
    <main className="app">
      <Link className="back-link" to="/">
        ← Home
      </Link>

      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Customers</h1>
            <p>Private customer records.</p>
          </div>
          <Link className="button-primary" to="/customers/new">
            Add Customer
          </Link>
        </div>
      </header>

      <form className="search-form" role="search" onSubmit={handleSearch}>
        <input
          className="filters__control"
          type="search"
          placeholder="Search by name or phone"
          aria-label="Search customers by name or phone"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        <button type="submit" className="button-primary">
          Search
        </button>
        {appliedSearch && (
          <button type="button" className="button-secondary" onClick={handleClear}>
            Clear
          </button>
        )}
      </form>

      {loading && <p className="state-message">Loading customers…</p>}

      {!loading && error && (
        <div className="state-message state-message--error" role="alert">
          <p>Unable to load customers.</p>
          <button
            type="button"
            className="retry-button"
            onClick={() => loadCustomers(appliedSearch)}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && customers.length === 0 && (
        <div className="state-message">
          {appliedSearch ? (
            <p>No customers match your search.</p>
          ) : (
            <>
              <p>No customers yet.</p>
              <Link className="button-link" to="/customers/new">
                Add Customer
              </Link>
            </>
          )}
        </div>
      )}

      {!loading && !error && customers.length > 0 && (
        <div className="customer-list">
          {customers.map((customer) => (
            <Link
              className="customer-card"
              key={customer._id}
              to={`/customers/${customer._id}`}
            >
              <div className="customer-card__main">
                <span className="customer-card__name">{customer.name}</span>
                <span className="customer-card__phone">{customer.phone}</span>
              </div>
              <span className="customer-card__chevron" aria-hidden="true">
                ›
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

export default CustomerListPage;
