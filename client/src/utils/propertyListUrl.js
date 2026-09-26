// Builds a Property List URL from discovery constraints.
//
// This is the single place that turns a (location, budget) choice into the
// existing `/properties` query parameters, so the discovery pages never
// duplicate query-string construction.
//
// - locationId alone            -> ?location=<id>
// - budget alone                -> ?budgetMin=<min>[&budgetMax=<max>]
// - location + budget           -> ?location=<id>&budgetMin=<min>[&budgetMax=<max>]
// - neither                     -> /properties (Explore All)
//
// `budget` is a BUDGET_OPTIONS entry ({ budgetMin, budgetMax? }).
export function buildPropertyListUrl({ locationId, budget } = {}) {
  const params = new URLSearchParams();

  if (locationId) {
    params.set("location", locationId);
  }

  if (budget) {
    params.set("budgetMin", String(budget.budgetMin));
    if (budget.budgetMax != null) {
      params.set("budgetMax", String(budget.budgetMax));
    }
  }

  const query = params.toString();
  return query ? `/properties?${query}` : "/properties";
}
