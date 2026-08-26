# Farm-Technology Deployment Runbook

## Production layout

Farm-Technology uses a Git-connected **Render web service** for the Express/SQLite application and a Git-connected **Vercel project** for the Vite storefront. The Vercel configuration in `frontend/vercel.json` proxies `/api/*` to the Render service, avoiding browser-side CORS complexity and keeping the public client configuration free of secrets.

## Render API and full-stack fallback

Create a Render Web Service from `SparshM8/Farm-Technology` on the `main` branch. Render should detect and build the repository `Dockerfile`, which installs the two packages, builds the frontend, initializes the schema, seeds the catalog, and starts Express.

Set these environment variables in Render:

| Name | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Generate inside Render; never commit it. |
| `FRONTEND_URL` | Set to the final Vercel URL only if a browser calls the Render API directly. |

Do not add `.env` files to the repository. SMTP values are optional and should only be set in Render when the mail workflow is enabled.

## Vercel storefront

Create a Git-connected Vercel project using `SparshM8/Farm-Technology`, set **Root Directory** to `frontend`, and deploy from `main`. Vercel detects Vite automatically. No API token or public API URL environment variable is required because `frontend/vercel.json` forwards `/api/*` requests to the Render API.

## Release checks

1. Visit `/api/health` on the Render service and confirm its status is `OK`.
2. Visit the Vercel URL and confirm the catalog loads.
3. Search products, add and remove a guest-cart item, then test account registration or sign-in.
4. Run `npm test`, `npm run lint`, and `npm run build` in `frontend/`, then `npm test` in `backend/` before tagging a release.

## Operational note

The initial Render deployment uses the free plan. It can cold-start after inactivity and does not persist SQLite storage between all redeploy/restart scenarios. Use a managed persistent database before accepting production orders or storing customer data long term.
