# Farm-Technology

> A field-to-cart agricultural commerce storefront built with React, Express, and SQLite.

Farm-Technology helps growers explore seeds, soil care, crop protection, tools, and field essentials through a responsive product catalog. The current release focuses on a dependable shopper journey: live catalog search and filtering, a persistent guest basket, optional account sign-in, and guest-to-account cart synchronization.

## What is available now

| Surface | Included in this release |
| --- | --- |
| Catalog | Live products, category chips, text search, stock indicators, and responsive product cards. |
| Cart | Browser-persistent guest basket, quantities, removal, estimated totals, and authenticated server-cart synchronization. |
| Accounts | JWT-backed registration, sign-in, sign-out, and session restoration. |
| Support | A validated product/contact enquiry form backed by the existing API. |
| Platform | React/Vite client, Express API, SQLite storage, automated tests, and a production Docker build. |

Checkout and order creation are deliberately **not exposed in the current shopper UI**. They are the next commerce milestone, rather than an implied completed feature.

## Architecture

```text
Browser
  └─ React + Vite storefront
       ├─ components/      focused visual surfaces
       ├─ context/         auth session + cart lifecycle
       ├─ hooks/           catalog data loading and derivation
       └─ lib/api.js       single API request boundary
                │
                ▼
          Express API
       ├─ auth, products, cart, orders, contact routes
       ├─ security middleware and request validation
       └─ SQLite catalog and application data
```

The deeper ownership and request-flow notes are in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Local development

### Requirements

Use Node.js 18 or newer and npm. Install frontend and backend dependencies separately because this repository is a two-package application.

```bash
git clone https://github.com/SparshM8/Farm-Technology.git
cd Farm-Technology

cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### Start the API

The database schema is created automatically at server startup. Seed the local demonstration catalog once before first use.

```bash
cd backend
npm run seed
PORT=3000 npm start
```

### Start the storefront

In a second terminal, point the Vite client at the local API.

```bash
cd frontend
VITE_API_BASE_URL=http://localhost:3000 npm run dev
```

Open the Vite URL shown in the terminal. The frontend’s API base is intentionally configured through `VITE_API_BASE_URL`; when it is empty, requests stay relative to the current origin.

## Validation

Run all checks from the respective package directories:

```bash
# Client data rules, linting, and production bundle
cd frontend
npm test
npm run lint
npm run build

# API routes and utility behavior
cd ../backend
npm test
```

## Production deployment

The production topology separates the static storefront from the long-running API:

| Service | Responsibility | Configuration |
| --- | --- | --- |
| Render | Builds the repository Dockerfile, seeds the demonstration catalog, serves the Express API, and can serve the bundled React app. | `Dockerfile` and the Render web service. |
| Vercel | Builds `frontend/` as a Vite project and forwards `/api/*` requests to Render. | `frontend/vercel.json` |

The Vercel proxy keeps browser API calls same-origin, so the public frontend does not contain a backend token or require a public API environment variable. The Render API requires `NODE_ENV=production` and a generated `JWT_SECRET`; configure SMTP values only if transactional email support is enabled.

> The initial Render service is on the free plan. It may take time to wake after inactivity and does not provide persistent disk storage, so it is appropriate for this demonstration release rather than durable production order data.

## Repository and release workflow

Use conventional, focused commits. Before creating a release, run the validation commands above, update this README when a public workflow changes, then create a semantic tag:

```bash
git tag -a v0.2.0 -m "Farm-Technology storefront modernization"
git push origin v0.2.0
```

## Roadmap

The most valuable next improvements are checkout and order creation, persistent managed storage, inventory administration, real product media, and a dedicated account/order-history experience.

## License

This project is available under the [MIT License](LICENSE).
