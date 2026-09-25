import mongoose from "mongoose";

// ---------------------------------------------------------------------------
// Location model
//
// This is a direct translation of the locked `Location` definition in
// docs/database-schema.md (section: # 3. Locations). Field names, types,
// nullable fields and timestamps are preserved exactly.
//
// Do not add, remove, rename or retype any field without explicit approval.
// ---------------------------------------------------------------------------

// --- Schema ---
const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    coverImage: {
      type: String,
      default: null,
    },

    description: {
      type: String,
      default: null,
    },

    isActive: {
      type: Boolean,
      required: true,
    },
  },
  {
    // Manages createdAt and updatedAt automatically.
    timestamps: true,

    // The locked schema names this collection `locations`.
    collection: "locations",
  }
);

const Location = mongoose.model("Location", locationSchema);

export default Location;
