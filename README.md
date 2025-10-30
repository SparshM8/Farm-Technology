# 🌾 Farming Technology - Full-Stack E-Commerce Platform
[![CI](https://github.com/<owner>/<repo>/actions/workflows/ci.yml/badge.svg)](https://github.com/<owner>/<repo>/actions/workflows/ci.yml)

A modern, full-featured agricultural technology e-commerce platform with real-time features, secure admin panel, AI chatbot, and complete order management system.

Created by **SPARSH**

---

## 🚀 Features

### 🛍️ E-Commerce Features
- **Product Catalog**: Browse and search through agricultural products with real-time updates
- **Shopping Cart**: Add products to cart with persistent state management
- **Secure Checkout**: Complete order processing with customer information collection
- **Order Management**: All orders are saved to database for admin review

### 🔐 Admin Panel
- **Secure Login**: Session-based authentication system (default password: `adminpass`)
- **Product Management**: Full CRUD operations (Create, Read, Update, Delete) for products
- **Order Viewing**: View all customer orders with detailed information
- **Contact Messages**: Access customer inquiries and feedback
- **Real-time Updates**: Instant notifications for new orders and messages

### 💬 AI Chatbot
- **Farmer Assistance**: Real-time Socket.IO powered chatbot
- **Smart Responses**: Provides information on fertilizers, pest control, and crop prices
- **Interactive UI**: Modern chat interface with emoji support

### 📰 Dynamic Content
- **Latest News**: Real-time news feed powered by Socket.IO
- **Live Updates**: Automatic content refresh without page reload
- **Database-Driven**: All content stored in SQLite for persistence

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach, works on all devices
- **Dark/Light Theme**: Toggle between themes with localStorage persistence
- **Smooth Animations**: Professional transitions and hover effects
- **Accessible**: ARIA labels and semantic HTML throughout

---

## 📋 Prerequisites

- **Node.js** v16+ (recommended v18+)
- **npm** or **yarn**
- **Modern web browser** (Chrome, Firefox, Edge, Safari)

---

## 🔧 Installation & Setup

### 1. Clone or Download the Project

```bash
cd "d:\DATA D\page\css\farm project"
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web server framework
- `socket.io` - Real-time bidirectional communication
- `sqlite3` - Database engine
- `express-session` - Session management
- `connect-sqlite3` - SQLite session store
- `multer` - File upload handling
- `body-parser` - Request body parsing
- `cors` - Cross-origin resource sharing

### 3. Start the Server

```bash
npm start
```

Or directly:

```bash
node server.js
```

### 4. Open in Browser

Navigate to: **http://localhost:3000**

⚠️ **Important**: Always access via `localhost:3000`, NOT through Live Server or port 5500!

---

## 🗄️ Database Structure

The application uses **SQLite** with the following tables:

### Products Table
```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    title TEXT,
    image TEXT,
    price TEXT,
    description TEXT,
    created_at INTEGER
);
```

### Orders Table
```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT,
    customer_address TEXT,
    customer_phone TEXT,
    items TEXT,
    total_price TEXT,
    order_date INTEGER
);
```

### Contacts Table
```sql
CREATE TABLE contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    message TEXT,
    received_at INTEGER
);
```

### News Table
```sql
CREATE TABLE news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    excerpt TEXT,
    link TEXT,
    date TEXT,
    created_at INTEGER
);
```

All data is stored in: `./data/data.db`

---

## 🔑 Admin Access

### Default Credentials
- **Password**: `adminpass`

### Changing Admin Password

**Windows PowerShell:**
```powershell
$env:ADMIN_PASSWORD = "your_new_password"
```

**Or set permanently:**
```powershell
setx ADMIN_PASSWORD "your_new_password"
```

**Linux/Mac:**
```bash
export ADMIN_PASSWORD="your_new_password"
```

Then restart the server.

### Admin Features
1. **Login**: Click "Admin" in footer → Enter password
2. **Manage Products**: Add, edit, delete products with image uploads
3. **View Orders**: See all customer orders with full details
4. **View Messages**: Read customer contact form submissions
5. **Real-time Notifications**: Get instant alerts for new orders/messages

---

## 🌐 API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Serve main HTML page |
| GET | `/api/products` | Fetch all products |
| GET | `/api/news` | Fetch all news items |
| POST | `/api/contact` | Submit contact form |
| POST | `/api/checkout` | Place an order |

### Protected Endpoints (Require Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Admin login |
| POST | `/api/admin/logout` | Admin logout |
| GET | `/api/admin/status` | Check login status |
| POST | `/api/products` | Create new product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| GET | `/api/contacts` | Get all messages |
| POST | `/api/upload` | Upload product image |

---

## 🔌 Socket.IO Events

### Client → Server
- `chat message` - Send chatbot message

### Server → Client
- `products:update` - Products list updated
- `news:update` - News items updated
- `contact:received` - New contact message
- `orders:new` - New order placed
- `chat message` - Chatbot response

---

## 📁 Project Structure

```
farm-project/
├── farm.html           # Main HTML file
├── farm.css            # Styles
├── farm.js             # Client-side JavaScript
├── server.js           # Node.js backend
├── package.json        # Dependencies
├── manifest.json       # PWA manifest
├── README.md           # Documentation
├── data/               # SQLite databases
│   ├── data.db        # Main database
│   └── sessions.sqlite # Session storage
├── uploads/            # Product image uploads
└── assets/             # Images, logos, etc.
    ├── logo.png
    ├── 02.jpg
    ├── 03.jpg
    └── ...
