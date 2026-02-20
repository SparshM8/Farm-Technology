# 🌾 Farming Tech Shop - Production E-Commerce Platform

A **full-featured, production-ready** agricultural e-commerce platform built with React, Node.js, Express, and SQLite. Includes complete user authentication, shopping cart, order management, admin panel, and more.

## ✨ Features

### Customer Features
✅ **User Management**
- User registration & login with JWT authentication
- Secure password hashing (bcryptjs)
- User profile management

✅ **Shopping**
- Browse products with search & filter
- Shopping cart with persistent storage
- Add product reviews and ratings

✅ **Checkout & Orders**
- Secure checkout process
- Order history & tracking
- Order confirmation emails
- Real-time order status updates

✅ **Responsive Design**
- Mobile-first responsive layout
- Works on all device sizes
- Touch-friendly interface

### Admin Features
✅ **Admin Dashboard**
- View sales statistics
- Manage products (CRUD)
- Manage orders & order status
- View customer inquiries

✅ **Order Management**
- Process orders
- Update shipping status
- Track inventory

## 🏗️ Architecture

```
FarmingTechShop/
├── frontend/                 # React SPA (Vite)
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── context/          # React Context (Auth)
│   │   ├── App.jsx
│   │   └── index.css
│   ├── dist/                 # Production build
│   └── vite.config.js
│
├── backend/                  # Node.js/Express API
│   ├── db/
│   │   └── database.js       # SQLite setup
│   ├── routes/               # API endpoints
│   ├── middleware/           # Auth, validation, errors
│   ├── utils/                # Helpers (JWT, email, etc)
│   ├── scripts/              # DB init & seed
│   ├── server.js             # Main app
│   └── farming_tech.db       # SQLite database
│
├── Dockerfile                # Docker configuration
├── docker-compose.yml        # Docker Compose setup
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ & npm 7+
- **Git**

### Installation

1. **Clone & Install**
   ```bash
   git clone <repo-url>
   cd FarmingTechShop
   
   # Install backend
   cd backend && npm install && cd ..
   
   # Install frontend
   cd frontend && npm install && cd ..
   ```

2. **Initialize Database**
   ```bash
   cd backend
   node scripts/init-db.js   # Create tables
   node scripts/seed-db.js   # Add sample data
   cd ..
   ```

3. **Start Development**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

4. **Access Application**
   - Frontend: http://localhost:5173
   - API: http://localhost:3000
   - Admin: admin@farmingtechshop.com / admin123

## 📚 API Documentation

### Authentication
```bash
POST /api/auth/register    # Register new user
POST /api/auth/login       # Login user
```

### Products
```bash
GET  /api/products                    # Get all products
GET  /api/products/:id                # Get product details
GET  /api/products/categories/all     # Get all categories
POST /api/products/:id/reviews        # Add review (auth required)
```

### Shopping Cart
```bash
GET    /api/cart                   # Get cart
POST   /api/cart/items             # Add to cart
PUT    /api/cart/items/:itemId     # Update cart item
DELETE /api/cart/items/:itemId     # Remove from cart
DELETE /api/cart                   # Clear cart
```

### Orders
```bash
POST /api/orders              # Create order
GET  /api/orders              # Get user orders
GET  /api/orders/:orderId     # Get order details
```

### Admin (requires auth + admin role)
```bash
GET  /api/admin/dashboard/stats         # Dashboard stats
POST /api/admin/products                # Create product
PUT  /api/admin/products/:id            # Update product
DELETE /api/admin/products/:id          # Delete product
GET  /api/admin/orders                  # Get all orders
PUT  /api/admin/orders/:id/status       # Update order status
GET  /api/admin/contacts                # Get contact submissions
PUT  /api/admin/contacts/:id/status     # Update contact status
```

### Contact
```bash
POST /api/contact            # Submit contact form
```

## ⚙️ Configuration

### Environment Variables
Create `backend/.env`:

```env
PORT=3000
NODE_ENV=production
FRONTEND_URL=http://localhost:5173

JWT_SECRET=your-secure-secret-key

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@farmingtechshop.com
```

## 🐳 Docker Deployment

### Build & Run with Docker
```bash
# Build image
docker build -t farming-tech-shop .

# Run container
docker run -p 3000:3000 -e JWT_SECRET=your-secret farming-tech-shop

# Using Docker Compose
docker-compose up -d
```

## 📦 Production Build

```bash
# Build frontend
cd frontend
npm run build
cd ..

# Start backend (serves frontend build)
cd backend
npm start
```

Then visit: http://localhost:3000

## 🧪 Testing

```bash
# Run API tests
cd backend
npm test

# Run with hot reload
npm run dev
```

## 🔐 Security Features

- ✅ JWT token-based authentication
- ✅ Bcrypt password hashing
- ✅ CORS protection
- ✅ Rate limiting (100 req/15min)
- ✅ Helmet.js security headers
- ✅ Input validation & sanitization
- ✅ SQL injection prevention (parameterized queries)
- ✅ HTTPS-ready configuration

## 📊 Database Schema

### Tables
- **users** - User accounts
- **products** - Product catalog
- **carts** - Shopping carts
- **cart_items** - Items in carts
- **orders** - Customer orders
- **order_items** - Items in orders
- **contacts** - Contact form submissions
- **reviews** - Product reviews

## 🚀 Deployment Options

### Heroku
```bash
heroku create your-app-name
git push heroku main
```

### Vercel (Frontend) + Render (Backend)
- Deploy `frontend/` folder to Vercel
- Deploy `backend/` folder to Render
- Configure CORS & environment variables

### AWS
- Frontend: S3 + CloudFront
- Backend: EC2 or ECS
- Database: RDS or DynamoDB

### DigitalOcean
- Deploy as Docker container
- Use App Platform for easy deployment

## 📈 Performance

- SQLite database with indexes
- Production build optimization
- Caching headers configured
- Rate limiting to prevent abuse
- Efficient API queries

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process
lsof -i :3000  (Mac/Linux)
netstat -ano | findstr :3000  (Windows)

# Kill process
kill -9 <PID>
```

### Database Lock
```bash
# Remove database and reinit
rm backend/farming_tech.db
cd backend && node scripts/init-db.js && node scripts/seed-db.js
```

### Token Expired
- Clear localStorage: `localStorage.clear()`
- Login again

## 📝 Development

### Adding a New Product
```bash
curl -X POST http://localhost:3000/api/admin/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Product",
    "category": "seeds",
    "price": 299,
    "description": "Product description",
    "stock": 50
  }'
```

### Creating an Order
1. User registers/logs in
2. Browse products
3. Add to cart
4. Checkout with shipping address
5. Order created with "pending" status
6. Admin processes & ships

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Submit pull request

## 📄 License

MIT License - see LICENSE file

## 🆘 Support

- GitHub Issues: Report bugs
- Email: support@farmingtechshop.com
- Documentation: See PRODUCTION_GUIDE.md

---

**Built with ❤️ for farmers worldwide. 🌾**

