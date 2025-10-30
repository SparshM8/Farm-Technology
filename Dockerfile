FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production || npm install --production

# Copy app source
COPY . /usr/src/app

# Expose port
EXPOSE 3000

# Use production start by default
ENV NODE_ENV=production
CMD ["node", "server.js"]
