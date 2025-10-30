# QA Checklist & Demo Script

This checklist helps you run a short, reliable demo and perform quick QA before submitting the project.

## Quick smoke checklist

1. Install deps

```powershell
# from repository root
npm install
```

2. (Optional) generate responsive images (if you changed images)

```powershell
npm run images:generate
```

3. Create a sample DB copy (safe, non-destructive)

```powershell
node scripts/create_sample_db.js
# creates data/sample-data.db by copying data/data.db if it exists
```

4. Start the app (dev)

```powershell
# development
npm run dev
# or (Docker)
# docker-compose -f docker-compose.dev.yml up --build
```

5. Run tests

```powershell
npm test
```

## Demo script (5-7 minutes)

1. Open the site
   - Open `farm.html` in the browser (or visit http://localhost:3000 if running server).
   - Show the responsive hero image and product grid.

2. Product & cart
   - Click a product to open details.
   - Add 1-2 products to the cart, change quantity using the stepper.
   - Demonstrate cart persisted in `localStorage` by refreshing the page.

3. Checkout
   - Open checkout modal and fill required fields (name, address, contact).
   - Submit checkout.
   - Show server confirmation UI (order success) and that server recalculates totals.

4. Admin flow (orders)
   - Start server with admin password (recommended):

```powershell
$env:ADMIN_PASSWORD = 'your-secret'
node server.js
```

   - Use the Admin login endpoint to authenticate (if UI exists) or use a curl POST to `/api/admin/login` sending JSON { "password": "your-secret" }.
   - Open admin orders page (or GET `/api/orders`) to show the new order.
   - Change order status and show that the order status update triggers server-side events (if Socket.IO running).

5. Realtime chat (if enabled)
   - Open two browser windows and send a message to show messages are delivered via Socket.IO and persisted during the session (if implemented).

6. Offline & PWA check (basic)
   - With service worker registered, reload the page and then toggle offline in browser devtools and confirm the site still loads static assets.

## QA checklist (short)

- [ ] `npm test` passes (unit/API)
- [ ] `npm run lint` passes (or only frontend files excluded intentionally)
- [ ] No console errors in browser on page load
- [ ] Images served via `<picture>`/`srcset` and WebP available
- [ ] Checkout creates order that appears in admin orders list
- [ ] Admin endpoints are protected by session (no X-Admin-Password fallback)
- [ ] `data/sample-data.db` exists (or `data/data.db` is present and seeded)

## Quick troubleshooting

- If orders do not appear in admin endpoint, check server logs for DB migration errors.
- If Socket.IO client fails to load, verify network tab for fallback CDN loader messages.

---

Place this file in `docs/QA_CHECKLIST.md` and use it during your demo and viva. Update any host/port references if you changed defaults.
