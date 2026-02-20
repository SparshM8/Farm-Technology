# Vercel + Render: Quick Deployment Checklist

## 🎯 5-Minute Setup Overview

```
GitHub Repo → Vercel (Frontend) + Render (Backend)
    ↓
Frontend URL: https://yourproject.vercel.app
Backend URL: https://farming-tech-shop-api.onrender.com
```

---

## ✅ STEP-BY-STEP DEPLOYMENT

### STEP 1️⃣: Prepare Your Repository (2 min)

```PowerShell
# Commit all changes
cd "d:\New folder (2)\FarmingTechShop"
git add .
git commit -m "Prepare for Vercel + Render deployment"
git push origin main
```

---

### STEP 2️⃣: Deploy Backend on Render.com (3 min)

1. Go to **[render.com](https://render.com)**
2. Click **Sign up with GitHub** → Authorize
3. Click **+ New** → **Web Service**
4. Search for **Farm-Technology** repo → Select it
5. Fill in:
   ```
   Name: farming-tech-shop-api
   Environment: Node
   Region: Oregon (or Singapore for India)
   Build Command: cd backend && npm install
   Start Command: cd backend && node server.js
   Plan: Free (or Starter $7/month for production)
   ```
6. Click **Advanced** → Add Environment Variables:
   ```
   NODE_ENV = production
   JWT_SECRET = (Render auto-generates, keep default)
   FRONTEND_URL = (you'll update this after Vercel)
   CORS_ORIGIN = (you'll update this after Vercel)
   SMTP_HOST = smtp.gmail.com
   SMTP_PORT = 587
   SMTP_USER = your-email@gmail.com
   SMTP_PASS = your-app-password (Gmail App Password)
   ```
7. Click **Create Web Service** → Wait 2-3 minutes
8. **COPY YOUR URL:** `https://farming-tech-shop-api.onrender.com`

---

### STEP 3️⃣: Deploy Frontend on Vercel (3 min)

1. Go to **[vercel.com](https://vercel.com)**
2. Click **Sign up with GitHub** → Authorize
3. Click **Add New Project**
4. Search for **Farm-Technology** repo → Select it
5. Configure:
   ```
   Framework Preset: Vite
   Build Command: cd frontend && npm run build
   Output Directory: frontend/dist
   Install Command: npm install
   ```
6. Click **Environment Variables** → Add:
   ```
   VITE_API_URL = https://farming-tech-shop-api.onrender.com
   ```
7. Click **Deploy** → Wait 1-2 minutes
8. **COPY YOUR URL:** `https://yourproject.vercel.app`

---

### STEP 4️⃣: Update Render Backend URLs (1 min)

1. Go back to **Render.com** → Your Service
2. Click **Environment** (in sidebar)
3. Edit these variables:
   ```
   FRONTEND_URL = https://yourproject.vercel.app
   CORS_ORIGIN = https://yourproject.vercel.app
   ```
4. Click **Save** → Service redeploys automatically

---

## 🧪 Test Your Deployment

### Test Backend:
```PowerShell
# In PowerShell, replace with your Render URL
$url = "https://farming-tech-shop-api.onrender.com/api/products"
Invoke-WebRequest -Uri $url | Select-Object StatusCode, Content
# Should return: 200 OK with products list
```

### Test Frontend:
```
Visit: https://yourproject.vercel.app
```

### Test Features:
- ✅ Register new account
- ✅ Login with email
- ✅ Browse products
- ✅ Add to cart
- ✅ Create order
- ✅ Admin login: `admin@farmingtechshop.com` / `admin123`
- ✅ Admin dashboard

---

## 📊 Cost & Performance

| Service | Plan | Cost | Performance |
|---------|------|------|-------------|
| Vercel Frontend | Free | $0 | ⚡ Very Fast (CDN) |
| Render Backend | Free | $0 | 🐌 Slow (15 min sleep) |
| Render Backend | Starter | $7/mo | ⚡ Good (Always on) |
| **TOTAL - Dev** | - | **$0** | Mixed |
| **TOTAL - Prod** | Starter | **$7/mo** | ⚡ Very Good |

**Recommendation:** Start with Free tier, upgrade Render to Starter ($7/month) when you have users.

---

## 🔧 Troubleshooting

### ❌ CORS Error (Frontend can't reach backend)
**Solution:**
1. Go to Render → Environment
2. Update `CORS_ORIGIN` to match your Vercel URL exactly
3. Wait for redeploy (2-3 min)

### ❌ 503 Service Unavailable (Render)
**Problem:** Free tier spins down after 15 min of inactivity
**Solution:** 
- Upgrade to Starter plan ($7/month), OR
- Use uptime monitor to keep it alive: [UptimeRobot](https://uptimerobot.com)

### ❌ Emails Not Sending
**Problem:** SMTP credentials invalid
**Solution:**
1. Test in development first: `npm run backend:dev`
2. Check SMTP_USER and SMTP_PASS in Render env vars
3. For Gmail: Use [App Password](https://myaccount.google.com/apppasswords) not your regular password

### ❌ Build Failed on Vercel
**Solution:**
1. Click **Deployments** → Failed deployment
2. Click **Error** tab to see what failed
3. Common fix: `cd frontend && npm run build` locally to test

### ❌ Build Failed on Render
**Solution:**
1. Go to Render → Service → **Logs** (bottom left)
2. Scroll through logs to find the error
3. Common fixes:
   - `cd backend && npm install` locally to test
   - Check Node version compatibility

---

## 🚀 Auto-Deploy from GitHub

**Both platforms automatically redeploy when you push to GitHub!**

```PowerShell
# Any commits you push will auto-deploy
git add .
git commit -m "Update feature"
git push origin main

# Vercel: Auto-deploys (1-2 min)
# Render: Auto-deploys (2-3 min)
```

---

## 📈 Monitoring in Production

### Vercel Analytics
- Go to **vercel.com** → Your Project
- Click **Analytics** to see traffic, speed, etc.

### Render Logs
- Go to **render.com** → Your Service
- Click **Logs** to see real-time backend logs

### Free Uptime Monitor (Optional)
- Go to [uptimerobot.com](https://uptimerobot.com)
- Add your backend URL to monitor
- Alerts you if service goes down

---

## 🔐 Security Checklist

- [ ] Change admin password from `admin123`
  ```
  Go to Admin Dashboard → Change default credentials
  ```
- [ ] Set strong `JWT_SECRET` (Keep Render auto-generated one)
- [ ] Use Gmail App Password for SMTP (not your account password)
- [ ] Enable HTTPS (automatic on both platforms)
- [ ] Check `CORS_ORIGIN` is set correctly
- [ ] Keep `NODE_ENV=production` in Render
- [ ] Review environment variables (no passwords in code)

---

## 📞 Need Help?

- **Vercel Issues:** [vercel.com/docs](https://vercel.com/docs)
- **Render Issues:** [render.com/docs](https://render.com/docs)
- **GitHub Issues:** [github.com/SparshM8/Farm-Technology/issues](https://github.com/SparshM8/Farm-Technology/issues)

---

## ⏱️ Deployment Timeline

| Step | Time | Status |
|------|------|--------|
| Render Backend Deploy | 2-3 min | ⏳ |
| Vercel Frontend Deploy | 1-2 min | ⏳ |
| Update CORS | 2-3 min | ⏳ |
| Full Deployment | **8-10 min** | ✅ |

🎉 **You'll have a live e-commerce platform in 10 minutes!**

---

## 🎓 Next Steps (After Deployment)

1. ✅ Monitor logs for errors
2. ✅ Test all features with real users
3. ✅ Set up custom domain (optional)
4. ✅ Configure analytics
5. ✅ Add more products to database
6. ✅ Set up payment integration (Razorpay)
7. ✅ Plan marketing & launch

---

**Last Updated:** February 20, 2026
**Status:** Ready to Deploy ✅
