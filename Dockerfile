FROM node:18-alpine

WORKDIR /app

# Copy entire project
COPY . .

# Install backend dependencies (production)
RUN cd backend && npm install --omit=dev

# Install frontend dependencies
RUN cd frontend && npm install

# Build frontend
RUN cd frontend && npm run build

# Remove frontend node_modules (not needed in production)
RUN rm -rf frontend/node_modules

EXPOSE 3000

# Initialize database and start server
CMD ["sh", "-c", "cd backend && node scripts/init-db.js && node scripts/seed-db.js && node server.js"]
