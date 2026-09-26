import { Routes, Route } from "react-router-dom";
import AppNav from "./components/AppNav.jsx";
import HomePage from "./pages/HomePage.jsx";
import LocationListPage from "./pages/LocationListPage.jsx";
import LocationBudgetPage from "./pages/LocationBudgetPage.jsx";
import BudgetListPage from "./pages/BudgetListPage.jsx";
import BudgetLocationPage from "./pages/BudgetLocationPage.jsx";
import PropertyListPage from "./pages/PropertyListPage.jsx";
import PropertyDetailsPage from "./pages/PropertyDetailsPage.jsx";
import ShortlistPage from "./pages/ShortlistPage.jsx";
import ComparePage from "./pages/ComparePage.jsx";

// Root component of the application.
// Defines the routes; the browser router itself is set up in main.jsx.
function App() {
  return (
    <>
      <AppNav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/locations" element={<LocationListPage />} />
        <Route path="/locations/:locationId" element={<LocationBudgetPage />} />
        <Route path="/budget" element={<BudgetListPage />} />
        <Route path="/budget/:budgetId" element={<BudgetLocationPage />} />
        <Route path="/properties" element={<PropertyListPage />} />
        <Route path="/properties/:id" element={<PropertyDetailsPage />} />
        <Route path="/shortlist" element={<ShortlistPage />} />
        <Route path="/compare" element={<ComparePage />} />
      </Routes>
    </>
  );
}

export default App;
