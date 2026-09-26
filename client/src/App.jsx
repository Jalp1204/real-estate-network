import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import LocationListPage from "./pages/LocationListPage.jsx";
import LocationBudgetPage from "./pages/LocationBudgetPage.jsx";
import BudgetListPage from "./pages/BudgetListPage.jsx";
import BudgetLocationPage from "./pages/BudgetLocationPage.jsx";
import PropertyListPage from "./pages/PropertyListPage.jsx";
import PropertyDetailsPage from "./pages/PropertyDetailsPage.jsx";

// Root component of the application.
// Defines the routes; the browser router itself is set up in main.jsx.
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/locations" element={<LocationListPage />} />
      <Route path="/locations/:locationId" element={<LocationBudgetPage />} />
      <Route path="/budget" element={<BudgetListPage />} />
      <Route path="/budget/:budgetId" element={<BudgetLocationPage />} />
      <Route path="/properties" element={<PropertyListPage />} />
      <Route path="/properties/:id" element={<PropertyDetailsPage />} />
    </Routes>
  );
}

export default App;
