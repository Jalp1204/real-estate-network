import { Link } from "react-router-dom";

// Presentational budget-range card, reused by the budget discovery and the
// location -> budget step. `to` is the target property-list URL.
function BudgetCard({ option, to }) {
  return (
    <Link className="budget-card" to={to}>
      <span className="budget-card__label">{option.label}</span>
      <span className="budget-card__hint">{option.hint}</span>
    </Link>
  );
}

export default BudgetCard;
