import mongoose from "mongoose";

// ---------------------------------------------------------------------------
// Property model
//
// This is a direct translation of the locked `Property` definition in
// docs/database-schema.md. Field names, types, nested objects, arrays,
// enum values, ObjectId relationships and timestamps are preserved exactly.
//
// Do not add, remove, rename or retype any field without explicit approval.
// ---------------------------------------------------------------------------

// --- Enum values (exactly as specified for the locked schema) ---
const PROPERTY_TYPES = ["apartment", "house", "commercial"];

const BHK = [ 1 , 2 , 3 , 4 , 5];

const PRICE_TYPES = ["fixed", "negotiable", "on_request"];

// Apartment/house may use sqyd or sqft.
// Commercial properties may use sqyd or sqft depending on the property.
const AREA_UNITS = ["sqyd" , "sqft"]; 

const POSSESSION_STATUSES = ["ready_to_move", "under_construction", "upcoming"];

const POSSESSION_DATE_TYPES = ["actual", "expected", "not_applicable"];

const FURNISHINGS = ["unfurnished", "semi_furnished", "fully_furnished"];

const FACINGS = [
  "north",
  "south",
  "east",
  "west",
  "north_east",
  "north_west",
  "south_east",
  "south_west",
  "unknown",
];

const AVAILABILITIES = [
  "available",
  "sold",
  "unavailable",
];

const SOURCE_TYPES = ["broker", "owner", "builder", "other"];

const VERIFICATION_STATUSES = [
  "not_checked",
  "partially_verified",
  "verification_completed",
];

// Shared by ownershipInfo, registrationInfo, approvalInfo and loanInfo.
const VERIFICATION_INFO_VALUES = ["not_checked", "provided", "checked"];

const PHOTO_CATEGORIES = [
  "exterior",
  "drawing_room",
  "living_room",
  "bedroom",
  "kitchen",
  "bathroom",
  "balcony",
  "parking",
  "building",
  "surroundings",
  "other",
];

const AMENITIES = [
  "lift",
  "parking",
  "gym",
  "security",
  "garden",
  "clubhouse",
  "play_area",
  "power_backup",
  "water_supply",
  "fire_safety",
  "solar",
];

const SPECIALITIES = [
  "corner_unit",
  "garden_facing",
  "main_road_facing",
  "renovated",
  "premium_location",
  "large_balcony",
];


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
        default: "fixed" ,
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
