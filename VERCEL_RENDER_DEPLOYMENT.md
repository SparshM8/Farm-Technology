# Vercel + Render Deployment Guide

Deploy your frontend on **Vercel** (free) and backend on **Render** (~$7/month).

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│         Your Domain (yourdomain.com)         │
├──────────────────┬──────────────────────────┤
│  Frontend (React)│   Backend (Node.js)      │
│    on Vercel     │    on Render.com         │
│   (Free)         │   ($0-7/month)           │
└──────────────────┴──────────────────────────┘
```

---

## Part 1: Deploy Backend on Render.com

### Step 1: Prepare Backend for Render

1. Create `render.yaml` in project root:

```yaml
services:
  - type: web
    name: farming-tech-shop-api
    env: node
    plan: free
    buildCommand: cd backend && npm install
    startCommand: cd backend && node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: JWT_SECRET
        generateValue: true
      - key: FRONTEND_URL
        value: https://your-vercel-domain.vercel.app
      - key: SMTP_HOST
        value: smtp.gmail.com
      - key: SMTP_PORT
        value: '587'
      - key: SMTP_SECURE
        value: 'false'
      - key: SMTP_USER
        scope: build
      - key: SMTP_PASS
        scope: build
      - key: CORS_ORIGIN
        value: https://your-vercel-domain.vercel.app
```

2. Update `backend/server.js` to handle Render port:
```javascript
const PORT = process.env.PORT || 3000;
```

### Step 2: Create Render Account & Deploy

1. Go to [render.com](https://render.com) → Sign up with GitHub
2. Click **+ New** → **Web Service**
3. Select your GitHub repository
4. Configure:
   - **Name:** `farming-tech-shop-api`
   - **Environment:** `Node`
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && node server.js`
   - **Plan:** Free (or Starter $7/month for better performance)

5. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: Generate a strong secret (use `openssl rand -base64 32`)
   - `FRONTEND_URL`: (you'll get Vercel URL after deploying frontend)
   - `SMTP_HOST`: `smtp.gmail.com`
   - `SMTP_PORT`: `587`
   - `SMTP_USER`: Your email
   - `SMTP_PASS`: Your app password
   - `CORS_ORIGIN`: (you'll get Vercel URL after deploying frontend)

6. Click **Create Web Service**
7. Wait for deployment (2-3 minutes)
8. Copy your backend URL: `https://farming-tech-shop-api.onrender.com`

**Note:** Render free tier apps spin down after 15 minutes of inactivity. Use Starter plan ($7/month) for production.

---

## Part 2: Deploy Frontend on Vercel

### Step 1: Update Frontend Configuration

1. Update `frontend/vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
```

2. Create `frontend/.env.production`:
```
VITE_API_URL=https://farming-tech-shop-api.onrender.com
```

3. Update `frontend/.env.development`:
```
VITE_API_URL=http://localhost:3000
```

4. Update API calls in React components to use:
```javascript
const API_URL = import.meta.env.VITE_API_URL;
fetch(`${API_URL}/api/products`);
```

### Step 2: Create Vercel Config

Create `vercel.json` in project root:

```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "env": {
    "VITE_API_URL": {
      "type": "plaintext"
    }
  }
}
```

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → Sign up/Login with GitHub
2. Click **Add New Project**
3. Select your GitHub repository
4. Configure:
   - **Framework Preset:** `Vite`
   - **Build Command:** `cd frontend && npm run build`
   - **Output Directory:** `frontend/dist`

5. Add Environment Variable:
   - `VITE_API_URL`: `https://farming-tech-shop-api.onrender.com` (your Render backend URL)

6. Click **Deploy**
7. Wait for deployment (1-2 minutes)
8. Copy your frontend URL: `https://your-project.vercel.app`

---

## Part 3: Update Render Environment Variables

Now that you have both URLs, update Render environment variables:

1. Go to Render.com → Select your service
2. Click **Environment** → Edit these:
   - `FRONTEND_URL`: `https://your-project.vercel.app`
   - `CORS_ORIGIN`: `https://your-project.vercel.app`

3. Click **Save** → Service will redeploy automatically

---

## Testing the Deployment

### Backend Health Check
```bash
curl https://farming-tech-shop-api.onrender.com/api/health
# Should return: { "status": "ok", "timestamp": ... }
```

### Frontend Access
```
https://your-project.vercel.app
```

### Test Features
1. ✅ Register new account
2. ✅ Login
3. ✅ Browse products
4. ✅ Add to cart
5. ✅ Create order
6. ✅ Admin login (admin@farmingtechshop.com / admin123)

---

## Environment Variables Summary

### Render (Backend)
```
NODE_ENV=production
PORT=3000
JWT_SECRET=your-generated-secret
FRONTEND_URL=https://your-project.vercel.app
CORS_ORIGIN=https://your-project.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Vercel (Frontend)
```
VITE_API_URL=https://farming-tech-shop-api.onrender.com
```

---

## Performance Optimization

### Vercel (Frontend)
- ✅ Automatic CDN caching
- ✅ Automatic image optimization
- ✅ Serverless functions (if needed)
- ✅ Analytics included

### Render (Backend)
- ⚠️ Free tier: Apps sleep after 15 min inactivity
- ✅ Upgrade to Starter ($7/month) for always-on
- ✅ Automatic SSL/HTTPS
- ✅ GitHub auto-deploy on push

---

## Monitoring & Logs

### Vercel Logs
1. Go to vercel.com → Your Project
2. Click **Deployments** → Select deployment
3. Click **Logs** to view real-time logs

### Render Logs
1. Go to render.com → Your Service
2. Click **Logs** (bottom left)
3. View real-time logs

---

## Troubleshooting

### CORS Errors
**Problem:** Frontend can't reach backend
**Solution:** Update Render `CORS_ORIGIN` to match your Vercel URL

### 503 Service Unavailable (Render Free Tier)
**Problem:** App spinning up (first request slow)
**Solution:** Upgrade to Starter plan ($7/month) or keep free tier for dev

### SMTP Not Sending Emails
**Problem:** SMTP credentials invalid
**Solution:** 
- Use Gmail: Enable "Less secure apps" or generate App Password
- Or use Sendgrid/Mailgun (free tier available)

### Images/Assets 404
**Problem:** CSS/JS files not loading
**Solution:** Check `frontend/dist` build output exists, rebuild with `npm run build`

---

## Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Free | $0/month |
| Render | Free | $0/month* |
| Render | Starter | $7/month |
| **Total** | **Free Tier** | **$0/month** |
| **Total** | **Production** | **$7/month** |

*Free tier has 15-min sleep period for cost efficiency.

---

## Next Steps

1. ✅ Create accounts on Vercel & Render
2. ✅ Deploy backend on Render
3. ✅ Deploy frontend on Vercel
4. ✅ Update environment variables
5. ✅ Test all features
6. ✅ Monitor logs in production
7. ⭐ Optional: Set up custom domain (GoDaddy, Namecheap)
8. ⭐ Optional: Enable SMTP for real emails

---

## Custom Domain Setup (Optional)

### Add Custom Domain to Vercel
1. Vercel Project → Settings → Domains
2. Add your domain (yourdomain.com)
3. Update DNS records (Vercel will show instructions)

### Add Custom Domain to Render
1. Render Service → Settings → Custom Domains
2. Add subdomain (api.yourdomain.com)
3. Update DNS records

---

## Redeploy After Changes

### Automatic Deployments (Recommended)
- Push to GitHub → Vercel & Render auto-deploy

### Manual Redeploy

**Vercel:**
```bash
vercel --prod
```

**Render:**
1. Go to Render.com → Your Service
2. Click **Manual Deploy** → **Deploy latest commit**

---

## Security Checklist

- [ ] Change admin password from `admin123`
- [ ] Set strong `JWT_SECRET` (openssl rand -base64 32)
- [ ] Configure SMTP with valid credentials
- [ ] Enable HTTPS (automatic on both platforms)
- [ ] Set `NODE_ENV=production`
- [ ] Update CORS_ORIGIN to production domain
- [ ] Backup database regularly
- [ ] Monitor logs for errors
- [ ] Set up uptime monitoring (Uptime Robot - free)

---

## Support & Resources

- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [Express.js Docs](https://expressjs.com/)
