import { Link } from "react-router-dom";
import { BUDGET_OPTIONS } from "../constants/budgetOptions.js";
import BudgetCard from "../components/BudgetCard.jsx";

// Budget discovery screen (step 1 of "Search by Budget"). Lists price ranges;
// selecting one continues to the location step for that budget.
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
          <BudgetCard key={option.id} option={option} to={`/budget/${option.id}`} />
        ))}
      </div>
    </main>
  );
}

export default BudgetListPage;
