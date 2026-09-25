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

  propertyType: String,          // enum

  bhk: Number | null,            // enum 1-5; may be null

  price: {
    amount: Number,
    type: String                 // enum; default "fixed"
  },

  area: Number,

  areaUnit: String,              // enum

  locationId: ObjectId,          // ref: Location (required)

  possession: {
    status: String,              // enum
    date: Date | null,
    dateType: String             // enum
  },

  details: {
    floor: Number | null,
    totalFloors: Number | null,
    parking: Number | null,      // may be unknown/null
    furnishing: String,          // enum
    facing: String,              // enum
    propertyAge: Number | null
  },

  amenities: [String],           // each entry is an enum value

  specialities: [String],        // each entry is an enum value

  photos: [
    {
      url: String,
      category: String,          // enum
      isPrimary: Boolean,
      caption: String | null
    }
  ],

  verification: {
    status: String,              // enum
    lastCheckedAt: Date | null,
    ownershipInfo: String,       // enum
    registrationInfo: String,    // enum
    approvalInfo: String,        // enum
    loanInfo: String,            // enum
    notes: String | null
  },

  availability: String,          // enum

  source: {
    brokerId: ObjectId | null,   // ref: Broker (optional)
    sourceType: String           // enum
  },

  internalNotes: [
    {
      text: String,
      createdAt: Date
    }
  ],

  createdAt: Date,               // managed by timestamps
  updatedAt: Date                // managed by timestamps
}
```

### Enumerated values

- **propertyType**: `apartment`, `house`, `commercial`
- **bhk**: `1`, `2`, `3`, `4`, `5`
- **price.type**: `fixed`, `negotiable`, `on_request` (default: `fixed`)
- **areaUnit**: `sqyd`, `sqft`
- **possession.status**: `ready_to_move`, `under_construction`, `upcoming`
- **possession.dateType**: `actual`, `expected`, `not_applicable`
- **details.furnishing**: `unfurnished`, `semi_furnished`, `fully_furnished`
- **details.facing**: `north`, `south`, `east`, `west`, `north_east`, `north_west`, `south_east`, `south_west`, `unknown`
- **availability**: `available`, `sold`, `unavailable`
- **source.sourceType**: `broker`, `owner`, `builder`, `other`
- **verification.status**: `not_checked`, `partially_verified`, `verification_completed`
- **verification.ownershipInfo / registrationInfo / approvalInfo / loanInfo**: `not_checked`, `provided`, `checked`
- **photos[].category**: `exterior`, `drawing_room`, `living_room`, `bedroom`, `kitchen`, `bathroom`, `balcony`, `parking`, `building`, `surroundings`, `other`
- **amenities[]**: `lift`, `parking`, `gym`, `security`, `garden`, `clubhouse`, `play_area`, `power_backup`, `water_supply`, `fire_safety`, `solar`
- **specialities[]**: `corner_unit`, `garden_facing`, `main_road_facing`, `renovated`, `premium_location`, `large_balcony`

### Nullable / default fields

- Nullable (`null` allowed, default `null`): `bhk`, `possession.date`,
  `details.floor`, `details.totalFloors`, `details.parking`, `details.propertyAge`,
  `photos[].caption`, `verification.lastCheckedAt`, `verification.notes`,
  `source.brokerId`.
- `price.type` defaults to `fixed`.

### Relationships

- `locationId` is an ObjectId reference to the `Location` collection (required).
- `source.brokerId` is an ObjectId reference to the `Broker` collection (optional,
  default `null`).

### Embedded structures

- `photos[]` and `internalNotes[]` are embedded subdocuments with no own `_id`.
- `internalNotes[].createdAt` is the timestamp of the individual note (distinct from
  the document-level `createdAt`/`updatedAt`).

### Timestamps

- `createdAt` and `updatedAt` are managed automatically through Mongoose timestamps
  configuration.

### Business clarifications

- `sqyd` and `sqft` are both valid area units.
- There is no forced mapping between `propertyType` and `areaUnit`; either unit may be
  used for a property regardless of its type, depending on the property.
- `parking` may be unknown/null.
- `bhk` may be null for properties where it does not apply.
- Property verification information is informational only and is not a legal
  certification.

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

  status: String,                  // enum

  notes: String | null,

  createdAt: Date,
  updatedAt: Date
}

### Enumerated values

- **status**: `active`, `under_review`, `inactive`

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

### Enumerated values

- **bhk**: `1`, `2`, `3`, `4`, `5`
- **propertyTypes**: `apartment`, `house`, `commercial`
- **possession**: `ready_to_move`, `under_construction`, `upcoming`
- **amenities**: `lift`, `parking`, `gym`, `security`, `garden`, `clubhouse`, `play_area`, `power_backup`, `water_supply`, `fire_safety`, `solar`

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