import mongoose from "mongoose";

// Connects to MongoDB using the connection string from the environment.
//
// The connection string is NEVER hardcoded. It is read from
// process.env.MONGODB_URI, which is loaded from server/.env when the server
// starts (see the npm scripts in package.json).
export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add it to server/.env");
  }

  await mongoose.connect(uri);

  console.log("MongoDB connected");
}
