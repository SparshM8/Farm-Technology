# Final Year Project Report

Project: FarmStore — Lightweight e‑commerce site for farm inputs and produce

Author: [Your Name]
Supervisor: [Supervisor Name]
Submission Date: 2025-10-30

## Abstract

FarmStore is a lightweight, accessible, and progressive web e‑commerce site tailored for small-scale agriculture retailers. It demonstrates full-stack web development skills: product catalog, responsive images and srcset, client-side cart with localStorage persistence, server-side checkout and orders (SQLite), admin order management, real-time chat via Socket.IO, and a service worker for basic PWA capabilities.

## Objectives

- Build a responsive product catalog with performance-minded image delivery (WebP/JPEG srcset).
- Implement cart, checkout, and server-side order processing that compute totals securely on the backend.
- Provide an admin interface for order status updates and realtime notifications.
- Improve accessibility and provide PWA basics (service worker, offline caching guards).
- Package the project with documentation and demonstration material suitable for final-year submission.

## Implementation Summary

- Frontend: `farm.html`, `farm.js`, `farm.css` — vanilla JS and accessible modal components, quantity steppers, cart persistence in `localStorage` under `ft_cart`.
- Backend: `server.js` — Express + SQLite; endpoints for products, checkout, orders, and admin; server computes order totals and stores `price_value` numeric column.
- Realtime: Socket.IO (server + dynamic client loader) for chat and order event notifications.
- Images: `scripts/generate-images.js` uses Sharp to produce WebP and JPEG sizes and writes `data/image-manifest.json`; client uses the manifest to build `<picture>` elements.

## Data Model (high-level)

- products: id, title, description, price (formatted), price_value (numeric), images (array)
- orders: id, items (JSON), total_formatted, total_value, customer info, status (pending/processing/packed/shipped/delivered), created_at

## Key Features Demonstrated

- Secure pricing: server-side total calculations to prevent client tampering.
- Responsive images: WebP + JPEG via `<picture>` and `srcset` for performance and compatibility.
- Offline-aware service worker with URI scheme guards to avoid extension/special-scheme caching errors.
- Accessibility: modals with focus trapping, keyboard shortcuts (Escape), proper ARIA attributes.
- Dev-friendly fallbacks: socket client loader that tries same-origin then CDN; admin status fallback for static-hosted frontend.

## Evaluation

Functional tests were executed via included smoke tests (see `tests/test-socket.js`) to validate realtime chat connectivity. Manual testing checklist covers: product listing, add-to-cart, quantity updates, checkout (creates order), admin login and status update (emits realtime event).

## Limitations & Future Work

- Authentication is minimal (session-based with development header fallback). For production, integrate a proper auth provider, hashed credentials, and HTTPS-only deployment.
- Payment integration is not included — add a gateway (Stripe/PayPal) and webhooks for production.
- More automated tests (end-to-end Puppeteer tests, unit tests) would improve CI coverage.

## Submission Contents

- Source code (frontend & backend): `farm.*`, `server.js`.
- Image generation script: `scripts/generate-images.js` and generated `data/image-manifest.json` (generated output may be excluded from git and included as sample).
- Documentation: `FINAL_REPORT.md`, `docs/architecture.md`, `docs/setup.md`.
- Presentation: `presentation.html`.

## References

- Node.js, Express, Socket.IO, Sharp, SQLite

---

Appendices (screenshots, test logs) may be included in a zip for submission.
