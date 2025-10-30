# Architecture

This document explains the high level architecture of the FarmStore project.

## Overview

FarmStore is a small full-stack application. The major components:

- Frontend: static files served (or hosted) including `farm.html`, `farm.js`, and `farm.css`.
- Backend: `server.js` — Node.js + Express server, using SQLite (file `data/data.db`) to persist products and orders.
- Realtime: Socket.IO for chat and order notifications (server emits `orders:new` and `orders:update`). Frontend uses a dynamic client loader that first tries same-origin then CDN fallback.
- Image Pipeline: `scripts/generate-images.js` — Sharp-based script that produces responsive images and writes `data/image-manifest.json`. Frontend builds `<picture>` elements from that manifest.

## API Endpoints (high-level)

- GET /api/products — list of products (may include image info and prices)
- POST /api/checkout — create an order; server computes totals and inserts order record
- GET /api/orders — list orders (admin)
- PUT /api/orders/:id/status — update order status (admin)
- POST /api/admin/login — admin login (session)

Socket events

- server -> client: `orders:new` — when a new order is placed
- server -> client: `orders:update` — when an order status is updated

## Data Flow

1. Images are prepared by `scripts/generate-images.js` and uploaded to `uploads/` and manifest written to `data/image-manifest.json`.
2. Frontend requests `/api/products` and renders product cards using `<picture>` from the manifest.
3. User adds items to cart (client-side in localStorage). On checkout, frontend POSTs order items to `/api/checkout`.
4. Server validates items (IDs & numeric `price_value`), computes secure `total_value`, persists the order, and emits `orders:new`.
5. Admin can update order status via `/api/orders/:id/status`; server emits `orders:update` and optionally sends an email notification when SMTP is configured.

## Security Considerations

- Always run behind HTTPS in production.
- Replace dev header-based admin fallback with a proper auth provider and hashed credentials.
- Avoid committing secrets — SMTP credentials must be provided via environment variables.
