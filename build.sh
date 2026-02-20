#!/bin/bash

# Build frontend
echo "🔨 Building frontend..."
cd frontend
npm run build
cd ..

# Create .env file if it doesn't exist
if [ ! -f backend/.env ]; then
  echo "📝 Creating .env file..."
  cp backend/.env.example backend/.env
  # Generate a secure JWT secret
  JWT_SECRET=$(openssl rand -base64 32)
  sed -i "s/your-secret-key-change-in-production-12345/$JWT_SECRET/" backend/.env
  echo "⚠️  Please update backend/.env with your configuration"
fi

echo "✅ Build complete!"
echo ""
echo "To start the application:"
echo "  npm start           (from root directory)"
echo ""
echo "For development:"
echo "  Terminal 1: cd backend && npm run dev"
echo "  Terminal 2: cd frontend && npm run dev"
