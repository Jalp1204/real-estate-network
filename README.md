# Real Estate Network

A professional, private real-estate property discovery and presentation system for a
real-estate broker — not a public marketplace.

The admin/broker manages property inventory and presents properties to customers from a
phone during in-person conversations. The app is mobile-first and responsive on tablet and
laptop.

## Tech Stack

- **Frontend:** React
- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **API:** REST
- **Language:** JavaScript

## Core Customer Flow

Home → Search by Location / Search by Budget / Explore All → Location or Budget selection →
Property List → Filters and Sorting → Property Details → Shortlist / Compare → Interest
submission

## Project Structure

```
client/   # React frontend
server/   # Node.js + Express backend
```

> The structure is intentionally minimal. Folders for components, pages, services, models,
> controllers, routes, and middleware are introduced only when needed.

## V1 Users

- **Customer** — browse, filter, view details/photos, shortlist, compare, indicate interest.
- **Admin/Broker** — manage properties, photos, availability, verification info, brokers,
  customers, and customer requirements.
- Brokers and customers do **not** have accounts in V1.

## Status

Documentation only. No application code yet. See `AGENTS.md` for full rules, scope, and
business constraints.
