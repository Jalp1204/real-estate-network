import mongoose from "mongoose";

// ---------------------------------------------------------------------------
// Customer model
//
// This is a direct translation of the locked `Customer` definition in
// docs/database-schema.md (section: # 5. Customer). Field names, types, the
// embedded interestHistory structure, nullable fields and timestamps are
// preserved exactly.
//
// `interestLevel` and `interestHistory.level` are defined as String only in
// the locked schema, so no enums are added.
// Customer has no ObjectId relationship in the locked schema.
//
// Do not add, remove, rename or retype any field without explicit approval.
// ---------------------------------------------------------------------------

// --- Schema ---
const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    interestLevel: {
      type: String,
      required: true,
    },

    interestHistory: {
      type: [
        {
          // The locked schema does not include an _id on history entries.
          _id: false,
          level: {
            type: String,
          },
          reason: {
            type: String,
          },
          changedAt: {
            type: Date,
          },
        },
      ],
    },

    notes: {
      type: String,
      default: null,
    },
  },
  {
    // Manages createdAt and updatedAt automatically.
    timestamps: true,

    // The locked schema names this collection `customers`.
    collection: "customers",
  }
);

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
