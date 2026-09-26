import { Routes, Route } from "react-router-dom";
import PropertyListPage from "./pages/PropertyListPage.jsx";
import PropertyDetailsPage from "./pages/PropertyDetailsPage.jsx";

// Root component of the application.
// Defines the routes; the browser router itself is set up in main.jsx.
function App() {
  return (
    <Routes>
      <Route path="/" element={<PropertyListPage />} />
      <Route path="/properties/:id" element={<PropertyDetailsPage />} />
    </Routes>
  );
}

export default App;
