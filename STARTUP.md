# 🌾 Farming Tech Shop - Startup Guide

## ✅ Project Setup Complete!

Your Farming Tech Shop is ready to run! Here's how to get started.

---

## 📋 Prerequisites

Make sure you have installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- Any modern web browser

Verify installation:
```bash
node --version
npm --version
```

---

## 🚀 Running the Project

### **Option 1: Run Both Servers (Recommended for Development)**

**Terminal 1 - Start Backend:**
```bash
cd FarmingTechShop/backend
npm start
```
You should see:
```
🌾 Farming Tech Shop API running on http://localhost:3000
Health check: http://localhost:3000/api/health
Products: http://localhost:3000/api/products
```

**Terminal 2 - Start Frontend:**
```bash
cd FarmingTechShop/frontend
npm run dev
```
You should see:
```
VITE v4.5.14 ready in 295 ms
➜ Local: http://localhost:5173/
```

**Then open in browser:**
- Add to cart & browse products: http://localhost:5173/
- Test API directly: http://localhost:3000/api/products

---

### **Option 2: Production Build**

```bash
# Build frontend
cd FarmingTechShop/frontend
npm run build

# Start backend (serves frontend build)
cd ../backend
npm start
```

Then visit: http://localhost:3000

---

## 📱 Features to Test

1. **Browse Products**
   - Visit homepage
   - Filter by category (Fertilizers, Seeds, Tools, etc.)
   - Click "View Details" to see full descriptions

2. **Contact Form**
   - Scroll to "Contact Us" section
   - Fill out the form
   - Submit (messages are logged on backend)

3. **Responsive Design**
   - Resize browser window
   - Test on mobile device (use DevTools)

---

## 🔍 API Testing

### Get All Products
```bash
curl http://localhost:3000/api/products
```

### Filter by Category
```bash
curl http://localhost:3000/api/products?category=seeds
```

### Get All Categories
```bash
curl http://localhost:3000/api/categories
```

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Submit Contact Form
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Farmer",
    "email": "john@farm.com",
    "subject": "Product Inquiry",
    "message": "I need fertilizer for my crops"
  }'
```

---

## 📁 Project Structure

```
FarmingTechShop/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   │   ├── Header.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── *.css           # Component styles
│   │   ├── App.jsx             # Main app component
│   │   ├── index.jsx           # React DOM mount
│   │   └── index.css           # Global styles
│   ├── public/                 # Static assets folder
│   ├── index.html              # HTML template
│   ├── vite.config.js          # Vite configuration
│   └── package.json
│
├── backend/                     # Express.js API
│   ├── server.js               # Main server file (703 lines)
│   ├── .env.example            # Environment template
│   └── package.json
│
├── README.md                    # Full documentation
├── .gitignore                   # Git ignore file
└── STARTUP.md                   # This file
```

---

## 🛠 Development Commands

### Frontend Development
```bash
cd frontend
npm run dev           # Start with hot reload
npm run build         # Build for production
npm run preview       # Preview production build
npm run lint          # Run ESLint
```

### Backend Development
```bash
cd backend
npm start             # Start server
npm run dev           # Start with auto-reload (needs nodemon)
```

---

## ⚙️ Configuration

### Backend Environment Variables

Create `backend/.env` file (optional):

```env
PORT=3000
NODE_ENV=development

# Optional: Enable email notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
SMTP_TO=admin@farmingtech.com
```

The server uses sample data by default. No database setup needed!

---

## 🐛 Troubleshooting

### **"Port 3000 already in use"**
```bash
# Find and kill the process using port 3000
lsof -i :3000           # macOS/Linux
netstat -ano | findstr :3000  # Windows
```

### **"npm: command not found"**
- Node.js might not be installed
- [Download and install Node.js](https://nodejs.org/)
- Restart your terminal after installation

### **"Cannot find module 'react'"**
```bash
cd frontend
npm install    # Reinstall dependencies
```

### **Frontend not loading at localhost:5173**
- Make sure backend is running on port 3000
- Check that `vite.config.js` has the proxy configured
- Clear browser cache (Ctrl+Shift+Delete)

### **CORS errors when submitting contact form**
- Backend must be running on port 3000
- Check that `cors()` is enabled in `server.js`

---

## 📊 Sample Data

The application comes with pre-loaded sample agricultural products:

1. **Organic Fertilizer** - ₹450
2. **Bio-Insecticide** - ₹320
3. **Hybrid Vegetable Seeds** - ₹250
4. **Garden Spade** - ₹580
5. **Soil Testing Kit** - ₹1200
6. **Agriculture Gloves** - ₹180

Add more products by editing `backend/server.js` and adding to the `products` array.

---

## 🚢 Deployment

### Deploy to Heroku
```bash
# Install Heroku CLI
heroku create your-app-name
git push heroku main
```

### Deploy to Vercel (Frontend) + Render (Backend)
- Frontend: Push `frontend/` folder to Vercel
- Backend: Push `backend/` folder to Render
- Update frontend proxy in `vite.config.js`

---

## 📞 Support

For issues or questions:
1. Check the **Troubleshooting** section above
2. Review [Vite docs](https://vitejs.dev/)
3. Review [Express docs](https://expressjs.com/)
4. Open an issue in your git repository

---

## 🎓 Next Steps

1. ✅ Run the application
2. ✅ Test all features
3. ✅ Add more products to `server.js`
4. ✅ Customize styling in `src/components/*.css`
5. ✅ Add email configuration for contact form
6. ✅ Deploy to production

---

**Happy farming! 🌾**

Last updated: February 2026
