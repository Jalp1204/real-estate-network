# AGENTS.md

Instructions and context for AI agents working on the **Real Estate Network** project.
Read this file fully before making changes.

## 1. What This Project Is

Real Estate Network is a **professional private real-estate property discovery and
presentation system** built for a real-estate broker.

- It is **primarily a private inventory and customer-presentation system**, NOT a public
  marketplace.
- The main user is an **admin (the broker/father)** who manages property inventory and
  presents properties to customers **from a phone during real-world conversations**.
- The application must be **mobile-first**, and also responsive on **tablet and laptop**.

## 2. Tech Stack

- **Frontend:** React
- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **API:** REST
- **Language:** JavaScript
- **Version control:** Git

## 3. Core Customer Flow

```
Home
  → Search by Location / Search by Budget / Explore All
  → Location or Budget selection
  → Property List
  → Filters and Sorting
  → Property Details
  → Shortlist / Compare
  → Interest submission
```

## 4. V1 Users

1. **Customer** — browse properties, filter, view details/photos, shortlist, compare, and
   indicate interest.
2. **Admin/Father** — manage properties, photos, availability, verification information,
   brokers, customers, and customer requirements.
3. **Brokers** do NOT have accounts in V1.
4. **Customers** do NOT have accounts in V1.

## 5. V1 Database Collections

- `properties`
- `locations`
- `brokers`
- `customers`
- `customerRequirements`
- `shortlists`

### Property data fields

`title`, `propertyType`, `bhk`, `price`, `area`, `areaUnit`, `locationId`, `possession`,
`details`, `amenities`, `specialities`, `photos`, `verification`, `availability`, `source`,
`internalNotes`, `createdAt`, `updatedAt`.

## 6. Locked Schemas — Critical Rule

The database schemas **have already been designed and are considered locked**.

- Do **not** invent or modify the schema design without **explicit approval**.
- Do **not** change locked database schemas without approval.

## 7. Internal vs. Customer-Facing Data

Internal/business data that is **internal only**:

- Broker trust score
- Customer interest level
- Broker phone/contact information
- Internal notes, commission information, owner private contact information, and
  negotiation information

**These must NEVER be exposed to customers.** Customer-facing and internal/admin data must
remain clearly separated in API responses, controllers, and UI.

## 8. Business Rules

- Property verification information is **informational only** — never present it as a legal
  certification.
- Expected possession dates must **not** be represented as guaranteed.
- Do **not** expose broker trust scores to customers.
- Do **not** expose customer interest levels to customers.
- Do **not** expose internal notes (or any internal data listed in section 7) to customers.
- Do **not** invent property information.

## 9. Engineering Rules

- Do **not** install dependencies without approval.
- Do **not** modify unrelated files when implementing a feature.
- Do **not** build features outside the current V1 scope without approval.
- Keep the code **understandable and maintainable**.
- Prefer **simple, explicit** solutions over unnecessary abstraction.

## 10. Out of Scope for V1

Do not build any of the following without approval:

- broker accounts
- customer accounts
- online booking
- payments
- commission payments
- public broker profiles
- reviews
- messaging
- AI features
- automated document verification
- public property submission
- multi-city expansion
- complex CRM
- giant map-search functionality

## 11. Development Approach

- Build the application **incrementally using vertical slices**.
- Do **not** generate the entire application at once.
- The initial project structure should separate `client/` and `server/`.
- The project should eventually contain appropriate frontend and backend folders for
  components, pages, services, models, controllers, routes, and middleware/services — but
  keep the architecture **simple and introduce folders only when needed**.

## 12. Current Status

- Repository initialized with documentation only.
- No application code has been written yet.
- Schemas are locked and already designed.

## 13. Authoritative Database Schema

The authoritative V1 database schema is defined in:

`docs/database-schema.md`

This document is the single source of truth for:

- collection structure
- field names
- field types
- nested objects
- enums
- relationships
- visibility rules
- schema boundaries

AI agents MUST read `docs/database-schema.md` before implementing database models or database-related features.

AI agents MUST NOT:

- add schema fields without explicit approval
- remove schema fields without explicit approval
- rename schema fields without explicit approval
- change field types without explicit approval
- change enum values without explicit approval
- change collection relationships without explicit approval

If implementation requirements conflict with the schema contract, stop and ask for clarification rather than silently changing the schema.