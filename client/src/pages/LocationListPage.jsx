import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLocations } from "../api/locations.js";
import LocationCard from "../components/LocationCard.jsx";

// Location discovery screen (step 1 of "Search by Location"). Lists active
// locations; selecting one continues to the budget step for that location.
function LocationListPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadLocations = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const data = await getLocations();
      setLocations(data);
    } catch {
      // Details are not shown to the user; the error state offers a retry.
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  return (
    <main className="app">
      <Link className="back-link" to="/">
        ← Home
      </Link>

      <header className="page-header">
        <h1>Locations</h1>
        <p>Choose an area to browse its properties.</p>
      </header>

      {loading && <p className="state-message">Loading locations…</p>}

      {!loading && error && (
        <div className="state-message state-message--error" role="alert">
          <p>Unable to load locations.</p>
          <button type="button" className="retry-button" onClick={loadLocations}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && locations.length === 0 && (
        <p className="state-message">No locations available yet.</p>
      )}

      {!loading && !error && locations.length > 0 && (
        <div className="location-grid">
          {locations.map((location) => (
            <LocationCard
              key={location._id}
              location={location}
              to={`/locations/${location._id}`}
            />
          ))}
        </div>
      )}
    </main>
  );
}

export default LocationListPage;