```

---

## 🎯 Usage Guide

### For Customers

1. **Browse Products**: Scroll to Products section or search by keyword
2. **Add to Cart**: Click "Add to Cart" on any product
3. **View Cart**: Click cart icon in header
4. **Checkout**: Fill in delivery details and confirm order
5. **Get Help**: Click chatbot icon for farming assistance

### For Administrators

1. **Login**: Footer → Admin → Enter password (`adminpass`)
2. **Manage Products**: 
   - Click "Manage Products" tab
   - Use "Add New Product" or edit/delete existing products
3. **View Orders**: Click "View Orders" → "Load Orders"
4. **Check Messages**: Click "View Messages" → "Load Messages"

---

## 🛠️ Development Notes

### Data Migration
- On first run, `products.json` and `news.json` are migrated to SQLite
- Prices are automatically converted from USD to INR (₹)
- Migration logs appear in server console

### Session Management
- Sessions stored in `./data/sessions.sqlite`
- Default session lifetime: 24 hours
- Sessions survive server restarts

### File Uploads
- Uploaded images saved to `./uploads/` directory
- Accessible via `/uploads/filename` URL
- Directory created automatically if missing

### Real-time Features
- Socket.IO connects on page load
- Automatic reconnection on disconnect
- Graceful fallback if Socket.IO unavailable

---

## 🐛 Troubleshooting

### Products Not Loading
✅ **Solution**: Ensure server is running on port 3000 and access via `http://localhost:3000`

### Admin Panel Not Working
✅ **Solution**: 
1. Check server is running
2. Verify password is correct (`adminpass` by default)
3. Clear browser cookies and try again

### Chatbot Not Responding
✅ **Solution**: 
1. Check browser console for Socket.IO connection errors
2. Ensure server is running
3. Try refreshing the page

### Database Errors
✅ **Solution**: 
1. Delete `./data/data.db` and restart server (will recreate)
2. Check file permissions on `./data/` folder

### Port 3000 Already in Use
✅ **Solution**: 
```bash
# Find and kill the process
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

---

## 🚀 Deployment Notes

⚠️ **This is a development server**. For production:

1. **Security**:
   - Set strong `ADMIN_PASSWORD` environment variable
   - Enable HTTPS
   - Add rate limiting
   - Implement CSRF protection

2. **Database**:
   - Consider PostgreSQL or MySQL for production
   - Set up automated backups
   - Add database indexes for performance

3. **File Storage**:
   - Use cloud storage (AWS S3, Azure Blob) for images
   - Implement CDN for static assets

4. **Environment**:
   - Use process manager (PM2, Forever)
   - Set up reverse proxy (Nginx, Apache)
   - Configure proper CORS policies

---

## 📝 License

This project is created by **SPARSH** for educational and demonstration purposes.

---

## 🤝 Support

For issues or questions:
- Email: sparshm8@ieee.org
- Check server console for error messages
- Review browser console (F12) for client-side errors

---

## 🎉 Acknowledgments

- Font Awesome for icons
- Google Fonts (Poppins, Roboto)
- Socket.IO for real-time features
- Express.js for backend framework
- SQLite for database

---

**Happy Farming! 🌾**
