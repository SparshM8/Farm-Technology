# Farming Tech Shop - Quick Reference

## 🚀 Quick Start

```bash
# 1. Install all dependencies
npm run install:all

# 2. Initialize database  
npm run db:init

# 3. Start development
# Terminal 1: Backend
npm run backend:dev

# Terminal 2: Frontend
npm run frontend
```

Then visit: http://localhost:5173

## 📊 Admin Login
- **Email**: admin@farmingtechshop.com
- **Password**: admin123

## 🔧 Common Commands

```bash
# Production build
npm run build && npm start

# Docker deployment
npm run docker:build && npm run docker:run

# Run tests
npm test

# Build frontend only
npm run frontend:build
```

## 📚 Documentation

- **README.md** - Overview and features
- **PRODUCTION_GUIDE.md** - Deployment instructions
- **STARTUP.md** - Development setup
- **backend/README.md** - API documentation

## 🌐 Key URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api/health

## 💾 Sample Data

Included 6 agricultural products:
1. Organic Fertilizer - ₹450
2. Bio-Insecticide - ₹320
3. Hybrid Vegetable Seeds - ₹250
4. Garden Spade - ₹580
5. Soil Testing Kit - ₹1200
6. Agriculture Gloves - ₹180

## 🔐 Features

✅ User authentication with JWT
✅ Shopping cart with persistence
✅ Order management
✅ Admin dashboard
✅ Email notifications
✅ Product reviews
✅ Responsive design
✅ SQLite database with backups
✅ Docker support
✅ Production-ready security

## 🚀 Deploy

See **PRODUCTION_GUIDE.md** for:
- Docker deployment
- Heroku
- AWS EC2
- DigitalOcean
- Vercel + Render
- And more...

---

**Built for production. Ready to scale. 🌾**
