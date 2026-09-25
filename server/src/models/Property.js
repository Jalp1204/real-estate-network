import mongoose from "mongoose";
import {
  PROPERTY_TYPES,
  BHK,
  PRICE_TYPES,
  AREA_UNITS,
  POSSESSION_STATUSES,
  POSSESSION_DATE_TYPES,
  FURNISHINGS,
  FACINGS,
  AVAILABILITIES,
  SOURCE_TYPES,
  VERIFICATION_STATUSES,
  VERIFICATION_INFO_VALUES,
  PHOTO_CATEGORIES,
  AMENITIES,
  SPECIALITIES,
} from "../constants/propertyOptions.js";

// ---------------------------------------------------------------------------
// Property model
//
// This is a direct translation of the locked `Property` definition in
// docs/database-schema.md. Field names, types, nested objects, arrays,
// enum values, ObjectId relationships and timestamps are preserved exactly.
//
// Controlled values live in ../constants/propertyOptions.js.
//
// Do not add, remove, rename or retype any field without explicit approval.
// ---------------------------------------------------------------------------

// --- Schema ---
const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    propertyType: {
      type: String,
      enum: PROPERTY_TYPES,
      required: true,
    },

    bhk: {
      type: Number,
      enum: BHK,
      default: null,
    },

    price: {
      amount: {
        type: Number,
        required: true,
      },
      type: {
        type: String,
        enum: PRICE_TYPES,
        required: true,
        default: "fixed",
      },
    },

    area: {
      type: Number,
      required: true,
    },

    areaUnit: {
      type: String,
      enum: AREA_UNITS,
      required: true,
    },

    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },

    possession: {
      status: {
        type: String,
        enum: POSSESSION_STATUSES,
        required: true,
      },
      date: {
        type: Date,
        default: null,
      },
      dateType: {
        type: String,
        enum: POSSESSION_DATE_TYPES,
        required: true,
      },
    },

    details: {
      floor: {
        type: Number,
        default: null,
      },
      totalFloors: {
        type: Number,
        default: null,
      },
      parking: {
        type: Number,
        default: null,
      },
      furnishing: {
        type: String,
        enum: FURNISHINGS,
        required: true,
      },
      facing: {
        type: String,
        enum: FACINGS,
        required: true,
      },
      propertyAge: {
        type: Number,
        default: null,
      },
    },

    // Enum is defined on the array element type so Mongoose validates each
    // entry against AMENITIES.
    amenities: {
      type: [{ type: String, enum: AMENITIES }],
      required: true,
    },

    specialities: {
      type: [{ type: String, enum: SPECIALITIES }],
      required: true,
    },

    photos: {
      type: [
        {
          // The locked schema does not include an _id on photo entries.
          _id: false,
          url: {
            type: String,
            required: true,
          },
          category: {
            type: String,
            enum: PHOTO_CATEGORIES,
            required: true,
          },
          isPrimary: {
            type: Boolean,
            required: true,
          },
          caption: {
            type: String,
            default: null,
          },
        },
      ],
      required: true,
    },

    verification: {
      status: {
        type: String,
        enum: VERIFICATION_STATUSES,
        required: true,
      },
      lastCheckedAt: {
        type: Date,
        default: null,
      },
      ownershipInfo: {
        type: String,
        enum: VERIFICATION_INFO_VALUES,
        required: true,
      },
      registrationInfo: {
        type: String,
        enum: VERIFICATION_INFO_VALUES,
        required: true,
      },
      approvalInfo: {
        type: String,
        enum: VERIFICATION_INFO_VALUES,
        required: true,
      },
      loanInfo: {
        type: String,
        enum: VERIFICATION_INFO_VALUES,
        required: true,
      },
      notes: {
        type: String,
        default: null,
      },
    },

    availability: {
      type: String,
      enum: AVAILABILITIES,
      required: true,
    },

    source: {
      brokerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Broker",
        default: null,
      },
      sourceType: {
        type: String,
        enum: SOURCE_TYPES,
        required: true,
      },
    },

    internalNotes: {
      type: [
        {
          // The locked schema does not include an _id on note entries.
          _id: false,
          text: {
            type: String,
            required: true,
          },
          createdAt: {
            type: Date,
          },
        },
      ],
      required: true,
    },
  },
  {
    // Manages createdAt and updatedAt automatically.
    timestamps: true,

    // The locked schema names this collection `properties`.
    collection: "properties",
  }
);

const Property = mongoose.model("Property", propertySchema);

export default Property;
