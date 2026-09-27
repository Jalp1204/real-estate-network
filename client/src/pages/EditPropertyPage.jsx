import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getPropertyInternalById, updateProperty } from "../api/properties.js";
import PropertyForm from "../components/PropertyForm.jsx";

// Edit Property (internal). Reuses the shared property form, prefilled from the
// existing record (including the stored broker source reference).
function EditPropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  // status: "loading" | "success" | "not_found" | "error"
  const [status, setStatus] = useState("loading");

  const loadProperty = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await getPropertyInternalById(id);
      setProperty(data);
      setStatus("success");
    } catch (error) {
      setProperty(null);
      setStatus(error?.code === "NOT_FOUND" ? "not_found" : "error");
    }
  }, [id]);

  useEffect(() => {
    loadProperty();
  }, [loadProperty]);

  const handleSubmit = async (payload) => {
    await updateProperty(id, payload);
    navigate(`/inventory/properties/${id}`);
  };

  const initialValues =
    property &&
    {
      title: property.title ?? "",
      propertyType: property.propertyType ?? "",
      locationId:
        property.locationId && typeof property.locationId === "object"
          ? property.locationId._id
          : property.locationId ?? "",
      priceAmount: property.price?.amount ?? "",
      priceType: property.price?.type ?? "fixed",
      area: property.area ?? "",
      areaUnit: property.areaUnit ?? "sqft",
      bhk: typeof property.bhk === "number" ? String(property.bhk) : "",
      availability: property.availability ?? "available",
      possessionStatus: property.possession?.status ?? "ready_to_move",
      furnishing: property.details?.furnishing ?? "unfurnished",
      facing: property.details?.facing ?? "unknown",
      sourceType: property.source?.sourceType ?? "owner",
      brokerId: property.source?.brokerId ?? "",
    };

  return (
    <main className="app">
      <Link className="back-link" to={`/inventory/properties/${id}`}>
        ← Property
      </Link>

      <header className="page-header">
        <h1>Edit Property</h1>
        {property && <p>{property.title}</p>}
      </header>

      {status === "loading" && <p className="state-message">Loading property…</p>}
      {status === "not_found" && <p className="state-message">Property not found.</p>}

      {status === "error" && (
        <div className="state-message state-message--error" role="alert">
          <p>Unable to load this property.</p>
          <button type="button" className="retry-button" onClick={loadProperty}>
            Retry
          </button>
        </div>
      )}

      {status === "success" && initialValues && (
        <PropertyForm
          initialValues={initialValues}
          submitLabel="Save Changes"
          onSubmit={handleSubmit}
          cancelHref={`/inventory/properties/${id}`}
        />
      )}
    </main>
  );
}

export default EditPropertyPage;
