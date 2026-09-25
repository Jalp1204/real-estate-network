import mongoose from "mongoose";

// ---------------------------------------------------------------------------
// Broker model
//
// This is a direct translation of the locked `Broker` definition in
// docs/database-schema.md (section: # 4. Broker). Field names, types, nested
// objects, nullable fields and timestamps are preserved exactly.
//
// `status` is an enum in the locked schema: active, under_review, inactive.
// Broker has no ObjectId relationship in the locked schema.
//
// Do not add, remove, rename or retype any field without explicit approval.
// ---------------------------------------------------------------------------

const STATUS_VALUES = [ "active" , "under_review" , "inactive"];

// --- Schema ---
const brokerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    businessName: {
      type: String,
      default: null,
    },

    location: {
      type: String,
      default: null,
    },

    registration: {
      type: String,
      default: null,
    },

    trustScore: {
      value: {
        type: Number,
      },
      lastReviewedAt: {
        type: Date,
      },
    },

    status: {
      type: String,
      enum: STATUS_VALUES,
      required: true,
    },

    notes: {
      type: String,
      default: null,
    },
  },
  {
    // Manages createdAt and updatedAt automatically.
    timestamps: true,

    // The locked schema names this collection `brokers`.
    collection: "brokers",
  }
);

const Broker = mongoose.model("Broker", brokerSchema);

export default Broker;
