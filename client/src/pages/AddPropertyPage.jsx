import { Link, useNavigate } from "react-router-dom";
import { createProperty } from "../api/properties.js";
import PropertyForm from "../components/PropertyForm.jsx";

// Add Property (internal). Minimal foundation used by the broker-source
// workflow; not a full property-management feature.
function AddPropertyPage() {
  const navigate = useNavigate();

  const handleSubmit = async (payload) => {
    const created = await createProperty(payload);
    navigate(`/inventory/properties/${created._id}`);
  };

  return (
    <main className="app">
      <Link className="back-link" to="/inventory/properties">
        ← Inventory
      </Link>

      <header className="page-header">
        <h1>Add Property</h1>
        <p>Add a property to the inventory.</p>
      </header>

      <PropertyForm
        submitLabel="Save Property"
        onSubmit={handleSubmit}
        cancelHref="/inventory/properties"
      />
    </main>
  );
}

export default AddPropertyPage;
