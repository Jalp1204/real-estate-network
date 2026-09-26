import { Link } from "react-router-dom";
import { BUDGET_OPTIONS } from "../constants/budgetOptions.js";

// Builds the property-list link for a budget option. The final "1 Crore+"
// option only sets budgetMin (meaning "and above").
function budgetLink(option) {
  const params = new URLSearchParams();
  params.set("budgetMin", String(option.budgetMin));
  if (option.budgetMax != null) {
    params.set("budgetMax", String(option.budgetMax));
  }
  return `/properties?${params.toString()}`;
}

// Budget discovery screen. Lists price ranges; each links to the property list
// filtered by budget.
function BudgetListPage() {
  return (
    <main className="app">
      <Link className="back-link" to="/">
        ← Home
      </Link>

      <header className="page-header">
        <h1>Budget</h1>
        <p>Choose a budget range to browse matching properties.</p>
      </header>

      <div className="budget-grid">
        {BUDGET_OPTIONS.map((option) => (
          <Link key={option.id} className="budget-card" to={budgetLink(option)}>
            <span className="budget-card__label">{option.label}</span>
            <span className="budget-card__hint">{option.hint}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}

export default BudgetListPage;
