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
import EditCustomerPage from "./pages/EditCustomerPage.jsx";
import CustomerInterestedPropertiesPage from "./pages/CustomerInterestedPropertiesPage.jsx";
import CustomerMatchingPropertiesPage from "./pages/CustomerMatchingPropertiesPage.jsx";
import CustomerRequirementsPage from "./pages/CustomerRequirementsPage.jsx";
import BrokerListPage from "./pages/BrokerListPage.jsx";
import AddBrokerPage from "./pages/AddBrokerPage.jsx";
import BrokerDetailsPage from "./pages/BrokerDetailsPage.jsx";
import EditBrokerPage from "./pages/EditBrokerPage.jsx";
import InventoryPropertyListPage from "./pages/InventoryPropertyListPage.jsx";
import AddPropertyPage from "./pages/AddPropertyPage.jsx";
import EditPropertyPage from "./pages/EditPropertyPage.jsx";
import InternalPropertyDetailsPage from "./pages/InternalPropertyDetailsPage.jsx";

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
        <Route
          path="/customers/:customerId/properties"
          element={<CustomerInterestedPropertiesPage />}
        />
        <Route
          path="/customers/:customerId/requirements"
          element={<CustomerRequirementsPage />}
        />
        <Route
          path="/customers/:customerId/matching-properties"
          element={<CustomerMatchingPropertiesPage />}
        />
        <Route path="/customers/:id/edit" element={<EditCustomerPage />} />
        <Route path="/customers/:id" element={<CustomerDetailsPage />} />

        {/* Private/internal broker directory */}
        <Route path="/brokers" element={<BrokerListPage />} />
        <Route path="/brokers/new" element={<AddBrokerPage />} />
        <Route path="/brokers/:id/edit" element={<EditBrokerPage />} />
        <Route path="/brokers/:id" element={<BrokerDetailsPage />} />

        {/* Private/internal property inventory (broker-source workflow) */}
        <Route
          path="/inventory/properties"
          element={<InventoryPropertyListPage />}
        />
        <Route path="/inventory/properties/new" element={<AddPropertyPage />} />
        <Route
          path="/inventory/properties/:id/edit"
          element={<EditPropertyPage />}
        />
        <Route
          path="/inventory/properties/:id"
          element={<InternalPropertyDetailsPage />}
        />
      </Routes>
    </>
  );
}

export default App;
