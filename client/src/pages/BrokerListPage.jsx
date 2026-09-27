import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBrokers } from "../api/brokers.js";
import { brokerStatusLabel } from "../constants/brokerOptions.js";

// Broker Directory list (private/internal area).
// Lists brokers newest-first with an optional name/phone/business/location
// search. Shows only a few identifying fields per card.
function BrokerListPage() {
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const loadBrokers = useCallback(async (search) => {
    setLoading(true);
    setError(false);

    try {
      const data = await getBrokers(search);
      setBrokers(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBrokers(appliedSearch);
  }, [loadBrokers, appliedSearch]);

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
            <h1>Brokers</h1>
            <p>Private broker directory.</p>
          </div>
          <Link className="button-primary" to="/brokers/new">
            Add Broker
          </Link>
        </div>
      </header>

      <form className="search-form" role="search" onSubmit={handleSearch}>
        <input
          className="filters__control"
          type="search"
          placeholder="Search by name, phone, business or location"
          aria-label="Search brokers by name, phone, business name or location"
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

      {loading && <p className="state-message">Loading brokers…</p>}

      {!loading && error && (
        <div className="state-message state-message--error" role="alert">
          <p>Unable to load brokers.</p>
          <button
            type="button"
            className="retry-button"
            onClick={() => loadBrokers(appliedSearch)}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && brokers.length === 0 && (
        <div className="state-message">
          {appliedSearch ? (
            <p>No brokers match your search.</p>
          ) : (
            <>
              <p>No brokers yet.</p>
              <Link className="button-link" to="/brokers/new">
                Add Broker
              </Link>
            </>
          )}
        </div>
      )}

      {!loading && !error && brokers.length > 0 && (
        <div className="customer-list">
          {brokers.map((broker) => (
            <Link
              className="customer-card"
              key={broker._id}
              to={`/brokers/${broker._id}`}
            >
              <div className="customer-card__main">
                <span className="customer-card__name">{broker.name}</span>
                {broker.businessName && (
                  <span className="broker-card__meta">{broker.businessName}</span>
                )}
                {broker.location && (
                  <span className="broker-card__meta">{broker.location}</span>
                )}
                <span className="broker-card__meta">{broker.phone}</span>
              </div>
              <span className="property-card__badge">
                {brokerStatusLabel(broker.status)}
              </span>
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

export default BrokerListPage;
