import mongoose from "mongoose";

// ---------------------------------------------------------------------------
// Shortlist model
//
// This is a direct translation of the locked `Shortlist` definition in
// docs/database-schema.md (section: # 7. Shortlist). Field names, types,
// ObjectId relationships and timestamps are preserved exactly.
//
// No enums, required constraints, indexes, hooks or virtuals are added.
//
// Do not add, remove, rename or retype any field without explicit approval.
// ---------------------------------------------------------------------------

// --- Schema ---
const shortlistSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },

    properties: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Property",
    },
  },
  {
    // Manages createdAt and updatedAt automatically.
    timestamps: true,

    // The locked schema names this collection `shortlists`.
    collection: "shortlists",
  }
);

const Shortlist = mongoose.model("Shortlist", shortlistSchema);

export default Shortlist;
