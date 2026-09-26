import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getLocations } from "../api/locations.js";
import { BUDGET_OPTIONS } from "../constants/budgetOptions.js";
import LocationCard from "../components/LocationCard.jsx";
import { buildPropertyListUrl } from "../utils/propertyListUrl.js";

// Step 2 of "Search by Budget": a budget has been chosen, now choose a location.
// Users may still skip location and view all properties in the budget.
// The page only constructs `/properties` URLs; PropertyListPage does the rest.
function BudgetLocationPage() {
  const { budgetId } = useParams();
  const option = BUDGET_OPTIONS.find((item) => item.id === budgetId) ?? null;

  const [locations, setLocations] = useState([]);
  // status: "loading" | "success" | "error"
  const [status, setStatus] = useState("loading");

  const loadLocations = useCallback(async () => {
    setStatus("loading");

    try {
      const data = await getLocations();
      setLocations(data);
      setStatus("success");
    } catch {
      setLocations([]);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (option) {
      loadLocations();
    }
  }, [option, loadLocations]);

  return (
    <main className="app">
      <Link className="back-link" to="/budget">
        ← Budget
      </Link>

      {!option && <p className="state-message">Budget range not found.</p>}

      {option && status === "loading" && <p className="state-message">Loading…</p>}

      {option && status === "error" && (
        <div className="state-message state-message--error" role="alert">
          <p>Unable to load locations.</p>
          <button type="button" className="retry-button" onClick={loadLocations}>
            Retry
          </button>
        </div>
      )}

      {option && status === "success" && (
        <>
          <header className="page-header">
            <h1>{option.label}</h1>
            <p>Choose a location.</p>
          </header>

          <Link
            className="button-link button-link--secondary view-all-link"
            to={buildPropertyListUrl({ budget: option })}
          >
            View All Properties in {option.label}
          </Link>

          {locations.length === 0 ? (
            <p className="state-message">No locations available yet.</p>
          ) : (
            <div className="location-grid">
              {locations.map((location) => (
                <LocationCard
                  key={location._id}
                  location={location}
                  to={buildPropertyListUrl({
                    budget: option,
                    locationId: location._id,
                  })}
                />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default BudgetLocationPage;
