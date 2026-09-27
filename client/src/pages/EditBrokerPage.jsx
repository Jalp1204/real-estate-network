import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getBrokerById, updateBroker } from "../api/brokers.js";
import BrokerForm from "../components/BrokerForm.jsx";

// Edit Broker screen (private/internal area).
// Reuses the same form as Add Broker, prefilled from the existing record.
function EditBrokerPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [broker, setBroker] = useState(null);
  // status: "loading" | "success" | "not_found" | "error"
  const [status, setStatus] = useState("loading");

  const loadBroker = useCallback(async () => {
    setStatus("loading");

    try {
      const data = await getBrokerById(id);
      setBroker(data);
      setStatus("success");
    } catch (error) {
      setBroker(null);
      setStatus(error?.code === "NOT_FOUND" ? "not_found" : "error");
    }
  }, [id]);

  useEffect(() => {
    loadBroker();
  }, [loadBroker]);

  const handleSubmit = async (data) => {
    await updateBroker(id, data);
    navigate(`/brokers/${id}`);
  };

  return (
    <main className="app">
      <Link className="back-link" to={`/brokers/${id}`}>
        ← Broker
      </Link>

      <header className="page-header">
        <h1>Edit Broker</h1>
        {broker && <p>{broker.name}</p>}
      </header>

      {status === "loading" && <p className="state-message">Loading broker…</p>}

      {status === "not_found" && <p className="state-message">Broker not found.</p>}

      {status === "error" && (
        <div className="state-message state-message--error" role="alert">
          <p>Unable to load this broker.</p>
          <button type="button" className="retry-button" onClick={loadBroker}>
            Retry
          </button>
        </div>
      )}

      {status === "success" && broker && (
        <BrokerForm
          initialValues={{
            name: broker.name ?? "",
            phone: broker.phone ?? "",
            businessName: broker.businessName ?? "",
            location: broker.location ?? "",
            registration: broker.registration ?? "",
            status: broker.status ?? "active",
            notes: broker.notes ?? "",
          }}
          submitLabel="Save Changes"
          onSubmit={handleSubmit}
          cancelHref={`/brokers/${id}`}
        />
      )}
    </main>
  );
}

export default EditBrokerPage;
