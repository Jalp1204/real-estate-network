import mongoose from "mongoose";
import {
  BHK,
  PROPERTY_TYPES,
  POSSESSION_STATUSES,
  AMENITIES,
} from "../constants/propertyOptions.js";

// ---------------------------------------------------------------------------
// CustomerRequirement model
//
// This is a direct translation of the locked `CustomerRequirement` definition
// in docs/database-schema.md (section: # 6. CustomerRequirement). Field names,
// types, ObjectId relationships, nullable fields and timestamps are preserved
// exactly.
//
// Fields that mirror controlled Property options (bhk, propertyTypes,
// possession, amenities) reuse the shared enums from
// ../constants/propertyOptions.js so the two models cannot drift apart.
//
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
      type: [{ type: Number, enum: BHK }],
    },

    propertyTypes: {
      type: [{ type: String, enum: PROPERTY_TYPES }],
    },

    minArea: {
      type: Number,
      default: null,
    },

    possession: {
      type: [{ type: String, enum: POSSESSION_STATUSES }],
    },

    amenities: {
      type: [{ type: String, enum: AMENITIES }],
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
