import { Link, useNavigate } from "react-router-dom";
import { createBroker } from "../api/brokers.js";
import BrokerForm from "../components/BrokerForm.jsx";

// Add Broker screen (private/internal area).
function AddBrokerPage() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    const created = await createBroker(data);
    navigate(`/brokers/${created._id}`);
  };

  return (
    <main className="app">
      <Link className="back-link" to="/brokers">
        ← Brokers
      </Link>

      <header className="page-header">
        <h1>Add Broker</h1>
        <p>Create a new private broker record.</p>
      </header>

      <BrokerForm
        submitLabel="Save Broker"
        onSubmit={handleSubmit}
        cancelHref="/brokers"
      />
    </main>
  );
}

export default AddBrokerPage;
