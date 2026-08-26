# Farm-Technology Architecture

## Purpose

Farm-Technology is organized as an agricultural commerce storefront with a React/Vite client and an Express/SQLite API. The current client architecture keeps browser-only state, catalog retrieval, authenticated session persistence, and server-cart synchronization in distinct modules so additional storefront features can be added without duplicating API code inside components.

## Client module boundaries

| Module | Responsibility | Key interfaces |
| --- | --- | --- |
| `src/lib/api.js` | Single JSON request boundary and API domain methods. | `api.catalog`, `api.auth`, `api.cart`, `api.contact` |
| `src/hooks/useCatalog.js` | Loads catalog data once and derives the current searched/filtered list. | `useCatalog({ category, query })` |
| `src/context/AuthContext.jsx` | Restores, persists, and clears the JWT session. | `user`, `token`, `login`, `register`, `logout` |
| `src/context/CartContext.jsx` | Owns guest cart storage, authenticated cart operations, and one-time guest-to-server sync per token. | `items`, `addToCart`, `updateQuantity`, `removeItem` |
| `src/App.jsx` | Composes storefront sections and owns only screen-level UI state. | Search/filter, cart drawer, account dialog |
| `src/components/*` | Renders focused presentation and interaction surfaces. | Header, Hero, Catalog, Product Card, Cart, Auth, Contact, Footer |

## Request and state flow

```text
UI component
  → focused hook or context
  → src/lib/api.js
  → /api/* Express router
  → SQLite data layer

Unauthenticated cart
  → localStorage (farmingTechGuestCart)
  → on successful sign-in, one sync per session token
  → authenticated /api/cart
```

The cart provider safeguards guest synchronization with a token reference. This prevents repeated guest-item POST requests when React re-renders or effects are re-invoked after a user has already authenticated.

## Visual system

The client uses a shared field-store palette and typographic system defined in `src/index.css`. The central tokens cover ink, forest, lime, paper, soil, borders, motion, and shadows. Sections use the same spacing and rounded-panel scale, while the hero and product cards use CSS-only agricultural field abstractions; this avoids claiming unavailable product photography or embedding unlicensed stock assets.

## Local UI verification

On August 26, 2026, the local preview rendered the redesigned sticky header, responsive hero, catalog toolbar, six live catalog items, filter chips, product actions, field guide, and contact surface. The hero’s primary catalog CTA was also activated during verification.

The catalog was visually reviewed at desktop width: the live six-item inventory rendered in a three-column grid with category, availability, price, and exposed “Add to basket” actions. The grid collapsed only at the responsive breakpoints defined in the catalog stylesheet.

The interaction inspection first kept the cart count at zero after an automated target attempt, so a direct click verification was retained rather than inferring cart behavior from the rendered control alone. The direct verification then succeeded: adding Organic Fertilizer changed the cart count from zero to one, opened the guest basket, rendered the expected item and ₹450 estimated total, and exposed sync, quantity, remove, and planned-checkout controls.

The temporary validation item was removed before completing the inspection. The drawer remained open in its designed empty state and the header cart count returned to zero.

The mobile landing experience was rendered at a 390 × 844 viewport. The compact header preserved its brand, menu trigger, sign-in trigger, and cart affordance; the hero changed to a stacked layout with full-width touch actions and retained readable type, field metadata, and visual context.

## Next architectural milestones

Checkout, order creation, account order history, product media management, and inventory administration remain separate future features. They should extend the `api` domain object and introduce focused hooks or contexts rather than placing new network calls directly in page components.
