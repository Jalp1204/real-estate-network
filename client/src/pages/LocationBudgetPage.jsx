import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getLocations } from "../api/locations.js";
import { BUDGET_OPTIONS } from "../constants/budgetOptions.js";
import BudgetCard from "../components/BudgetCard.jsx";
import { buildPropertyListUrl } from "../utils/propertyListUrl.js";

// Step 2 of "Search by Location": a location has been chosen, now choose a
// budget. Users may still skip budget and view all properties in the location.
// The page only constructs `/properties` URLs; PropertyListPage does the rest.
function LocationBudgetPage() {
  const { locationId } = useParams();

  const [location, setLocation] = useState(null);
  // status: "loading" | "success" | "not_found" | "error"
  const [status, setStatus] = useState("loading");

  const loadLocation = useCallback(async () => {
    setStatus("loading");

    try {
      const locations = await getLocations();
      const match = locations.find((item) => item._id === locationId) ?? null;
      setLocation(match);
      setStatus(match ? "success" : "not_found");
    } catch {
      setLocation(null);
      setStatus("error");
    }
  }, [locationId]);

  useEffect(() => {
    loadLocation();
  }, [loadLocation]);

  return (
    <main className="app">
      <Link className="back-link" to="/locations">
        ← Locations
      </Link>

      {status === "loading" && <p className="state-message">Loading…</p>}

      {status === "not_found" && <p className="state-message">Location not found.</p>}

      {status === "error" && (
        <div className="state-message state-message--error" role="alert">
          <p>Unable to load this location.</p>
          <button type="button" className="retry-button" onClick={loadLocation}>
            Retry
          </button>
        </div>
      )}

      {status === "success" && location && (
        <>
          <header className="page-header">
            <h1>{location.name}</h1>
            <p>
              {[location.city, location.state].filter(Boolean).join(", ")}
              {location.city || location.state ? " · " : ""}
              Choose a budget range.
            </p>
          </header>

          <Link
            className="button-link button-link--secondary view-all-link"
            to={buildPropertyListUrl({ locationId: location._id })}
          >
            View All Properties in {location.name}
          </Link>

          <div className="budget-grid">
            {BUDGET_OPTIONS.map((option) => (
              <BudgetCard
                key={option.id}
                option={option}
                to={buildPropertyListUrl({ locationId: location._id, budget: option })}
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
}

export default LocationBudgetPage;
