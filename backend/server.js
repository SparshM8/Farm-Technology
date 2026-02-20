import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Initialize environment variables
dotenv.config();

// Import database
import { initializeDatabase, createSchema } from './db/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import contactRoutes from './routes/contact.js';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL || 'http://localhost:5173',
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

// Static file serving for frontend (production build)
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath, { maxAge: '1h' }));

// Fallback to index.html for React Router
app.get('*', (req, res) => {
  // Don't serve HTML for API calls
  if (req.path.startsWith('/api/')) {
    return notFoundHandler(req, res);
  }

  res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
    if (err) {
      console.log('Frontend build not found. Run: cd frontend && npm run build');
      res.status(404).json({
        error: 'Frontend not found',
        message: 'Please build the frontend first: cd frontend && npm run build',
      });
    }
  });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    console.log('🚀 Starting Farming Tech Shop API...');
    console.log('📦 Initializing database...');

    const db = await initializeDatabase();
    await createSchema(db);

    console.log('✅ Database ready');

    app.listen(PORT, () => {
      console.log(`\n🌾 Farming Tech Shop API running on http://localhost:${PORT}`);
      console.log('\n📚 Available endpoints:');
      console.log('   Health:      GET  /api/health');
      console.log('   Auth:        POST /api/auth/register');
      console.log('               POST /api/auth/login');
      console.log('   Products:    GET  /api/products');
      console.log('               POST /api/products/:id/reviews (auth required)');
      console.log('   Cart:        GET  /api/cart');
      console.log('               POST /api/cart/items');
      console.log('               PUT  /api/cart/items/:itemId');
      console.log('               DELETE /api/cart/items/:itemId');
      console.log('   Orders:      GET  /api/orders');
      console.log('               POST /api/orders');
      console.log('   Admin:       GET  /api/admin/dashboard/stats (auth required)');
      console.log('   Contact:     POST /api/contact');
      console.log('\n🔐 Authentication: Include "Authorization: Bearer <token>" header');
      console.log(`\n📖 Frontend: http://localhost:${PORT}`);
      console.log(`\n🛠️  Admin login: admin@farmingtechshop.com / admin123`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

