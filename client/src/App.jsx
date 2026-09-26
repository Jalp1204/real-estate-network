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
import CustomerListPage from "./pages/CustomerListPage.jsx";
import AddCustomerPage from "./pages/AddCustomerPage.jsx";
import CustomerDetailsPage from "./pages/CustomerDetailsPage.jsx";

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
        {/* Private/internal customer area */}
        <Route path="/customers" element={<CustomerListPage />} />
        <Route path="/customers/new" element={<AddCustomerPage />} />
        <Route path="/customers/:id" element={<CustomerDetailsPage />} />
      </Routes>
    </>
  );
}

export default App;
