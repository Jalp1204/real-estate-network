import express from "express";
import propertyRoutes from "./routes/propertyRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";

// The Express "app" is created here and kept separate from server.js.
// This separation keeps the app easy to test and easy to extend later.
const app = express();

// Allow the app to read JSON request bodies.
// Nothing uses this yet, but it is standard for a REST API foundation.
app.use(express.json());

// Health check endpoint.
// Used to confirm the server is up and responding.
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Real Estate Network API is running",
  });
});

// Property endpoints (read-only).
app.use("/api/properties", propertyRoutes);

// Location endpoints (read-only).
app.use("/api/locations", locationRoutes);

// Customer endpoints (private/internal area).
app.use("/api/customers", customerRoutes);

export default app;
