// Budget discovery options.
//
// Each option maps to the property-list query it opens:
//   /properties?budgetMin=<budgetMin>[&budgetMax=<budgetMax>]
//
// The final "1 Crore+" option intentionally has no `budgetMax` because it means
// "₹80 Lakh and above", not a capped range.
export const BUDGET_OPTIONS = [
  { id: "20-30", label: "₹20–30 Lakh", hint: "₹20 Lakh to ₹30 Lakh", budgetMin: 2000000, budgetMax: 3000000 },
  { id: "30-40", label: "₹30–40 Lakh", hint: "₹30 Lakh to ₹40 Lakh", budgetMin: 3000000, budgetMax: 4000000 },
  { id: "40-60", label: "₹40–60 Lakh", hint: "₹40 Lakh to ₹60 Lakh", budgetMin: 4000000, budgetMax: 6000000 },
  { id: "60-80", label: "₹60–80 Lakh", hint: "₹60 Lakh to ₹80 Lakh", budgetMin: 6000000, budgetMax: 8000000 },
  { id: "80-plus", label: "₹80 Lakh–1 Crore+", hint: "₹80 Lakh and above", budgetMin: 8000000 },
];
