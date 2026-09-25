import app from "./app.js";
import { connectDB } from "./config/db.js";

// Port can be overridden with the PORT environment variable.
const PORT = process.env.PORT || 5001;

async function startServer() {
  // Connect to MongoDB FIRST. Express must not accept HTTP requests until
  // the database connection is ready.
  try {
    await connectDB();
  } catch (error) {
    console.error("Failed to connect to MongoDB. Server will not start.");
    console.error(error.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Real Estate Network API listening on http://localhost:${PORT}`);
  });
}

startServer();
