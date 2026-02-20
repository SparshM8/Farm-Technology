FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN cd backend && npm ci --only=production
RUN cd frontend && npm ci

# Build frontend
COPY frontend ./frontend
RUN cd frontend && npm run build

# Copy backend
COPY backend ./backend

EXPOSE 3000

# Initialize database and start server
CMD ["sh", "-c", "cd backend && node scripts/init-db.js && node scripts/seed-db.js && node server.js"]
