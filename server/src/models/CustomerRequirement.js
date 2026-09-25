import mongoose from "mongoose";

// ---------------------------------------------------------------------------
// CustomerRequirement model
//
// This is a direct translation of the locked `CustomerRequirement` definition
// in docs/database-schema.md (section: # 6. CustomerRequirement). Field names,
// types, ObjectId relationships, nullable fields and timestamps are preserved
// exactly.
//
// No enums are added: the locked schema specifies String / Number only.
// There is deliberately NO `maxArea` field.
//
// Do not add, remove, rename or retype any field without explicit approval.
// ---------------------------------------------------------------------------

// --- Schema ---
const customerRequirementSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },

    budget: {
      min: {
        type: Number,
        default: null,
      },
      max: {
        type: Number,
        default: null,
      },
    },

    locations: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Location",
    },

    bhk: {
      type: [Number],
    },

    propertyTypes: {
      type: [String],
    },

    minArea: {
      type: Number,
      default: null,
    },

    possession: {
      type: [String],
    },

    amenities: {
      type: [String],
    },

    notes: {
      type: String,
      default: null,
    },
  },
  {
    // Manages createdAt and updatedAt automatically.
    timestamps: true,

    // The locked schema names this collection `customerRequirements`.
    collection: "customerRequirements",
  }
);

const CustomerRequirement = mongoose.model(
  "CustomerRequirement",
  customerRequirementSchema
);

export default CustomerRequirement;
