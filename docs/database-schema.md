# Real Estate Network — Database Schema Contract

> **STATUS: LOCKED**
>
> This document is the authoritative database schema contract for V1.
> AI agents and developers must not modify the schema, fields, enums,
> relationships, or visibility rules without explicit approval.

---

# 1. Collections

V1 consists of exactly these six MongoDB collections:

1. `properties`
2. `locations`
3. `brokers`
4. `customers`
5. `customerRequirements`
6. `shortlists`

MongoDB/Mongoose will automatically provide `_id` and timestamps where specified.

---

# 2. Property

Collection: `properties`

```js
Property {
  _id: ObjectId,

  title: String,

  propertyType: String,

  bhk: Number | null,

  price: {
    amount: Number,
    type: String
  },

  area: Number,

  areaUnit: String,

  locationId: ObjectId,

  possession: {
    status: String,
    date: Date | null,
    dateType: String
  },

  details: {
    floor: Number | null,
    totalFloors: Number | null,
    parking: Number,
    furnishing: String,
    facing: String,
    propertyAge: Number | null
  },

  amenities: [String],

  specialities: [String],

  photos: [
    {
      url: String,
      category: String,
      isPrimary: Boolean,
      caption: String | null
    }
  ],

  verification: {
    status: String,
    lastCheckedAt: Date | null,
    ownershipInfo: String,
    registrationInfo: String,
    approvalInfo: String,
    loanInfo: String,
    notes: String | null
  },

  availability: String,

  source: {
    brokerId: ObjectId | null,
    sourceType: String
  },

  internalNotes: [
    {
      text: String,
      createdAt: Date
    }
  ],

  createdAt: Date,
  updatedAt: Date
}

# 3. Locations

Location {
  _id: ObjectId,

  name: String,

  city: String,

  state: String,

  coverImage: String | null,

  description: String | null,

  isActive: Boolean,

  createdAt: Date,
  updatedAt: Date
}

# 4. Broker

Broker {
  _id: ObjectId,

  name: String,

  phone: String,

  businessName: String | null,

  location: String | null,

  registration: String | null,

  trustScore: {
    value: Number,
    lastReviewedAt: Date
  },

  status: String,

  notes: String | null,

  createdAt: Date,
  updatedAt: Date
}

# 5. Customer

Customer {
  _id: ObjectId,

  name: String,

  phone: String,

  interestLevel: String,

  interestHistory: [
    {
      level: String,
      reason: String,
      changedAt: Date
    }
  ],

  notes: String | null,

  createdAt: Date,
  updatedAt: Date
}

# 6. CustomerRequirement

CustomerRequirement {
  _id: ObjectId,

  customerId: ObjectId,

  budget: {
    min: Number | null,
    max: Number | null
  },

  locations: [ObjectId],

  bhk: [Number],

  propertyTypes: [String],

  minArea: Number | null,

  possession: [String],

  amenities: [String],

  notes: String | null,

  createdAt: Date,
  updatedAt: Date
}

# 7. Shortlist

Shortlist {
  _id: ObjectId,

  customerId: ObjectId,

  properties: [ObjectId],

  createdAt: Date,
  updatedAt: Date
}

MongoDB provides `_id` automatically. `createdAt` and `updatedAt` are
managed through Mongoose timestamps configuration where applicable.