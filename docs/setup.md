# Setup and Run (Local Development)

These instructions assume you are on Windows and will use PowerShell (the project was tested locally on Windows). Adjust paths/commands for Linux/macOS as needed.

Prerequisites

- Node.js (v16 or newer strongly recommended)
- npm
- Optional: `git` to clone the repo

1) Install dependencies

Open PowerShell in the project root (where `package.json` is located) and run:

```powershell
npm install
```

2) Generate responsive images (recommended)

This step requires the `sharp` dependency which is included in `package.json`.

```powershell
node scripts/generate-images.js
```

This will scan `uploads/` and write resized WebP/JPEG assets and `data/image-manifest.json`.

3) Environment variables

You can run the app without SMTP configured. For email notifications set the following env vars (don't commit them):

- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
- ADMIN_PASSWORD (optional override for admin login; default used in dev is 'PASSCODE')

Example (PowerShell):

```powershell
$env:SMTP_HOST = 'smtp.example.com'
$env:SMTP_PORT = '587'
$env:SMTP_USER = 'user@example.com'
$env:SMTP_PASS = 'secret'
$env:ADMIN_PASSWORD = 'PASSCODE'
npm start
```

4) Run the server (development)

```powershell
npm start
# or if you have nodemon installed globally:
nodemon server.js
```

Server runs on port 3000 by default (http://localhost:3000). Open `farm.html` in your browser from the server (recommended) or serve the static files with any static host (note: some features like Socket.IO same-origin will fall back to CDN).

5) Run smoke tests

The repo includes a socket smoke test:

```powershell
node tests/test-socket.js
```

6) Admin access (development)

Visit `/admin` or use the admin panel in `farm.html`. Admin endpoints use session-based authentication via the `/api/admin/login` endpoint. There is no longer a header-based `X-Admin-Password` fallback (do not store admin credentials client-side).

7) Production notes

- Serve behind HTTPS. Use a production-ready process manager (PM2) or containerize with Docker.
- Use a hardened database and backups for orders.
- Replace dev auth with proper credentials and HTTPS-only cookies.

## Docker (optional) — quick start for development

If you prefer to run the app in Docker for a reproducible dev environment, use the included Dockerfiles.

Build the image and run with docker-compose:

```powershell
docker compose -f docker-compose.dev.yml build
docker compose -f docker-compose.dev.yml up
```

Notes:
- The compose file mounts the project directory into the container for live reload (nodemon). It also provides named volumes for `data/` and `uploads/` so your DB and uploaded files persist between runs.
- To stop and remove containers:

```powershell
docker compose -f docker-compose.dev.yml down
```

